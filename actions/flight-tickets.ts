'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyUser, notifySuperAdmins } from './notifications'
import { FlightTicketOrder, FlightTicketOrderStatus } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getFlightTicketOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('flight_ticket_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as FlightTicketOrder[]
}

export async function getAllFlightTicketOrders() {
    const supabase = await createClient()
    // Admin check is handled by RLS, but we can verify role here if needed
    const { data, error } = await supabase
        .from('flight_ticket_orders')
        .select('*, user:users(email, full_name)')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as FlightTicketOrder[]
}

export async function payFlightTicketOrder(orderId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get order details
    const { data: order, error: orderError } = await supabase
        .from('flight_ticket_orders')
        .select('*')
        .eq('id', orderId)
        .single()

    if (orderError || !order) throw new Error('Order not found')
    if (order.status !== 'priced') throw new Error('Order is not in priced status')
    if (!order.price) throw new Error('Price not set')

    // Check balance
    const { data: profile } = await supabase
        .from('users')
        .select('balance, email')
        .eq('id', user.id)
        .single()

    if (!profile || profile.balance < order.price) {
        throw new Error('Insufficient balance')
    }

    // Process payment (Deduct balance and update order status)
    // In a real app, this should be a transaction
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: profile.balance - order.price })
        .eq('id', user.id)

    if (balanceError) throw new Error(balanceError.message)

    const { error: updateError } = await supabase
        .from('flight_ticket_orders')
        .update({
            status: 'paid',
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (updateError) throw new Error(updateError.message)

    // Log transaction
    await supabase.from('balance_transactions').insert({
        user_id: user.id,
        amount: order.price,
        type: 'debit',
        description: `Flight Ticket Payment: ${order.departure_city} to ${order.destination_city}`,
        reference_id: orderId,
        reference_type: 'flight_ticket_order'
    })

    // Notify admins
    await notifySuperAdmins(
        'পেমেন্ট সফল হয়েছে (ফ্লাইট টিকিট)',
        `${profile.email} একটি ফ্লাইট টিকিটের পেমেন্ট করেছেন (৳${order.price})`,
        '/superadmin/flight-tickets',
        'payment'
    )

    revalidatePath('/dashboard/orders')
    revalidatePath('/superadmin/flight-tickets')
}


