import { getAllUsers } from '@/actions/superadmin'
import { UsersTable } from '@/components/superadmin/users-table'

export default async function SuperAdminUsersPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    const users = await getAllUsers(searchParams.search)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            </div>

            <UsersTable initialUsers={users} />
        </div>
    )
}
