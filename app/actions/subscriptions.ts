'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSubscription(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[v0] Get subscription error:', error)
    return null
  }

  return data
}

export async function createTrialSubscription(userId: string) {
  const supabase = await createClient()

  const trialStartDate = new Date()
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 14) // 14 day trial

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_type: 'trial',
      status: 'active',
      trial_start_date: trialStartDate.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
      auto_renew: false,
    })
    .select()
    .single()

  if (error) {
    console.error('[v0] Create trial error:', error)
    return { error: 'Failed to create trial subscription' }
  }

  revalidatePath('/dashboard')
  return { data, error: null }
}

export async function updateSubscription(
  subscriptionId: string,
  planType: string,
  status: string
) {
  const supabase = await createClient()

  const subscriptionStartDate = new Date()
  const subscriptionEndDate = new Date()
  subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1) // 1 month

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      plan_type: planType,
      status: status,
      subscription_start_date: subscriptionStartDate.toISOString(),
      subscription_end_date: subscriptionEndDate.toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single()

  if (error) {
    console.error('[v0] Update subscription error:', error)
    return { error: 'Failed to update subscription' }
  }

  revalidatePath('/dashboard/settings')
  return { data, error: null }
}

export async function checkSubscriptionStatus(userId: string) {
  const subscription = await getSubscription(userId)

  if (!subscription) {
    return { isActive: false, needsTrial: true }
  }

  const now = new Date()
  const endDate = subscription.trial_end_date
    ? new Date(subscription.trial_end_date)
    : subscription.subscription_end_date
      ? new Date(subscription.subscription_end_date)
      : null

  if (!endDate) {
    return { isActive: false, needsTrial: false }
  }

  const isActive = subscription.status === 'active' && now < endDate

  return {
    isActive,
    needsTrial: false,
    daysRemaining: Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    subscription
  }
}
