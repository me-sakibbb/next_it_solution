import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUserShop() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: shop, error } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .single()

  if (error || !shop) {
    // If no shop exists, something went wrong with signup
    // This shouldn't happen with the trigger, but handle it gracefully
    throw new Error('Shop not found. Please contact support.')
  }

  return { user, shop }
}
