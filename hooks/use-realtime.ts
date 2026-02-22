'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeTable<T>(
  table: string,
  filter?: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channelConfig: any = {
      event: '*',
      schema: 'public',
      table: table,
    }

    if (filter) {
      channelConfig.filter = filter
    }

    const newChannel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', channelConfig, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData((current) => [...current, payload.new as T])
        } else if (payload.eventType === 'UPDATE') {
          setData((current) =>
            current.map((item: any) =>
              item.id === payload.new.id ? (payload.new as T) : item
            )
          )
        } else if (payload.eventType === 'DELETE') {
          setData((current) =>
            current.filter((item: any) => item.id !== payload.old.id)
          )
        }
      })
      .subscribe()

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [table, filter])

  return { data, setData, channel }
}

export function useRealtimeUpdates(
  table: string,
  onUpdate: (payload: any) => void,
  filter?: string
) {
  // Use a ref for the callback to avoid infinite re-subscribe
  // when the caller doesn't memoize the onUpdate function
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    const supabase = createClient()

    const channelConfig: any = {
      event: '*',
      schema: 'public',
      table: table,
    }

    if (filter) {
      channelConfig.filter = filter
    }

    const channel = supabase
      .channel(`${table}-updates`)
      .on('postgres_changes', channelConfig, (payload) => {
        onUpdateRef.current(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter])
}
