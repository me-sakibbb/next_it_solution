import { getUserOrders } from '@/actions/services'
import { UserOrdersList } from '@/components/services/user-orders-list'

export default async function UserOrdersPage() {
    const orders = await getUserOrders()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
            </div>

            <UserOrdersList initialOrders={orders} />
        </div>
    )
}
