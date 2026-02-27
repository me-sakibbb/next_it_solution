'use client'

import { ServiceOrder } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Package, Clock } from 'lucide-react'
import Link from 'next/link'

interface RecentOrdersWidgetProps {
    orders: ServiceOrder[]
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

export function RecentOrdersWidget({ orders }: RecentOrdersWidgetProps) {
    const recentOrders = orders.slice(0, 5)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">আমার অর্ডারসমূহ</CardTitle>
                <Link href="/dashboard/orders">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                        সবগুলো দেখুন <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {recentOrders.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        এখনও কোনো অর্ডার নেই।
                    </div>
                ) : (
                    recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none truncate max-w-[150px]">
                                    {order.service?.name || 'অজানা সার্ভিস'}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {new Date(order.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <Badge className={statusColors[order.status] || 'bg-gray-100'} variant="secondary">
                                {statusLabels[order.status] || order.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
