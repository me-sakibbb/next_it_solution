'use client'

import { useState, useEffect } from 'react'
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '@/app/actions/notifications'
import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  async function loadNotifications() {
    try {
      const data = await getNotifications(userId)
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    
    // Subscribe to real-time notifications
    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(current => 
      current.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    await markNotificationAsRead(id)
    loadNotifications() // Re-fetch to ensure consistency
  }

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(current => 
      current.map(n => ({ ...n, is_read: true }))
    )
    await markAllNotificationsAsRead(userId)
    loadNotifications()
  }

  const removeNotification = async (id: string) => {
    // Optimistic update
    setNotifications(current => 
      current.filter(n => n.id !== id)
    )
    await deleteNotification(id)
    loadNotifications()
  }

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh: loadNotifications
  }
}
