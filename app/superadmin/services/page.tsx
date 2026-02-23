'use client'

import { useEffect, useState } from 'react'
import { getServicesAdmin } from '@/actions/superadmin'
import { ServicesManagement } from '@/components/superadmin/services-management'

export default function SuperAdminServicesPage() {
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getServicesAdmin()
            .then(setServices)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="text-gray-500">Loading services...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services Management</h1>
            </div>

            <ServicesManagement initialServices={services} />
        </div>
    )
}
