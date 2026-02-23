'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { getPaginationRange, type PaginationParams, type PaginatedResponse } from '@/lib/pagination'

export async function getPaginatedExpenses(params: PaginationParams): Promise<PaginatedResponse<any>> {
    const supabase = await createClient()
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
        .order(params.sortBy || 'expense_date', { ascending: params.sortOrder === 'asc' })
        .order('created_at', { ascending: params.sortOrder === 'asc' })
        .range(from, to)

    if (error) throw error

    return {
        data: data || [],
        total: count || 0,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil((count || 0) / params.limit)
    }
}

export async function getExpenseStats(shopId: string) {
    const supabase = await createClient()

    const todayStr = new Date().toISOString().split('T')[0]
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('shop_id', shopId)

    if (error) throw error

    const totalAmount = data.reduce((sum, e) => sum + Number(e.amount), 0)
    const todayAmount = data
        .filter(e => e.expense_date === todayStr)
        .reduce((sum, e) => sum + Number(e.amount), 0)
    const thisMonthAmount = data
        .filter(e => e.expense_date >= firstDayOfMonth)
        .reduce((sum, e) => sum + Number(e.amount), 0)

    return {
        totalAmount,
        todayAmount,
        thisMonthAmount,
        totalRecords: data.length
    }
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
    categoryName: string,
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
        .eq('name', categoryName)
        .eq('is_system', true)
        .single()

    if (catError && catError.code === 'PGRST116') {
        // Category doesn't exist, create it
        const { data: newCategory, error: insertError } = await supabase
            .from('expense_categories')
            .insert({
                shop_id: shopId,
                name: categoryName,
                description: `System generated category for ${categoryName}`,
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
export async function deleteSystemExpense(referenceId: string, type: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('reference_id', referenceId)
        .eq('reference_type', type)

    if (error) throw error
    revalidatePath('/dashboard/shop/expenses')
}
