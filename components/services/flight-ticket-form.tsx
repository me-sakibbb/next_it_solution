'use client'

import { useState } from 'react'
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plane, Calendar, User, Phone, Mail, Info, CheckCircle2, RefreshCw, Send, MapPin, Briefcase } from 'lucide-react'
import { createFlightTicketOrder } from '@/actions/flight-tickets'
import { toast } from 'sonner'
import { Separator } from "@/components/ui/separator"

interface FlightTicketFormProps {
    onSuccess?: () => void
}

export function FlightTicketForm({ onSuccess }: FlightTicketFormProps) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
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
            await createFlightTicketOrder(formData)
            setSubmitted(true)
            toast.success('অর্ডার সফলভাবে সাবমিট হয়েছে')
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error("Submit error:", error)
            toast.error(error?.message || 'সাবমিট করতে সমস্যা হয়েছে')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setSubmitted(false)
        setFormData({
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
    }

    if (submitted) {
        return (
            <Card className="max-w-4xl mx-auto border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden rounded-2xl border-t-4 border-t-green-500">
                <CardContent className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-6">
                    <div className="w-24 h-24 bg-green-50 dark:bg-green-950/40 rounded-full flex items-center justify-center mb-2 shadow-inner">
                        <CheckCircle2 className="w-14 h-14 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-3">
                        <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">রিকোয়েস্ট সফল হয়েছে!</CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-base leading-relaxed">
                            আপনার ফ্লাইট টিকেটের রিকোয়েস্ট সফলভাবে গ্রহণ করা হয়েছে। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে যোগাযোগ করে সম্ভাব্য খরচের পরিমাণ জানাবে।
                        </CardDescription>
                    </div>
                    <Button 
                        size="lg"
                        className="mt-6 px-8 h-12 font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 transition-all text-base gap-2" 
                        onClick={handleReset}
                    >
                        <RefreshCw className="w-5 h-5" /> আরেকটি রিকোয়েস্ট করুন
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-4xl mx-auto border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden rounded-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner">
                        <Plane className="w-8 h-8 text-white rotate-45" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">নতুন ফ্লাইট টিকিট রিকোয়েস্ট</h2>
                        <p className="text-blue-100 text-sm mt-1.5 font-medium">সেরা মূল্যে ফ্লাইট টিকিট পেতে আপনার ভ্রমণ ও যোগাযোগের বিবরণ প্রদান করুন</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-md text-white/90">
                    <Info className="w-4 h-4" /> এডমিন কোটেশন
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <CardContent className="p-6 sm:p-10 space-y-10">
                    {/* Section 1: Trip Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            ভ্রমণের বিবরণ
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="from" className="font-semibold text-gray-700 dark:text-gray-300">কোথা থেকে (প্রস্থান শহর) <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="from" 
                                    placeholder="যেমন: ঢাকা (DAC)" 
                                    required
                                    value={formData.departure_city}
                                    onChange={(e) => setFormData({...formData, departure_city: e.target.value})}
                                    className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="to" className="font-semibold text-gray-700 dark:text-gray-300">কোথায় (গন্তব্য শহর) <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="to" 
                                    placeholder="যেমন: লন্ডন (LHR)" 
                                    required
                                    value={formData.destination_city}
                                    onChange={(e) => setFormData({...formData, destination_city: e.target.value})}
                                    className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="dep_date" className="font-semibold text-gray-700 dark:text-gray-300">যাত্রার তারিখ <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="dep_date" 
                                    type="date" 
                                    required
                                    value={formData.departure_date}
                                    onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                                    className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="ret_date" className="font-semibold text-gray-700 dark:text-gray-300">ফেরার তারিখ (ঐচ্ছিক)</Label>
                                <Input 
                                    id="ret_date" 
                                    type="date"
                                    value={formData.return_date}
                                    onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                                    className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-gray-100 dark:bg-gray-800" />

                    {/* Section 2: Preferences */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            ভ্রমণ পছন্দসমূহ
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="font-semibold text-gray-700 dark:text-gray-300">কেবিন ক্লাস</Label>
                                <Select value={formData.cabin_class} onValueChange={(v) => setFormData({...formData, cabin_class: v})}>
                                    <SelectTrigger className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
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
                            <div className="space-y-3">
                                <Label className="font-semibold text-gray-700 dark:text-gray-300">যাত্রী সংখ্যা</Label>
                                <Select value={formData.passengers} onValueChange={(v) => setFormData({...formData, passengers: v})}>
                                    <SelectTrigger className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
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

                    <Separator className="bg-gray-100 dark:bg-gray-800" />

                    {/* Section 3: Contact & Notes */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                            <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                                <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            যোগাযোগের তথ্য ও অন্যান্য
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="font-semibold text-gray-700 dark:text-gray-300">পূর্ণ নাম <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="name" 
                                    placeholder="আপনার নাম লিখুন" 
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="phone" className="font-semibold text-gray-700 dark:text-gray-300">মোবাইল নম্বর <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="phone" 
                                    placeholder="মোবাইল নম্বর" 
                                    required
                                    value={formData.contact_number}
                                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                                    className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-300">ইমেইল ঠিকানা <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="ইমেইল ঠিকানা" 
                                    required
                                    value={formData.email_address}
                                    onChange={(e) => setFormData({...formData, email_address: e.target.value})}
                                    className="h-12 px-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                                />
                            </div>
                            <div className="md:col-span-3 space-y-3 pt-2">
                                <Label htmlFor="notes" className="font-semibold text-gray-700 dark:text-gray-300">অতিরিক্ত অনুরোধ (ঐচ্ছিক)</Label>
                                <Textarea 
                                    id="notes" 
                                    placeholder="যেমন: নির্দিষ্ট কোনো এয়ারলাইন্স, উইন্ডো সিট বা অতিরিক্ত লাগেজ সংক্রান্ত অনুরোধ..." 
                                    className="min-h-[100px] p-4 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-colors resize-none"
                                    value={formData.additional_notes}
                                    onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
                
                <CardFooter className="bg-gray-50/80 dark:bg-gray-900/30 px-6 py-8 sm:px-10 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-3 p-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl text-blue-700 dark:text-blue-300 w-full md:w-auto md:max-w-xl">
                        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed font-medium">
                            আমাদের প্রতিনিধি আপনার ভ্রমণ তথ্যের ভিত্তিতে টিকিটের সেরা মূল্য নির্ধারণ করে সাম্প্রতিক অর্ডারসমূহ ট্যাবে জানিয়ে দেবেন।
                        </p>
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full md:w-auto h-12 px-10 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/25 transition-all text-white gap-2"
                        disabled={loading}
                    >
                        {loading ? 'প্রক্রিয়াধীন...' : (
                            <>
                                <Send className="w-5 h-5" />
                                রিকোয়েস্ট পাঠান
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
