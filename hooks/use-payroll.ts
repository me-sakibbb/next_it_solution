'use client'

import { useServerPagination } from './use-server-pagination'
import { createClient } from '@/lib/supabase/client'
import { getPaginationRange, type PaginationParams } from '@/lib/pagination'
import { useCallback, useState, useEffect } from 'react'
import { toast } from 'sonner'

export function usePayroll(shopId: string) {
    const supabase = createClient()
    const [stats, setStats] = useState({
        totalPaid: 0,
        totalPending: 0,
        thisMonthTotal: 0
    })

    const fetchStats = useCallback(async () => {
        if (!shopId) return

        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        // Total Paid
        const { data: paidData } = await supabase
            .from('payroll')
            .select('net_salary')
            .eq('shop_id', shopId)
            .eq('status', 'paid')

        // Total Pending
        const { data: pendingData } = await supabase
            .from('payroll')
            .select('net_salary')
            .eq('shop_id', shopId)
            .eq('status', 'pending')

        // This Month Total (all status)
        const { data: monthData } = await supabase
            .from('payroll')
            .select('net_salary')
            .eq('shop_id', shopId)
            .eq('month', currentMonth)
            .eq('year', currentYear)

        setStats({
            totalPaid: paidData?.reduce((acc, curr) => acc + Number(curr.net_salary), 0) || 0,
            totalPending: pendingData?.reduce((acc, curr) => acc + Number(curr.net_salary), 0) || 0,
            thisMonthTotal: monthData?.reduce((acc, curr) => acc + Number(curr.net_salary), 0) || 0
        })
    }, [supabase, shopId])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const fetchPayroll = useCallback(async (params: PaginationParams) => {
        const { from, to } = getPaginationRange(params.page, params.limit)

        let query = supabase
            .from('payroll')
            .select('*, staff!inner(*)', { count: 'exact' })
            .eq('shop_id', params.shopId)

        if (params.search) {
            query = query.ilike('staff.name', `%${params.search}%`)
        }

        if (params.filters?.status) {
            query = query.eq('status', params.filters.status)
        }

        const { data, error, count } = await query
            .order(params.sortBy || 'year', { ascending: params.sortOrder === 'desc' })
            .order('month', { ascending: params.sortOrder === 'desc' })
            .range(from, to)

        if (error) throw error

        return {
            data: data || [],
            total: count || 0,
        }
    }, [supabase])

    const pagination = useServerPagination({
        fetchAction: fetchPayroll,
        shopId,
        initialLimit: 10,
    })

    const handleCreatePayroll = async (formData: FormData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const baseSalary = Number(formData.get('base_salary'))
            const allowances = Number(formData.get('allowances') || 0)
            const deductions = Number(formData.get('deductions') || 0)
            const overtimePay = Number(formData.get('overtime_pay') || 0)
            const bonus = Number(formData.get('bonus') || 0)

            const grossSalary = baseSalary + allowances + overtimePay + bonus
            const netSalary = grossSalary - deductions

            const payrollData = {
                shop_id: shopId,
                staff_id: formData.get('staff_id'),
                month: Number(formData.get('month')),
                year: Number(formData.get('year')),
                base_salary: baseSalary,
                basic_salary: baseSalary,
                allowances: allowances,
                deductions: deductions,
                overtime_hours: Number(formData.get('overtime_hours') || 0),
                overtime_pay: overtimePay,
                bonus: bonus,
                gross_salary: grossSalary,
                net_salary: netSalary,
                payment_date: formData.get('payment_date') || null,
                payment_method: formData.get('payment_method') || null,
                status: 'pending',
                payment_status: 'pending',
                notes: formData.get('notes') || null,
                created_by: user?.id,
            }

            const { data, error } = await supabase
                .from('payroll')
                .insert(payrollData)
                .select()
                .single()

            if (error) throw error

            toast.success('Payroll record created successfully')
            pagination.refresh()
            fetchStats()
            return data
        } catch (err: any) {
            toast.error(err.message || 'Failed to create payroll record')
            return null
        }
    }

    const handleMarkAsPaid = async (payrollId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { data: payroll, error: fetchError } = await supabase
                .from('payroll')
                .select('shop_id, net_salary')
                .eq('id', payrollId)
                .single()

            if (fetchError) throw fetchError

            const { error: updateError } = await supabase
                .from('payroll')
                .update({
                    status: 'paid',
                    payment_status: 'paid'
                })
                .eq('id', payrollId)

            if (updateError) throw updateError

            try {
                const categoryName = 'পে-রোল'
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
                            title: 'স্টাফ বেতন প্রদান',
                            category_id: category.id,
                            amount: Number(payroll.net_salary),
                            expense_date: new Date().toISOString(),
                            notes: `Auto-generated from payroll`,
                            reference_type: 'payroll',
                            reference_id: payrollId,
                            created_by: user?.id,
                        })
                }
            } catch (err) {
                console.error('Failed to auto log payroll expense:', err)
            }

            toast.success('Payroll marked as paid')
            pagination.refresh()
            fetchStats()
            return true
        } catch (err: any) {
            toast.error(err.message || 'Failed to update payroll status')
            return false
        }
    }

    return {
        payroll: pagination.data,
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
        handleCreatePayroll,
        handleMarkAsPaid,
        stats
    }
}
