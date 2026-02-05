'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProducts(shopId: string) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!shopId) return

        async function fetchProducts() {
            try {
                setLoading(true)
                const supabase = createClient()

                const { data, error } = await supabase
                    .from('products')
                    .select(`
            *,
            category:categories(id, name),
            inventory(quantity, available_quantity)
          `)
                    .eq('shop_id', shopId)
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setProducts(data || [])
            } catch (err) {
                setError(err as Error)
                console.error('Failed to fetch products:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()

        // Real-time subscription
        const supabase = createClient()
        const channel = supabase
            .channel('products-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                    filter: `shop_id=eq.${shopId}`,
                },
                () => {
                    fetchProducts()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [shopId])

    return { products, loading, error }
}
