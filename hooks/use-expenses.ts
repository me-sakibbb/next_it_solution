'use client'

import { useState, useEffect } from 'react'
import { getExpenses } from '@/app/actions/expenses'

export function useExpenses(shopId: string) {
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchExpenses() {
            if (!shopId) return

            try {
                const data = await getExpenses(shopId)
                setExpenses(data)
            } catch (error) {
                console.error('Failed to fetch expenses:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchExpenses()
    }, [shopId])

    return { expenses, loading }
}
