'use client'

import { useState, useEffect, useCallback } from 'react'
import { getServicesAdmin, upsertService } from '@/actions/superadmin'
import { getAppSettings } from '@/actions/settings'
import { Service } from '@/lib/types'
import { toast } from 'sonner'

export function useAdminServices() {
    const [services, setServices] = useState<Service[]>([])
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [svcs, cfg] = await Promise.all([getServicesAdmin(), getAppSettings()])
            setServices(svcs as Service[])
            setSettings(cfg)
        } catch (err: any) {
            console.error('Failed to fetch admin services:', err)
            setError(err.message || 'Failed to fetch services')
            toast.error(err.message || 'Failed to fetch services')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSaveService = useCallback(async (service: Partial<Service>) => {
        try {
            await upsertService(service)
            toast.success('সার্ভিস সফলভাবে সংরক্ষণ করা হয়েছে।')
            await fetchData()
            return true
        } catch (err: any) {
            console.error('Failed to save service:', err)
            toast.error(err.message || 'Failed to save service')
            throw err
        }
    }, [fetchData])

    return {
        services,
        settings,
        loading,
        error,
        handleSaveService,
        refresh: fetchData
    }
}
