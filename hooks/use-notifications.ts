'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const supabase = createClient()

  const loadNotifications = useCallback(async () => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, userId])

  useEffect(() => {
    loadNotifications()

    if (!userId) return

    // Subscribe to real-time notifications
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
  }, [userId, supabase, loadNotifications])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(current =>
      current.map(n => n.id === id ? { ...n, is_read: true } : n)
    )

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      loadNotifications() // Revert on failure
    }
  }

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(current =>
      current.map(n => ({ ...n, is_read: true }))
    )

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      loadNotifications()
    }
  }

  const removeNotification = async (id: string) => {
    // Optimistic update
    setNotifications(current =>
      current.filter(n => n.id !== id)
    )

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Failed to delete notification:', error)
      loadNotifications()
    }
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
