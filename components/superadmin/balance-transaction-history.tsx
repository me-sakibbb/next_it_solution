'use client'

import { useState } from 'react'
import { fetchAllBalanceTransactions } from '@/actions/superadmin-server'
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface BalanceTx {
    id: string
    user_id: string
    amount: number
    type: 'credit' | 'debit'
    description: string
    reference_id: string | null
    reference_type: string | null
    created_at: string
    user: {
        id: string
        email: string
        full_name: string | null
    } | null
}

interface BalanceTransactionHistoryProps {
    initialData: BalanceTx[]
    initialCount: number
    initialPage: number
    pageSize: number
}

const REFERENCE_TYPE_LABELS: Record<string, string> = {
    service_order: 'Service Order',
    bkash_payment: 'Payment Top-Up',
    gateway_payment: 'Payment Top-Up',
    subscription: 'Subscription',
    referral_bonus: 'Referral Bonus',
    manual: 'Manual',
}

export function BalanceTransactionHistory({
    initialData,
    initialCount,
    initialPage,
    pageSize,
}: BalanceTransactionHistoryProps) {
    const [search, setSearch] = useState('')
    const [data, setData] = useState<BalanceTx[]>(initialData)
    const [count, setCount] = useState(initialCount)
    const [page, setPage] = useState(initialPage)
    const [loading, setLoading] = useState(false)

    const totalPages = Math.ceil(count / pageSize)

    const fetchPage = async (newPage: number, newSearch?: string) => {
        setLoading(true)
        try {
            const result = await fetchAllBalanceTransactions(newPage, pageSize, newSearch)
            setData(result.data as BalanceTx[])
            setCount(result.count)
            setPage(newPage)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchPage(1, search || undefined)
    }

    const totalCredit = data.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0)
    const totalDebit = data.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0)

    return (
        <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                        <p className="text-xs text-green-700 dark:text-green-400 font-medium">Credits (this page)</p>
                        <p className="text-lg font-bold text-green-800 dark:text-green-300">৳{totalCredit.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                        <p className="text-xs text-red-700 dark:text-red-400 font-medium">Debits (this page)</p>
                        <p className="text-lg font-bold text-red-800 dark:text-red-300">৳{totalDebit.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button type="submit" disabled={loading}>Search</Button>
            </form>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Reference</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No balance transactions found.
                                </TableCell>
                            </TableRow>
                        ) : data.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell className="text-sm whitespace-nowrap">
                                    {new Date(tx.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-sm">{tx.user?.full_name || 'Unknown'}</div>
                                        <div className="text-xs text-muted-foreground">{tx.user?.email}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {tx.type === 'credit' ? (
                                        <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-600 hover:bg-green-700">
                                            <TrendingUp className="h-3 w-3" />
                                            Credit
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                            <TrendingDown className="h-3 w-3" />
                                            Debit
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}৳{Number(tx.amount).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-sm max-w-60 truncate" title={tx.description}>
                                    {tx.description}
                                </TableCell>
                                <TableCell>
                                    {tx.reference_type ? (
                                        <Badge variant="outline" className="text-xs">
                                            {REFERENCE_TYPE_LABELS[tx.reference_type] ?? tx.reference_type}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">—</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Showing {data.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, count)} of {count} transactions
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPage(page - 1, search || undefined)}
                        disabled={page <= 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                    </Button>
                    <span className="px-2">Page {page} of {totalPages || 1}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPage(page + 1, search || undefined)}
                        disabled={page >= totalPages || loading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
