'use server'

import { createAdminClient } from '@/lib/supabase/admin'

const PAGE_SIZE_DEFAULT = 20

export async function updateUserBalance(userId: string, balance: number) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('users')
        .update({ balance, updated_at: new Date().toISOString() })
        .eq('id', userId)
    if (error) throw new Error(error.message)
}

export async function updateUserInfo(
    userId: string,
    fields: { full_name?: string; balance?: number; is_active?: boolean; phone?: string; shop_address?: string; disabled_features?: string[] }
) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('users')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', userId)
    if (error) throw new Error(error.message)
}

export async function fetchAllBkashTransactions(
    page = 1,
    pageSize = PAGE_SIZE_DEFAULT,
    search?: string,
    range: 'today' | 'this_month' | 'all' = 'all'
) {
    const supabase = createAdminClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
        .from('bkash_payments')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`trx_id.ilike.%${search}%,payment_id.ilike.%${search}%`)
    }

    if (range === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        query = query.gte('created_at', today.toISOString())
    } else if (range === 'this_month') {
        const firstDay = new Date()
        firstDay.setDate(1)
        firstDay.setHours(0, 0, 0, 0)
        query = query.gte('created_at', firstDay.toISOString())
    }

    // Clone query for revenue calculation (without range limits)
    let revenueQuery = supabase
        .from('bkash_payments')
        .select('amount, intent')
        .eq('status', 'executed')

    if (range === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        revenueQuery = revenueQuery.gte('created_at', today.toISOString())
    } else if (range === 'this_month') {
        const firstDay = new Date()
        firstDay.setDate(1)
        firstDay.setHours(0, 0, 0, 0)
        revenueQuery = revenueQuery.gte('created_at', firstDay.toISOString())
    }

    const [{ data: payments, error, count }, { data: revenueData }] = await Promise.all([
        query.range(from, to),
        revenueQuery
    ])

    if (error) throw new Error(error.message)

    const totalRevenue = (revenueData ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
    const addBalanceRevenue = (revenueData ?? [])
        .filter(p => p.intent === 'add_balance')
        .reduce((sum, p) => sum + Number(p.amount), 0)
    const subscriptionRevenue = (revenueData ?? [])
        .filter(p => p.intent === 'subscribe')
        .reduce((sum, p) => sum + Number(p.amount), 0)

    if (!payments || payments.length === 0) {
        return {
            data: [],
            count: count ?? 0,
            totalRevenue,
            addBalanceRevenue,
            subscriptionRevenue
        }
    }

    const userIds = [...new Set(payments.map((p: any) => p.user_id))]
    const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name, shop_address')
        .in('id', userIds)

    const userMap = Object.fromEntries((users ?? []).map((u: any) => [u.id, u]))

    return {
        data: payments.map((p: any) => ({ ...p, user: userMap[p.user_id] ?? null })),
        count: count ?? 0,
        totalRevenue,
        addBalanceRevenue,
        subscriptionRevenue
    }
}

export async function fetchAllBalanceTransactions(page = 1, pageSize = PAGE_SIZE_DEFAULT, search?: string) {
    const supabase = createAdminClient()
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
        .select('id, email, full_name, shop_address')
        .in('id', userIds)

    const userMap = Object.fromEntries((users ?? []).map((u: any) => [u.id, u]))

    return {
        data: txns.map((t: any) => ({ ...t, user: userMap[t.user_id] ?? null })),
        count: count ?? 0,
    }
}
import { getPaginationRange } from '@/lib/pagination'

export async function fetchPaginatedUsers(params: {
    page: number
    pageSize: number
    search?: string
    plan?: string
    balanceFilter?: 'all' | 'zero' | 'positive'
    sortBy?: 'balance' | 'created_at'
    sortOrder?: 'asc' | 'desc'
}) {
    const supabase = createAdminClient()
    const { from, to } = getPaginationRange(params.page, params.pageSize)

    // Construct query
    // If we have a plan filter, we need to use an inner join for efficient server-side filtering
    const selectStr = params.plan
        ? '*, subscription:subscriptions!inner(id, plan_type, status, subscription_start_date, subscription_end_date, trial_end_date)'
        : '*, subscription:subscriptions(id, plan_type, status, subscription_start_date, subscription_end_date, trial_end_date)'

    let query = supabase
        .from('users')
        .select(selectStr, { count: 'exact' })

    // Filters
    if (params.search) {
        query = query.or(`email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`)
    }

    if (params.plan && params.plan !== 'all') {
        query = query.eq('subscription.plan_type', params.plan)
    }

    if (params.balanceFilter === 'zero') {
        query = query.eq('balance', 0)
    } else if (params.balanceFilter === 'positive') {
        query = query.gt('balance', 0)
    }

    // Sort
    query = query.order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })

    const { data: users, count, error } = await query.range(from, to)

    if (error) throw new Error(error.message)

    return {
        data: (users || []) as any[],
        total: count ?? 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: count ? Math.ceil(count / params.pageSize) : 0
    }
}

export async function deleteUser(userId: string) {
    const supabase = createAdminClient()
    
    // Delete service orders and flight tickets first to clear the non-cascading FK constraints
    const { error: ticketError } = await supabase
        .from('flight_ticket_orders')
        .delete()
        .eq('user_id', userId)
    if (ticketError) throw new Error(`Failed to delete flight tickets: ${ticketError.message}`)

    const { error: serviceError } = await supabase
        .from('service_orders')
        .delete()
        .eq('user_id', userId)
    if (serviceError) throw new Error(`Failed to delete service orders: ${serviceError.message}`)

    // Delete the auth user (this cascades to public.users, subscriptions, shops, etc.)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) {
        throw new Error(authError.message)
    }
}

