'use client'

import { useState } from 'react'
import { FlightTicketOrder } from '@/lib/types'
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
import { Plane, Calendar, User, Wallet, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { payFlightTicketOrder } from '@/actions/flight-tickets'
import { toast } from 'sonner'
import { format } from 'date-fns'
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

interface FlightTicketOrdersListProps {
    initialOrders: FlightTicketOrder[]
    onRefresh?: () => void
}

const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'অপেক্ষমান', icon: Clock },
    priced: { color: 'bg-blue-100 text-blue-800', label: 'মূল্য নির্ধারিত', icon: AlertCircle },
    paid: { color: 'bg-purple-100 text-purple-800', label: 'পেমেন্ট সম্পন্ন', icon: CheckCircle2 },
    completed: { color: 'bg-green-100 text-green-800', label: 'সম্পন্ন', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'বাতিল', icon: AlertCircle },
}

export function FlightTicketOrdersList({ initialOrders, onRefresh }: FlightTicketOrdersListProps) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
    const [confirmOrder, setConfirmOrder] = useState<FlightTicketOrder | null>(null)

    const handlePay = async (orderId: string) => {
        setLoadingMap(prev => ({ ...prev, [orderId]: true }))
        console.log("Starting payment for order:", orderId)
        try {
            const result = await payFlightTicketOrder(orderId)
            console.log("Payment result:", result)
            toast.success('পেমেন্ট সফল ভাবে সম্পন্ন হয়েছে')
            if (onRefresh) onRefresh()
        } catch (error: any) {
            console.error("Payment error in component:", error)
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

    if (initialOrders.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Plane className="mx-auto h-12 w-12 text-gray-400 mb-4 opacity-20" />
                <p className="text-gray-500 dark:text-gray-400">আপনি এখনো কোনো ফ্লাইটের রিকোয়েস্ট করেননি।</p>
                <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/dashboard/services'}>
                    ফ্লাইট বুকিং করুন
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {initialOrders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending
                const StatusIcon = config.icon

                return (
                    <Card key={order.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all rounded-2xl bg-white dark:bg-gray-950">
                        <CardHeader className="pb-4 border-b bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            {order.departure_city} <Plane className="h-4 w-4 text-blue-500" /> {order.destination_city}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 text-xs">
                                        Order #{order.id.slice(0, 8)} • 
                                        <Calendar className="h-3 w-3" /> {new Date(order.created_at).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <Badge className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold ${config.color}`}>
                                    <StatusIcon className="h-4 w-4" />
                                    {config.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">অর্ডার নম্বর</span>
                                        <p className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">যাত্রার তারিখ</span>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {format(new Date(order.departure_date), 'PPP', { locale: undefined })}
                                            {order.return_date && (
                                                <span className="text-xs text-gray-500 font-normal">
                                                    (ফিরতি: {format(new Date(order.return_date), 'PPP')})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">যাত্রী ও ক্লাস</span>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            {order.passengers} জন, {order.cabin_class === 'Economy' ? 'ইকোনমি' : order.cabin_class === 'Business' ? 'বিজনেস' : order.cabin_class === 'First Class' ? 'ফার্স্ট ক্লাস' : order.cabin_class}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">নির্ধারিত মূল্য</span>
                                        <p className="text-2xl font-black text-blue-600">
                                            {order.price ? `৳${order.price.toLocaleString()}` : 'অপেক্ষমান...'}
                                        </p>
                                    </div>
                                    {order.status === 'priced' && (
                                        <Button 
                                            className="w-full bg-green-600 hover:bg-green-700 font-bold gap-2 text-white h-11"
                                            onClick={() => setConfirmOrder(order)}
                                            disabled={loadingMap[order.id]}
                                        >
                                            <Wallet className="h-4 w-4" />
                                            {loadingMap[order.id] ? 'প্রসেস করা হচ্ছে...' : 'পেমেন্ট করুন'}
                                        </Button>
                                    )}
                                </div>

                                {order.admin_notes && (
                                    <div className="space-y-2 lg:col-span-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">এডমিন নোট / টিকিট লিংক</span>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-800 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {renderDeliverables(order.admin_notes)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            <AlertDialog open={!!confirmOrder} onOpenChange={(open) => !open && setConfirmOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>পেমেন্ট নিশ্চিত করুন</AlertDialogTitle>
                        <AlertDialogDescription>
                            আপনি কি নিশ্চিত যে আপনি এই ফ্লাইটের জন্য ৳{confirmOrder?.price?.toLocaleString()} পেমেন্ট করতে চান? আপনার মেইন ব্যালেন্স থেকে এই টাকা কেটে নেয়া হবে।
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!(confirmOrder && loadingMap[confirmOrder.id])}>বাতিল</AlertDialogCancel>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 h-10 px-4 py-2 text-white rounded-md text-sm font-medium"
                            onClick={() => confirmOrder && handlePay(confirmOrder.id)}
                            disabled={!!(confirmOrder && loadingMap[confirmOrder.id])}
                        >
                            {confirmOrder && loadingMap[confirmOrder.id] ? 'প্রসেস করা হচ্ছে...' : 'পেমেন্ট নিশ্চিত করুন'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
