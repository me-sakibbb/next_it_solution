'use client'

import { ServiceOrder, FlightTicketOrder } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Package, Clock, Plane, Wallet, Eye, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { payFlightTicketOrder } from '@/actions/flight-tickets'
import { toast } from 'sonner'
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

interface RecentOrdersWidgetProps {
    orders: ServiceOrder[]
    flightTickets: FlightTicketOrder[]
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

const flightStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    priced: 'bg-cyan-100 text-cyan-800',
    paid: 'bg-emerald-100 text-emerald-800 font-bold',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

const flightStatusLabels: Record<string, string> = {
    pending: 'পেন্ডিং',
    priced: 'দাম দেয়া হয়েছে',
    paid: 'পেমেন্ট সম্পন্ন',
    completed: 'সম্পন্ন',
    cancelled: 'বাতিল',
}

export function RecentOrdersWidget({ orders, flightTickets }: RecentOrdersWidgetProps) {
    const [confirmOrder, setConfirmOrder] = useState<FlightTicketOrder | null>(null)
    const [viewNotesOrder, setViewNotesOrder] = useState<FlightTicketOrder | null>(null)
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

    const recentOrders = orders.slice(0, 5)
    const recentFlights = flightTickets.slice(0, 5)

    const handlePay = async (orderId: string) => {
        setLoadingMap(prev => ({ ...prev, [orderId]: true }))
        try {
            await payFlightTicketOrder(orderId)
            toast.success('পেমেন্ট সফল ভাবে সম্পন্ন হয়েছে')
            // No refresh needed here as parent usually handles it or we re-fetch in hook
            // but the UI won't update until next refresh.
            // Ideally we'd call a refresh callback if passed.
            window.location.reload() // Simple way to refresh data
        } catch (error: any) {
            toast.error(error.message || 'পেমেন্ট করতে সমস্যা হয়েছে')
        } finally {
            setLoadingMap(prev => ({ ...prev, [orderId]: false }))
            setConfirmOrder(null)
        }
    }

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
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium break-all"
                    >
                        {part} <ExternalLink className="w-3 h-3" />
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <Card className="shadow-md border-none ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-bold">অ্যাক্টিভিটি</CardTitle>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold">
                            সবগুলো <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 mb-4 bg-gray-100 dark:bg-gray-900">
                        <TabsTrigger value="orders" className="text-xs font-bold py-2">
                            সার্ভিস অর্ডার ({orders.length})
                        </TabsTrigger>
                        <TabsTrigger value="flights" className="text-xs font-bold py-2">
                            ফ্লাইট টিকেট ({flightTickets.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="space-y-3">
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <Package className="mx-auto h-10 w-10 mb-2 opacity-20" />
                                এখনও কোনো অর্ডার নেই।
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <Link 
                                    key={order.id} 
                                    href="/dashboard/orders?tab=services"
                                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-800 cursor-pointer"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold leading-none truncate max-w-[140px] group-hover:text-primary transition-colors text-gray-900 dark:text-gray-100">
                                            {order.service?.name || 'অজানা সার্ভিস'}
                                        </p>
                                        <div className="flex items-center text-[10px] text-muted-foreground">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {new Date(order.created_at).toLocaleDateString('bn-BD')}
                                        </div>
                                    </div>
                                    <Badge className={`${statusColors[order.status] || 'bg-gray-100'} border-none shadow-none text-[10px] px-2 py-0 font-bold`} variant="secondary">
                                        {statusLabels[order.status] || order.status.replace('_', ' ')}
                                    </Badge>
                                </Link>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="flights" className="space-y-3">
                        {recentFlights.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <Plane className="mx-auto h-10 w-10 mb-2 opacity-20" />
                                কোনো ফ্লাইট টিকেট নেই।
                            </div>
                        ) : (
                            recentFlights.map((flight) => (
                                <div 
                                    key={flight.id} 
                                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-800 relative"
                                >
                                    <Link href="/dashboard/flight-tickets" className="flex-1 cursor-pointer">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold leading-none truncate max-w-[140px] group-hover:text-primary transition-colors text-gray-900 dark:text-gray-100">
                                                {flight.departure_city} → {flight.destination_city}
                                            </p>
                                            <div className="flex items-center text-[10px] text-muted-foreground">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {new Date(flight.created_at).toLocaleDateString('bn-BD')}
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    <div className="flex items-center gap-2">
                                        {flight.status === 'priced' && (
                                            <Button 
                                                size="sm" 
                                                className="h-7 px-2 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setConfirmOrder(flight);
                                                }}
                                            >
                                                <Wallet className="w-3 h-3 mr-1" />পেমেন্ট
                                            </Button>
                                        )}
                                        {flight.status === 'completed' && flight.admin_notes && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="h-7 px-2 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setViewNotesOrder(flight);
                                                }}
                                            >
                                                <Eye className="w-3 h-3 mr-1" />টিকেট
                                            </Button>
                                        )}
                                        <Badge className={`${flightStatusColors[flight.status] || 'bg-gray-100'} border-none shadow-none text-[10px] px-2 py-0 font-bold`} variant="secondary">
                                            {flightStatusLabels[flight.status] || flight.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* Confirmation Modal */}
            <AlertDialog open={!!confirmOrder} onOpenChange={(open) => !open && setConfirmOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>পেমেন্ট নিশ্চিত করুন</AlertDialogTitle>
                        <AlertDialogDescription>
                            আপনি কি নিশ্চিত যে আপনি এই ফ্লাইটের জন্য ৳{confirmOrder?.price?.toLocaleString()} পেমেন্ট করতে চান? আপনার মেইন ব্যালেন্স থেকে এই টাকা কেটে নেয়া হবে।
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => confirmOrder && handlePay(confirmOrder.id)}
                            disabled={confirmOrder && loadingMap[confirmOrder.id]}
                        >
                            পেমেন্ট করুন
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Ticket Details Modal */}
            <Dialog open={!!viewNotesOrder} onOpenChange={(open) => !open && setViewNotesOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plane className="h-5 w-5 text-blue-600" /> টিকেটের বিস্তারিত তথ্য
                        </DialogTitle>
                        <DialogDescription>
                            {viewNotesOrder?.departure_city} থেকে {viewNotesOrder?.destination_city}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-800 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {viewNotesOrder?.admin_notes && renderDeliverables(viewNotesOrder.admin_notes)}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setViewNotesOrder(null)}>বন্ধ করুন</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
