'use client'

import { useServerPagination } from './use-server-pagination'
import { createClient } from '@/lib/supabase/client'
import { getPaginationRange, type PaginationParams } from '@/lib/pagination'
import { useCallback, useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useExpenses(shopId: string) {
    const supabase = createClient()
    const [stats, setStats] = useState({
        totalExpenses: 0,
        manualExpenses: 0,
        systemExpenses: 0
    })

    const fetchStats = useCallback(async () => {
        if (!shopId) return

        const { data, error } = await supabase
            .from('expenses')
            .select('amount, reference_type')
            .eq('shop_id', shopId)

        if (error) {
            console.error('Error fetching expense stats:', error)
            return
        }

        const total = data.reduce((acc, curr) => acc + Number(curr.amount), 0)
        const manual = data.filter(e => e.reference_type === 'manual').reduce((acc, curr) => acc + Number(curr.amount), 0)
        const system = total - manual

        setStats({
            totalExpenses: total,
            manualExpenses: manual,
            systemExpenses: system
        })
    }, [supabase, shopId])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const fetchExpenses = useCallback(async (params: PaginationParams) => {
        const { from, to } = getPaginationRange(params.page, params.limit)

        let query = supabase
            .from('expenses')
            .select('*, expense_categories(*)', { count: 'exact' })
            .eq('shop_id', params.shopId)

        if (params.search) {
            query = query.ilike('title', `%${params.search}%`)
        }

        if (params.filters?.category_id && params.filters.category_id !== 'all') {
            query = query.eq('category_id', params.filters.category_id)
        }

        const { data, error, count } = await query
            .order(params.sortBy || 'expense_date', { ascending: params.sortOrder === 'desc' })
            .order('created_at', { ascending: params.sortOrder === 'desc' })
            .range(from, to)

        if (error) throw error

        return {
            data: data || [],
            total: count || 0,
        }
    }, [supabase])

    const pagination = useServerPagination({
        fetchAction: fetchExpenses,
        shopId,
        initialLimit: 10,
    })

    const handleCreateExpense = async (formData: FormData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const categoryIdVal = formData.get('category_id');
            const expenseData = {
                shop_id: shopId,
                title: formData.get('title'),
                category_id: categoryIdVal && categoryIdVal !== 'none' ? categoryIdVal : null,
                amount: Number(formData.get('amount')),
                expense_date: formData.get('expense_date'),
                notes: formData.get('notes') || null,
                reference_type: 'manual',
                created_by: user?.id,
            }

            const { data, error } = await supabase
                .from('expenses')
                .insert(expenseData)
                .select()
                .single()

            if (error) throw error

            toast.success('Expense created successfully')
            pagination.refresh()
            fetchStats()
            return data
        } catch (err: any) {
            toast.error(err.message || 'Failed to create expense')
            return null
        }
    }

    const handleUpdateExpense = async (id: string, formData: FormData) => {
        try {
            const categoryIdVal = formData.get('category_id');
            const expenseData = {
                title: formData.get('title'),
                category_id: categoryIdVal && categoryIdVal !== 'none' ? categoryIdVal : null,
                amount: Number(formData.get('amount')),
                expense_date: formData.get('expense_date'),
                notes: formData.get('notes') || null,
            }

            const { data, error } = await supabase
                .from('expenses')
                .update(expenseData)
                .eq('id', id)
                .eq('reference_type', 'manual')
                .select()
                .single()

            if (error) throw error

            toast.success('Expense updated successfully')
            pagination.refresh()
            fetchStats()
            return data
        } catch (err: any) {
            toast.error(err.message || 'Failed to update expense')
            return null
        }
    }

    const handleDeleteExpense = async (id: string) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id)
                .eq('reference_type', 'manual')

            if (error) throw error

            toast.success('Expense deleted successfully')
            pagination.refresh()
            fetchStats()
            return true
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete expense')
            return false
        }
    }

    return {
        expenses: pagination.data,
        total: pagination.total,
        loading: pagination.loading,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        setPage: pagination.setPage,
        setLimit: pagination.setLimit,
        setSearch: pagination.setSearch,
        setFilters: pagination.setFilters,
        refresh: () => {
            pagination.refresh()
            fetchStats()
        },
        handleCreateExpense,
        handleUpdateExpense,
        handleDeleteExpense,
        stats
    }
}
