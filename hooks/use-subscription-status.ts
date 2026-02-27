'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSubscriptionStatus(userId: string) {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Avoid running if no userId
        if (!userId) {
            setLoading(false)
            return
        }

        const checkStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('status', { ascending: true })
                    .order('subscription_start_date', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                if (error) throw error
                setStatus(data)
            } catch (err) {
                console.error('Failed to check subscription:', err)
            } finally {
                setLoading(false)
            }
        }

        checkStatus()
    }, [userId, supabase])

    return { status, loading }
}
