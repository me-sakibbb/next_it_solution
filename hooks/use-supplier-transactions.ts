'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSystemExpense } from '@/app/actions/expenses'

export function useSupplierTransactions(shopId: string) {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTransactions() {
            if (!shopId) return

            const supabase = createClient()
            const { data, error } = await supabase
                .from('supplier_transactions')
                .select('*')
                .eq('shop_id', shopId)

            if (!error && data) {
                setTransactions(data)
            }
            setLoading(false)
        }

        fetchTransactions()
    }, [shopId])

    const addTransaction = async (
        supplierId: string,
        amount: number,
        type: 'payment' | 'due_added' | 'adjustment',
        notes?: string
    ) => {
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        // Get current due
        const { data: supplier, error: supError } = await supabase
            .from('suppliers')
            .select('due')
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

        // Update supplier due
        const { error: updateError } = await supabase
            .from('suppliers')
            .update({ due: newDue })
            .eq('id', supplierId)

        if (updateError) throw updateError

        // Create transaction record
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

        if (transError) {
            console.error('Failed to create supplier transaction:', transError)
            throw transError
        }

        // Auto log as expense if payment
        if (type === 'payment' && transData) {
            try {
                await createSystemExpense(
                    shopId,
                    amount,
                    'Supplier Payment',
                    'supplier_payment',
                    transData.id
                )
            } catch (err) {
                console.error('Failed to auto-log supplier payment expense:', err)
            }
        }
    }

    return { transactions, loading, addTransaction }
}
