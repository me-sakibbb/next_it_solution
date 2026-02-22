'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getExpenseCategories(shopId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (error) throw error
    return data
}

export async function createExpenseCategory(shopId: string, formData: FormData) {
    const supabase = await createClient()

    const categoryData = {
        shop_id: shopId,
        name: formData.get('name'),
        description: formData.get('description') || null,
        is_system: false,
        is_active: true
    }

    const { data, error } = await supabase
        .from('expense_categories')
        .insert(categoryData)
        .select()
        .single()

    if (error) throw error
    revalidatePath('/dashboard/shop/expenses/categories')
    return data
}

export async function updateExpenseCategory(id: string, formData: FormData) {
    const supabase = await createClient()

    const categoryData = {
        name: formData.get('name'),
        description: formData.get('description') || null,
    }

    const { data, error } = await supabase
        .from('expense_categories')
        .update(categoryData)
        .eq('id', id)
        .eq('is_system', false) // prevent updating system categories manually
        .select()
        .single()

    if (error) throw error
    revalidatePath('/dashboard/shop/expenses/categories')
    return data
}

export async function deleteExpenseCategory(id: string) {
    const supabase = await createClient()

    // Soft delete by setting is_active to false
    const { error } = await supabase
        .from('expense_categories')
        .update({ is_active: false })
        .eq('id', id)
        .eq('is_system', false) // prevent deleting system categories

    if (error) throw error
    revalidatePath('/dashboard/shop/expenses/categories')
}
