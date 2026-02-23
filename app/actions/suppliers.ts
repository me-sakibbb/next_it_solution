'use server'

import { createClient } from '@/lib/supabase/server'
import { getPaginationRange, type PaginationParams, type PaginatedResponse } from '@/lib/pagination'
import { supplierSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getSuppliers(shopId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('name')

    if (error) throw error
    return data
}

export async function getPaginatedSuppliers(params: PaginationParams): Promise<PaginatedResponse<any>> {
    const supabase = await createClient()
    const { from, to } = getPaginationRange(params.page, params.limit)

    let query = supabase
        .from('suppliers')
        .select('*', { count: 'exact' })
        .eq('shop_id', params.shopId)
        .eq('is_active', true)

    if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,company_name.ilike.%${params.search}%,phone.ilike.%${params.search}%`)
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

export async function createSupplier(shopId: string, formData: FormData) {
    const supabase = await createClient()

    const supplierData = {
        name: formData.get('name'),
        contact_person: formData.get('contact_person') || undefined,
        email: formData.get('email') || undefined,
        phone: formData.get('phone') || undefined,
        address: formData.get('address') || undefined,
        city: formData.get('city') || undefined,
        state: formData.get('state') || undefined,
        zip_code: formData.get('zip_code') || undefined,
        country: formData.get('country') || undefined,
        tax_id: formData.get('tax_id') || undefined,
        payment_terms: formData.get('payment_terms') || undefined,
        credit_limit: formData.get('credit_limit') ? Number(formData.get('credit_limit')) : undefined,
    }

    const validated = supplierSchema.parse(supplierData)

    const { data, error } = await supabase
        .from('suppliers')
        .insert({
            ...validated,
            shop_id: shopId,
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath('/dashboard/shop/suppliers')
    return data
}

export async function updateSupplier(id: string, shopId: string, formData: FormData) {
    const supabase = await createClient()

    const supplierData = {
        name: formData.get('name'),
        contact_person: formData.get('contact_person') || undefined,
        email: formData.get('email') || undefined,
        phone: formData.get('phone') || undefined,
        address: formData.get('address') || undefined,
        city: formData.get('city') || undefined,
        state: formData.get('state') || undefined,
        zip_code: formData.get('zip_code') || undefined,
        country: formData.get('country') || undefined,
        tax_id: formData.get('tax_id') || undefined,
        payment_terms: formData.get('payment_terms') || undefined,
        credit_limit: formData.get('credit_limit') ? Number(formData.get('credit_limit')) : undefined,
    }

    const validated = supplierSchema.parse(supplierData)

    const { data, error } = await supabase
        .from('suppliers')
        .update(validated)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    revalidatePath('/dashboard/shop/suppliers')
    return data
}

export async function deleteSupplier(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('suppliers')
        .update({ is_active: false })
        .eq('id', id)

    if (error) throw error
    revalidatePath('/dashboard/shop/suppliers')
}

export async function getSupplierStats(shopId: string) {
    const supabase = await createClient()

    const { data, error, count } = await supabase
        .from('suppliers')
        .select('due', { count: 'exact' })
        .eq('shop_id', shopId)
        .eq('is_active', true)

    if (error) throw error

    const totalDue = data.reduce((sum, s) => sum + (Number(s.due) || 0), 0)
    const suppliersWithDueCount = data.filter(s => (Number(s.due) || 0) > 0).length

    return {
        totalSuppliers: count || 0,
        totalDue,
        suppliersWithDueCount
    }
}
