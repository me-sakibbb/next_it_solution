import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

        // Deduct balance
        const newBalance = currentBalance - planPrice
        const { error: balanceErr } = await adminSupabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', user.id)

        if (balanceErr) {
            console.error('Failed to deduct balance:', balanceErr)
            return NextResponse.json({ error: 'ব্যালেন্স কাটাতে ব্যর্থ হয়েছে' }, { status: 500 })
        }

        // Calculate subscription dates
        const startDate = new Date()
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 30)

        // Upsert subscription
        const { data: existing } = await adminSupabase
            .from('subscriptions')
            .select('id, subscription_end_date, status')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()

        if (existing) {
            const currentEnd = existing.subscription_end_date && existing.status === 'active'
                ? new Date(existing.subscription_end_date)
                : new Date()

            if (currentEnd > new Date()) {
                endDate.setTime(currentEnd.getTime())
                endDate.setDate(endDate.getDate() + 30)
            }

            await adminSupabase
                .from('subscriptions')
                .update({
                    plan_type: planType,
                    status: 'active',
                    subscription_start_date: startDate.toISOString(),
                    subscription_end_date: endDate.toISOString(),
                    payment_method: 'wallet',
                    cv_usage: 0,
                    autofill_usage: 0,
                })
                .eq('id', existing.id)
        } else {
            await adminSupabase.from('subscriptions').insert({
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
        }

        // Notification
        await adminSupabase.from('notifications').insert({
            user_id: user.id,
            title: 'সাবস্ক্রিপশন সক্রিয় হয়েছে 🎉',
            message: `${PLAN_NAMES[planType]} প্ল্যান সক্রিয় হয়েছে। ওয়ালেট থেকে ৳${planPrice.toFixed(2)} কাটা হয়েছে।`,
            type: 'payment',
            action_url: '/dashboard/billing',
        })

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
