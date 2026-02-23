'use client'

import { ShopTask, TaskStatus } from '@/lib/types'
import { toast } from 'sonner'
import { useServerPagination } from './use-server-pagination'
import { useMemo, useCallback, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPaginationRange, type PaginationParams } from '@/lib/pagination'

export function useShopTasks(shopId?: string, status: string = 'all') {
    const supabase = createClient()
    const [stats, setStats] = useState({
        pendingCount: 0,
        completedCount: 0,
        pendingValue: 0
    })

    const fetchStats = useCallback(async () => {
        if (!shopId) return

        const { data: tasks, error } = await supabase
            .from('shop_tasks')
            .select('status, price')
            .eq('shop_id', shopId)

        if (error) {
            console.error('Error fetching task stats:', error)
            return
        }

        const pending = tasks.filter(t => t.status === 'pending')
        const completed = tasks.filter(t => t.status === 'completed')
        const pendingValue = pending.reduce((sum, t) => sum + Number(t.price), 0)

        setStats({
            pendingCount: pending.length,
            completedCount: completed.length,
            pendingValue
        })
    }, [supabase, shopId])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const fetchTasks = useCallback(async (params: PaginationParams) => {
        const { from, to } = getPaginationRange(params.page, params.limit)

        let query = supabase
            .from('shop_tasks')
            .select('*', { count: 'exact' })
            .eq('shop_id', params.shopId)

        if (params.search) {
            query = query.or(`title.ilike.%${params.search}%,customer_name.ilike.%${params.search}%`)
        }

        if (params.filters?.status && params.filters.status !== 'all') {
            query = query.eq('status', params.filters.status)
        }

        const { data, error, count } = await query
            .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'desc' })
            .range(from, to)

        if (error) throw error

        return {
            data: (data || []) as ShopTask[],
            total: count || 0,
        }
    }, [supabase])

    const pagination = useServerPagination<ShopTask>({
        fetchAction: fetchTasks,
        shopId: shopId || '',
        initialFilters: { status },
        initialLimit: 10,
    })

    const createTask = async (data: Partial<ShopTask>) => {
        if (!shopId) return
        try {
            const { error } = await supabase.from('shop_tasks').insert({
                shop_id: shopId,
                ...data,
                status: 'pending',
            })

            if (error) throw error

            toast.success('Task created successfully')
            pagination.refresh()
            fetchStats()
        } catch (error: any) {
            toast.error(error.message || 'Failed to create task')
            throw error
        }
    }

    const updateStatus = async (taskId: string, status: TaskStatus) => {
        if (!shopId) return
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Get task details
            const { data: task, error: fetchError } = await supabase
                .from('shop_tasks')
                .select('*')
                .eq('id', taskId)
                .single()

            if (fetchError) throw fetchError

            // 2. Update status
            const updates: Partial<ShopTask> = {
                status,
                completed_at: status === 'completed' ? new Date().toISOString() : null,
            }

            const { error: updateError } = await supabase
                .from('shop_tasks')
                .update(updates)
                .eq('id', taskId)

            if (updateError) throw updateError

            // 3. Handle System Expense
            if (status === 'completed' && task.cost > 0) {
                try {
                    const categoryName = 'Service/Task Cost'
                    let { data: category } = await supabase
                        .from('expense_categories')
                        .select('id')
                        .eq('shop_id', shopId)
                        .eq('name', categoryName)
                        .eq('is_system', true)
                        .single()

                    if (!category) {
                        const { data: newCategory, error: insertCatError } = await supabase
                            .from('expense_categories')
                            .insert({
                                shop_id: shopId,
                                name: categoryName,
                                is_system: true,
                                is_active: true
                            })
                            .select('id')
                            .single()

                        if (insertCatError) throw insertCatError
                        category = newCategory
                    }

                    if (category) {
                        await supabase
                            .from('expenses')
                            .insert({
                                shop_id: shopId,
                                title: `Task Cost: ${task.title}`,
                                category_id: category.id,
                                amount: Number(task.cost),
                                expense_date: new Date().toISOString(),
                                notes: `Auto-generated from shop_task_expense`,
                                reference_type: 'shop_task_expense',
                                reference_id: taskId,
                                created_by: user?.id,
                            })
                    }
                } catch (expError) {
                    console.error('Failed to create system expense for task:', expError)
                }
            } else if (status === 'pending' && task.cost > 0) {
                try {
                    await supabase
                        .from('expenses')
                        .delete()
                        .eq('reference_id', taskId)
                        .eq('reference_type', 'shop_task_expense')
                } catch (expError) {
                    console.error('Failed to delete system expense for task:', expError)
                }
            }

            toast.success('Task status updated')
            pagination.refresh()
            fetchStats()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update task status')
            throw error
        }
    }

    const deleteTask = async (taskId: string) => {
        try {
            const { error } = await supabase
                .from('shop_tasks')
                .delete()
                .eq('id', taskId)

            if (error) throw error

            toast.success('Task deleted successfully')
            pagination.refresh()
            fetchStats()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete task')
            throw error
        }
    }

    return {
        tasks: pagination.data,
        total: pagination.total,
        loading: pagination.loading,
        error: pagination.error,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        setPage: pagination.setPage,
        setLimit: pagination.setLimit,
        setSearch: pagination.setSearch,
        setFilters: pagination.setFilters,
        stats,
        refreshTasks: () => {
            pagination.refresh()
            fetchStats()
        },
        createTask,
        updateStatus,
        deleteTask,
    }
}
