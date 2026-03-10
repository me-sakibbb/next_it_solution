'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchPaginatedUsers } from '@/actions/superadmin-server'
import { UsersTable } from '@/components/superadmin/users-table'
import { Loader2 } from 'lucide-react'

export default function SuperAdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    const [params, setParams] = useState({
        page: 1,
        pageSize: 10,
        search: '',
        plan: 'all',
        balanceFilter: 'all' as 'all' | 'zero' | 'positive',
        sortBy: 'created_at' as 'balance' | 'created_at',
        sortOrder: 'desc' as 'asc' | 'desc'
    })

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetchPaginatedUsers(params)
            setUsers(response.data)
            setTotal(response.total)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }, [params])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleParamsChange = (newParams: any) => {
        setParams(prev => ({ ...prev, ...newParams }))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            </div>

            <UsersTable
                initialUsers={users}
                totalCount={total}
                currentPage={params.page}
                onParamsChange={handleParamsChange}
                params={params}
            />

            {loading && (
                <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    )
}
