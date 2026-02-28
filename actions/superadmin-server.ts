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
    fields: { full_name?: string; balance?: number; is_active?: boolean }
) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('users')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', userId)
    if (error) throw new Error(error.message)
}

export async function fetchAllBkashTransactions(page = 1, pageSize = PAGE_SIZE_DEFAULT, search?: string) {
    const supabase = createAdminClient()
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
