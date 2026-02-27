'use client'

import { useState } from 'react'
import { ServiceOrder } from '@/lib/types'
import { updateOrderStatus } from '@/actions/superadmin'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { Eye, FileText } from 'lucide-react'

interface OrdersListProps {
    initialOrders: ServiceOrder[]
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export function OrdersList({ initialOrders }: OrdersListProps) {
    const router = useRouter()
    const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [status, setStatus] = useState('')
    const [deliverables, setDeliverables] = useState('')
    const [loading, setLoading] = useState(false)

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
            await updateOrderStatus(selectedOrder.id, status, deliverables)
            setIsDialogOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to update order', error)
            alert('Failed to update order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
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
                        {initialOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{order.user?.email}</div>
                                        <div className="text-xs text-gray-500">{order.user?.full_name}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{order.service?.name}</TableCell>
                                <TableCell>${order.total_price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                                        {order.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(order)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

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
                                <p className="font-medium">${selectedOrder?.total_price.toFixed(2)}</p>
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
