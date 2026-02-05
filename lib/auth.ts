import { createClient } from '@/lib/supabase/server'
import type { User } from '@/lib/types'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  return user
}

export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
  
  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('email, role')
    .eq('id', userId)
    .single()

  if (!user) return false

  return user.role === 'super_admin' || adminEmails.includes(user.email)
}

export async function getUserShops(userId: string) {
  const supabase = await createClient()
  
  const { data: shopMembers } = await supabase
    .from('shop_members')
    .select(`
      shop_id,
      role,
      shops (*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)

  return shopMembers || []
}

export async function hasShopAccess(userId: string, shopId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('shop_members')
    .select('id')
    .eq('user_id', userId)
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .single()

  return !!data
}

export async function getShopMemberRole(userId: string, shopId: string): Promise<string | null> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('shop_members')
    .select('role')
    .eq('user_id', userId)
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .single()

  return data?.role || null
}
