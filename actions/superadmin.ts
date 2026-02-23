import { createClient } from '@/lib/supabase/client'
import { Service } from '@/lib/types'

export async function getAdminStats() {
    const supabase = createClient()
    const [usersResult, ordersResult, revenueResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase
            .from('service_orders')
            .select('id', { count: 'exact', head: true })
            .in('status', ['pending', 'in_progress']),
        supabase
            .from('service_orders')
            .select('total_price')
            .eq('status', 'completed'),
    ])

    const revenue = (revenueResult.data ?? []).reduce(
        (sum: number, o: { total_price: number }) => sum + o.total_price,
        0
    )

    return {
        users: usersResult.count ?? 0,
        activeOrders: ordersResult.count ?? 0,
        revenue,
    }
}

export async function getAllOrdersAdmin() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('service_orders')
        .select('*, service:services(*), user:users(id, email, full_name)')
        .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
}

export async function updateOrderStatus(
    orderId: string,
    status: string,
    deliverables: string
) {
    const supabase = createClient()
    const { error } = await supabase
        .from('service_orders')
        .update({ status, deliverables, updated_at: new Date().toISOString() })
        .eq('id', orderId)
    if (error) throw new Error(error.message)
}

export async function getServicesAdmin() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
}

export async function upsertService(service: Partial<Service>) {
    const supabase = createClient()
    const { error } = await supabase.from('services').upsert({
        ...service,
        updated_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)
}

export async function getAllUsers(search?: string) {
    const supabase = createClient()
    let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data ?? []
}

export async function updateUserBalance(userId: string, balance: number) {
    const supabase = createClient()
    const { error } = await supabase
        .from('users')
        .update({ balance, updated_at: new Date().toISOString() })
        .eq('id', userId)
    if (error) throw new Error(error.message)
}
