'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { SubscriptionPlans } from './subscription-plans'
import { useUsageLimits } from '@/hooks/use-usage-limits'
import { Loader2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SubscriptionWallProps {
    children: React.ReactNode
    feature?: 'cv' | 'shop' | 'autofill'
}

export function SubscriptionWall({ children, feature = 'cv' }: SubscriptionWallProps) {
    const { usage, limits, planType, balance, loading, refresh } = useUsageLimits()
    const [showWall, setShowWall] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Only show wall if fully loaded and no active limits found
        if (!loading) {
            if (!limits) {
                setShowWall(true)
            } else {
                setShowWall(false)
            }
        }
    }, [limits, loading])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">অনুমতি যাচাই করা হচ্ছে...</p>
            </div>
        )
    }

    if (showWall) {
        return (
            <div className="relative min-h-[600px] w-full flex items-center justify-center rounded-xl overflow-hidden border bg-background/50 backdrop-blur-sm p-8">
                <div className="max-w-4xl w-full space-y-12">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">আপনার কোন সক্রিয় প্ল্যান নেই</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            এই সার্ভিসটি ব্যবহার করতে আপনার একটি সাবস্ক্রিপশন প্ল্যান প্রয়োজন। নিচের প্ল্যানগুলো থেকে আপনার পছন্দেরটি বেছে নিন।
                        </p>
                    </div>

                    <div className="pt-8">
                        <SubscriptionPlans
                            userBalance={balance}
                            currentPlan={planType || undefined}
                            onSuccess={() => {
                                refresh()
                                // onSuccess might take a second to reflect in DB
                                setTimeout(refresh, 1000)
                            }}
                        />
                    </div>
                </div>

                {/* Static Background Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
            </div>
        )
    }

    return <>{children}</>
}
