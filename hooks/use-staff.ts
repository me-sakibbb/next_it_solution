'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStaff(shopId: string) {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!shopId) return

        const supabase = createClient()

        async function fetchStaff() {
            try {
                setLoading(true)

                const { data, error } = await supabase
                    .from('staff')
                    .select(`
                        *,
                        shop_member:shop_members!inner(shop_id)
                    `)
                    .eq('shop_member.shop_id', shopId)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setStaff(data || [])
            } catch (err: any) {
                setError(err as Error)
                console.error('Failed to fetch staff:', {
                    message: err.message,
                    details: err.details,
                    hint: err.hint,
                    code: err.code,
                    error: err
                })
            } finally {
                setLoading(false)
            }
        }

        fetchStaff()

        // Real-time subscription
        const channel = supabase
            .channel('staff-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'staff',
                    filter: `shop_id=eq.${shopId}`,
                },
                () => {
                    fetchStaff()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [shopId])

    return { staff, loading, error }
}
