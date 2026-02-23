'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAllUsers } from '@/actions/superadmin'
import { UsersTable } from '@/components/superadmin/users-table'

export default function SuperAdminUsersPage() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search') ?? undefined
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getAllUsers(search)
            .then(setUsers)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [search])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="text-gray-500">Loading users...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            </div>

            <UsersTable initialUsers={users} />
        </div>
    )
}
