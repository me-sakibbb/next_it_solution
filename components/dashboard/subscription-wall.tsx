'use client'

import { useState, useEffect } from 'react'
import { SubscriptionPlans } from './subscription-plans'
import { useUsageLimits } from '@/hooks/use-usage-limits'
import { Loader2, Lock } from 'lucide-react'

interface SubscriptionWallProps {
    children: React.ReactNode
    feature?: 'cv' | 'shop' | 'autofill'
}

export function SubscriptionWall({ children, feature = 'cv' }: SubscriptionWallProps) {
    const { limits, planType, balance, loading, refresh } = useUsageLimits()
    const [showWall, setShowWall] = useState(false)

    useEffect(() => {
        // Only evaluate wall state after fully loaded
        if (!loading) {
            setShowWall(!limits)
        }
    }, [limits, loading])

    const handleSuccess = async () => {
        // Give the DB a moment to commit before re-checking
        await new Promise(resolve => setTimeout(resolve, 800))
        await refresh()
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">অনমত যচই কর হচছ...</p>
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
                        <h2 className="text-3xl font-bold tracking-tight">আপনর কন সকরয পলযন নই</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            এই সরভসট বযবহর করত আপনর একট সবসকরপশন পলযন পরযজন নচর পলযনগল থক আপনর পছনদরট বছ নন
                        </p>
                    </div>

                    <div className="pt-8">
                        <SubscriptionPlans
                            userBalance={balance}
                            currentPlan={planType || undefined}
                            onSuccess={handleSuccess}
                        />
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
            </div>
        )
    }

    return <>{children}</>
}
