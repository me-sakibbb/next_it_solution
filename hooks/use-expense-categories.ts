'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useExpenseCategories(shopId: string) {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchCategories = useCallback(async () => {
        if (!shopId) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('expense_categories')
                .select('*')
                .eq('shop_id', shopId)
                .eq('is_active', true)
                .order('name')

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Failed to fetch expense categories:', error)
        } finally {
            setLoading(false)
        }
    }, [shopId, supabase])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const handleCreateCategory = async (name: string, description?: string) => {
        try {
            const { data, error } = await supabase
                .from('expense_categories')
                .insert({ name, description, shop_id: shopId })
                .select()
                .single()

            if (error) throw error
            toast.success('Category created successfully')
            fetchCategories()
            return data
        } catch (err: any) {
            toast.error(err.message || 'Failed to create category')
            return null
        }
    }

    const handleUpdateCategory = async (id: string, name: string) => {
        try {
            const { data, error } = await supabase
                .from('expense_categories')
                .update({ name })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            toast.success('Category updated successfully')
            fetchCategories()
            return data
        } catch (err: any) {
            toast.error(err.message || 'Failed to update category')
            return null
        }
    }

    const handleDeleteCategory = async (id: string) => {
        try {
            const { error } = await supabase
                .from('expense_categories')
                .update({ is_active: false })
                .eq('id', id)

            if (error) throw error
            toast.success('Category deleted successfully')
            fetchCategories()
            return true
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete category')
            return false
        }
    }

    return {
        categories,
        loading,
        refresh: fetchCategories,
        handleCreateCategory,
        handleUpdateCategory,
        handleDeleteCategory
    }
}
