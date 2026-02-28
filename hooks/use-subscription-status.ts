'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SubscriptionStatusResult {
    isActive: boolean
    planType: string | null
    daysRemaining: number
    subscription: any | null
}

export function useSubscriptionStatus(userId: string) {
    const [status, setStatus] = useState<SubscriptionStatusResult>({
        isActive: false,
        planType: null,
        daysRemaining: 0,
        subscription: null,
    })
    const [loading, setLoading] = useState(true)

    const checkStatus = useCallback(async () => {
        if (!userId) {
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', userId)
                .order('subscription_start_date', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (error) throw error

            if (!data) {
                setStatus({ isActive: false, planType: null, daysRemaining: 0, subscription: null })
                return
            }

            const now = new Date()
            const endDate = data.subscription_end_date ? new Date(data.subscription_end_date) : null
            const isActive =
                data.status === 'active' &&
                endDate !== null &&
                endDate > now

            const daysRemaining = endDate && endDate > now
                ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : 0

            setStatus({
                isActive,
                planType: isActive ? data.plan_type : null,
                daysRemaining,
                subscription: data,
            })
        } catch (err) {
            console.error('Failed to check subscription:', err)
            setStatus({ isActive: false, planType: null, daysRemaining: 0, subscription: null })
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (!userId) return

        checkStatus()

        // Listen for real-time changes to this user's subscription row so the
        // header updates immediately after a purchase without needing a refresh.
        const supabase = createClient()
        const channel = supabase
            .channel(`subscription-status-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    checkStatus()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, checkStatus])

    return { status, loading, refresh: checkStatus }
}
