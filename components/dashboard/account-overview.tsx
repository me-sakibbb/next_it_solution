'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Subscription } from "@/lib/types";
import { useUsageLimits } from "@/hooks/use-usage-limits";
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Crown, Calendar, CreditCard, Wallet, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { AddBalanceModal } from './add-balance-modal'

interface AccountOverviewProps {
    subscription: Subscription | null
    balance: number
}

export function AccountOverview({ subscription, balance }: AccountOverviewProps) {
    const { usage, limits, loading: usageLoading } = useUsageLimits();

    // The hook returns the raw subscription record
    // Calculate active status and days remaining from the record
    const isActive = subscription?.status === 'active'
    let daysRemaining = 0
    if (isActive) {
        const endDate = subscription.subscription_end_date || subscription.trial_end_date
        if (endDate) {
            const end = new Date(endDate)
            const now = new Date()
            daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        }
    }

    // Calculate progress (assuming 30 days for simplicity or from trial dates)
    const totalDays = 30
    const progress = Math.min(100, Math.max(0, (daysRemaining / totalDays) * 100))

    const planMap: Record<string, string> = {
        'trial': 'ট্রায়াল',
        'basic_bit': 'বেসিক বিট',
        'advance_plus': 'এডভান্স প্লাস',
        'premium_power': 'প্রিমিয়াম পাওয়ার',
        'basic': 'বেসিক',
        'premium': 'প্রিমিয়াম',
        'enterprise': 'এন্টারপ্রাইজ'
    }

    const planName = planMap[subscription?.plan_type || ''] || 'ফ্রি প্ল্যান'
    const isTrial = subscription?.plan_type === 'trial'

    // Formatter for currency
    const formatCurrency = (amount: number) => {
        return `৳${new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)}`
    }

    if (usageLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        )
    }

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
                                    বর্তমান প্ল্যান: <span className="text-primary text-xl ml-2">{planName.charAt(0).toUpperCase() + planName.slice(1)}</span>
                                    {isTrial && <Badge variant="secondary" className="ml-2">ট্রায়াল</Badge>}
                                    {isActive ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">সক্রিয়</Badge>
                                    ) : (
                                        <Badge variant="destructive">নিষ্ক্রিয়</Badge>
                                    )}
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    সমস্ত AI ফিচার এবং টুল ব্যবহারের সুবিধা।
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{daysRemaining > 0 ? `${daysRemaining} দিন বাকি` : 'মেয়াদ শেষ'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CreditCard className="w-4 h-4" />
                                    <span>পরবর্তী বিলিং: {subscription?.subscription_end_date ? new Date(subscription.subscription_end_date).toLocaleDateString() : 'প্রযোজ্য নয়'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col gap-3">
                            <Button asChild className="w-full md:w-auto shadow-lg shadow-primary/20">
                                <Link href="/dashboard/billing">
                                    প্ল্যান আপগ্রেড করুন <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {isActive && (
                        <div className="mt-6 pt-4 border-t border-primary/10">
                            <div className="flex justify-between text-xs mb-2 text-muted-foreground">
                                <span>প্ল্যান ব্যবহার</span>
                                <span>{daysRemaining} / {totalDays} দিন</span>
                            </div>
                            <Progress value={progress} className="h-2 bg-primary/20" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Usage Limits Card */}
            {isActive && usage && limits && (
                <Card className="md:col-span-4 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            সার্ভিস ব্যবহার
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-foreground">AI সিভি বিল্ডার</span>
                                <span className="text-muted-foreground">{usage.cv_usage} / {limits.cv_makes} ব্যবহার করা হয়েছে</span>
                            </div>
                            <Progress value={(usage.cv_usage / limits.cv_makes) * 100} className="h-2" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-foreground">অটো-ফিল অ্যাপ্লিকেশন</span>
                                <span className="text-muted-foreground">{usage.autofill_usage} / {limits.autofill_applications} ব্যবহার করা হয়েছে</span>
                            </div>
                            <Progress value={(usage.autofill_usage / limits.autofill_applications) * 100} className="h-2" />
                        </div>

                        <p className="text-[10px] text-muted-foreground text-center italic">
                            *আপনার সাবস্ক্রিপশন প্ল্যান অনুযায়ী এই লিমিটগুলো নির্ধারিত।
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Balance Card */}
            <Card className="md:col-span-4 border-border/50 flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-muted-foreground">বর্তমান ব্যালেন্স</span>
                    </div>

                    <div className="mt-2">
                        <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            AI ক্রেডিট এবং প্রিমিয়াম সার্ভিসের জন্য তহবিল
                        </p>
                    </div>

                    <div className="mt-6">
                        <AddBalanceModal>
                            <Button variant="outline" className="w-full hover:bg-blue-500/5 hover:text-blue-600 hover:border-blue-200 transition-colors">
                                ফান্ড যোগ করুন
                            </Button>
                        </AddBalanceModal>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
