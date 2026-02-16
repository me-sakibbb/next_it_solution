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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'

interface ShopSidebarProps {
  user: User
  profile: any
}

const shopMenuItems = [
  { name: 'Shop Overview', href: '/dashboard/shop', icon: Store },
  { name: 'Sales & POS', href: '/dashboard/shop/sales', icon: ShoppingCart },
  { name: 'Inventory', href: '/dashboard/shop/inventory', icon: Package },
  { name: 'Customers', href: '/dashboard/shop/customers', icon: UserCircle },
  { name: 'Staff', href: '/dashboard/shop/staff', icon: Users },
  { name: 'Payroll', href: '/dashboard/shop/payroll', icon: DollarSign },
  { name: 'Reports', href: '/dashboard/shop/reports', icon: TrendingUp },
  { name: 'Tasks', href: '/dashboard/shop/tasks', icon: ClipboardList },
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
          <span className="font-semibold text-foreground">Shop Management</span>
        </Link>
      </div>

      {/* Back to Dashboard Button */}
      <div className="p-4 border-b">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {shopMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
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
