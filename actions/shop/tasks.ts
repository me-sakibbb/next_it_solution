'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ShopTask, TaskStatus } from '@/lib/types'

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

    revalidatePath('/dashboard/shop/tasks')
    revalidatePath('/dashboard/shop')
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
