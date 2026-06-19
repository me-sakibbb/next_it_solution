'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Check, Crown, Zap, Star, Wallet, Loader2, AlertCircle } from 'lucide-react'
import { useBkashPayment } from '@/hooks/use-bkash-payment'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useSubscriptionContext } from '@/lib/subscription-context'

interface Plan {
    id: string
    name: string
    nameEn: string
    price: number
    period: string
    icon: React.ReactNode
    features: string[]
    color: string
    gradient: string
    badge?: string
}

const PLANS: Plan[] = [
    {
        id: 'basic_bit',
        name: 'বেসিক বিট',
        nameEn: 'Basic Bit',
        price: 199,
        period: 'মাস',
        icon: <Star className="w-5 h-5" />,
        badge: undefined,
        color: 'text-blue-600',
        gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20',
        features: [
            'শপ ম্যানেজমেন্ট একসেস',
            '১০টি AI CV মেইক',
            '২০টি অটোফিল আবেদন',
            'সকল অনলাইন টুলস',
            'প্রয়োজনীয় গ্রাফিক্স ফাইল',
            'গুরুত্বপূর্ণ সনদ ফরমেট',
        ],
    },
    {
        id: 'advance_plus',
        name: 'এডভান্স প্লাস',
        nameEn: 'Advance Plus',
        price: 299,
        period: 'মাস',
        icon: <Zap className="w-5 h-5" />,
        badge: 'জনপ্রিয়',
        color: 'text-violet-600',
        gradient: 'from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20',
        features: [
            'শপ ম্যানেজমেন্ট একসেস',
            '২০টি AI CV মেইক',
            '৪০টি অটোফিল আবেদন',
            'সকল অনলাইন টুলস',
            'প্রয়োজনীয় গ্রাফিক্স ফাইল',
            'গুরুত্বপূর্ণ সনদ ফরমেট',
        ],
    },
    {
        id: 'premium_power',
        name: 'প্রিমিয়াম পাওয়ার',
        nameEn: 'Premium Power',
        price: 399,
        period: 'মাস',
        icon: <Crown className="w-5 h-5" />,
        badge: 'সেরা মান',
        color: 'text-amber-600',
        gradient: 'from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20',
        features: [
            'শপ ম্যানেজমেন্ট একসেস',
            '৪০টি AI CV মেইক',
            '৮০টি অটোফিল আবেদন',
            'সকল অনলাইন টুলস',
            'প্রয়োজনীয় গ্রাফিক্স ফাইল',
            'গুরুত্বপূর্ণ সনদ ফরমেট',
        ],
    },
]

interface SubscriptionPlansProps {
    currentPlan?: string
    userBalance?: number
    onSuccess?: () => void
}

export function SubscriptionPlans({ currentPlan, userBalance = 0, onSuccess }: SubscriptionPlansProps) {
    const { initiateBkashPayment, initiateWalletSubscribe, isLoading } = useBkashPayment()
    const { toast } = useToast()
    const router = useRouter()
    const { refresh: refreshSubscription } = useSubscriptionContext()

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        plan?: Plan
        method?: 'bkash' | 'wallet'
    }>({ open: false })
    const [processingPlan, setProcessingPlan] = useState<string | null>(null)

    const openConfirm = (plan: Plan, method: 'bkash' | 'wallet') => {
        setConfirmDialog({ open: true, plan, method })
    }

    const handleConfirm = async () => {
        const { plan, method } = confirmDialog
        if (!plan || !method) return

        setConfirmDialog({ open: false })
        setProcessingPlan(plan.id)

        try {
            if (method === 'bkash') {
                await initiateBkashPayment({
                    amount: plan.price,
                    intent: 'subscribe',
                    planType: plan.id,
                })
                // Redirect happens inside the hook, page navigates away
            } else {
                const result = await initiateWalletSubscribe(plan.id)
                if (result.success) {
                    toast({
                        title: '🎉 সাবস্ক্রিপশন সক্রিয়!',
                        description: `${plan.name} প্ল্যান সফলভাবে সক্রিয় হয়েছে।`,
                    })
                    refreshSubscription()
                    onSuccess?.()
                    router.refresh()
                } else {
                    toast({
                        title: 'পেমেন্ট ব্যর্থ',
                        description: result.error || 'অজানা ত্রুটি',
                        variant: 'destructive',
                    })
                }
            }
        } catch {
            // Error already handled by hook
        } finally {
            setProcessingPlan(null)
        }
    }

    const isCurrentPlan = (planId: string) => currentPlan === planId

    return (
        <>
            <div className="grid gap-6 md:grid-cols-3">
                {PLANS.map((plan) => {
                    const isCurrent = isCurrentPlan(plan.id)
                    const canAffordWithWallet = userBalance >= plan.price
                    const isProcessing = processingPlan === plan.id
                    const isPaidPlan = currentPlan && !['free', 'trial'].includes(currentPlan)

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg border ${plan.badge === 'জনপ্রিয়'
                                ? 'border-violet-300 dark:border-violet-700 shadow-violet-100 dark:shadow-violet-900/20'
                                : 'border-border/60'
                                } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        >
                            {/* Popular badge */}
                            {plan.badge && (
                                <div className="absolute top-0 right-0">
                                    <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl ${plan.id === 'advance_plus'
                                        ? 'bg-violet-500 text-white'
                                        : 'bg-amber-500 text-white'
                                        }`}>
                                        {plan.badge}
                                    </div>
                                </div>
                            )}

                            {isCurrent && (
                                <div className="absolute top-0 left-0">
                                    <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-br-xl bg-primary text-primary-foreground">
                                        বর্তমান প্ল্যান
                                    </div>
                                </div>
                            )}

                            <CardHeader className={`bg-gradient-to-br ${plan.gradient} rounded-t-lg pb-4`}>
                                <div className={`inline-flex items-center gap-2 ${plan.color} font-semibold mb-2`}>
                                    {plan.icon}
                                    <span>{plan.name}</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">৳{plan.price}</span>
                                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                                </div>
                                <CardDescription className="text-xs">৩০ দিনের জন্য সক্রিয়</CardDescription>
                            </CardHeader>

                            <CardContent className="p-5 space-y-5">
                                {/* Features */}
                                <ul className="space-y-2.5">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-[13px] md:text-sm leading-snug">
                                            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.color}`} />
                                            <span className="font-medium text-foreground/90">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 pt-1">
                                    {/* bKash Direct */}
                                    <Button
                                        className="w-full gap-2 bg-[#d12053] hover:bg-[#b01845] text-white border-none shadow-sm"
                                        disabled={isProcessing}
                                        onClick={() => openConfirm(plan, 'bkash')}
                                    >
                                        {isProcessing && processingPlan === plan.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : null}
                                        {isCurrent ? 'রিনিউ / মেয়াদ বাড়ান' : (isPaidPlan ? 'প্ল্যান পরিবর্তন করুন' : 'bKash দিয়ে কিনুন')}
                                    </Button>

                                    {/* Wallet */}
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        disabled={isProcessing || !canAffordWithWallet}
                                        onClick={() => openConfirm(plan, 'wallet')}
                                        title={!canAffordWithWallet ? `পর্যাপ্ত ব্যালেন্স নেই (৳${plan.price} প্রয়োজন)` : undefined}
                                    >
                                        <Wallet className="w-4 h-4" />
                                        {isCurrent ? 'ব্যালেন্স দিয়ে রিনিউ' : 'ব্যালেন্স দিয়ে কিনুন'}
                                        {!canAffordWithWallet && (
                                            <AlertCircle className="w-3 h-3 text-muted-foreground" />
                                        )}
                                    </Button>

                                    {!canAffordWithWallet && (
                                        <p className="text-[10px] text-muted-foreground text-center">
                                            {userBalance < plan.price ? `আরও ৳${(plan.price - userBalance).toFixed(0)} প্রয়োজন` : ''}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open })}>
                <DialogContent className="sm:max-w-[400px] subscription-modal-content">
                    <DialogHeader>
                        <DialogTitle>নিশ্চিত করুন</DialogTitle>
                        <DialogDescription>
                            {confirmDialog.plan && confirmDialog.method && (
                                <>
                                    <span className="font-semibold text-foreground">{confirmDialog.plan.name}</span> প্ল্যান কিনতে{' '}
                                    {confirmDialog.method === 'bkash' ? (
                                        <span>bKash-এর মাধ্যমে <span className="font-semibold text-foreground">৳{confirmDialog.plan.price}</span> পেমেন্ট করুন।</span>
                                    ) : (
                                        <span>আপনার ওয়ালেট থেকে <span className="font-semibold text-foreground">৳{confirmDialog.plan.price}</span> কাটা হবে।</span>
                                    )}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {confirmDialog.method === 'wallet' && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>বর্তমান ব্যালেন্স:</span>
                                <span className="font-medium text-foreground">৳{userBalance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span>কাটা হবে:</span>
                                <span className="font-medium text-destructive">- ৳{confirmDialog.plan?.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mt-1 pt-1 border-t border-border/50">
                                <span>বাকি থাকবে:</span>
                                <span className="font-medium text-foreground">৳{(userBalance - (confirmDialog.plan?.price || 0)).toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {confirmDialog.method === 'bkash' && (
                        <div className="bg-[#d12053]/5 border border-[#d12053]/20 rounded-lg p-3 text-sm text-muted-foreground">
                            আপনাকে bKash-এর পেমেন্ট পেজে নিয়ে যাওয়া হবে। পেমেন্ট সম্পন্ন হলে স্বয়ংক্রিয়ভাবে সাবস্ক্রিপশন সক্রিয় হবে।
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setConfirmDialog({ open: false })}>
                            বাতিল
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className={confirmDialog.method === 'bkash' ? 'bg-[#d12053] hover:bg-[#b01845] text-white' : ''}
                        >
                            নিশ্চিত করুন
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
