import { getAvailableServices, getUserBalance } from '@/actions/services'
import { ServiceCatalog } from '@/components/services/service-catalog'
import { Wallet } from 'lucide-react'

export default async function ServicesPage() {
    const [services, balance] = await Promise.all([
        getAvailableServices(),
        getUserBalance()
    ])

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services</h1>
                    <p className="text-gray-500 dark:text-gray-400">Order premium services to boost your business</p>
                </div>

                <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <Wallet className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Balance:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${balance.toFixed(2)}</span>
                </div>
            </div>

            <ServiceCatalog initialServices={services} userBalance={balance} />
        </div>
    )
}
