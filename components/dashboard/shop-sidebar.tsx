'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  UserCircle,
  Home,
  ArrowLeft,
  ClipboardList,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'

interface ShopSidebarProps {
  user: User
  profile: any
}

// Primary Operations
const primaryMenuItems = [
  { name: 'দোকান ওভারভিউ', href: '/dashboard/shop', icon: Store },
  { name: 'বিক্রয় ও পিওএস', href: '/dashboard/shop/sales', icon: ShoppingCart },
  { name: 'ইনভেন্টরি', href: '/dashboard/shop/inventory', icon: Package },
  { name: 'কাজ / সার্ভিস', href: '/dashboard/shop/tasks', icon: ClipboardList },
]

// Entities & People
const entitiesMenuItems = [
  { name: 'কাস্টমার', href: '/dashboard/shop/customers', icon: UserCircle },
  { name: 'সাপ্লায়ার', href: '/dashboard/shop/suppliers', icon: Users },
  { name: 'স্টাফ', href: '/dashboard/shop/staff', icon: Users },
]

// Financials & Reporting
const financeMenuItems = [
  { name: 'বেতন', href: '/dashboard/shop/payroll', icon: DollarSign },
  { name: 'খরচ', href: '/dashboard/shop/expenses', icon: Receipt },
  { name: 'রিপোর্ট', href: '/dashboard/shop/reports', icon: TrendingUp },
]

export function ShopSidebar({ user, profile }: ShopSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">দোকান ব্যবস্থাপনা</span>
        </Link>
      </div>

      {/* Back to Dashboard Button */}
      <div className="p-4 border-b">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ড্যাশবোর্ডে ফিরে যান
          </Button>
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4">

        {/* Primary Operations */}
        <div className="space-y-1">
          {primaryMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Entities */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase text-muted-foreground/60 tracking-wider mb-2">নেটওয়ার্ক</p>
          {entitiesMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Finance and Reports */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase text-muted-foreground/60 tracking-wider mb-2">অর্থ ও রিপোর্ট</p>
          {financeMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.name}
              </Link>
            )
          })}
        </div>

      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {profile?.full_name || 'User'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
