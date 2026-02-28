'use client'

import { useState } from 'react'
import { getAllTransactions } from '@/actions/superadmin'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Ban } from 'lucide-react'
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

interface Transaction {
    id: string
    user_id: string
    payment_id: string
    intent: string
    plan_type: string | null
    amount: number
    status: string
    trx_id: string | null
    bkash_error: string | null
    created_at: string
    updated_at: string
    user: {
        id: string
        email: string
        full_name: string | null
    } | null
}

interface TransactionHistoryProps {
    initialData: Transaction[]
    initialCount: number
    initialPage: number
    pageSize: number
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
    executed: { label: 'Success', variant: 'default', icon: CheckCircle2 },
    created: { label: 'Pending', variant: 'secondary', icon: Clock },
    failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
    cancelled: { label: 'Cancelled', variant: 'outline', icon: Ban },
}

const INTENT_LABELS: Record<string, string> = {
    add_balance: 'Add Balance',
    subscribe: 'Subscription',
}

const PLAN_LABELS: Record<string, string> = {
    trial: 'Free Plan',
    basic_bit: 'Basic Bit',
    advance_plus: 'Advance Plus',
    premium_power: 'Premium Power',
}

export function TransactionHistory({
    initialData,
    initialCount,
    initialPage,
    pageSize,
}: TransactionHistoryProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [data, setData] = useState<Transaction[]>(initialData)
    const [count, setCount] = useState(initialCount)
    const [page, setPage] = useState(initialPage)
    const [loading, setLoading] = useState(false)

    const totalPages = Math.ceil(count / pageSize)

    const fetchPage = async (newPage: number, newSearch?: string) => {
        setLoading(true)
        try {
            const result = await getAllTransactions(newPage, pageSize, newSearch)
            setData(result.data as Transaction[])
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

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by TxID or Payment ID..."
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
                            <TableHead>Intent</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>TxID</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : data.map((tx) => {
                            const statusCfg = STATUS_CONFIG[tx.status] ?? { label: tx.status, variant: 'outline' as const, icon: Clock }
                            const StatusIcon = statusCfg.icon
                            return (
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
                                        <Badge variant="outline" className="text-xs">
                                            {INTENT_LABELS[tx.intent] ?? tx.intent}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {tx.plan_type ? (
                                            <span className="font-medium text-primary">{PLAN_LABELS[tx.plan_type] ?? tx.plan_type}</span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold text-sm">
                                        ৳{Number(tx.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                        {tx.trx_id ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={statusCfg.variant}
                                            className="flex items-center gap-1 w-fit"
                                        >
                                            <StatusIcon className="h-3 w-3" />
                                            {statusCfg.label}
                                        </Badge>
                                        {tx.bkash_error && (
                                            <div className="text-xs text-destructive mt-1 max-w-40 truncate" title={tx.bkash_error}>
                                                {tx.bkash_error}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
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
