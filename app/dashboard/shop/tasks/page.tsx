import { getUserShop } from '@/lib/get-user-shop'
import { getCustomers } from '@/app/actions/customers'
import { TasksClient } from './tasks-client'

export default async function TasksPage() {
    return (
        <TasksClient />
    )
}
