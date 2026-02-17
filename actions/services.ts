'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserBalance() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data } = await supabase.from('users').select('balance').eq('id', user.id).single()
    return data?.balance || 0
}

export async function getAvailableServices() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category')

    if (error) throw error
    return data
}

export async function getServiceById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('services').select('*').eq('id', id).single()
    if (error) throw error
    return data
}

export async function createServiceOrder(serviceId: string, requirements: string, price: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check balance
    const { data: userRecord } = await supabase.from('users').select('balance').eq('id', user.id).single()
    const currentBalance = userRecord?.balance || 0

    if (currentBalance < price) {
        throw new Error('Insufficient balance')
    }

    // Deduct balance and create order transaction
    // Note: RPC would be better for atomicity, but doing sequential here for simplicity as allowed by policy
    // We should ideally wrap this in a transaction if Supabase supported client-side transactions easily or use RPC.
    // For now, we'll optimistically update.

    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: currentBalance - price })
        .eq('id', user.id)

    if (balanceError) throw new Error('Failed to update balance')

    const { error: orderError } = await supabase.from('service_orders').insert({
        user_id: user.id,
        service_id: serviceId,
        status: 'pending',
        requirements,
        total_price: price
    })

    if (orderError) {
        // Refund if order fails - crucial for data integrity
        await supabase.from('users').update({ balance: currentBalance }).eq('id', user.id)
        throw new Error('Failed to create order')
    }

    revalidatePath('/dashboard/services')
    return { success: true }
}

export async function getUserOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('service_orders')
        .select('*, service:services(name, image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}
