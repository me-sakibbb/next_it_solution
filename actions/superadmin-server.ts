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
    fields: { full_name?: string; balance?: number; is_active?: boolean; phone?: string }
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
        .select('id, email, full_name')
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
        .select('id, email, full_name')
        .in('id', userIds)

    const userMap = Object.fromEntries((users ?? []).map((u: any) => [u.id, u]))

    return {
        data: txns.map((t: any) => ({ ...t, user: userMap[t.user_id] ?? null })),
        count: count ?? 0,
    }
}
