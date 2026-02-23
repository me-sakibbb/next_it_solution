'use client'

import { useServerPagination } from './use-server-pagination'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { supplierSchema } from '@/lib/validations'
import { getPaginationRange, type PaginationParams } from '@/lib/pagination'
import { useCallback, useState, useEffect } from 'react'

export function useSuppliers(shopId: string) {
    const supabase = createClient()
    const [stats, setStats] = useState({
        totalSuppliers: 0,
        totalDue: 0,
        suppliersWithDueCount: 0
    })

    const fetchStats = useCallback(async () => {
        if (!shopId) return
        const { data, error, count } = await supabase
            .from('suppliers')
            .select('due', { count: 'exact' })
            .eq('shop_id', shopId)
            .eq('is_active', true)

        if (error) {
            console.error('Error fetching supplier stats:', error)
            return
        }

        const totalDue = data.reduce((sum, s) => sum + (Number(s.due) || 0), 0)
        const suppliersWithDueCount = data.filter(s => (Number(s.due) || 0) > 0).length

        setStats({
            totalSuppliers: count || 0,
            totalDue,
            suppliersWithDueCount
        })
    }, [supabase, shopId])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const fetchSuppliers = useCallback(async (params: PaginationParams) => {
        const { from, to } = getPaginationRange(params.page, params.limit)

        let query = supabase
            .from('suppliers')
            .select('*', { count: 'exact' })
            .eq('shop_id', params.shopId)
            .eq('is_active', true)

        if (params.search) {
            query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%`)
        }

        const { data, error, count } = await query
            .order(params.sortBy || 'name', { ascending: params.sortOrder === 'asc' })
            .range(from, to)

        if (error) throw error

        return {
            data: data || [],
            total: count || 0,
        }
    }, [supabase])

    const pagination = useServerPagination({
        fetchAction: fetchSuppliers,
        shopId,
        initialLimit: 10,
    })

    const handleCreate = async (formData: FormData) => {
        try {
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

            toast.success('সাপ্লায়ার সফলভাবে যোগ করা হয়েছে।')
            pagination.refresh()
            fetchStats()
            return data
        } catch (err: any) {
            toast.error(err.message || 'সাপ্লায়ার যোগ করতে সমস্যা হয়েছে।')
            throw err
        }
    }

    const handleUpdate = async (id: string, formData: FormData) => {
        try {
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

            toast.success('সাপ্লায়ার সফলভাবে আপডেট করা হয়েছে।')
            pagination.refresh()
            fetchStats()
            return data
        } catch (err: any) {
            toast.error(err.message || 'সাপ্লায়ার আপডেট করতে সমস্যা হয়েছে।')
            throw err
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('suppliers')
                .update({ is_active: false })
                .eq('id', id)

            if (error) throw error

            toast.success('সাপ্লায়ার সফলভাবে ডিলিট করা হয়েছে।')
            pagination.refresh()
            fetchStats()
            return true
        } catch (err: any) {
            toast.error(err.message || 'সাপ্লায়ার ডিলিট করতে সমস্যা হয়েছে।')
            throw err
        }
    }

    return {
        suppliers: pagination.data,
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
        createSupplier: handleCreate,
        updateSupplier: handleUpdate,
        deleteSupplier: handleDelete,
        stats
    }
}
