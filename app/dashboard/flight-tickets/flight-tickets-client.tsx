'use client'

import { FlightTicketOrdersList } from '@/components/services/flight-ticket-orders-list'
import { FlightTicketDialog } from '@/components/services/flight-ticket-dialog'
import { FlightTicketOrder } from '@/lib/types'
import { useRouter } from 'next/navigation'

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold border-b border-gray-200 dark:border-gray-800 pb-2">ফ্লাইট টিকেট</h1>
                    <p className="text-gray-500 mt-2">আপনার ফ্লাইট টিকেটের রিকোয়েস্ট সমূহ দেখুন এবং নতুন রিকোয়েস্ট করুন</p>
                </div>
                
                <FlightTicketDialog triggerButton onSuccess={handleRefresh} />
            </div>
            
            <FlightTicketOrdersList initialOrders={initialOrders} onRefresh={handleRefresh} />
        </div>
    )
}