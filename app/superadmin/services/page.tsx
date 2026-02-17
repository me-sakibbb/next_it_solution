import { getServicesAdmin } from '@/actions/superadmin'
import { ServicesManagement } from '@/components/superadmin/services-management'

export default async function SuperAdminServicesPage() {
    const services = await getServicesAdmin()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services Management</h1>
            </div>

            <ServicesManagement initialServices={services} />
        </div>
    )
}
