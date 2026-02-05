'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useShop() {
    const [shop, setShop] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function fetchUserAndShop() {
            try {
                setLoading(true)
                const supabase = createClient()

                // Get current user
                const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
                if (userError) throw userError
                if (!currentUser) throw new Error('Not authenticated')

                setUser(currentUser)

                // Get user's shop membership joined with shop details
                const { data: memberData, error: memberError } = await supabase
                    .from('shop_members')
                    .select('*, shop:shops(*)')
                    .eq('user_id', currentUser.id)
                    .eq('is_active', true)
                    .limit(1)
                    .maybeSingle()

                if (memberError) throw memberError

                if (!memberData) {
                    // Fallback: Check if user owns any shops directly (some older records might not have shop_members)
                    const { data: directShop, error: directError } = await supabase
                        .from('shops')
                        .select('*')
                        .eq('owner_id', currentUser.id)
                        .eq('is_active', true)
                        .limit(1)
                        .maybeSingle()

                    if (directError) throw directError
                    if (!directShop) throw new Error('No shop associated with user')

                    setShop(directShop)
                } else {
                    setShop(memberData.shop)
                }
            } catch (err: any) {
                setError(err as Error)
                console.error('Failed to fetch user/shop:', {
                    message: err.message,
                    details: err.details,
                    hint: err.hint,
                    code: err.code,
                    error: err
                })
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndShop()
    }, [])

    return { user, shop, loading, error }
}
