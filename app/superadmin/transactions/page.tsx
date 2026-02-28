'use client'

import { useEffect, useState } from 'react'
import { getAllTransactions } from '@/actions/superadmin'
import { TransactionHistory } from '@/components/superadmin/transaction-history'
import { Receipt } from 'lucide-react'

const PAGE_SIZE = 20

export default function SuperAdminTransactionsPage() {
    const [data, setData] = useState<any[]>([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getAllTransactions(1, PAGE_SIZE)
            .then((result) => {
                setData(result.data)
                setCount(result.count)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="text-gray-500">Loading transactions...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">All bKash payment records across all users</p>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                    Total: <span className="font-semibold text-foreground">{count}</span> records
                </div>
            </div>

            <TransactionHistory
                initialData={data}
                initialCount={count}
                initialPage={1}
                pageSize={PAGE_SIZE}
            />
        </div>
    )
}
