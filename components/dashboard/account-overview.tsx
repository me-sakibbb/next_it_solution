'use client'

import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Crown, Calendar, CreditCard, Wallet, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface AccountOverviewProps {
    user: any
    profile: any
}

export function AccountOverview({ user, profile }: AccountOverviewProps) {
    const { status, loading } = useSubscriptionStatus(user?.id || '')

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        )
    }

    const isActive = status?.isActive
    const daysRemaining = status?.daysRemaining || 0
    // Calculate progress (assuming 30 days for simplicity or from trial dates)
    const totalDays = 30
    const progress = Math.min(100, Math.max(0, (daysRemaining / totalDays) * 100))

    const planName = status?.subscription?.plan_type || 'Free Plan'
    const isTrial = status?.subscription?.plan_type === 'trial'

    // Formatter for currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    // Mock balance for now (replace with actual balance field from profile if it exists)
    const balance = profile?.balance || 0.00

    return (
        <div className="grid gap-6 md:grid-cols-12 mb-8 animate-fade-in">
            {/* Subscription Status Card */}
            <Card className="md:col-span-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm relative overflow-hidden">
                <CardContent className="p-6">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Crown className="w-32 h-32 text-primary rotate-12" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    Current Plan: <span className="text-primary text-xl">{planName.charAt(0).toUpperCase() + planName.slice(1)}</span>
                                    {isTrial && <Badge variant="secondary" className="ml-2">Trial</Badge>}
                                    {isActive ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">Active</Badge>
                                    ) : (
                                        <Badge variant="destructive">Inactive</Badge>
                                    )}
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Access to all AI features and tools.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Next billing: {status?.subscription?.current_period_end ? new Date(status.subscription.current_period_end).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col gap-3">
                            <Button asChild className="w-full md:w-auto shadow-lg shadow-primary/20">
                                <Link href="/dashboard/settings">
                                    Upgrade Plan <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {isActive && (
                        <div className="mt-6 pt-4 border-t border-primary/10">
                            <div className="flex justify-between text-xs mb-2 text-muted-foreground">
                                <span>Plan Usage</span>
                                <span>{daysRemaining} / {totalDays} days</span>
                            </div>
                            <Progress value={progress} className="h-2 bg-primary/20" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Balance Card */}
            <Card className="md:col-span-4 border-border/50 flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-muted-foreground">Available Balance</span>
                    </div>

                    <div className="mt-2">
                        <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Funds for AI credits & premium services
                        </p>
                    </div>

                    <div className="mt-6">
                        <Button variant="outline" className="w-full hover:bg-blue-500/5 hover:text-blue-600 hover:border-blue-200 transition-colors">
                            Add Funds
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
