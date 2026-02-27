'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, Loader2, BellRing, BellOff } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NotificationType } from '@/lib/types'

export function NotificationsDropdown({ userId }: { userId?: string }) {
  const {
    notifications,
    unreadCount,
    isPushEnabled,
    isLoading,
    markAsRead,
    markAllAsRead,
    enablePush,
    disablePush,
    refresh
  } = useNotifications(userId)
  const [isOpen, setIsOpen] = useState(false)
  const [isPushLoading, setIsPushLoading] = useState(false)
  const router = useRouter()

  const handleNotificationClick = async (id: string, url?: string) => {
    await markAsRead(id)
    setIsOpen(false)
    if (url) {
      router.push(url)
    }
  }

  const togglePush = async (enabled: boolean) => {
    setIsPushLoading(true)
    try {
      if (enabled) {
        await enablePush()
      } else {
        await disablePush()
      }
    } finally {
      setIsPushLoading(false)
    }
  }

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'order_status': return 'অর্ডার আপডেট'
      case 'payment': return 'পেমেন্ট'
      case 'system': return 'সিস্টেম'
      default: return 'সাধারণ'
    }
  }

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'order_status': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'payment': return 'bg-green-100 text-green-800 border-green-200'
      case 'system': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">নোটিফিকেশন</h4>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <Loader2 className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-muted-foreground"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                সব পড়া হয়েছে
              </Button>
            )}
          </div>
        </div>

        <div className="p-3 bg-muted/30 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="push-toggle" className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
              {isPushEnabled ? <BellRing className="w-3 h-3 text-primary" /> : <BellOff className="w-3 h-3 text-muted-foreground" />}
              পুশ নোটিফিকেশন
            </Label>
            <span className="text-[10px] text-muted-foreground">ব্রাউজার বন্ধ থাকলেও অ্যালার্ট পান</span>
          </div>
          <div className="flex items-center">
            {isPushLoading && <Loader2 className="w-3 h-3 animate-spin mr-2 text-muted-foreground" />}
            <Switch
              id="push-toggle"
              checked={isPushEnabled}
              onCheckedChange={togglePush}
              disabled={isPushLoading}
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">এখনও কোনো নোটিফিকেশন নেই</p>
              <p className="text-xs text-muted-foreground mt-1">সব নতুন আপডেটগুলো এখানে দেখতে পাবেন</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 text-left transition-colors hover:bg-muted/50 border-b border-gray-100 dark:border-gray-800 relative",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex items-start justify-between w-full">
                    <p className="font-medium text-sm leading-tight">{notification.title}</p>
                    <Badge variant="outline" className={cn("text-[10px] h-4 px-1 py-0 font-normal rounded-sm border", getTypeColor(notification.type))}>
                      {getTypeLabel(notification.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(notification.created_at).toLocaleString('bn-BD')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
