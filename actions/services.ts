import { createClient } from '@/lib/supabase/client'

export async function getAvailableServices() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
}

export async function getUserBalance(): Promise<number> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()
    if (error) return 0
    return data?.balance ?? 0
}

export async function getUserOrders() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('service_orders')
        .select('*, service:services(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
}

export async function createServiceOrder(
    serviceId: string,
    requirements: string,
    price: number
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check balance
    const { data: profile } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

    if (!profile || profile.balance < price) {
        throw new Error('Insufficient balance')
    }

    // Create order
    const { error: orderError } = await supabase
        .from('service_orders')
        .insert({
            user_id: user.id,
            service_id: serviceId,
            requirements,
            total_price: price,
            status: 'pending',
        })
    if (orderError) throw new Error(orderError.message)

    // Deduct balance
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: profile.balance - price })
        .eq('id', user.id)
    if (balanceError) throw new Error(balanceError.message)
}
