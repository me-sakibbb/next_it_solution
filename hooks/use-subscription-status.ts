'use client'

import { useState, useEffect } from 'react'
import { checkSubscriptionStatus } from '@/app/actions/subscriptions'

export function useSubscriptionStatus(userId: string) {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Avoid running if no userId
        if (!userId) {
            setLoading(false)
            return
        }

        checkSubscriptionStatus(userId)
            .then(setStatus)
            .catch((err) => console.error('Failed to check subscription:', err))
            .finally(() => setLoading(false))
    }, [userId])

    return { status, loading }
}
