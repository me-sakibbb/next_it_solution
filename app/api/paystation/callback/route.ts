import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyTransaction } from '@/lib/paystation'
import { checkAndRewardReferral } from '@/lib/referral'

/**
 * Paystation Callback Handler
 *
 * After payment on Paystation's hosted checkout, the user is redirected
 * here with query params: ?status=Successful&invoice_number=...&trx_id=...
 *
 * SECURITY: We NEVER trust the query params directly.
 * We always verify via the Transaction Status API before crediting.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const invoiceNumber = searchParams.get('invoice_number')
    const trxId = searchParams.get('trx_id')

    const baseRedirect = `${request.nextUrl.origin}/dashboard/billing`

    // Handle cancel/failure from client-side redirect
    if (!invoiceNumber) {
        return NextResponse.redirect(`${baseRedirect}?status=failed&error=missing_invoice`)
    }

    if (status === 'Canceled') {
        const adminSupabase = createAdminClient()
        await adminSupabase
            .from('bkash_payments')
            .update({ status: 'cancelled' })
            .eq('payment_id', invoiceNumber)

        return NextResponse.redirect(`${baseRedirect}?status=cancelled`)
    }

    if (status === 'Failed') {
        const adminSupabase = createAdminClient()
        await adminSupabase
            .from('bkash_payments')
            .update({ status: 'failed' })
            .eq('payment_id', invoiceNumber)

        return NextResponse.redirect(`${baseRedirect}?status=failed`)
    }

    try {
        const adminSupabase = createAdminClient()

        // Fetch our stored payment record
        const { data: paymentRecord, error: fetchError } = await adminSupabase
            .from('bkash_payments')
            .select('*')
            .eq('payment_id', invoiceNumber)
            .single()

        if (fetchError || !paymentRecord) {
            console.error('Payment record not found for invoice:', invoiceNumber, fetchError)
            return NextResponse.redirect(`${baseRedirect}?status=failed&error=record_not_found`)
        }

        // Idempotency check — if already executed, just redirect to success
        if (paymentRecord.status === 'executed') {
            return NextResponse.redirect(`${baseRedirect}?status=success&already=true`)
        }

        // ═══════════════════════════════════════════════════════
        // CRITICAL SECURITY: Verify payment via Transaction Status API
        // Never trust client-side callback query params
        // ═══════════════════════════════════════════════════════
        let verificationResult
        try {
            verificationResult = await verifyTransaction(invoiceNumber)
        } catch (verifyError) {
            console.error('Paystation verification failed:', verifyError)
            await adminSupabase
                .from('bkash_payments')
                .update({
                    status: 'failed',
                    gateway_error: verifyError instanceof Error ? verifyError.message : 'Verification failed',
                })
                .eq('payment_id', invoiceNumber)

            return NextResponse.redirect(`${baseRedirect}?status=failed&error=verification_failed`)
        }

        // Verify the transaction status from the server response
        const txStatus = verificationResult.data.trx_status
        if (txStatus !== 'Success') {
            console.error('Paystation transaction not successful:', txStatus, verificationResult)
            await adminSupabase
                .from('bkash_payments')
                .update({
                    status: 'failed',
                    gateway_error: `Transaction status: ${txStatus}`,
                })
                .eq('payment_id', invoiceNumber)

            return NextResponse.redirect(`${baseRedirect}?status=failed&error=payment_not_successful`)
        }

        // Verify amount matches (prevent manipulation)
        const verifiedAmount = parseFloat(verificationResult.data.payment_amount)
        const recordedAmount = parseFloat(paymentRecord.amount)
        if (Math.abs(verifiedAmount - recordedAmount) > 0.01) {
            console.error('Amount mismatch!', { verifiedAmount, recordedAmount })
            await adminSupabase
                .from('bkash_payments')
                .update({
                    status: 'failed',
                    gateway_error: `Amount mismatch: expected ${recordedAmount}, got ${verifiedAmount}`,
                })
                .eq('payment_id', invoiceNumber)

            return NextResponse.redirect(`${baseRedirect}?status=failed&error=amount_mismatch`)
        }

        // Payment verified successfully — mark as executed
        const confirmedTrxId = verificationResult.data.trx_id || trxId || ''
        await adminSupabase
            .from('bkash_payments')
            .update({
                status: 'executed',
                trx_id: confirmedTrxId,
                payment_method: verificationResult.data.payment_method || 'paystation',
            })
            .eq('payment_id', invoiceNumber)

        const userId = paymentRecord.user_id
        const amount = parseFloat(paymentRecord.amount)

        // ═══════════════════════════════════════════════════════
        // Process the payment based on intent
        // ═══════════════════════════════════════════════════════

        if (paymentRecord.intent === 'add_balance') {
            // Increment user balance
            const { data: currentUser, error: userFetchErr } = await adminSupabase
                .from('users')
                .select('balance')
                .eq('id', userId)
                .single()

            if (userFetchErr || !currentUser) {
                console.error('Failed to fetch user balance:', userFetchErr)
            } else {
                const newBalance = parseFloat(currentUser.balance || 0) + amount
                await adminSupabase
                    .from('users')
                    .update({ balance: newBalance })
                    .eq('id', userId)

                // Log balance transaction
                await adminSupabase.from('balance_transactions').insert({
                    user_id: userId,
                    amount,
                    type: 'credit',
                    description: `পেমেন্ট গেটওয়ে দিয়ে ব্যালেন্স যোগ (TxID: ${confirmedTrxId})`,
                    reference_id: paymentRecord.id,
                    reference_type: 'gateway_payment',
                })
            }

            // Send notification
            await adminSupabase.from('notifications').insert({
                user_id: userId,
                title: 'ব্যালেন্স যোগ হয়েছে ✅',
                message: `আপনার ওয়ালেটে ৳${amount.toFixed(2)} সফলভাবে যোগ হয়েছে। ট্রানজেকশন আইডি: ${confirmedTrxId}`,
                type: 'payment',
                action_url: '/dashboard/billing',
            })

            // Check referral bonus eligibility (top-up of 200+ taka)
            if (amount >= 200) {
                await checkAndRewardReferral(userId, amount, 'topup')
            }
        } else if (paymentRecord.intent === 'subscribe') {
            const planType = paymentRecord.plan_type
            const startDate = new Date()

            // Upsert subscription — find any existing record for this user
            const { data: existing } = await adminSupabase
                .from('subscriptions')
                .select('id, plan_type, subscription_end_date, status')
                .eq('user_id', userId)
                .order('subscription_start_date', { ascending: false })
                .limit(1)
                .maybeSingle()

            // Calculate end date
            let endDate: Date
            const isCurrentlyActive = existing &&
                existing.status === 'active' &&
                existing.subscription_end_date &&
                new Date(existing.subscription_end_date) > startDate
            const isSamePlan = existing?.plan_type === planType

            if (isCurrentlyActive && isSamePlan) {
                endDate = new Date(existing.subscription_end_date!)
                endDate.setDate(endDate.getDate() + 30)
            } else {
                endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + 30)
            }

            if (existing) {
                const { error: updateError } = await adminSupabase
                    .from('subscriptions')
                    .update({
                        plan_type: planType,
                        status: 'active',
                        subscription_start_date: startDate.toISOString(),
                        subscription_end_date: endDate.toISOString(),
                        payment_method: 'paystation',
                        cv_usage: 0,
                        autofill_usage: 0,
                        extraction_usage: 0,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id)
                if (updateError) {
                    console.error('Failed to update subscription:', updateError)
                }

                // Clear reminder logs for this subscription since it's renewed
                await adminSupabase
                    .from('subscription_reminder_log')
                    .delete()
                    .eq('subscription_id', existing.id)
            } else {
                const { error: insertError } = await adminSupabase
                    .from('subscriptions')
                    .insert({
                        user_id: userId,
                        plan_type: planType,
                        status: 'active',
                        subscription_start_date: startDate.toISOString(),
                        subscription_end_date: endDate.toISOString(),
                        payment_method: 'paystation',
                        auto_renew: false,
                        cv_usage: 0,
                        autofill_usage: 0,
                        extraction_usage: 0,
                    })
                if (insertError) {
                    console.error('Failed to insert subscription:', insertError)
                }
            }

            const planNames: Record<string, string> = {
                basic_bit: 'বেসিক বিট',
                advance_plus: 'এডভান্স প্লাস',
                premium_power: 'প্রিমিয়াম পাওয়ার',
            }

            // Send notification
            await adminSupabase.from('notifications').insert({
                user_id: userId,
                title: 'সাবস্ক্রিপশন সক্রিয় হয়েছে 🎉',
                message: `${planNames[planType] || planType} প্ল্যান সক্রিয় হয়েছে। মেয়াদ: ৩০ দিন পর্যন্ত (${endDate.toLocaleDateString('bn-BD')})। ট্রানজেকশন আইডি: ${confirmedTrxId}`,
                type: 'payment',
                action_url: '/dashboard/billing',
            })

            // Check referral bonus eligibility (subscription purchase of 200+ taka)
            if (amount >= 200) {
                await checkAndRewardReferral(userId, amount, 'subscription')
            }
        }

        return NextResponse.redirect(`${baseRedirect}?status=success`)
    } catch (error) {
        console.error('Paystation callback error:', error)
        return NextResponse.redirect(`${baseRedirect}?status=failed`)
    }
}
