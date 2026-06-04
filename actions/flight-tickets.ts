'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyUser, notifySuperAdmins } from './notifications'
import { createAdminClient } from '@/lib/supabase/admin'
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
    const adminSupabase = createAdminClient()
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
    // We use adminSupabase for status update to bypass RLS, but user client for balance if possible
    // Actually, balance deduction should also be handled carefully.
    // Since users HAVE update permission on their own profile, supabase (user client) works for balance.
    
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: profile.balance - order.price })
        .eq('id', user.id)

    if (balanceError) throw new Error(balanceError.message)

    // Now update order status using admin client
    const { error: updateError } = await adminSupabase
        .from('flight_ticket_orders')
        .update({
            status: 'paid',
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (updateError) {
        // Rollback balance if possible? (Manual rollback)
        await adminSupabase
            .from('users')
            .update({ balance: profile.balance })
            .eq('id', user.id)
        throw new Error(updateError.message)
    }

    // Log transaction using admin client to ensure it works
    await adminSupabase.from('balance_transactions').insert({
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

    revalidatePath('/dashboard/flight-tickets')
    revalidatePath('/superadmin/flight-tickets')
}

export async function createFlightTicketOrder(formData: {
    departure_city: string
    destination_city: string
    departure_date: string
    return_date?: string
    full_name: string
    contact_number: string
    email_address: string
    cabin_class: string
    passengers: string
    additional_notes?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const insertData: any = {
        ...formData,
        user_id: user.id,
        status: 'pending'
    }

    if (!insertData.return_date) {
        delete insertData.return_date
    }

    const { data, error } = await supabase
        .from('flight_ticket_orders')
        .insert(insertData)
        .select()
        .single()

    if (error) {
        console.error("Supabase insert error:", error)
        throw new Error(error.message)
    }

    // Notify super admins
    await notifySuperAdmins(
        'নতুন ফ্লাইট টিকিট রিকোয়েস্ট',
        `${formData.full_name} একটি নতুন ফ্লাইট টিকিট কোটেশন রিকোয়েস্ট করেছেন।`,
        '/superadmin/flight-tickets',
        'order_status'
    ).catch(err => console.error("Failed to notify admins:", err))

    revalidatePath('/dashboard/flight-tickets')
    return data as FlightTicketOrder
}


