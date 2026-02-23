'use client'

import { useServerPagination } from './use-server-pagination'
import { createClient } from '@/lib/supabase/client'
import { getPaginationRange, type PaginationParams } from '@/lib/pagination'
import { useCallback, useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useStaff(shopId: string) {
    const supabase = createClient()
    const [stats, setStats] = useState({
        totalStaff: 0,
        totalPendingLeaves: 0
    })
    const [attendance, setAttendance] = useState<any[]>([])
    const [leaves, setLeaves] = useState<any[]>([])

    const fetchStats = useCallback(async () => {
        if (!shopId) return
        const { count: staffCount } = await supabase
            .from('staff')
            .select('id', { count: 'exact', head: true })
            .eq('shop_id', shopId)
            .eq('is_active', true)

        const { count: leaveCount } = await supabase
            .from('leaves')
            .select('id', { count: 'exact', head: true })
            .eq('shop_id', shopId)
            .eq('status', 'pending')

        setStats({
            totalStaff: staffCount || 0,
            totalPendingLeaves: leaveCount || 0
        })
    }, [supabase, shopId])

    const fetchAttendance = useCallback(async () => {
        if (!shopId) return
        const { data, error } = await supabase
            .from('attendance')
            .select('*, staff(*)')
            .eq('shop_id', shopId)
            .order('date', { ascending: false })
            .limit(100)

        if (!error && data) {
            setAttendance(data)
        }
    }, [supabase, shopId])

    const fetchLeaves = useCallback(async () => {
        if (!shopId) return
        const { data, error } = await supabase
            .from('leaves')
            .select('*, staff(*)')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setLeaves(data)
        }
    }, [supabase, shopId])

    useEffect(() => {
        fetchStats()
        fetchAttendance()
        fetchLeaves()
    }, [fetchStats, fetchAttendance, fetchLeaves])

    const fetchStaff = useCallback(async (params: PaginationParams) => {
        const { from, to } = getPaginationRange(params.page, params.limit)

        let query = supabase
            .from('staff')
            .select('*', { count: 'exact' })
            .eq('shop_id', params.shopId)
            .eq('is_active', true)

        if (params.search) {
            query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%`)
        }

        const { data, error, count } = await query
            .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })
            .range(from, to)

        if (error) throw error

        return {
            data: data || [],
            total: count || 0,
        }
    }, [supabase])

    const pagination = useServerPagination({
        fetchAction: fetchStaff,
        shopId,
        initialLimit: 10,
    })

    const handleCreateStaff = async (formData: FormData) => {
        try {
            const staffData = {
                shop_id: shopId,
                name: formData.get('name'),
                email: formData.get('email') || undefined,
                phone: formData.get('phone') || undefined,
                employee_id: formData.get('employee_id') || undefined,
                department: formData.get('department') || undefined,
                designation: formData.get('designation') || undefined,
                employment_type: formData.get('employment_type') || 'full_time',
                date_of_joining: formData.get('date_of_joining'),
                base_salary: Number(formData.get('base_salary')),
                emergency_contact_name: formData.get('emergency_contact_name') || undefined,
                emergency_contact_phone: formData.get('emergency_contact_phone') || undefined,
            }

            const { data, error } = await supabase
                .from('staff')
                .insert(staffData)
                .select()
                .single()

            if (error) throw error

            toast.success('Staff added successfully')
            pagination.refresh()
            fetchStats()
            return data
        } catch (err: any) {
            toast.error(err.message || 'Failed to add staff')
            return null
        }
    }

    const handleUpdateStaff = async (staffId: string, formData: FormData) => {
        try {
            const staffData = {
                name: formData.get('name'),
                email: formData.get('email') || undefined,
                phone: formData.get('phone') || undefined,
                employee_id: formData.get('employee_id') || undefined,
                department: formData.get('department') || undefined,
                designation: formData.get('designation') || undefined,
                employment_type: formData.get('employment_type') || 'full_time',
                date_of_joining: formData.get('date_of_joining'),
                base_salary: Number(formData.get('base_salary')),
                emergency_contact_name: formData.get('emergency_contact_name') || undefined,
                emergency_contact_phone: formData.get('emergency_contact_phone') || undefined,
            }

            const { data, error } = await supabase
                .from('staff')
                .update(staffData)
                .eq('id', staffId)
                .select()
                .single()

            if (error) throw error

            toast.success('Staff updated successfully')
            pagination.refresh()
            fetchStats()
            return data
        } catch (err: any) {
            toast.error(err.message || 'Failed to update staff')
            return null
        }
    }

    const handleCreateAttendance = async (formData: FormData) => {
        try {
            const attendanceData = {
                shop_id: shopId,
                staff_id: formData.get('staff_id'),
                date: formData.get('date'),
                check_in: formData.get('check_in') ? new Date(formData.get('check_in') as string).toISOString() : null,
                check_out: formData.get('check_out') ? new Date(formData.get('check_out') as string).toISOString() : null,
                status: formData.get('status') || 'present',
                notes: formData.get('notes'),
            }

            const { error } = await supabase.from('attendance').insert(attendanceData)
            if (error) throw error
            toast.success('Attendance recorded')
            fetchAttendance()
            return true
        } catch (err: any) {
            toast.error(err.message || 'Failed to record attendance')
            return false
        }
    }

    const handleCreateLeave = async (formData: FormData) => {
        try {
            const fromDate = new Date(formData.get('from_date') as string)
            const toDate = new Date(formData.get('to_date') as string)
            const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

            const leaveData = {
                shop_id: shopId,
                staff_id: formData.get('staff_id'),
                leave_type: formData.get('leave_type'),
                from_date: formData.get('from_date'),
                to_date: formData.get('to_date'),
                days,
                reason: formData.get('reason'),
                status: 'pending',
            }

            const { error } = await supabase.from('leaves').insert(leaveData)
            if (error) throw error
            toast.success('Leave requested')
            fetchLeaves()
            fetchStats()
            return true
        } catch (err: any) {
            toast.error(err.message || 'Failed to request leave')
            return false
        }
    }

    const handleUpdateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('leaves')
                .update({
                    status,
                    approved_by: user?.id,
                    approved_at: new Date().toISOString(),
                })
                .eq('id', id)
            if (error) throw error
            toast.success(`Leave ${status}`)
            fetchLeaves()
            fetchStats()
            return true
        } catch (err: any) {
            toast.error(err.message || 'Failed to update leave status')
            return false
        }
    }

    return {
        staff: pagination.data,
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
            fetchAttendance()
            fetchLeaves()
        },
        handleCreateStaff,
        handleUpdateStaff,
        handleCreateAttendance,
        handleCreateLeave,
        handleUpdateLeaveStatus,
        stats,
        attendance,
        leaves
    }
}
