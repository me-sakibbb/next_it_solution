'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function checkEmailExists(email: string) {
    try {
        const supabase = createAdminClient()

        // We search in the public 'users' table which mirrors the auth users
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle()

        if (error) {
            console.error('Error checking email:', error)
            return false
        }

        return !!data
    } catch (err) {
        console.error('Unexpected error checking email:', err)
        return false
    }
}
