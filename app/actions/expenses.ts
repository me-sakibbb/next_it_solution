'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getExpenses(shopId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('expenses')
        .select('*, expense_categories(*)')
        .eq('shop_id', shopId)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createExpense(shopId: string, formData: FormData) {
    const supabase = await createClient()
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
    revalidatePath('/dashboard/shop/expenses')
    return data
}

export async function updateExpense(id: string, formData: FormData) {
    const supabase = await createClient()

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
        .eq('reference_type', 'manual') // Only allow updating manual expenses directly
        .select()
        .single()

    if (error) throw error
    revalidatePath('/dashboard/shop/expenses')
    return data
}

export async function deleteExpense(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('reference_type', 'manual') // Only allow deleting manual expenses directly

    if (error) throw error
    revalidatePath('/dashboard/shop/expenses')
}

export async function createSystemExpense(
    shopId: string,
    amount: number,
    title: string,
    type: 'supplier_payment' | 'payroll' | 'shop_task_expense',
    referenceId: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Find or create the system category
    let { data: category, error: catError } = await supabase
        .from('expense_categories')
        .select('id')
        .eq('shop_id', shopId)
        .eq('name', title)
        .eq('is_system', true)
        .single()

    if (catError && catError.code === 'PGRST116') {
        // Category doesn't exist, create it
        const { data: newCategory, error: insertError } = await supabase
            .from('expense_categories')
            .insert({
                shop_id: shopId,
                name: title,
                description: `System generated category for ${title}`,
                is_system: true,
                is_active: true
            })
            .select('id')
            .single()

        if (insertError) throw insertError
        category = newCategory
    } else if (catError) {
        throw catError
    }

    if (!category) throw new Error("Could not find or create system category")

    // 2. Insert the expense record
    const expenseData = {
        shop_id: shopId,
        title: title,
        category_id: category.id,
        amount: amount,
        expense_date: new Date().toISOString(),
        notes: `Auto-generated from ${type}`,
        reference_type: type,
        reference_id: referenceId,
        created_by: user?.id,
    }

    const { error: expError } = await supabase
        .from('expenses')
        .insert(expenseData)

    if (expError) throw expError
}
