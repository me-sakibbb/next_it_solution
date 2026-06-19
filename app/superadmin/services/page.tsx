'use client'

import { useAdminServices } from '@/hooks/use-admin-services'
import { ServicesManagement } from '@/components/superadmin/services-management'
import { ResourceLinksSettings } from '@/components/superadmin/resource-links-settings'
import { Loader2 } from 'lucide-react'

export default function SuperAdminServicesPage() {
    const {
        services,
        settings,
        loading,
        handleSaveService
    } = useAdminServices()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services Management</h1>
            </div>

            <ResourceLinksSettings
                initialGraphicsUrl={settings['graphics_files_drive_url'] ?? ''}
                initialCertificateUrl={settings['certificate_formats_drive_url'] ?? ''}
            />

            <ServicesManagement
                services={services}
                onSaveService={handleSaveService}
            />

            {loading && (
                <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    )
}
