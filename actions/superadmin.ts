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
            .from('bkash_payments')
            .select('amount')
            .eq('status', 'executed'),
    ])

    const revenue = (revenueResult.data ?? []).reduce(
        (sum: number, o: { amount: number }) => sum + Number(o.amount),
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

import { notifyUser } from './notifications'

export async function updateOrderStatus(
    orderId: string,
    status: string,
    deliverables: string
) {
    const supabase = createClient()
    const { error, data: orderData } = await supabase
        .from('service_orders')
        .update({ status, deliverables, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('user_id, service:services(name)')
        .single()

    if (error) throw new Error(error.message)

    if (orderData && orderData.user_id) {
        const serviceName = (orderData.service as any)?.name || 'আপনার অর্ডার'
        const statusMap: Record<string, string> = {
            'pending': 'অপেক্ষমান',
            'in_progress': 'চলমান',
            'completed': 'সম্পন্ন',
            'cancelled': 'বাতিল'
        }
        const readableStatus = statusMap[status] || status

        await notifyUser(
            orderData.user_id,
            'অর্ডারের স্ট্যাটাস আপডেট হয়েছে',
            `${serviceName} এর বর্তমান স্ট্যাটাস: ${readableStatus}`,
            '/dashboard/orders',
            'order_status'
        )
    }
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

export async function getAllUsersWithSubscription(search?: string) {
    const supabase = createClient()
    let query = supabase
        .from('users')
        .select('*, subscription:subscriptions(id, plan_type, status, subscription_start_date, subscription_end_date, trial_end_date)')
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data ?? []
}

export async function updateUserSubscription(
    userId: string,
    planType: string,
    status: string,
    subscriptionEndDate?: string
) {
    const supabase = createClient()

    // When superadmin changes the plan, always reset usage limits
    const { error } = await supabase
        .from('subscriptions')
        .upsert(
            {
                user_id: userId,
                plan_type: planType,
                status,
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: subscriptionEndDate || null,
                cv_usage: 0,
                autofill_usage: 0,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
        )
    if (error) throw new Error(error.message)
}

export async function getAllTransactions(page = 1, pageSize = 20, search?: string) {
    const supabase = createClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from('bkash_payments')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (search) {
        query = query.or(`trx_id.ilike.%${search}%,payment_id.ilike.%${search}%`)
    }

    const { data: payments, error, count } = await query
    if (error) throw new Error(error.message)

    if (!payments || payments.length === 0) {
        return { data: [], count: count ?? 0 }
    }

    // bkash_payments.user_id maps to auth.users (same UUID as public.users.id)
    const userIds = [...new Set(payments.map((p: any) => p.user_id))]
    const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds)

    const userMap = Object.fromEntries((users ?? []).map((u: any) => [u.id, u]))

    return {
        data: payments.map((p: any) => ({ ...p, user: userMap[p.user_id] ?? null })),
        count: count ?? 0,
    }
}

export async function getAllBalanceTransactions(page = 1, pageSize = 20, search?: string) {
    const supabase = createClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from('balance_transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (search) {
        query = query.ilike('description', `%${search}%`)
    }

    const { data: txns, error, count } = await query
    if (error) throw new Error(error.message)

    if (!txns || txns.length === 0) {
        return { data: [], count: count ?? 0 }
    }

    const userIds = [...new Set(txns.map((t: any) => t.user_id))]
    const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds)

    const userMap = Object.fromEntries((users ?? []).map((u: any) => [u.id, u]))

    return {
        data: txns.map((t: any) => ({ ...t, user: userMap[t.user_id] ?? null })),
        count: count ?? 0,
    }
}
