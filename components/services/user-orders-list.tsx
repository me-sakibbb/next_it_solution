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
import { FileText, ExternalLink } from 'lucide-react'

interface UserOrdersListProps {
    initialOrders: ServiceOrder[]
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
    pending: 'অপেক্ষমান',
    in_progress: 'চলমান',
    completed: 'সম্পন্ন',
    cancelled: 'বাতিল',
}

export function UserOrdersList({ initialOrders }: UserOrdersListProps) {
    const renderDeliverables = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 font-medium break-all"
                    >
                        {part} <ExternalLink className="w-3 h-3" />
                    </a>
                );
            }
            return part;
        });
    };

    if (initialOrders.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
                <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/dashboard'}>
                    Browse Services
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {initialOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{order.service?.name || 'Unknown Service'}</CardTitle>
                                <CardDescription className="text-xs text-gray-500">
                                    Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                                {statusLabels[order.status] || order.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</span>
                                <p className="text-lg font-bold text-primary">৳{order.total_price.toLocaleString()}</p>
                            </div>
                            {order.requirements && (
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Requirements</span>
                                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed border-l-2 border-primary/20 pl-3">
                                        {order.requirements}
                                    </p>
                                </div>
                            )}
                        </div>

                        {order.status === 'completed' && (
                            <div className="mt-6 pt-6 border-t">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Deliverables / Result</span>
                                {order.deliverables ? (
                                    <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl text-sm border border-primary/10 whitespace-pre-wrap leading-relaxed shadow-sm">
                                        {renderDeliverables(order.deliverables)}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No specific deliverables attached.</p>
                                )}
                            </div>
                        )}

                        {order.status === 'in_progress' && (
                            <div className="mt-6 pt-6 border-t flex items-center gap-2 text-sm text-blue-600 font-medium">
                                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                Our team is currently working on your request...
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
