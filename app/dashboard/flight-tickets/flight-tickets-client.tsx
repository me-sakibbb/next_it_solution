'use client'

import { FlightTicketOrdersList } from '@/components/services/flight-ticket-orders-list'
import { FlightTicketForm } from '@/components/services/flight-ticket-form'
import { FlightTicketOrder } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, History } from 'lucide-react'

interface FlightTicketsClientProps {
    initialOrders: FlightTicketOrder[]
    shopId?: string
}

export function FlightTicketsClient({ initialOrders, shopId }: FlightTicketsClientProps) {
    const router = useRouter()

    const handleRefresh = () => {
        router.refresh()
    }

    return (
        <div className="container mx-auto p-4 max-w-7xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold">ফ্লাইট টিকেট</h1>
                    <p className="text-gray-500 mt-1">আপনার ফ্লাইট টিকেটের রিকোয়েস্ট সমূহ দেখুন এবং নতুন রিকোয়েস্ট করুন</p>
                </div>
            </div>

            <Tabs defaultValue="create" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md bg-gray-100/80 dark:bg-gray-800 p-1 rounded-xl h-11 border border-gray-200/50 dark:border-gray-700">
                    <TabsTrigger value="create" className="rounded-lg font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                        <PlusCircle className="w-4 h-4" />
                        নতুন টিকেট রিকোয়েস্ট
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="rounded-lg font-bold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                        <History className="w-4 h-4" />
                        সাম্প্রতিক অর্ডারসমূহ
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="create" className="outline-none">
                    <FlightTicketForm onSuccess={handleRefresh} />
                </TabsContent>
                
                <TabsContent value="orders" className="outline-none">
                    <FlightTicketOrdersList initialOrders={initialOrders} onRefresh={handleRefresh} />
                </TabsContent>
            </Tabs>
        </div>
    )
}