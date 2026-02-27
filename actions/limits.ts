'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLimitsForPlan, PlanLimits } from '@/lib/subscription-limits'
import { Subscription, SubscriptionPlanType } from '@/lib/types'

export async function getUserUsageLimits() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { usage: null, limits: null, planType: null, balance: 0 }
    }

    const adminSupabase = createAdminClient()

    const [subRes, userRes] = await Promise.all([
        adminSupabase
            .from('subscriptions')
            .select('plan_type, status, cv_usage, autofill_usage, subscription_end_date')
            .eq('user_id', user.id)
            .order('status', { ascending: true })
            .order('subscription_start_date', { ascending: false })
            .limit(1)
            .maybeSingle(),
        adminSupabase
            .from('users')
            .select('balance')
            .eq('id', user.id)
            .single()
    ])

    let usage = null
    let limits = null
    let planType = null
    let balance = userRes.data?.balance || 0

    if (subRes.data) {
        const sub = subRes.data
        const isActive = sub.status === 'active' &&
            (!sub.subscription_end_date || new Date(sub.subscription_end_date) > new Date())

        if (isActive) {
            usage = {
                cv_usage: sub.cv_usage || 0,
                autofill_usage: sub.autofill_usage || 0
            }
            limits = getLimitsForPlan(sub.plan_type as SubscriptionPlanType)
            planType = sub.plan_type as SubscriptionPlanType
        }
    }

    return { usage, limits, planType, balance }
}

export async function checkFeatureLimit(feature: 'cv' | 'autofill'): Promise<{ allowed: boolean; remaining: number; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { allowed: false, remaining: 0, error: 'Not authenticated' }

    const adminSupabase = createAdminClient()

    // Get active subscription
    const { data: subscription, error } = await adminSupabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('subscription_start_date', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error || !subscription) {
        return { allowed: false, remaining: 0, error: 'No active subscription found' }
    }

    // Additional date check
    if (subscription.subscription_end_date && new Date(subscription.subscription_end_date) < new Date()) {
        return { allowed: false, remaining: 0, error: 'Subscription expired' }
    }

    const limits = getLimitsForPlan(subscription.plan_type)
    const usage = feature === 'cv' ? (subscription.cv_usage || 0) : (subscription.autofill_usage || 0)
    const limit = feature === 'cv' ? limits.cv_makes : limits.autofill_applications

    const remaining = Math.max(0, limit - usage)

    return {
        allowed: remaining > 0,
        remaining
    }
}

export async function incrementFeatureUsage(feature: 'cv' | 'autofill') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const adminSupabase = createAdminClient()

    const { data: subscription } = await adminSupabase
        .from('subscriptions')
        .select('id, cv_usage, autofill_usage, subscription_end_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('subscription_start_date', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (!subscription) throw new Error('No active subscription found')
    if (subscription.subscription_end_date && new Date(subscription.subscription_end_date) < new Date()) {
        throw new Error('Subscription expired')
    }

    if (feature === 'cv') {
        await adminSupabase
            .from('subscriptions')
            .update({ cv_usage: (subscription.cv_usage || 0) + 1 })
            .eq('id', subscription.id)
    } else {
        await adminSupabase
            .from('subscriptions')
            .update({ autofill_usage: (subscription.autofill_usage || 0) + 1 })
            .eq('id', subscription.id)
    }
}
