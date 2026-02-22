'use client'

import { useState, useEffect } from 'react'
import { getExpenseCategories } from '@/app/actions/expense-categories'

export function useExpenseCategories(shopId: string) {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCategories() {
            if (!shopId) return

            try {
                const data = await getExpenseCategories(shopId)
                setCategories(data)
            } catch (error) {
                console.error('Failed to fetch expense categories:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [shopId])

    return { categories, loading }
}
