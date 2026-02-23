'use client'

import { useServerPagination } from './use-server-pagination'
import { useToast } from '@/components/ui/use-toast'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPaginationRange, type PaginationParams } from '@/lib/pagination'

export function useSales(shopId: string) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchSales = useCallback(async (params: PaginationParams) => {
        const { from, to } = getPaginationRange(params.page, params.limit)

        let query = supabase
            .from('sales')
            .select(`
                *,
                customer:customers(id, name, phone),
                sale_items(
                    *,
                    product:products(name, unit)
                )
            `, { count: 'exact' })
            .eq('shop_id', params.shopId)

        if (params.search) {
            query = query.ilike('sale_number', `%${params.search}%`)
        }

        if (params.filters?.payment_status) {
            query = query.eq('payment_status', params.filters.payment_status)
        }

        const { data, error, count } = await query
            .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })
            .range(from, to)

        if (error) throw error

        return {
            data: data || [],
            total: count || 0,
        }
    }, [supabase])

    const pagination = useServerPagination<any>({
        fetchAction: fetchSales,
        shopId,
        initialLimit: 10,
    })

    const handleCreateSale = async (saleData: any) => {
        setLoading(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Generate sale number
            const { count } = await supabase
                .from('sales')
                .select('*', { count: 'exact', head: true })
                .eq('shop_id', shopId)

            const saleNumber = `SALE-${String((count || 0) + 1).padStart(6, '0')}`

            // Calculate totals
            const subtotal = saleData.items.reduce((sum: number, item: any) => {
                return sum + (item.quantity * item.unit_price)
            }, 0)

            const taxAmount = saleData.items.reduce((sum: number, item: any) => {
                const itemTotal = item.quantity * item.unit_price
                const tax = itemTotal * ((item.tax_rate || 0) / 100)
                return sum + tax
            }, 0)

            const totalAmount = subtotal + taxAmount - (saleData.discount_amount || 0)
            const rawPaidAmount = Number(saleData.paid_amount) || 0
            const paidAmount = Math.min(rawPaidAmount, totalAmount)
            const balanceAmount = totalAmount - paidAmount
            const paymentStatus = balanceAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending')

            // 1. Create sale
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert({
                    shop_id: shopId,
                    customer_id: saleData.customer_id || null,
                    sale_number: saleNumber,
                    status: 'completed',
                    subtotal,
                    tax_amount: taxAmount,
                    discount_amount: saleData.discount_amount || 0,
                    total_amount: totalAmount,
                    paid_amount: paidAmount,
                    payment_status: paymentStatus,
                    notes: saleData.notes,
                    created_by: user?.id,
                })
                .select()
                .single()

            if (saleError) throw saleError

            // 2. Create sale items
            const saleItems = saleData.items.map((item: any) => ({
                sale_id: sale.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                tax_rate: item.tax_rate || 0,
                discount_amount: item.discount_amount || 0,
            }))

            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(saleItems)

            if (itemsError) throw itemsError

            // 3. Update customer balance if there is a due
            if (balanceAmount > 0 && saleData.customer_id) {
                const { error: rpcError } = await supabase.rpc('increment_customer_balance', {
                    p_customer_id: saleData.customer_id,
                    p_amount: balanceAmount
                })

                if (rpcError) {
                    const { data: customer } = await supabase
                        .from('customers')
                        .select('outstanding_balance')
                        .eq('id', saleData.customer_id)
                        .single()

                    if (customer) {
                        const newBalance = (Number(customer.outstanding_balance) || 0) + balanceAmount
                        await supabase
                            .from('customers')
                            .update({ outstanding_balance: newBalance })
                            .eq('id', saleData.customer_id)
                    }
                }
            }

            // 4. Create payment record if paid anything
            if (paidAmount > 0) {
                await supabase
                    .from('payments')
                    .insert({
                        shop_id: shopId,
                        sale_id: sale.id,
                        amount: paidAmount,
                        payment_method: saleData.payment_method,
                        created_by: user?.id,
                    })
            }

            toast({
                title: 'সফল',
                description: 'বিক্রয় সফলভাবে সম্পন্ন হয়েছে।',
            })
            pagination.refresh()
            return sale
        } catch (err: any) {
            setError(err.message)
            toast({
                variant: 'destructive',
                title: 'ব্যর্থ',
                description: err.message || 'বিক্রয় সম্পন্ন করতে সমস্যা হয়েছে।',
            })
            return null
        } finally {
            setLoading(false)
        }
    }

    const handleAddPayment = async (paymentData: any) => {
        setLoading(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Get current sale data
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .select('*')
                .eq('id', paymentData.sale_id)
                .single()

            if (saleError) throw saleError

            const amount = Number(paymentData.amount)

            // 2. Insert payment record
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    shop_id: shopId,
                    sale_id: paymentData.sale_id,
                    amount: amount,
                    payment_method: paymentData.payment_method,
                    created_by: user?.id
                })

            if (paymentError) throw paymentError

            // 3. Update sale totals
            const newPaidAmount = (Number(sale.paid_amount) || 0) + amount
            const newBalanceAmount = Number(sale.total_amount) - newPaidAmount
            const newPaymentStatus = newBalanceAmount <= 0 ? 'paid' : 'partial'

            await supabase
                .from('sales')
                .update({
                    paid_amount: newPaidAmount,
                    payment_status: newPaymentStatus
                })
                .eq('id', paymentData.sale_id)

            // 4. Update customer balance
            if (sale.customer_id) {
                const { error: rpcError } = await supabase.rpc('decrement_customer_balance', {
                    p_customer_id: sale.customer_id,
                    p_amount: amount
                })

                if (rpcError) {
                    const { data: customer } = await supabase
                        .from('customers')
                        .select('outstanding_balance')
                        .eq('id', sale.customer_id)
                        .single()

                    if (customer) {
                        const currentBalance = Number(customer.outstanding_balance) || 0
                        await supabase
                            .from('customers')
                            .update({ outstanding_balance: currentBalance - amount })
                            .eq('id', sale.customer_id)
                    }
                }
            }

            toast({
                title: 'সফল',
                description: 'পেমেন্ট সফলভাবে যোগ করা হয়েছে।',
            })
            pagination.refresh()
            return true
        } catch (err: any) {
            setError(err.message)
            toast({
                variant: 'destructive',
                title: 'ব্যর্থ',
                description: err.message || 'পেমেন্ট যোগ করতে সমস্যা হয়েছে।',
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateSale = async (saleId: string, updateData: any) => {
        setLoading(true)
        setError(null)
        try {
            // 1. Get current sale
            const { data: sale, error: fetchError } = await supabase
                .from('sales')
                .select('*')
                .eq('id', saleId)
                .single()

            if (fetchError) throw fetchError

            // 2. Calculate new totals
            const currentTotal = Number(sale.total_amount)
            const oldDiscount = Number(sale.discount_amount) || 0
            const newDiscount = Number(updateData.discount_amount)

            const baseAmount = currentTotal + oldDiscount
            const newTotal = baseAmount - newDiscount
            const newBalance = newTotal - (Number(sale.paid_amount) || 0)
            const newPaymentStatus = newBalance <= 0 ? 'paid' : ((Number(sale.paid_amount) || 0) > 0 ? 'partial' : 'pending')

            // 3. Update Sale
            const { error: updateError } = await supabase
                .from('sales')
                .update({
                    discount_amount: newDiscount,
                    total_amount: newTotal,
                    payment_status: newPaymentStatus,
                    notes: updateData.notes
                })
                .eq('id', saleId)

            if (updateError) throw updateError

            // 4. Update Customer Balance (Delta)
            if (sale.customer_id) {
                const balanceDelta = newTotal - currentTotal
                if (balanceDelta !== 0) {
                    const { data: customer } = await supabase
                        .from('customers')
                        .select('outstanding_balance')
                        .eq('id', sale.customer_id)
                        .single()

                    if (customer) {
                        await supabase
                            .from('customers')
                            .update({ outstanding_balance: (Number(customer.outstanding_balance) || 0) + balanceDelta })
                            .eq('id', sale.customer_id)
                    }
                }
            }

            toast({
                title: 'সফল',
                description: 'বিক্রয় তথ্য সফলভাবে আপডেট করা হয়েছে।',
            })
            pagination.refresh()
            return true
        } catch (err: any) {
            setError(err.message)
            toast({
                variant: 'destructive',
                title: 'ব্যর্থ',
                description: err.message || 'বিক্রয় তথ্য আপডেট করতে সমস্যা হয়েছে।',
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    const getSaleDetails = async (saleId: string) => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('sales')
                .select(`
                    *,
                    customer:customers(id, name, phone, email, address),
                    shop:shops(id, name, address, phone, email, logo_url),
                    sale_items(
                        *,
                        product:products(name, unit)
                    )
                `)
                .eq('id', saleId)
                .single()

            if (error) throw error
            return data
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'ব্যর্থ',
                description: 'বিক্রয় তথ্য লোড করতে সমস্যা হয়েছে।',
            })
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        sales: pagination.data,
        total: pagination.total,
        isLoading: pagination.loading || loading,
        error: pagination.error || error,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        setPage: pagination.setPage,
        setLimit: pagination.setLimit,
        setSearch: pagination.setSearch,
        setFilters: pagination.setFilters,
        refresh: pagination.refresh,
        handleCreateSale,
        handleAddPayment,
        handleUpdateSale,
        getSaleDetails,
    }
}
