'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSales(shopId: string) {
    const [sales, setSales] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!shopId) return

        async function fetchSales() {
            try {
                setLoading(true)
                const supabase = createClient()

                const { data, error } = await supabase
                    .from('sales')
                    .select(`
            *,
            customer:customers(id, name, phone),
            sale_items(
              *,
              product:products(name, unit)
            )
          `)
                    .eq('shop_id', shopId)
                    .order('created_at', { ascending: false })
                    .limit(100)

                if (error) throw error
                setSales(data || [])
            } catch (err) {
                setError(err as Error)
                console.error('Failed to fetch sales:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchSales()

        // Real-time subscription
        const supabase = createClient()
        const channel = supabase
            .channel('sales-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sales',
                    filter: `shop_id=eq.${shopId}`,
                },
                () => {
                    fetchSales()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [shopId])

    return { sales, loading, error }
}
