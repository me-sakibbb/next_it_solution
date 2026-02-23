'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ShopTask, TaskStatus } from '@/lib/types'
import { createSystemExpense, deleteSystemExpense } from '@/app/actions/expenses'
import { getPaginationRange, type PaginationParams, type PaginatedResponse } from '@/lib/pagination'

export async function getShopTasks(shopId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('shop_tasks')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return data as ShopTask[]
}

export async function getPaginatedShopTasks(params: PaginationParams): Promise<PaginatedResponse<ShopTask>> {
    const supabase = await createClient()
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
        .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })
        .range(from, to)

    if (error) throw new Error(error.message)

    return {
        data: (data || []) as ShopTask[],
        total: count || 0,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil((count || 0) / params.limit)
    }
}

export async function createShopTask(shopId: string, data: Partial<ShopTask>) {
    const supabase = await createClient()

    const { error } = await supabase.from('shop_tasks').insert({
        shop_id: shopId,
        ...data,
        status: 'pending',
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/shop/tasks')
    revalidatePath('/dashboard/shop')
}

export async function updateShopTaskStatus(taskId: string, status: TaskStatus) {
    const supabase = await createClient()

    // 1. Get task details first
    const { data: task, error: fetchError } = await supabase
        .from('shop_tasks')
        .select('*')
        .eq('id', taskId)
        .single()

    if (fetchError) throw new Error(fetchError.message)

    const updates: Partial<ShopTask> = {
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined,
    }

    const { error } = await supabase
        .from('shop_tasks')
        .update(updates)
        .eq('id', taskId)

    if (error) {
        throw new Error(error.message)
    }

    // 2. Handle System Expense
    if (status === 'completed' && task.cost > 0) {
        try {
            await createSystemExpense(
                task.shop_id,
                task.cost,
                `Task Cost: ${task.title}`,
                'Service/Task Cost',
                'shop_task_expense',
                task.id
            )
        } catch (expError) {
            console.error('Failed to create system expense for task:', expError)
        }
    } else if (status === 'pending' && task.cost > 0) {
        try {
            await deleteSystemExpense(task.id, 'shop_task_expense')
        } catch (expError) {
            console.error('Failed to delete system expense for task:', expError)
        }
    }

    revalidatePath('/dashboard/shop/tasks')
    revalidatePath('/dashboard/shop')
    revalidatePath('/dashboard/shop/expenses')
}

export async function deleteShopTask(taskId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('shop_tasks')
        .delete()
        .eq('id', taskId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/shop/tasks')
    revalidatePath('/dashboard/shop')
}
