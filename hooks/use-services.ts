'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAvailableServices, getUserOrders, getUserBalance } from '@/actions/services'
import { Service, ServiceOrder } from '@/lib/types'

export function useServices() {
    const [services, setServices] = useState<Service[]>([])
    const [orders, setOrders] = useState<ServiceOrder[]>([])
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [s, o, b] = await Promise.all([
                getAvailableServices(),
                getUserOrders(),
                getUserBalance()
            ])
            setServices(s as Service[])
            setOrders(o as ServiceOrder[])
            setBalance(b)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch services data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        services,
        orders,
        balance,
        loading,
        error,
        refresh: fetchData
    }
}
