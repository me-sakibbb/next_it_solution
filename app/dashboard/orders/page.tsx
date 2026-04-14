'use client'

import { useEffect, useState, Suspense } from 'react'
import { getUserOrders } from '@/actions/services'
import { getFlightTicketOrders } from '@/actions/flight-tickets'
import { UserOrdersList } from '@/components/services/user-orders-list'
import { FlightTicketOrdersList } from '@/components/services/flight-ticket-orders-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Plane } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function OrdersPageContent() {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab')
    const [activeTab, setActiveTab] = useState(tabParam === 'flights' ? 'flights' : 'services')
    
    const [orders, setOrders] = useState<any[]>([])
    const [flightOrders, setFlightOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Update active tab if URL parameter changes
    useEffect(() => {
        if (tabParam === 'flights' || tabParam === 'services') {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    const fetchAllOrders = async () => {
        setLoading(true)
        try {
            const [svcOrders, fltOrders] = await Promise.all([
                getUserOrders(),
                getFlightTicketOrders()
            ])
            setOrders(svcOrders)
            setFlightOrders(fltOrders)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllOrders()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="text-gray-500">Loading orders...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <TabsTrigger value="services" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                        <ShoppingBag className="h-4 w-4" /> Service Orders
                    </TabsTrigger>
                    <TabsTrigger value="flights" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                        <Plane className="h-4 w-4" /> Flight Ticket Orders
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="mt-6">
                    <UserOrdersList initialOrders={orders} />
                </TabsContent>

                <TabsContent value="flights" className="mt-6">
                    <FlightTicketOrdersList initialOrders={flightOrders} onRefresh={fetchAllOrders} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function UserOrdersPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
            <OrdersPageContent />
        </Suspense>
    )
}
