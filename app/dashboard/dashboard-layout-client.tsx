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

    const routeFeatureMap: Record<string, string> = {
        '/dashboard/shop': 'shop',
        '/dashboard/photo-enhancer': 'photo-enhancer',
        '/dashboard/cv-builder': 'cv-builder',
        '/dashboard/print-ready': 'print-ready',
        '/dashboard/flight-tickets': 'flight-tickets',
    }
    const currentFeature = Object.keys(routeFeatureMap).find(route => pathname.startsWith(route))
    const isRestricted = currentFeature && profile?.disabled_features?.includes(routeFeatureMap[currentFeature])

    const renderContent = () => {
        if (isRestricted) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
                    <div className="bg-destructive/10 p-4 rounded-full mb-4">
                        <svg className="w-10 h-10 text-destructive" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">অ্যাক্সেস বন্ধ</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        এই ফিচারটি আপনার অ্যাকাউন্টের জন্য বন্ধ করা আছে। ফিচারটি ব্যবহার করতে অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।
                    </p>
                </div>
            )
        }
        return children
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <UniversalHeader user={user} profile={profile} />
            {isShop && !isRestricted ? (
                <div className="flex-1 flex overflow-hidden">
                    {renderContent()}
                </div>
            ) : (
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8 h-full">
                        {renderContent()}
                    </div>
                </main>
            )}
        </div>
    )
}
