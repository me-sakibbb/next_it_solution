'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import type { Notification } from '@/lib/types'
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/lib/push-notifications'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPushEnabled, setIsPushEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

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

  const { toast } = useToast()

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.volume = 0.5
      audio.play().catch(e => console.error('Audio play failed:', e))
    } catch (e) {
      console.error('Sound error:', e)
    }
  }, [])

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
          (payload) => {
            // If it's a new notification, show toast and play sound
            if (payload.eventType === 'INSERT') {
              const newNotif = payload.new as Notification
              playNotificationSound()
              toast({
                title: newNotif.title,
                description: newNotif.message,
                variant: 'default',
                action: newNotif.action_url ? (
                  <ToastAction
                    altText="দেখুন"
                    onClick={() => {
                      markAsRead(newNotif.id)
                      if (newNotif.action_url) router.push(newNotif.action_url)
                    }}
                  >
                    দেখুন
                  </ToastAction>
                ) : undefined
              })
            }
            fetchNotifications()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [userId, fetchNotifications, playNotificationSound, toast])

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(current => {
      const notification = current.find(n => n.id === id)
      if (!notification || notification.read) return current

      setUnreadCount(prev => Math.max(0, prev - 1))
      return current.map(n => n.id === id ? { ...n, read: true } : n)
    })

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('read', false)

    if (error) {
      console.error('Error marking notification as read', error)
      fetchNotifications()
    }
  }, [supabase, fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    // Optimistic
    setNotifications(current => {
      const unread = current.filter(n => !n.read).length
      if (unread === 0) return current

      setUnreadCount(0)
      return current.map(n => ({ ...n, read: true }))
    })

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      fetchNotifications()
    }
  }, [userId, supabase, fetchNotifications])

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
