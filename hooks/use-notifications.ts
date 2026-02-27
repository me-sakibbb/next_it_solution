'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/types'
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/lib/push-notifications'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPushEnabled, setIsPushEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)

    try {
      // Check if we actually have a session
      const { data: sessionData } = await supabase.auth.getSession()
      console.log('Current notification session:', sessionData.session ? 'Active' : 'Missing')

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications detail:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      } else if (data) {
        setNotifications(data as Notification[])
        setUnreadCount(data.filter(n => !n.read).length)
      }
    } catch (err: any) {
      console.error('Fetch notifications catch block:', err)
    } finally {
      setIsLoading(false)
    }

    // Check push permission state
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsPushEnabled(Notification.permission === 'granted')
    }
  }, [userId]) // supabase removed from deps as it is now a stable singleton

  useEffect(() => {
    if (userId) {
      fetchNotifications()

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`user-notifications-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          () => {
            fetchNotifications()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [userId, fetchNotifications])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(current =>
      current.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(current => Math.max(0, current - 1))

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) {
      fetchNotifications()
      console.error('Error marking notification as read', error)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return

    // Optimistic
    setNotifications(current => current.map(n => ({ ...n, read: true })))
    setUnreadCount(0)

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      fetchNotifications()
    }
  }

  const enablePush = async () => {
    const success = await subscribeToPushNotifications()
    setIsPushEnabled(success)
    return success
  }

  const disablePush = async () => {
    const success = await unsubscribeFromPushNotifications()
    if (success) {
      setIsPushEnabled(false)
    }
    return success
  }

  return {
    notifications,
    unreadCount,
    isPushEnabled,
    isLoading,
    markAsRead,
    markAllAsRead,
    enablePush,
    disablePush,
    refresh: fetchNotifications
  }
}
