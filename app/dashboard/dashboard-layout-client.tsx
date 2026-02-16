'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { UniversalHeader } from '@/components/dashboard/universal-header'
import { User } from '@supabase/supabase-js'

interface DashboardLayoutClientProps {
    children: React.ReactNode
    user: User
    profile: any
}

export function DashboardLayoutClient({
    children,
    user,
    profile
}: DashboardLayoutClientProps) {
    const pathname = usePathname()

    // Check if we are in the shop management section
    const isShop = pathname.startsWith('/dashboard/shop')

    if (isShop) {
        return <>{children}</>
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <UniversalHeader user={user} profile={profile} />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
