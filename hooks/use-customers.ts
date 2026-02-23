'use client'

import { Customer } from '@/lib/types'
import { useServerPagination } from './use-server-pagination'
import { createClient } from '@/lib/supabase/client'
import { customerSchema } from '@/lib/validations'
import { getPaginationRange, type PaginationParams } from '@/lib/pagination'
import { useCallback, useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useCustomers(shopId: string, onlyDebtors: boolean = false) {
    const supabase = createClient()
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalDue: 0,
        totalDebtors: 0
    })

    const fetchStats = useCallback(async () => {
        if (!shopId) return
        const { data, error, count } = await supabase
            .from('customers')
            .select('outstanding_balance', { count: 'exact' })
            .eq('shop_id', shopId)
            .eq('is_active', true)

        if (error) {
            console.error('Error fetching customer stats:', error)
            return
        }

        const totalDue = data.reduce((sum, c) => sum + (Number(c.outstanding_balance) || 0), 0)
        const totalDebtors = data.filter(c => (Number(c.outstanding_balance) || 0) > 0).length

        setStats({
            totalCustomers: count || 0,
            totalDue,
            totalDebtors
        })
    }, [supabase, shopId])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const fetchCustomers = useCallback(async (params: PaginationParams) => {
        const { from, to } = getPaginationRange(params.page, params.limit)

        let query = supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('shop_id', params.shopId)
            .eq('is_active', true)

        if (params.search) {
            query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%,email.ilike.%${params.search}%`)
        }

        if (params.filters?.only_debtors) {
            query = query.gt('outstanding_balance', 0)
        }

        const { data, error, count } = await query
            .order(params.sortBy || 'name', { ascending: params.sortOrder === 'asc' })
            .range(from, to)

        if (error) throw error

        return {
            data: data as Customer[] || [],
            total: count || 0,
        }
    }, [supabase])

    const pagination = useServerPagination<Customer>({
        fetchAction: fetchCustomers,
        shopId,
        initialFilters: { only_debtors: onlyDebtors },
        initialLimit: 10,
    })

    const handleCreateCustomer = async (formData: FormData) => {
        try {
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
                    toast.error(`এই মোবাইল নম্বরটি (${validated.phone}) ইতিমধ্যে অন্য একজন কাস্টমার ব্যবহার করছেন।`)
                    return null
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

            toast.success('কাস্টমার সফলভাবে যোগ করা হয়েছে।')
            pagination.refresh()
            fetchStats()
            return data
        } catch (error: any) {
            toast.error(error.message || 'কাস্টমার যোগ করতে সমস্যা হয়েছে।')
            return null
        }
    }

    const handleUpdateCustomer = async (id: string, formData: FormData) => {
        try {
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

            toast.success('কাস্টমার সফলভাবে আপডেট করা হয়েছে।')
            pagination.refresh()
            fetchStats()
            return data
        } catch (error: any) {
            toast.error(error.message || 'কাস্টমার আপডেট করতে সমস্যা হয়েছে।')
            return null
        }
    }

    const handleDeleteCustomer = async (id: string) => {
        try {
            const { error } = await supabase
                .from('customers')
                .update({ is_active: false })
                .eq('id', id)

            if (error) throw error

            toast.success('কাস্টমার সফলভাবে ডিলিট করা হয়েছে।')
            pagination.refresh()
            fetchStats()
            return true
        } catch (error: any) {
            toast.error(error.message || 'কাস্টমার ডিলিট করতে সমস্যা হয়েছে।')
            return false
        }
    }

    return {
        customers: pagination.data,
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
        refresh: pagination.refresh,
        handleCreateCustomer,
        handleUpdateCustomer,
        handleDeleteCustomer,
        stats
    }
}
