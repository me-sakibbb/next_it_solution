'use client'

import { ServiceOrder } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Download } from 'lucide-react'

interface UserOrdersListProps {
    initialOrders: ServiceOrder[]
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export function UserOrdersList({ initialOrders }: UserOrdersListProps) {
    if (initialOrders.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
                <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/dashboard/services'}>
                    Browse Services
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {initialOrders.map((order) => (
                <Card key={order.id}>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{order.service?.name || 'Unknown Service'}</CardTitle>
                                <CardDescription className="text-xs text-gray-500">
                                    Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                                {order.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold block text-gray-700 dark:text-gray-300">Price:</span>
                                ${order.total_price.toFixed(2)}
                            </div>
                            {order.requirements && (
                                <div>
                                    <span className="font-semibold block text-gray-700 dark:text-gray-300">My Requirements:</span>
                                    <p className="text-gray-600 dark:text-gray-400 truncate">{order.requirements}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                        {order.status === 'completed' && order.deliverables ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="ml-auto">
                                        <FileText className="w-4 h-4 mr-2" />
                                        View Deliverables
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Deliverables</DialogTitle>
                                    </DialogHeader>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-sm whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                                        {order.deliverables}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <span className="text-xs text-gray-400 italic ml-auto">
                                {order.status === 'completed' ? 'No deliverables attached' : 'Work in progress...'}
                            </span>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
