'use client'

import { useState } from 'react'
import { FlightTicketOrder } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { notifyUser } from '@/actions/notifications'
import { useRouter } from 'next/navigation'
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
import { Label } from '@/components/ui/label'
import { Eye, Plane, Calendar, User, Phone, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface FlightTicketsManagementProps {
    initialOrders: FlightTicketOrder[]
}

const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    priced: { color: 'bg-blue-100 text-blue-800', label: 'Priced' },
    paid: { color: 'bg-purple-100 text-purple-800', label: 'Paid' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
}

export function FlightTicketsManagement({ initialOrders }: FlightTicketsManagementProps) {
    const router = useRouter()
    const supabase = createClient()
    const [selectedOrder, setSelectedOrder] = useState<FlightTicketOrder | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [price, setPrice] = useState<string>('')
    const [adminNotes, setAdminNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleOpenDialog = (order: FlightTicketOrder) => {
        setSelectedOrder(order)
        setPrice(order.price?.toString() || '')
        setAdminNotes(order.admin_notes || '')
        setIsDialogOpen(true)
    }

    const handleSetPrice = async () => {
        if (!selectedOrder || !price) return
        setLoading(true)
        try {
            const numericPrice = parseFloat(price)
            const { error } = await supabase
                .from('flight_ticket_orders')
                .update({
                    price: numericPrice,
                    status: 'priced',
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedOrder.id)

            if (error) throw new Error(error.message)

            // Notify user (Server action)
            await notifyUser(
                selectedOrder.user_id,
                'টিকিটের মূল্য নির্ধারণ করা হয়েছে',
                `আপনার ফ্লাইট টিকিটের জন্য ৳${numericPrice} মূল্য নির্ধারণ করা হয়েছে। অনুগ্রহ করে পেমেন্ট সম্পন্ন করুন।`,
                '/dashboard/orders',
                'order_status'
            )

            toast.success('Price set successfully')
            setIsDialogOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to set price')
        } finally {
            setLoading(false)
        }
    }

    const handleDeliver = async () => {
        if (!selectedOrder || !adminNotes) {
            toast.error('Please provide delivery notes or drive link')
            return
        }
        setLoading(true)
        try {
            const { error } = await supabase
                .from('flight_ticket_orders')
                .update({
                    admin_notes: adminNotes,
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedOrder.id)

            if (error) throw new Error(error.message)

            // Notify user (Server action)
            await notifyUser(
                selectedOrder.user_id,
                'টিকিট ডেলিভারি সম্পন্ন',
                `আপনার ${selectedOrder.departure_city} থেকে ${selectedOrder.destination_city} এর টিকিট ডেলিভারি করা হয়েছে।`,
                '/dashboard/orders',
                'order_status'
            )

            toast.success('Ticket delivered successfully')
            setIsDialogOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to deliver ticket')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-white dark:bg-gray-950 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900">
                        <TableRow>
                            <TableHead>অর্ডার আইডি</TableHead>
                            <TableHead>ইউজার / যাত্রী</TableHead>
                            <TableHead>রুট</TableHead>
                            <TableHead>তারিখ</TableHead>
                            <TableHead>মূল্য</TableHead>
                            <TableHead>স্ট্যাটাস</TableHead>
                            <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialOrders.map((order) => {
                            const config = statusConfig[order.status] || statusConfig.pending
                            return (
                                <TableRow key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{order.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            {order.departure_city} <Plane className="h-3 w-3 text-blue-500" /> {order.destination_city}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <span className="font-medium">{format(new Date(order.departure_date), 'dd MMM yyyy')}</span>
                                            {order.return_date && <span className="text-muted-foreground italic text-[10px]">ফিরতি: {format(new Date(order.return_date), 'dd MMM yyyy')}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-black text-blue-600">
                                            {order.price ? `৳${order.price.toLocaleString()}` : '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${config.color}`}>
                                            {config.label === 'Pending' ? 'অপেক্ষমান' : config.label === 'Priced' ? 'মূল্য নির্ধারিত' : config.label === 'Paid' ? 'পেমেন্ট সম্পন্ন' : config.label === 'Completed' ? 'সম্পন্ন' : config.label === 'Cancelled' ? 'বাতিল' : config.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30" onClick={() => handleOpenDialog(order)}>
                                            <Eye className="h-4 w-4 text-blue-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {initialOrders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    কোনো ফ্লাইট টিকিট অর্ডার পাওয়া যায়নি।
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <Plane className="h-5 w-5 text-blue-600" /> ফ্লাইট রিকোয়েস্ট ম্যানেজ করুন
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Summary Section */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div>
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">প্রস্থান</Label>
                                <p className="font-bold text-sm">{selectedOrder?.departure_city} ({format(new Date(selectedOrder?.departure_date || Date.now()), 'dd MMM')})</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">গন্তব্য</Label>
                                <p className="font-bold text-sm">{selectedOrder?.destination_city}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">যাত্রী / ক্লাস</Label>
                                <p className="font-bold text-sm">{selectedOrder?.passengers} জন / {selectedOrder?.cabin_class === 'Economy' ? 'ইকোনমি' : selectedOrder?.cabin_class === 'Business' ? 'বিজনেস' : selectedOrder?.cabin_class === 'First Class' ? 'ফার্স্ট ক্লাস' : selectedOrder?.cabin_class}</p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <Label className="text-gray-500 flex items-center gap-1"><User className="h-3 w-3" /> পূর্ণ নাম</Label>
                                <p className="font-medium">{selectedOrder?.full_name}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" /> ফোন নম্বর</Label>
                                <p className="font-medium font-mono">{selectedOrder?.contact_number}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> ইমেইল</Label>
                                <p className="font-medium underline decoration-blue-200">{selectedOrder?.email_address}</p>
                            </div>
                            {selectedOrder?.additional_notes && (
                                <div className="space-y-1 md:col-span-2">
                                    <Label className="text-gray-500">ইউজার নোট</Label>
                                    <p className="p-3 bg-white dark:bg-gray-800 rounded-lg text-xs border border-gray-100 dark:border-gray-800 italic">{selectedOrder?.additional_notes}</p>
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-100 dark:border-gray-800" />

                        {/* Action Section */}
                        <div className="space-y-4">
                            {selectedOrder?.status === 'pending' && (
                                <div className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                    <Label className="font-bold text-blue-800 dark:text-blue-300">ফেজ ১: মূল্য নির্ধারণ করুন</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">৳</span>
                                            <Input 
                                                type="number" 
                                                placeholder="মূল্য লিখুন..." 
                                                className="pl-8 bg-white" 
                                                value={price} 
                                                onChange={(e) => setPrice(e.target.value)} 
                                            />
                                        </div>
                                        <Button className="bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-500/20" onClick={handleSetPrice} disabled={loading || !price}>
                                            দাম সেট করুন ও ইউজারকে জানান
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-blue-600/70 italic">মূল্য নির্ধারণ করলে স্ট্যাটাস "মূল্য নির্ধারিত" হয়ে যাবে এবং ইউজার পেমেন্ট করার নোটিফিকেশন পাবে।</p>
                                </div>
                            )}

                            {selectedOrder?.status === 'paid' && (
                                <div className="space-y-3 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/50">
                                    <Label className="font-bold text-purple-800 dark:text-purple-300">ফেজ ২: টিকিট / ড্রাইভ লিংক ডেলিভারি দিন</Label>
                                    <Textarea 
                                        placeholder="ডেলিভারি মেসেজ এবং টিকিটের গুগল ড্রাইভ লিংক এখানে দিন..." 
                                        className="bg-white min-h-[100px]"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                    />
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700 font-bold text-white shadow-lg shadow-purple-500/20" onClick={handleDeliver} disabled={loading || !adminNotes}>
                                        টিকিট ডেলিভারি দিন ও কমপ্লিট করুন
                                    </Button>
                                    <p className="text-[10px] text-purple-600/70 italic">তথ্য প্রদান করলে অর্ডার স্ট্যাটাস "সম্পন্ন" হয়ে যাবে।</p>
                                </div>
                            )}

                            {(selectedOrder?.status === 'priced' || selectedOrder?.status === 'completed' || selectedOrder?.status === 'paid') && (
                                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <Label className="font-bold text-gray-500">ইতিহাস / স্ট্যাটাস তথ্য</Label>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm">বর্তমান স্ট্যাটাস: <Badge variant="outline" className="ml-2 bg-white dark:bg-gray-800">
                                            {selectedOrder.status === 'priced' ? 'মূল্য নির্ধারিত' : selectedOrder.status === 'paid' ? 'পেমেন্ট সম্পন্ন' : selectedOrder.status === 'completed' ? 'সম্পন্ন' : selectedOrder.status}
                                        </Badge></span>
                                        <span className="text-sm">নির্ধারিত মূল্য: <span className="font-bold text-blue-600">৳{selectedOrder.price?.toLocaleString()}</span></span>
                                    </div>
                                    {selectedOrder.admin_notes && (
                                        <div className="mt-4">
                                            <Label className="text-[10px] font-bold uppercase text-gray-400">এডমিন নোট</Label>
                                            <p className="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700 mt-1">{selectedOrder.admin_notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>বন্ধ করুন</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
