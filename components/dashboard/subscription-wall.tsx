'use client'

import { useState, useEffect } from 'react'
import { SubscriptionPlans } from './subscription-plans'
import { useUsageLimits } from '@/hooks/use-usage-limits'
import { Loader2, Lock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SubscriptionWallProps {
    children: React.ReactNode
    feature?: 'cv' | 'shop' | 'autofill'
}

export function SubscriptionWall({ children, feature = 'cv' }: SubscriptionWallProps) {
    const { limits, planType, balance, loading, refresh } = useUsageLimits()
    const [showWall, setShowWall] = useState(false)
    const [actionBlockedOpen, setActionBlockedOpen] = useState(false)

    useEffect(() => {
        // Only evaluate wall state after fully loaded
        if (!loading) {
            let blocked = false
            if (!limits) {
                blocked = true // No active plan
            } else if (feature === 'shop' && planType === 'trial') {
                blocked = true // Trial/Free plan doesn't have shop access
            }
            setShowWall(blocked)
        }
    }, [limits, loading, feature, planType])

    const handleReactCapture = (e: React.MouseEvent | React.FormEvent) => {
        if (!showWall || feature !== 'shop') return
        const target = e.target as HTMLElement

        if (target.closest('.subscription-modal-content') || target.closest('.subscription-bypass')) {
            return
        }

        const isBlockable = target.closest('button') || target.closest('input[type="submit"]') || target.closest('[data-slot="button"]')

        if (isBlockable) {
            e.preventDefault()
            e.stopPropagation()
            // Prevents other React handlers on this element or descendants from firing
            if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
                e.nativeEvent.stopImmediatePropagation()
            }
            setActionBlockedOpen(true)
        }
    }

    const handleReactSubmit = (e: React.FormEvent) => {
        if (!showWall || feature !== 'shop') return
        const target = e.target as HTMLElement
        if (target.closest('.subscription-modal-content') || target.closest('.subscription-bypass')) return

        e.preventDefault()
        e.stopPropagation()
        if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
            e.nativeEvent.stopImmediatePropagation()
        }
        setActionBlockedOpen(true)
    }

    const handleSuccess = async () => {
        setActionBlockedOpen(false)
        // Give the DB a moment to commit before re-checking
        await new Promise(resolve => setTimeout(resolve, 800))
        await refresh()
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">অনুমতি যাচাই করা হচ্ছে...</p>
            </div>
        )
    }

    if (showWall) {
        if (feature === 'shop') {
            // For shop, render children so they can look around, but open the popup on actions
            return (
                <div onClickCapture={handleReactCapture} onSubmitCapture={handleReactSubmit} className="contents">
                    {children}
                    <Dialog open={actionBlockedOpen} onOpenChange={setActionBlockedOpen}>
                        <DialogContent className="w-full sm:max-w-[95vw] md:max-w-6xl lg:max-w-7xl subscription-modal-content p-0 overflow-hidden border-border/50">
                            <ScrollArea className="max-h-[95vh]">
                                <div className="p-6 md:p-8 space-y-8 bg-background">
                                    <DialogHeader className="text-center space-y-4 pt-4 sm:text-center">
                                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                            <Lock className="w-8 h-8 text-primary" />
                                        </div>
                                        <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">অ্যাক্সেস সীমাবদ্ধ</DialogTitle>
                                        <DialogDescription className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                            শপ ম্যানেজমেন্টের সম্পূর্ণ সুবিধা উপভোগ করতে এবং কাজ করতে একটি প্রিমিয়াম প্ল্যান প্রয়োজন।
                                        </DialogDescription>
                                    </DialogHeader>
                                    <SubscriptionPlans
                                        userBalance={balance}
                                        currentPlan={planType || undefined}
                                        onSuccess={handleSuccess}
                                    />
                                    <div className="pb-4"></div>
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>
            )
        }

        // Standard blocker logic for CV/Autofill 
        return (
            <div className="relative min-h-[600px] w-full flex items-center justify-center rounded-xl overflow-hidden border bg-background/50 backdrop-blur-sm p-8">
                <div className="max-w-7xl w-full space-y-12 subscription-modal-content">
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
