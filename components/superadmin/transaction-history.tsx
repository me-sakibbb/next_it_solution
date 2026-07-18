'use client'

import { useState } from 'react'
import { fetchAllBkashTransactions } from '@/actions/superadmin-server'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Ban, Banknote, Wallet, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
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
    gateway_error: string | null
    created_at: string
    updated_at: string
    user: {
        id: string
        email: string
        full_name: string | null
    } | null
}

type TimeRange = 'today' | 'this_month' | 'all'

interface TransactionHistoryProps {
    initialData: Transaction[]
    initialCount: number
    initialRevenue: number
    initialAddBalanceRevenue: number
    initialSubscriptionRevenue: number
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
    initialRevenue,
    initialAddBalanceRevenue,
    initialSubscriptionRevenue,
    initialPage,
    pageSize,
}: TransactionHistoryProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [data, setData] = useState<Transaction[]>(initialData)
    const [count, setCount] = useState(initialCount)
    const [revenue, setRevenue] = useState(initialRevenue)
    const [addBalanceRevenue, setAddBalanceRevenue] = useState(initialAddBalanceRevenue)
    const [subscriptionRevenue, setSubscriptionRevenue] = useState(initialSubscriptionRevenue)
    const [page, setPage] = useState(initialPage)
    const [range, setRange] = useState<TimeRange>('all')
    const [loading, setLoading] = useState(false)

    const totalPages = Math.ceil(count / pageSize)

    const fetchPage = async (newPage: number, newSearch?: string, newRange?: TimeRange) => {
        setLoading(true)
        const activeRange = newRange ?? range
        try {
            const result = await fetchAllBkashTransactions(newPage, pageSize, newSearch, activeRange)
            setData(result.data as Transaction[])
            setCount(result.count)
            setRevenue(result.totalRevenue)
            setAddBalanceRevenue(result.addBalanceRevenue)
            setSubscriptionRevenue(result.subscriptionRevenue)
            setPage(newPage)
            if (newRange) setRange(newRange)
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
        <div className="space-y-6">
            {/* Minimal Revenue Summary Card */}
            <Card className="border shadow-none bg-transparent max-w-lg">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Banknote className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Revenue ({range.replace('_', ' ')})</p>
                            <h3 className="text-2xl font-bold tracking-tight">৳{revenue.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 border-l pl-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-medium">Add Balance:</span>
                            <span className="text-xs font-semibold">৳{addBalanceRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-medium">Subscription:</span>
                            <span className="text-xs font-semibold">৳{subscriptionRevenue.toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-muted/30 p-4 rounded-xl border border-dashed">
                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search TxID or Email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-background border-muted-foreground/20 focus-visible:ring-indigo-500"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">Search</Button>
                </form>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-xs text-muted-foreground whitespace-nowrap font-bold uppercase tracking-widest text-[10px]">Filter:</span>
                    <Select
                        value={range}
                        onValueChange={(v: TimeRange) => fetchPage(1, search || undefined, v)}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-full md:w-[160px] bg-background border-muted-foreground/20">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent className="border-indigo-100">
                            <SelectItem value="all">All History</SelectItem>
                            <SelectItem value="this_month">Current Month</SelectItem>
                            <SelectItem value="today">Today's Total</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

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
                        ) : data.map((tx: Transaction) => {
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
                                        {(tx.gateway_error || tx.bkash_error) && (
                                            <div className="text-xs text-destructive mt-1 max-w-40 truncate" title={tx.gateway_error || tx.bkash_error || ''}>
                                                {tx.gateway_error || tx.bkash_error}
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
