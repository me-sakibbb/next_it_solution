'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { supplierSchema } from '@/lib/validations'

export function useSuppliers(shopId: string) {
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!shopId) return

        const supabase = createClient()

        async function fetchSuppliers() {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('suppliers')
                    .select('*')
                    .eq('shop_id', shopId)
                    .eq('is_active', true)
                    .order('name')

                if (error) throw error
                setSuppliers(data || [])
            } catch (err) {
                setError(err as Error)
                console.error('Failed to fetch suppliers:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchSuppliers()

        const channel = supabase
            .channel('suppliers-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'suppliers', filter: `shop_id=eq.${shopId}` },
                () => { fetchSuppliers() }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [shopId])

    const createSupplier = useCallback(async (formData: FormData) => {
        const supabase = createClient()

        const supplierData = {
            name: formData.get('name'),
            contact_person: formData.get('contact_person') || undefined,
            email: formData.get('email') || undefined,
            phone: formData.get('phone') || undefined,
            address: formData.get('address') || undefined,
            city: formData.get('city') || undefined,
            state: formData.get('state') || undefined,
            zip_code: formData.get('zip_code') || undefined,
            country: formData.get('country') || undefined,
            tax_id: formData.get('tax_id') || undefined,
            payment_terms: formData.get('payment_terms') || undefined,
            credit_limit: formData.get('credit_limit') ? Number(formData.get('credit_limit')) : undefined,
        }

        const validated = supplierSchema.parse(supplierData)

        const { data, error } = await supabase
            .from('suppliers')
            .insert({
                ...validated,
                shop_id: shopId,
            })
            .select()
            .single()

        if (error) throw error
        return data
    }, [shopId])

    const updateSupplier = useCallback(async (id: string, formData: FormData) => {
        const supabase = createClient()

        const supplierData = {
            name: formData.get('name'),
            contact_person: formData.get('contact_person') || undefined,
            email: formData.get('email') || undefined,
            phone: formData.get('phone') || undefined,
            address: formData.get('address') || undefined,
            city: formData.get('city') || undefined,
            state: formData.get('state') || undefined,
            zip_code: formData.get('zip_code') || undefined,
            country: formData.get('country') || undefined,
            tax_id: formData.get('tax_id') || undefined,
            payment_terms: formData.get('payment_terms') || undefined,
            credit_limit: formData.get('credit_limit') ? Number(formData.get('credit_limit')) : undefined,
        }

        const validated = supplierSchema.parse(supplierData)

        const { data, error } = await supabase
            .from('suppliers')
            .update(validated)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }, [shopId])

    const deleteSupplier = useCallback(async (id: string) => {
        const supabase = createClient()

        const { error } = await supabase
            .from('suppliers')
            .update({ is_active: false })
            .eq('id', id)

        if (error) throw error
    }, [shopId])

    return {
        suppliers,
        loading,
        error,
        createSupplier,
        updateSupplier,
        deleteSupplier
    }
}
