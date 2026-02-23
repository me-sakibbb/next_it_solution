'use client'

import { useEffect, useState } from 'react'
import { getAllOrdersAdmin } from '@/actions/superadmin'
import { OrdersList } from '@/components/superadmin/orders-list'

export default function SuperAdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllOrdersAdmin()
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="text-gray-500">Loading orders...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
            </div>

            <OrdersList initialOrders={orders} />
        </div>
    )
}
