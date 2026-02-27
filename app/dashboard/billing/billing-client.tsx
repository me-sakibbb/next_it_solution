'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SubscriptionPlans } from '@/components/dashboard/subscription-plans'
import { AddBalanceModal } from '@/components/dashboard/add-balance-modal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Crown, Wallet, PlusCircle, Receipt, CheckCircle2,
    XCircle, Clock, ArrowDownCircle, ArrowUpCircle,
    RefreshCw
} from 'lucide-react'
import { BkashPayment } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'

interface BillingPageClientProps {
    user: any
    profile: any
    subscription: any
    payments: BkashPayment[]
}

const PLAN_NAMES: Record<string, string> = {
    trial: 'ট্রায়াল',
    basic: 'বেসিক',
    basic_bit: 'বেসিক বিট',
    advance_plus: 'এডভান্স প্লাস',
    premium_power: 'প্রিমিয়াম পাওয়ার',
    premium: 'প্রিমিয়াম',
    enterprise: 'এন্টারপ্রাইজ',
}

const STATUS_CONFIG = {
    executed: { label: 'সফল', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
    failed: { label: 'ব্যর্থ', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
    cancelled: { label: 'বাতিল', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: XCircle },
    created: { label: 'প্রক্রিয়াধীন', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
}

export function BillingPageClient({ user, profile, subscription, payments }: BillingPageClientProps) {
    const router = useRouter()
    const { toast } = useToast()

    const balance = parseFloat(profile?.balance || 0)
    const isSubscriptionActive = subscription?.status === 'active' &&
        subscription?.subscription_end_date &&
        new Date(subscription.subscription_end_date) > new Date()

    const daysRemaining = subscription?.subscription_end_date
        ? Math.max(0, Math.ceil((new Date(subscription.subscription_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0

    const handleSuccess = () => {
        toast({ title: 'সফল!', description: 'আপনার অ্যাকাউন্ট আপডেট হয়েছে।' })
        router.refresh()
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Crown className="w-6 h-6 text-primary" />
                        বিলিং ও সাবস্ক্রিপশন
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">আপনার প্ল্যান ও পেমেন্ট পরিচালনা করুন</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.refresh()} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    রিফ্রেশ
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Plan */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.03]">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <Crown className="w-4 h-4 text-primary" />
                            বর্তমান প্ল্যান
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">
                                {PLAN_NAMES[subscription?.plan_type || ''] || 'কোনো প্ল্যান নেই'}
                            </span>
                            {isSubscriptionActive ? (
                                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]">সক্রিয়</Badge>
                            ) : (
                                <Badge variant="destructive" className="text-[10px]">নিষ্ক্রিয়</Badge>
                            )}
                        </div>
                        {isSubscriptionActive && (
                            <p className="text-xs text-muted-foreground mt-2">
                                {daysRemaining} দিন বাকি · {formatDate(subscription.subscription_end_date)} পর্যন্ত
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Balance */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <Wallet className="w-4 h-4 text-blue-500" />
                            ওয়ালেট ব্যালেন্স
                        </div>
                        <div className="text-2xl font-bold">৳{balance.toFixed(2)}</div>
                        <div className="mt-3">
                            <AddBalanceModal>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full gap-1.5 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/30"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    ব্যালেন্স যোগ করুন
                                </Button>
                            </AddBalanceModal>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Payments */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <Receipt className="w-4 h-4 text-violet-500" />
                            মোট পেমেন্ট
                        </div>
                        <div className="text-2xl font-bold">
                            {payments.filter(p => p.status === 'executed').length}টি
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            সর্বমোট ৳{payments
                                .filter(p => p.status === 'executed')
                                .reduce((sum, p) => sum + parseFloat(p.amount as any), 0)
                                .toFixed(2)} পরিশোধ করা হয়েছে
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Subscription Plans */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold">প্ল্যান নির্বাচন করুন</h2>
                    <p className="text-sm text-muted-foreground">
                        বিকাশ দিয়ে পেমেন্ট করুন অথবা ওয়ালেট ব্যালেন্স ব্যবহার করুন
                    </p>
                </div>
                <SubscriptionPlans
                    currentPlan={isSubscriptionActive ? subscription?.plan_type : undefined}
                    userBalance={balance}
                    onSuccess={handleSuccess}
                />
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        পেমেন্টের ইতিহাস
                    </h2>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {payments.map((payment) => {
                                    const config = STATUS_CONFIG[payment.status] || STATUS_CONFIG.created
                                    const StatusIcon = config.icon
                                    const isIncome = payment.intent === 'add_balance'

                                    return (
                                        <div key={payment.id} className="flex items-center justify-between px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'}`}>
                                                    {isIncome
                                                        ? <ArrowDownCircle className="w-4 h-4" />
                                                        : <ArrowUpCircle className="w-4 h-4" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {payment.intent === 'add_balance'
                                                            ? 'ব্যালেন্স যোগ'
                                                            : `${PLAN_NAMES[payment.plan_type || ''] || payment.plan_type} সাবস্ক্রিপশন`
                                                        }
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(payment.created_at).toLocaleString('bn-BD')}
                                                        </span>
                                                        {payment.trx_id && (
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                TrxID: {payment.trx_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-foreground'}`}>
                                                    {isIncome ? '+' : ''}৳{parseFloat(payment.amount as any).toFixed(2)}
                                                </span>
                                                <Badge className={`text-[10px] px-2 py-0.5 border-0 ${config.color}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1 inline" />
                                                    {config.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
