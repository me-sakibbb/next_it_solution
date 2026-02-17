'use server'

import { createClient } from '@/lib/supabase/server'
import { Service, ServiceOrder, User } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function checkSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return false

    const { data: admin } = await supabase
        .from('super_admins')
        .select('email')
        .eq('email', user.email)
        .single()

    return !!admin
}

export async function getAdminStats() {
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: orderCount } = await supabase.from('service_orders').select('*', { count: 'exact', head: true }).eq('status', 'in_progress')

    // Calculate revenue from completed orders (this is a simple sum, normally we'd filter by time)
    const { data: orders } = await supabase.from('service_orders').select('total_price').eq('status', 'completed')
    const revenue = orders?.reduce((acc, order) => acc + (Number(order.total_price) || 0), 0) || 0

    return {
        users: userCount || 0,
        activeOrders: orderCount || 0,
        revenue
    }
}

export async function getAllUsers(search?: string) {
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    let query = supabase.from('users').select('*').order('created_at', { ascending: false })

    if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as User[]
}

export async function updateUserBalance(userId: string, amount: number) {
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { error } = await supabase.from('users').update({ balance: amount }).eq('id', userId)

    if (error) throw error
    revalidatePath('/superadmin/users')
}

// Services CRUD
export async function getServicesAdmin() {
    const supabase = await createClient()
    // Super admin can see all
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Service[]
}

export async function upsertService(service: Partial<Service>) {
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { error } = await supabase.from('services').upsert(service)

    if (error) throw error
    revalidatePath('/superadmin/services')
    revalidatePath('/dashboard/services')
}

// Order Management for Admin
export async function getAllOrdersAdmin() {
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('service_orders')
        .select('*, user:users(email, full_name), service:services(name)')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as ServiceOrder[]
}

export async function updateOrderStatus(orderId: string, status: string, deliverables?: string) {
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    const updateData: any = { status }
    if (deliverables) updateData.deliverables = deliverables
    if (status === 'completed') updateData.updated_at = new Date().toISOString()

    const { error } = await supabase.from('service_orders').update(updateData).eq('id', orderId)

    if (error) throw error
    revalidatePath('/superadmin/orders')
}
