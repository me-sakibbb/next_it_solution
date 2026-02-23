'use server'

import { createClient } from '@/lib/supabase/server'
import { productSchema, categorySchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { getPaginationRange, type PaginationParams, type PaginatedResponse } from '@/lib/pagination'

export async function getProducts(shopId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      inventory(quantity)
    `)
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProducts error:', error)
    throw error
  }

  return data
}

export async function getPaginatedProducts(params: PaginationParams): Promise<PaginatedResponse<any>> {
  const supabase = await createClient()
  const { from, to } = getPaginationRange(params.page, params.limit)

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      inventory(quantity)
    `, { count: 'exact' })
    .eq('shop_id', params.shopId)
    .eq('is_active', true)

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%,barcode.ilike.%${params.search}%`)
  }

  if (params.filters?.category_id) {
    query = query.eq('category_id', params.filters.category_id)
  }

  const { data, error, count } = await query
    .order(params.sortBy || 'name', { ascending: params.sortOrder === 'asc' })
    .range(from, to)

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil((count || 0) / params.limit)
  }
}

export async function getProduct(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      inventory(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProduct(shopId: string, formData: FormData) {
  const supabase = await createClient()

  const categoryId = formData.get('category_id')
  const supplierId = formData.get('supplier_id')

  const productData = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    sku: formData.get('sku') || undefined,
    barcode: formData.get('barcode') || undefined,
    brand: formData.get('brand') || undefined,
    model: formData.get('model') || undefined,
    category_id: categoryId && categoryId !== 'none' ? categoryId : undefined,
    supplier_id: supplierId && supplierId !== 'none' ? supplierId : undefined,
    cost_price: Number(formData.get('cost_price')),
    selling_price: Number(formData.get('selling_price')),
    mrp: formData.get('mrp') ? Number(formData.get('mrp')) : undefined,
    tax_rate: Number(formData.get('tax_rate') || 0),
    unit: formData.get('unit') || 'piece',
    min_stock_level: Number(formData.get('min_stock_level') || 0),
    warranty_period: formData.get('warranty_period') ? Number(formData.get('warranty_period')) : undefined,
    warranty_type: formData.get('warranty_type') || undefined,
  }

  const validated = productSchema.parse(productData)

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      ...validated,
      shop_id: shopId,
    })
    .select()
    .single()

  if (productError) throw productError

  // Create inventory record - always create even if quantity is 0
  const initialQuantity = Number(formData.get('initial_quantity') || 0)

  const { error: inventoryError } = await supabase
    .from('inventory')
    .insert({
      shop_id: shopId,
      product_id: product.id,
      quantity: initialQuantity,
    })

  if (inventoryError) {
    console.error('Inventory creation error:', inventoryError)
  }

  // Fetch the complete product with relationships before returning
  const { data: completeProduct, error: fetchError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      inventory(quantity, available_quantity)
    `)
    .eq('id', product.id)
    .single()

  if (fetchError) {
    console.error('Error fetching complete product:', fetchError)
    // Fallback to simpler object if fetch fails
    return product
  }

  revalidatePath('/dashboard/shop/inventory')
  return completeProduct
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  const categoryId = formData.get('category_id')
  const supplierId = formData.get('supplier_id')

  const productData = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    sku: formData.get('sku') || undefined,
    barcode: formData.get('barcode') || undefined,
    brand: formData.get('brand') || undefined,
    model: formData.get('model') || undefined,
    category_id: categoryId && categoryId !== 'none' ? categoryId : undefined,
    supplier_id: supplierId && supplierId !== 'none' ? supplierId : undefined,
    cost_price: Number(formData.get('cost_price')),
    selling_price: Number(formData.get('selling_price')),
    mrp: formData.get('mrp') ? Number(formData.get('mrp')) : undefined,
    tax_rate: Number(formData.get('tax_rate') || 0),
    unit: formData.get('unit') || 'piece',
    min_stock_level: Number(formData.get('min_stock_level') || 0),
    warranty_period: formData.get('warranty_period') ? Number(formData.get('warranty_period')) : undefined,
    warranty_type: formData.get('warranty_type') || undefined,
  }

  const validated = productSchema.parse(productData)

  const { data, error } = await supabase
    .from('products')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Fetch the complete product with relationships before returning
  const { data: completeProduct, error: fetchError } = await supabase
    .from('products')
    .select(`
       *,
       category:categories(id, name),
       inventory(quantity, available_quantity)
     `)
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Error fetching complete product after update:', fetchError)
    return data
  }

  revalidatePath('/dashboard/shop/inventory')
  return completeProduct
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/dashboard/shop/inventory')
}

export async function getCategories(shopId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

export async function createCategory(shopId: string, formData: FormData) {
  const supabase = await createClient()

  const parentId = formData.get('parent_id')

  const categoryData = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    parent_id: parentId && parentId !== 'none' ? parentId : undefined,
  }

  const validated = categorySchema.parse(categoryData)

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...validated,
      shop_id: shopId,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/shop/inventory')
  return data
}

export async function updateInventory(productId: string, shopId: string, adjustment: number, type: string, notes?: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Update inventory
  const { data: inventory, error: invError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('product_id', productId)
    .eq('shop_id', shopId)
    .single()

  if (invError) throw invError

  const newQuantity = inventory.quantity + adjustment

  const { error: updateError } = await supabase
    .from('inventory')
    .update({
      quantity: newQuantity,
      last_restocked_at: new Date().toISOString()
    })
    .eq('product_id', productId)
    .eq('shop_id', shopId)

  if (updateError) throw updateError

  // Create transaction record
  await supabase
    .from('inventory_transactions')
    .insert({
      shop_id: shopId,
      product_id: productId,
      transaction_type: type,
      quantity: adjustment,
      notes,
      created_by: user?.id,
    })

  revalidatePath('/dashboard/shop/inventory')
}
