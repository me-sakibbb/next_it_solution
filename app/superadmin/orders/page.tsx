'use client'

import { useAdminOrders } from '@/hooks/use-admin-orders'
import { OrdersList } from '@/components/superadmin/orders-list'
import { Loader2 } from 'lucide-react'

export default function SuperAdminOrdersPage() {
    const {
        orders,
        total,
        loading,
        page,
        params,
        onParamsChange,
        handleUpdateOrderStatus
    } = useAdminOrders()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
            </div>

            <OrdersList
                orders={orders}
                totalCount={total}
                currentPage={page}
                onParamsChange={onParamsChange}
                params={params}
                onUpdateStatus={handleUpdateOrderStatus}
            />

            {loading && (
                <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    )
}
