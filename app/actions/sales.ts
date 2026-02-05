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
      paid_amount: saleData.paid_amount,
      payment_status: saleData.paid_amount >= totalAmount ? 'paid' : 'partial',
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

  // Create payment record if paid
  if (saleData.paid_amount > 0) {
    await supabase
      .from('payments')
      .insert({
        shop_id: shopId,
        sale_id: sale.id,
        amount: saleData.paid_amount,
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
