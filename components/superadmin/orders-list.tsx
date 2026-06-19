'use client'

import { useState, useEffect } from 'react'
import { ServiceOrder } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Eye, Search } from 'lucide-react'

interface OrdersListProps {
    orders: ServiceOrder[]
    totalCount: number
    currentPage: number
    onParamsChange: (params: {
        page?: number
        search?: string
        status?: string
    }) => void
    params: {
        search: string
        status: string
        pageSize: number
    }
    onUpdateStatus: (orderId: string, status: string, deliverables: string) => Promise<boolean>
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
}

export function OrdersList({
    orders,
    totalCount,
    currentPage,
    onParamsChange,
    params,
    onUpdateStatus,
}: OrdersListProps) {
    const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [status, setStatus] = useState('')
    const [deliverables, setDeliverables] = useState('')
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState(params.search)

    // Sync local search with params
    useEffect(() => {
        setSearch(params.search)
    }, [params.search])

    const handleOpenDialog = (order: ServiceOrder) => {
        setSelectedOrder(order)
        setStatus(order.status)
        setDeliverables(order.deliverables || '')
        setIsDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!selectedOrder) return
        setLoading(true)
        try {
            await onUpdateStatus(selectedOrder.id, status, deliverables)
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Failed to update order', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onParamsChange({ search, page: 1 })
    }

    const clearFilters = () => {
        setSearch('')
        onParamsChange({ search: '', status: 'all', page: 1 })
    }

    const totalPages = Math.ceil(totalCount / params.pageSize)

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
                <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">Search User</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Email or Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-background"
                        />
                    </div>
                </form>

                <div className="w-[180px] space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">Status</Label>
                    <Select value={params.status} onValueChange={(val) => onParamsChange({ status: val, page: 1 })}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button type="submit">Filter</Button>
                    <Button variant="ghost" type="button" onClick={clearFilters}>Reset</Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white dark:bg-gray-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-gray-950 dark:text-gray-50">{order.user?.email}</div>
                                            <div className="text-xs text-gray-500">{order.user?.full_name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{order.service?.name}</TableCell>
                                    <TableCell className="font-medium">৳{order.total_price.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge className={`${statusColors[order.status] || 'bg-gray-100'} hover:${statusColors[order.status] || 'bg-gray-100'} border-none`}>
                                            {statusLabels[order.status] || order.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(order)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Total {totalCount} orders
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onParamsChange({ page: currentPage - 1 })}
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </Button>
                        <div className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onParamsChange({ page: currentPage + 1 })}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Manage Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Manage Order</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-gray-500">Service</Label>
                                <p className="font-medium">{selectedOrder?.service?.name}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Total Price</Label>
                                <p className="font-medium">৳{selectedOrder?.total_price.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Requirements from User</Label>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300 min-h-[60px] whitespace-pre-wrap border border-gray-200 dark:border-gray-800">
                                {selectedOrder?.requirements || 'No requirements provided.'}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="deliverables">Deliverables / Notes</Label>
                            <Textarea
                                id="deliverables"
                                value={deliverables}
                                onChange={(e) => setDeliverables(e.target.value)}
                                placeholder="Enter completion notes or download detailed..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
