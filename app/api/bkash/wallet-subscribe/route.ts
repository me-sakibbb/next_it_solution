import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAndRewardReferral } from '@/lib/referral'

const PLAN_PRICES: Record<string, number> = {
    basic_bit: 199,
    advance_plus: 299,
    premium_power: 399,
}

const PLAN_NAMES: Record<string, string> = {
    basic_bit: 'বেসিক বিট',
    advance_plus: 'এডভান্স প্লাস',
    premium_power: 'প্রিমিয়াম পাওয়ার',
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'অনুমোদিত নয়' }, { status: 401 })
        }

        const body = await request.json()
        const { planType } = body

        // Validate plan
        const validPlans = Object.keys(PLAN_PRICES)
        if (!planType || !validPlans.includes(planType)) {
            return NextResponse.json({ error: 'অবৈধ প্ল্যান নির্বাচন' }, { status: 400 })
        }

        const planPrice = PLAN_PRICES[planType]

        // Fetch current user balance using admin client
        const adminSupabase = createAdminClient()
        const { data: userData, error: userErr } = await adminSupabase
            .from('users')
            .select('balance')
            .eq('id', user.id)
            .single()

        if (userErr || !userData) {
            return NextResponse.json({ error: 'ব্যবহারকারীর তথ্য পাওয়া যায়নি' }, { status: 500 })
        }

        const currentBalance = parseFloat(userData.balance || 0)

        if (currentBalance < planPrice) {
            return NextResponse.json(
                {
                    error: `পর্যাপ্ত ব্যালেন্স নেই। প্রয়োজন: ৳${planPrice.toFixed(2)}, বর্তমান: ৳${currentBalance.toFixed(2)}`,
                    code: 'INSUFFICIENT_BALANCE',
                },
                { status: 400 }
            )
        }

        // Deduct balance atomically
        const { error: balanceErr, data: updatedUser } = await adminSupabase
            .from('users')
            .update({ balance: currentBalance - planPrice })
            .eq('id', user.id)
            .gte('balance', planPrice) // Ensure balance is still sufficient at the moment of update
            .select('balance')
            .single()

        if (balanceErr || !updatedUser) {
            console.error('Failed to deduct balance (possible race condition or insufficient funds):', balanceErr)
            return NextResponse.json({ error: 'ব্যালেন্স কাটাতে ব্যর্থ হয়েছে বা ইনসাফিসিয়েন্ট ব্যালেন্স' }, { status: 500 })
        }

        const newBalance = updatedUser.balance

        // Log balance transaction (debit for subscription purchase)
        await adminSupabase.from('balance_transactions').insert({
            user_id: user.id,
            amount: planPrice,
            type: 'debit',
            description: `${PLAN_NAMES[planType]} সাবস্ক্রিপশন কেনা হয়েছে (ওয়ালেট থেকে)`,
            reference_type: 'subscription',
        })

        // Calculate subscription dates
        const startDate = new Date()

        // Find any existing subscription record for this user
        const { data: existing } = await adminSupabase
            .from('subscriptions')
            .select('id, plan_type, subscription_end_date, status')
            .eq('user_id', user.id)
            .order('subscription_start_date', { ascending: false })
            .limit(1)
            .maybeSingle()

        // Calculate end date:
        // - If same plan and still active: extend from current end date
        // - If upgrading/downgrading plan or expired: 30 days from now
        let endDate: Date
        const isCurrentlyActive = existing &&
            existing.status === 'active' &&
            existing.subscription_end_date &&
            new Date(existing.subscription_end_date) > startDate
        const isSamePlan = existing?.plan_type === planType

        if (isCurrentlyActive && isSamePlan) {
            // Same plan renewal — extend from current end
            endDate = new Date(existing.subscription_end_date!)
            endDate.setDate(endDate.getDate() + 30)
        } else {
            // New plan or upgrade/downgrade — 30 days from now, limits reset
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
                    payment_method: 'wallet',
                    cv_usage: 0,
                    autofill_usage: 0,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id)
            if (updateError) {
                console.error('Failed to update subscription:', updateError)
                return NextResponse.json({ error: 'সাবস্ক্রিপশন আপডেট করতে ব্যর্থ হয়েছে' }, { status: 500 })
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
                    user_id: user.id,
                    plan_type: planType,
                    status: 'active',
                    subscription_start_date: startDate.toISOString(),
                    subscription_end_date: endDate.toISOString(),
                    payment_method: 'wallet',
                    auto_renew: false,
                    cv_usage: 0,
                    autofill_usage: 0,
                })
            if (insertError) {
                console.error('Failed to insert subscription:', insertError)
                return NextResponse.json({ error: 'সাবস্ক্রিপশন তৈরি করতে ব্যর্থ হয়েছে' }, { status: 500 })
            }
        }

        // Notification
        await adminSupabase.from('notifications').insert({
            user_id: user.id,
            title: 'সাবস্ক্রিপশন সক্রিয় হয়েছে 🎉',
            message: `${PLAN_NAMES[planType]} প্ল্যান সক্রিয় হয়েছে। ওয়ালেট থেকে ৳${planPrice.toFixed(2)} কাটা হয়েছে।`,
            type: 'payment',
            action_url: '/dashboard/billing',
        })

        // Check referral bonus eligibility (subscription purchase of 200+ taka)
        if (planPrice >= 200) {
            await checkAndRewardReferral(user.id, planPrice, 'subscription')
        }

        return NextResponse.json({
            success: true,
            newBalance,
            message: `${PLAN_NAMES[planType]} প্ল্যান সফলভাবে সক্রিয় হয়েছে!`,
        })
    } catch (error) {
        console.error('Wallet subscribe error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'পেমেন্ট প্রক্রিয়া করতে ব্যর্থ হয়েছে' },
            { status: 500 }
        )
    }
}
