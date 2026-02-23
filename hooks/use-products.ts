'use client'

import { useServerPagination } from './use-server-pagination'
import { createClient } from '@/lib/supabase/client'
import { getPaginationRange, type PaginationParams } from '@/lib/pagination'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { productSchema } from '@/lib/validations'

export function useProducts(shopId: string, categoryId?: string) {
    const supabase = createClient()

    const fetchProducts = useCallback(async (params: PaginationParams) => {
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
        }
    }, [supabase])

    const pagination = useServerPagination({
        fetchAction: fetchProducts,
        shopId,
        initialFilters: { category_id: categoryId },
        initialLimit: 10,
    })

    const handleCreateProduct = async (formData: FormData) => {
        try {
            const catId = formData.get('category_id')
            const supplierId = formData.get('supplier_id')

            const productData = {
                name: formData.get('name'),
                description: formData.get('description') || undefined,
                sku: formData.get('sku') || undefined,
                barcode: formData.get('barcode') || undefined,
                brand: formData.get('brand') || undefined,
                model: formData.get('model') || undefined,
                category_id: catId && catId !== 'none' ? catId : undefined,
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

            // Create inventory record
            const initialQuantity = Number(formData.get('initial_quantity') || 0)
            const { error: inventoryError } = await supabase
                .from('inventory')
                .insert({
                    shop_id: shopId,
                    product_id: product.id,
                    quantity: initialQuantity,
                })

            if (inventoryError) console.error('Inventory creation error:', inventoryError)

            toast.success('Product created successfully')
            pagination.refresh()
            return product
        } catch (error: any) {
            toast.error(error.message || 'Failed to create product')
            return null
        }
    }

    const handleUpdateProduct = async (id: string, formData: FormData) => {
        try {
            const catId = formData.get('category_id')
            const supplierId = formData.get('supplier_id')

            const productData = {
                name: formData.get('name'),
                description: formData.get('description') || undefined,
                sku: formData.get('sku') || undefined,
                barcode: formData.get('barcode') || undefined,
                brand: formData.get('brand') || undefined,
                model: formData.get('model') || undefined,
                category_id: catId && catId !== 'none' ? catId : undefined,
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

            toast.success('Product updated successfully')
            pagination.refresh()
            return data
        } catch (error: any) {
            toast.error(error.message || 'Failed to update product')
            return null
        }
    }

    const handleDeleteProduct = async (id: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: false })
                .eq('id', id)

            if (error) throw error

            toast.success('Product deleted successfully')
            pagination.refresh()
            return true
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete product')
            return false
        }
    }

    const handleUpdateInventory = async (productId: string, adjustment: number, type: string, notes?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

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

            toast.success('Inventory updated successfully')
            pagination.refresh()
            return true
        } catch (error: any) {
            toast.error(error.message || 'Failed to update inventory')
            return false
        }
    }

    return {
        products: pagination.data,
        total: pagination.total,
        loading: pagination.loading,
        error: pagination.error,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        setPage: pagination.setPage,
        setLimit: pagination.setLimit,
        setSearch: pagination.setSearch,
        setFilters: pagination.setFilters,
        refresh: pagination.refresh,
        handleCreateProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        handleUpdateInventory,
    }
}
