'use client'

import { useEffect, useState } from 'react'
import { getAdminStats } from '@/actions/superadmin'
import { Users, ShoppingCart, DollarSign } from 'lucide-react'

interface AdminStats {
    users: number
    activeOrders: number
    revenue: number
}

export default function SuperAdminPage() {
    const [stats, setStats] = useState<AdminStats>({ users: 0, activeOrders: 0, revenue: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAdminStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? '...' : stats.users}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? '...' : stats.activeOrders}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                            <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? '...' : `$${stats.revenue.toFixed(2)}`}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
