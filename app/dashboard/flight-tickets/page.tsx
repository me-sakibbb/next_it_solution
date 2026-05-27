import { getFlightTicketOrders } from '@/actions/flight-tickets'
import { getUserShop } from '@/lib/get-user-shop'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FlightTicketsClient } from './flight-tickets-client'

export default async function FlightTicketsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const userData = await getUserShop();
    const shopId = userData?.shop?.id;
    
    // Fallback to empty array if user or function fails
    const flightOrders = await getFlightTicketOrders()

    return (
        <FlightTicketsClient initialOrders={flightOrders || []} shopId={shopId} />
    )
}