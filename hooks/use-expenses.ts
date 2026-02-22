'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getExpenses } from '@/app/actions/expenses'
import { isToday, isThisMonth } from 'date-fns'

export function useExpenses(shopId: string) {
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchExpenses = useCallback(async () => {
        if (!shopId) return

        try {
            setLoading(true)
            const data = await getExpenses(shopId)
            setExpenses(data)
        } catch (error) {
            console.error('Failed to fetch expenses:', error)
        } finally {
            setLoading(false)
        }
    }, [shopId])

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    // Computed stats
    const totalAmount = useMemo(
        () => expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
        [expenses]
    )

    const todayAmount = useMemo(
        () => expenses
            .filter(e => e.expense_date && isToday(new Date(e.expense_date)))
            .reduce((sum, exp) => sum + Number(exp.amount), 0),
        [expenses]
    )

    const thisMonthAmount = useMemo(
        () => expenses
            .filter(e => e.expense_date && isThisMonth(new Date(e.expense_date)))
            .reduce((sum, exp) => sum + Number(exp.amount), 0),
        [expenses]
    )

    return {
        expenses,
        loading,
        totalAmount,
        todayAmount,
        thisMonthAmount,
        refresh: fetchExpenses,
    }
}
