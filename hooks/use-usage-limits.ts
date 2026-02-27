'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlanLimits } from '@/lib/subscription-limits'
import { SubscriptionPlanType } from '@/lib/types'
import { getUserUsageLimits } from '@/actions/limits'

export function useUsageLimits() {
    const [usage, setUsage] = useState<{ cv_usage: number; autofill_usage: number } | null>(null)
    const [limits, setLimits] = useState<PlanLimits | null>(null)
    const [planType, setPlanType] = useState<SubscriptionPlanType | null>(null)
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)

    const fetchUsage = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getUserUsageLimits()
            setUsage(data.usage)
            setLimits(data.limits)
            setPlanType(data.planType)
            setBalance(data.balance)
        } catch (error) {
            console.error('Failed to get usage limits:', error)
            setUsage(null)
            setLimits(null)
            setPlanType(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsage()
    }, [fetchUsage])

    return { usage, limits, planType, balance, loading, refresh: fetchUsage }
}
