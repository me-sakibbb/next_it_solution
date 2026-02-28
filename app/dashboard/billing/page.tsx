import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BillingPageClient } from './billing-client'
import { redirect } from 'next/navigation'

export default async function BillingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const adminSupabase = createAdminClient()

    // Fetch user profile (balance + referral_code)
    const { data: profile } = await adminSupabase
        .from('users')
        .select('balance, full_name, referral_code')
        .eq('id', user.id)
        .single()

    // Fetch subscription
    const { data: subscription } = await adminSupabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('status', { ascending: true })
        .order('subscription_start_date', { ascending: false })
        .limit(1)
        .maybeSingle()

    // Fetch payment history (last 10)
    const { data: payments } = await adminSupabase
        .from('bkash_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch referral stats
    const { data: referrals, count: referralCount } = await adminSupabase
        .from('referrals')
        .select('id, status, created_at, bonus_amount', { count: 'exact' })
        .eq('referrer_id', user.id)

    const referralStats = {
        total: referralCount || 0,
        rewarded: referrals?.filter(r => r.status === 'rewarded').length || 0,
        pending: referrals?.filter(r => r.status === 'pending').length || 0,
        totalEarned: referrals
            ?.filter(r => r.status === 'rewarded')
            .reduce((sum, r) => sum + parseFloat(r.bonus_amount || 0), 0) || 0,
    }

    return (
        <BillingPageClient
            user={user}
            profile={profile}
            subscription={subscription}
            payments={payments || []}
            referralStats={referralStats}
        />
    )
}
