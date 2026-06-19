'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchPaginatedOrders, updateOrderStatus } from '@/actions/superadmin'
import { ServiceOrder, ServiceStatus } from '@/lib/types'
import { toast } from 'sonner'

export function useAdminOrders() {
    const [orders, setOrders] = useState<ServiceOrder[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [params, setParams] = useState({
        page: 1,
        pageSize: 10,
        search: '',
        status: 'all'
    })

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await fetchPaginatedOrders(params)
            setOrders(result.data as ServiceOrder[])
            setTotal(result.total)
        } catch (err: any) {
            console.error('Failed to fetch orders:', err)
            setError(err.message || 'Failed to fetch orders')
            toast.error(err.message || 'Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }, [params])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleUpdateOrderStatus = useCallback(async (orderId: string, status: string, deliverables: string) => {
        try {
            await updateOrderStatus(orderId, status, deliverables)
            // Immediately update the local state for a fast UI update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as ServiceStatus, deliverables } : o))
            toast.success('অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে।')
            // Refresh database data in the background to ensure correctness
            fetchOrders()
            return true
        } catch (err: any) {
            console.error('Failed to update order status:', err)
            toast.error(err.message || 'Failed to update order status')
            throw err
        }
    }, [fetchOrders])

    const handleParamsChange = useCallback((newParams: Partial<typeof params>) => {
        setParams(prev => ({ ...prev, ...newParams }))
    }, [])

    return {
        orders,
        total,
        loading,
        error,
        page: params.page,
        pageSize: params.pageSize,
        params,
        onParamsChange: handleParamsChange,
        handleUpdateOrderStatus,
        refresh: fetchOrders
    }
}
