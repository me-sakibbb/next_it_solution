import { getUserShop } from '@/lib/get-user-shop'
import { getCustomers } from '@/app/actions/sales'
import { TasksClient } from './tasks-client'

export default async function TasksPage() {
    const { shop } = await getUserShop()
    const customers = await getCustomers(shop.id)

    return (
        <TasksClient customers={customers} />
    )
}
