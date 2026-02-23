'use server'

import { createClient } from '@/lib/supabase/server'
import { customerSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { getPaginationRange, type PaginationParams, type PaginatedResponse } from '@/lib/pagination'

export async function getCustomers(shopId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('name')

    if (error) throw error
    return data
}

export async function getPaginatedCustomers(params: PaginationParams): Promise<PaginatedResponse<any>> {
    const supabase = await createClient()
    const { from, to } = getPaginationRange(params.page, params.limit)

    let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('shop_id', params.shopId)
        .eq('is_active', true)

    if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%,email.ilike.%${params.search}%`)
    }

    // Support for filtering by balance (debtors only)
    if (params.filters?.only_debtors) {
        query = query.gt('outstanding_balance', 0)
    }

    const { data, error, count } = await query
        .order(params.sortBy || 'name', { ascending: params.sortOrder === 'asc' })
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

export async function createCustomer(shopId: string, formData: FormData) {
    const supabase = await createClient()

    const customerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip_code: formData.get('zip_code'),
        country: formData.get('country'),
        customer_type: formData.get('customer_type') || 'retail',
        credit_limit: Number(formData.get('credit_limit') || 0),
    }

    const validated = customerSchema.parse(customerData)

    if (validated.phone) {
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('shop_id', shopId)
            .eq('phone', validated.phone)
            .maybeSingle()

        if (existingCustomer) {
            throw new Error(`এই মোবাইল নম্বরটি (${validated.phone}) ইতিমধ্যে অন্য একজন কাস্টমার ব্যবহার করছেন।`)
        }
    }

    const { data, error } = await supabase
        .from('customers')
        .insert({
            ...validated,
            shop_id: shopId,
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/dashboard/shop/customers')
    revalidatePath('/dashboard/shop/sales')
    return data
}

export async function updateCustomer(id: string, formData: FormData) {
    const supabase = await createClient()

    const customerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip_code: formData.get('zip_code'),
        country: formData.get('country'),
        customer_type: formData.get('customer_type'),
        credit_limit: Number(formData.get('credit_limit') || 0),
    }

    const validated = customerSchema.parse(customerData)

    const { data, error } = await supabase
        .from('customers')
        .update(validated)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error

    revalidatePath('/dashboard/shop/customers')
    revalidatePath('/dashboard/shop/sales')
    return data
}

export async function getCustomerStats(shopId: string) {
    const supabase = await createClient()

    const { data, error, count } = await supabase
        .from('customers')
        .select('outstanding_balance', { count: 'exact' })
        .eq('shop_id', shopId)
        .eq('is_active', true)

    if (error) throw error

    const totalDue = data.reduce((sum, c) => sum + (Number(c.outstanding_balance) || 0), 0)
    const totalDebtors = data.filter(c => (Number(c.outstanding_balance) || 0) > 0).length

    return {
        totalCustomers: count || 0,
        totalDue,
        totalDebtors
    }
}
export async function deleteCustomer(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/shop/customers')
    revalidatePath('/dashboard/shop/sales')
    return true
}
