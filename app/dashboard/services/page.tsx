'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAvailableServices, getUserBalance } from '@/actions/services'
import { ServiceCatalog } from '@/components/services/service-catalog'
import { Wallet } from 'lucide-react'

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([])
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(() => {
        setLoading(true)
        Promise.all([getAvailableServices(), getUserBalance()])
            .then(([s, b]) => {
                setServices(s)
                setBalance(b)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="text-gray-500">Loading services...</span>
            </div>
        )
    }

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

            <ServiceCatalog
                initialServices={services}
                userBalance={balance}
                onOrderSuccess={fetchData}
            />
        </div>
    )
}
