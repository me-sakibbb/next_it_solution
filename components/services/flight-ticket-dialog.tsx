'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plane, Calendar, User, Phone, Mail, Info, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { notifySuperAdmins } from '@/actions/notifications'
import { toast } from 'sonner'

interface FlightTicketDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function FlightTicketDialog({ isOpen, onOpenChange }: FlightTicketDialogProps) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const supabase = createClient()
    const [formData, setFormData] = useState({
        departure_city: '',
        destination_city: '',
        departure_date: '',
        return_date: '',
        full_name: '',
        contact_number: '',
        email_address: '',
        cabin_class: 'Economy',
        passengers: '1',
        additional_notes: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const insertData: any = {
                ...formData,
                user_id: user.id,
                status: 'pending'
            }

            // Handle optional date
            if (!insertData.return_date) {
                delete insertData.return_date
            }

            const { error } = await supabase
                .from('flight_ticket_orders')
                .insert(insertData)

            if (error) {
                console.error("Supabase insert error:", error)
                throw new Error(error.message)
            }

            // Notify super admins (Server action called from client, but not awaited to avoid blocking)
            notifySuperAdmins(
                'নতুন ফ্লাইট টিকিট রিকোয়েস্ট',
                `${formData.full_name} একটি নতুন ফ্লাইট টিকিট কোটেশন রিকোয়েস্ট করেছেন।`,
                '/superadmin/flight-tickets',
                'order_status'
            ).catch(err => console.error("Failed to notify admins:", err))

            setSubmitted(true)
            toast.success('অর্ডার সফলভাবে সাবমিট হয়েছে')
        } catch (error: any) {
            console.error("Submit error:", error)
            toast.error(error?.message || 'সাবমিট করতে সমস্যা হয়েছে')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => {
                onOpenChange(open)
                if (!open) setSubmitted(false)
            }}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">সাবমিট সফল হয়েছে!</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            ধন্যবাদ আপনার সাবমিট সফল হয়েছে, শ্রীগ্ৰই আমাদের একজন কাস্টমার প্রতিনিধি আপনাকে ডিসকাউন্ট প্রাইস সহ বিস্তারিত জানাবেন।
                        </DialogDescription>
                        <Button className="w-full mt-6" onClick={() => onOpenChange(false)}>
                            বন্ধ করুন
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl">
                {/* Hero Header */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-blue-900/40" />
                    <div className="relative h-full flex flex-col items-center justify-center text-white px-6 text-center">
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full mb-3">
                            <Plane className="h-8 w-8 text-white rotate-45" />
                        </div>
                        <DialogTitle className="text-3xl font-extrabold tracking-tight">ম্যানুয়াল ফ্লাইট টিকিট অর্ডার</DialogTitle>
                        <DialogDescription className="text-blue-100 mt-1 max-w-md mx-auto text-sm">আমাদের কাছ থেকে সেরা এয়ার টিকিটের দাম পেতে আপনার তথ্য জমা দিন!</DialogDescription>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 bg-white dark:bg-gray-950">
                    {/* Cities Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="from" className="text-sm font-semibold flex items-center gap-2">
                                <Plane className="h-4 w-4 text-blue-500" /> কোথা থেকে (প্রস্থান শহর)
                            </Label>
                            <Input 
                                id="from" 
                                placeholder="যেমন: ঢাকা" 
                                required
                                value={formData.departure_city}
                                onChange={(e) => setFormData({...formData, departure_city: e.target.value})}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="to" className="text-sm font-semibold flex items-center gap-2">
                                <Plane className="h-4 w-4 text-indigo-500 rotate-90" /> কোথায় (গন্তব্য শহর)
                            </Label>
                            <Input 
                                id="to" 
                                placeholder="যেমন: লন্ডন" 
                                required
                                value={formData.destination_city}
                                onChange={(e) => setFormData({...formData, destination_city: e.target.value})}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Dates Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="dep_date" className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" /> যাত্রার তারিখ
                            </Label>
                            <Input 
                                id="dep_date" 
                                type="date" 
                                required
                                value={formData.departure_date}
                                onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                                className="bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ret_date" className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-indigo-500" /> ফেরার তারিখ (ঐচ্ছিক)
                            </Label>
                            <Input 
                                id="ret_date" 
                                type="date"
                                value={formData.return_date}
                                onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                                className="bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Passenger Info Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">যাত্রীর তথ্য</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-semibold flex items-center gap-1">
                                    <User className="h-3 w-3" /> পূর্ণ নাম
                                </Label>
                                <Input 
                                    id="name" 
                                    placeholder="আপনার নাম লিখুন" 
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    className="bg-gray-50 border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> মোবাইল নম্বর
                                </Label>
                                <Input 
                                    id="phone" 
                                    placeholder="মোবাইল নম্বর লিখুন" 
                                    required
                                    value={formData.contact_number}
                                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                                    className="bg-gray-50 border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> ইমেইল ঠিকানা
                                </Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="ইমেইল ঠিকানা লিখুন" 
                                    required
                                    value={formData.email_address}
                                    onChange={(e) => setFormData({...formData, email_address: e.target.value})}
                                    className="bg-gray-50 border-gray-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">ভ্রমণ পছন্দসমূহ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">কেবিন ক্লাস নির্বাচন করুন</Label>
                                <Select 
                                    value={formData.cabin_class} 
                                    onValueChange={(v) => setFormData({...formData, cabin_class: v})}
                                >
                                    <SelectTrigger className="bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="কেবিন ক্লাস নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Economy">ইকোনমি</SelectItem>
                                        <SelectItem value="Premium Economy">প্রিমিয়াম ইকোনমি</SelectItem>
                                        <SelectItem value="Business">বিজনেস</SelectItem>
                                        <SelectItem value="First Class">ফার্স্ট ক্লাস</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">যাত্রী সংখ্যা নির্বাচন করুন</Label>
                                <Select 
                                    value={formData.passengers}
                                    onValueChange={(v) => setFormData({...formData, passengers: v})}
                                >
                                    <SelectTrigger className="bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="যাত্রী সংখ্যা নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                            <SelectItem key={n} value={n.toString()}>{n} জন যাত্রী</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold">অতিরিক্ত নোট (ঐচ্ছিক)</Label>
                        <Textarea 
                            id="notes" 
                            placeholder="আপনার কোনো বিশেষ অনুরোধ বা নোট থাকলে এখানে লিখুন..." 
                            className="bg-gray-50 border-gray-200 min-h-[100px]"
                            value={formData.additional_notes}
                            onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all rounded-xl text-white"
                            disabled={loading}
                        >
                            {loading ? 'সাবমিট করা হচ্ছে...' : 'অর্ডার সাবমিট করুন'}
                        </Button>
                    </div>

                    {/* Info Box */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300">
                        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed">
                            আমাদের কাছ থেকে সেরা এয়ার টিকিটের দাম পেতে আপনার তথ্য জমা দিন এবং আপনি শীঘ্রই আমাদের অ্যাডমিনের কাছ থেকে একটি বিশেষ মূল্য পাবেন!
                        </p>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
