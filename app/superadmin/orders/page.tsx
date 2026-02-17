import { getAllOrdersAdmin } from '@/actions/superadmin'
import { OrdersList } from '@/components/superadmin/orders-list'

export default async function SuperAdminOrdersPage() {
    const orders = await getAllOrdersAdmin()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
            </div>

            <OrdersList initialOrders={orders} />
        </div>
    )
}
