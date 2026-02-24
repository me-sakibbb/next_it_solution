'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export function useReports(shopId: string) {
    const supabase = createClient()
    const [sales, setSales] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        if (!shopId) return
        try {
            setLoading(true)

            const [salesRes, productsRes, expensesRes] = await Promise.all([
                supabase
                    .from('sales')
                    .select('*, customer:customers(name), sale_items(*)')
                    .eq('shop_id', shopId)
                    .order('sale_date', { ascending: false }),
                supabase
                    .from('products')
                    .select('*, category:categories(name), inventory(quantity)')
                    .eq('shop_id', shopId)
                    .eq('is_active', true),
                supabase
                    .from('expenses')
                    .select('*, expense_categories(name)')
                    .eq('shop_id', shopId)
                    .order('expense_date', { ascending: false })
            ])

            if (salesRes.error) throw salesRes.error
            if (productsRes.error) throw productsRes.error
            if (expensesRes.error) throw expensesRes.error

            setSales(salesRes.data || [])
            setProducts(productsRes.data || [])
            setExpenses(expensesRes.data || [])
        } catch (error: any) {
            console.error('Error fetching reports data:', error)
            toast.error('Failed to load reports data')
        } finally {
            setLoading(false)
        }
    }, [supabase, shopId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        sales,
        products,
        expenses,
        loading,
        refresh: fetchData
    }
}
