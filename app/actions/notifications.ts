'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotifications(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[v0] Get notifications error:', error)
    return []
  }

  return data
}

export async function createNotification(
  userId: string,
  type: 'info' | 'warning' | 'error' | 'success',
  title: string,
  message: string,
  link?: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    console.error('[v0] Create notification error:', error)
    return { error: 'Failed to create notification' }
  }

  revalidatePath('/dashboard')
  return { data, error: null }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('[v0] Mark notification read error:', error)
    return { error: 'Failed to mark notification as read' }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('[v0] Mark all notifications read error:', error)
    return { error: 'Failed to mark all notifications as read' }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('[v0] Delete notification error:', error)
    return { error: 'Failed to delete notification' }
  }

  revalidatePath('/dashboard')
  return { error: null }
}
