import { getAllFlightTicketOrders } from '@/actions/flight-tickets'
import { FlightTicketsManagement } from '@/components/superadmin/flight-tickets-management'

export default async function FlightTicketsPage() {
    const orders = await getAllFlightTicketOrders()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">Flight Ticket Orders</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage custom flight ticket quotations and deliveries.</p>
            </div>

            <FlightTicketsManagement initialOrders={orders} />
        </div>
    )
}
