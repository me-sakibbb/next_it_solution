'use server'

import { createClient } from '@/lib/supabase/server'
import { saleSchema, customerSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getSales(shopId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      customer:customers(id, name, phone, email, address),
      shop:shops(id, name, address, phone, email),
      sale_items(
        *,
        product:products(name, unit)
      )
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data
}

export async function createSale(shopId: string, saleData: any) {
  const supabase = await createClient()

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

  // Calculate balance (due) amount
  const paidAmount = Number(saleData.paid_amount) || 0
  const balanceAmount = totalAmount - paidAmount
  const paymentStatus = balanceAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending')

  // Create sale
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

  // Create sale items (inventory will be updated automatically by trigger)
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

  // Update customer balance if there is a due
  if (balanceAmount > 0 && saleData.customer_id) {
    // Check if customer exists and has outstanding_balance column
    // We try to update, if it fails due to column missing, we might need a fallback or just log error
    // Assuming schema matches types.ts
    const { error: customerError } = await supabase.rpc('increment_customer_balance', {
      p_customer_id: saleData.customer_id,
      p_amount: balanceAmount
    })

    // If RPC fails (maybe not exists), try direct update
    if (customerError) {
      // Fetch current balance
      const { data: customer } = await supabase
        .from('customers')
        .select('outstanding_balance')
        .eq('id', saleData.customer_id)
        .single()

      if (customer) {
        const newBalance = (customer.outstanding_balance || 0) + balanceAmount
        await supabase
          .from('customers')
          .update({ outstanding_balance: newBalance })
          .eq('id', saleData.customer_id)
      }
    }
  }

  // Create payment record if paid anything
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

  revalidatePath('/dashboard/shop/sales')
  return sale
}

export async function getCustomers(shopId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

export async function createCustomer(shopId: string, formData: FormData) {
  const supabase = await createClient()

  const customerData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zip_code: formData.get('zip_code'),
    country: formData.get('country'),
    customer_type: formData.get('customer_type') || 'retail',
    credit_limit: Number(formData.get('credit_limit') || 0),
  }

  const validated = customerSchema.parse(customerData)

  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...validated,
      shop_id: shopId,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/shop/customers')
  return data
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()

  const customerData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zip_code: formData.get('zip_code'),
    country: formData.get('country'),
    customer_type: formData.get('customer_type'),
    credit_limit: Number(formData.get('credit_limit') || 0),
  }

  const validated = customerSchema.parse(customerData)

  const { data, error } = await supabase
    .from('customers')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/shop/customers')
  return data
}

export async function addPayment(shopId: string, paymentData: any) {
  const supabase = await createClient()
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

  // Remove balance_amount if it's generated
  await supabase
    .from('sales')
    .update({
      paid_amount: newPaidAmount,
      payment_status: newPaymentStatus
    })
    .eq('id', paymentData.sale_id)

  // 4. Update customer balance (decrease outstanding)
  if (sale.customer_id) {
    // Try RPC first
    const { error: rpcError } = await supabase.rpc('decrement_customer_balance', {
      p_customer_id: sale.customer_id,
      p_amount: amount
    })

    if (rpcError) {
      // Fallback manual update
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

  revalidatePath('/dashboard/shop/sales')
}

export async function updateSale(shopId: string, saleId: string, updateData: any) {
  const supabase = await createClient()

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
    // Current Balance (calculated) = Total - Paid
    // New Balance (calculated) = NewTotal - Paid
    // Delta = NewBalance - CurrentBalance = NewTotal - Total

    // We want to ADJUST the customer's outstanding balance by this Delta.

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

  revalidatePath('/dashboard/shop/sales')
}
