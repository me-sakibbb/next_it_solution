'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useSupplierTransactions(shopId: string) {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchTransactions = useCallback(async () => {
        if (!shopId) return

        const { data, error } = await supabase
            .from('supplier_transactions')
            .select('*')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setTransactions(data)
        }
        setLoading(false)
    }, [shopId, supabase])

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    const addTransaction = async (
        supplierId: string,
        amount: number,
        type: 'payment' | 'due_added' | 'adjustment',
        notes?: string
    ) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Get current due
            const { data: supplier, error: supError } = await supabase
                .from('suppliers')
                .select('due, name')
                .eq('id', supplierId)
                .single()

            if (supError) throw supError

            let newDue = Number(supplier.due)
            if (type === 'payment') {
                newDue -= amount
            } else if (type === 'due_added') {
                newDue += amount
            } else if (type === 'adjustment') {
                newDue += amount
            }

            // 2. Update supplier due
            const { error: updateError } = await supabase
                .from('suppliers')
                .update({ due: newDue })
                .eq('id', supplierId)

            if (updateError) throw updateError

            // 3. Create transaction record
            const { data: transData, error: transError } = await supabase
                .from('supplier_transactions')
                .insert({
                    shop_id: shopId,
                    supplier_id: supplierId,
                    transaction_type: type,
                    amount,
                    notes,
                    created_by: user?.id,
                })
                .select()
                .single()

            if (transError) throw transError

            // 4. Auto log as expense if payment
            if (type === 'payment' && transData) {
                try {
                    const categoryName = 'সাপ্লায়ার পেমেন্ট'
                    let { data: category } = await supabase
                        .from('expense_categories')
                        .select('id')
                        .eq('shop_id', shopId)
                        .eq('name', categoryName)
                        .eq('is_system', true)
                        .single()

                    if (!category) {
                        const { data: newCategory } = await supabase
                            .from('expense_categories')
                            .insert({
                                shop_id: shopId,
                                name: categoryName,
                                is_system: true,
                                is_active: true
                            })
                            .select('id')
                            .single()
                        category = newCategory
                    }

                    if (category) {
                        await supabase
                            .from('expenses')
                            .insert({
                                shop_id: shopId,
                                title: `সাপ্লায়ার পেমেন্ট - ${supplier.name}`,
                                category_id: category.id,
                                amount: amount,
                                expense_date: new Date().toISOString(),
                                notes: `Auto-generated from supplier transaction`,
                                reference_type: 'supplier_payment',
                                reference_id: transData.id,
                                created_by: user?.id,
                            })
                    }
                } catch (err) {
                    console.error('Failed to auto-log supplier payment expense:', err)
                }
            }

            toast.success('Transaction added successfully')
            fetchTransactions()
            return true
        } catch (error: any) {
            toast.error(error.message || 'Failed to add transaction')
            return false
        }
    }

    return { transactions, loading, addTransaction, refresh: fetchTransactions }
}
