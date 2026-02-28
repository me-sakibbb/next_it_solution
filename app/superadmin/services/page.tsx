'use client'

import { useEffect, useState } from 'react'
import { getServicesAdmin } from '@/actions/superadmin'
import { getAppSettings } from '@/actions/settings'
import { ServicesManagement } from '@/components/superadmin/services-management'
import { ResourceLinksSettings } from '@/components/superadmin/resource-links-settings'

export default function SuperAdminServicesPage() {
    const [services, setServices] = useState<any[]>([])
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getServicesAdmin(), getAppSettings()])
            .then(([svcs, cfg]) => {
                setServices(svcs)
                setSettings(cfg)
            })
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

            <ResourceLinksSettings
                initialGraphicsUrl={settings['graphics_files_drive_url'] ?? ''}
                initialCertificateUrl={settings['certificate_formats_drive_url'] ?? ''}
            />

            <ServicesManagement initialServices={services} />
        </div>
    )
}

