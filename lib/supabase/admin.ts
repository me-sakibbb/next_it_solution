import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
        throw new Error('Supabase URL missing (NEXT_PUBLIC_SUPABASE_URL)')
    }
    if (!supabaseServiceKey) {
        throw new Error('Supabase Service Role Key missing (SUPABASE_SERVICE_ROLE_KEY)')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
