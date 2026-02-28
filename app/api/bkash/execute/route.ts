import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { executePayment } from '@/lib/bkash'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const paymentID = searchParams.get('paymentID')
    const status = searchParams.get('status')

    const baseRedirect = `${request.nextUrl.origin}/dashboard/billing`

    // User cancelled or payment failed before execution
    if (!paymentID || status === 'cancel') {
        return NextResponse.redirect(`${baseRedirect}?status=cancelled`)
    }

    if (status === 'failure') {
        // Update DB record
        const adminSupabase = createAdminClient()
        await adminSupabase
            .from('bkash_payments')
            .update({ status: 'failed' })
            .eq('payment_id', paymentID)

        return NextResponse.redirect(`${baseRedirect}?status=failed`)
    }

    try {
        const adminSupabase = createAdminClient()

        // Fetch the payment session we recorded earlier
        const { data: paymentRecord, error: fetchError } = await adminSupabase
            .from('bkash_payments')
            .select('*')
            .eq('payment_id', paymentID)
            .single()

        if (fetchError || !paymentRecord) {
            console.error('Payment record not found for paymentID:', paymentID, fetchError)
            return NextResponse.redirect(`${baseRedirect}?status=failed&error=record_not_found`)
        }

        // Idempotency check — if already executed, just redirect to success
        if (paymentRecord.status === 'executed') {
            return NextResponse.redirect(`${baseRedirect}?status=success&already=true`)
        }

        // Execute the payment with bKash
        let trxResult
        try {
            trxResult = await executePayment(paymentID)
        } catch (bkashError) {
            console.error('bKash execute failed:', bkashError)
            await adminSupabase
                .from('bkash_payments')
                .update({
                    status: 'failed',
                })
                .eq('payment_id', paymentID)

            return NextResponse.redirect(`${baseRedirect}?status=failed&error=execute_failed`)
        }

        // Mark payment record as executed with trxID
        await adminSupabase
            .from('bkash_payments')
            .update({
                status: 'executed',
                trx_id: trxResult.trxID,
            })
            .eq('payment_id', paymentID)

        const userId = paymentRecord.user_id
        const amount = paymentRecord.amount

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
                const newBalance = parseFloat(currentUser.balance || 0) + parseFloat(amount)
                await adminSupabase
                    .from('users')
                    .update({ balance: newBalance })
                    .eq('id', userId)
            }

            // Send notification
            await adminSupabase.from('notifications').insert({
                user_id: userId,
                title: 'ব্যালেন্স যোগ হয়েছে ✅',
                message: `আপনার ওয়ালেটে ৳${parseFloat(amount).toFixed(2)} সফলভাবে যোগ হয়েছে। ট্রানজেকশন আইডি: ${trxResult.trxID}`,
                type: 'payment',
                action_url: '/dashboard/billing',
            })
        } else if (paymentRecord.intent === 'subscribe') {
            const planType = paymentRecord.plan_type

            const startDate = new Date()

            // Upsert subscription — find any existing record for this user
            const { data: existing } = await adminSupabase
                .from('subscriptions')
                .select('id, subscription_end_date, status')
                .eq('user_id', userId)
                .order('subscription_start_date', { ascending: false })
                .limit(1)
                .maybeSingle()

            // Calculate end date: extend from current end if still active, otherwise 30 days from now
            let endDate: Date
            if (
                existing &&
                existing.status === 'active' &&
                existing.subscription_end_date &&
                new Date(existing.subscription_end_date) > startDate
            ) {
                endDate = new Date(existing.subscription_end_date)
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
                        payment_method: 'bkash',
                        cv_usage: 0,
                        autofill_usage: 0,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id)
                if (updateError) {
                    console.error('Failed to update subscription:', updateError)
                }
            } else {
                const { error: insertError } = await adminSupabase
                    .from('subscriptions')
                    .insert({
                        user_id: userId,
                        plan_type: planType,
                        status: 'active',
                        subscription_start_date: startDate.toISOString(),
                        subscription_end_date: endDate.toISOString(),
                        payment_method: 'bkash',
                        auto_renew: false,
                        cv_usage: 0,
                        autofill_usage: 0,
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
                message: `${planNames[planType] || planType} প্ল্যান সক্রিয় হয়েছে। মেয়াদ: ৩০ দিন পর্যন্ত (${endDate.toLocaleDateString('bn-BD')})। ট্রানজেকশন আইডি: ${trxResult.trxID}`,
                type: 'payment',
                action_url: '/dashboard/billing',
            })
        }

        return NextResponse.redirect(`${baseRedirect}?status=success`)
    } catch (error) {
        console.error('bKash execute route error:', error)
        return NextResponse.redirect(`${baseRedirect}?status=failed`)
    }
}
