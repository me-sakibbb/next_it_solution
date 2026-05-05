'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Service } from '@/lib/types'
import { notifyUser } from './notifications'

export async function getAdminStats() {
    const supabase = await createClient()
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
    const supabase = await createClient()
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
    const supabase = await createClient()

    // 1. Fetch current order state
    const { data: order, error: fetchError } = await supabase
        .from('service_orders')
        .select('*, service:services(name)')
        .eq('id', orderId)
        .single()

    if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`)
    if (!order) throw new Error('Order not found')

    const previousStatus = order.status

    // 2. Perform the update
    const { error: updateError } = await supabase
        .from('service_orders')
        .update({
            status,
            deliverables,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (updateError) throw new Error(`Update error: ${updateError.message}`)

    // 3. Handle Refund if status changed to cancelled
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
        try {
            const adminSupabase = createAdminClient()

            // Get user profile for current balance
            const { data: profile, error: profileError } = await adminSupabase
                .from('users')
                .select('balance')
                .eq('id', order.user_id)
                .single()

            if (profileError) throw new Error(`Profile fetch error: ${profileError.message}`)

            if (profile) {
                const refundAmount = Number(order.total_price)
                const newBalance = Number(profile.balance) + refundAmount

                // Update balance
                const { error: balError } = await adminSupabase
                    .from('users')
                    .update({ balance: newBalance })
                    .eq('id', order.user_id)

                if (balError) throw new Error(`Balance update error: ${balError.message}`)

                // Log refund transaction
                await adminSupabase.from('balance_transactions').insert({
                    user_id: order.user_id,
                    amount: refundAmount,
                    type: 'credit',
                    description: `নিশ্চিত বাতিল: ${order.service?.name || ''} অর্ডারের মূল্য ফেরত`,
                    reference_id: order.id,
                    reference_type: 'service_order',
                })
            }
        } catch (adminError: any) {
            console.error('Refund failed:', adminError)
            // We throw here so the user sees that even though status might have updated, the refund failed
            throw new Error(`Status updated but refund failed: ${adminError.message}. Please check your SUPABASE_SERVICE_ROLE_KEY environment variable.`)
        }
    }

    // 4. Send Notification
    try {
        const serviceName = (order.service as any)?.name || 'আপনার অর্ডার'
        const statusMap: Record<string, string> = {
            'pending': 'অপেক্ষমান',
            'in_progress': 'চলমান',
            'completed': 'সম্পন্ন',
            'cancelled': 'বাতিল'
        }
        const readableStatus = statusMap[status] || status

        await notifyUser(
            order.user_id,
            'অর্ডারের স্ট্যাটাস আপডেট হয়েছে',
            `${serviceName} এর বর্তমান স্ট্যাটাস: ${readableStatus}${status === 'cancelled' ? '। অর্ডারের মূল্য আপনার ওয়ালেটে ফেরত দেওয়া হয়েছে।' : ''}`,
            '/dashboard/orders',
            'order_status'
        )
    } catch (notifError) {
        console.error('Notification failed:', notifError)
    }
}

export async function getServicesAdmin() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
}

export async function upsertService(service: Partial<Service>) {
    const supabase = await createClient()
    const { error } = await supabase.from('services').upsert({
        ...service,
        updated_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)
}

export async function getAllUsers(search?: string) {
    const supabase = await createClient()
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
    const supabase = await createClient()
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
    const supabase = await createClient()

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
                extraction_usage: 0,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
        )
    if (error) throw new Error(error.message)
}

export async function getAllTransactions(page = 1, pageSize = 20, search?: string) {
    const supabase = await createClient()
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
    const supabase = await createClient()
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
