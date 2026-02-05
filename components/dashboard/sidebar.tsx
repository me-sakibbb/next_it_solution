'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  ImageIcon,
  FileUser,
  TrendingUp,
  UserCircle,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import { CollapsibleNav } from './collapsible-nav'

interface SidebarProps {
  user: User
  profile: any
}

const inventorySubItems = [
  { name: 'Sales & POS', href: '/dashboard/sales', icon: ShoppingCart },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Customers', href: '/dashboard/customers', icon: UserCircle },
  { name: 'Staff', href: '/dashboard/staff', icon: Users },
  { name: 'Payroll', href: '/dashboard/payroll', icon: DollarSign },
  { name: 'Reports', href: '/dashboard/reports', icon: TrendingUp },
]

export function DashboardSidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()

  // Check if we're on the exact dashboard home page
  const isDashboardHome = pathname === '/dashboard'
  const isPhotoEnhancer = pathname === '/dashboard/photo-enhancer' || pathname.startsWith('/dashboard/photo-enhancer/')
  const isCVBuilder = pathname === '/dashboard/cv-builder' || pathname.startsWith('/dashboard/cv-builder/')

  return (
    <div className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">Next IT</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {/* Dashboard Home */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isDashboardHome
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>

        {/* Photo Enhancer */}
        <Link
          href="/dashboard/photo-enhancer"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isPhotoEnhancer
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <ImageIcon className="h-5 w-5" />
          Photo Enhancer
        </Link>

        {/* AI CV Builder */}
        <Link
          href="/dashboard/cv-builder"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isCVBuilder
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <FileUser className="h-5 w-5" />
          AI CV Builder
        </Link>

        {/* Inventory Management - Collapsible */}
        <CollapsibleNav
          name="Inventory Management"
          icon={Briefcase}
          subItems={inventorySubItems}
        />
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

