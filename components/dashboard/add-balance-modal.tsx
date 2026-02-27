'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, PlusCircle, Loader2, ShieldCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useBkashPayment } from "@/hooks/use-bkash-payment"

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

export function AddBalanceModal({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const { toast } = useToast()
    const { initiateBkashPayment, isLoading } = useBkashPayment()

    const handleAmountSelect = (val: number) => {
        setAmount(val.toString())
    }

    const handlePay = async () => {
        const amountNum = parseFloat(amount)

        if (isNaN(amountNum) || amountNum < 10) {
            toast({
                title: 'অবৈধ পরিমাণ',
                description: 'সর্বনিম্ন পেমেন্ট ৳১০',
                variant: 'destructive',
            })
            return
        }

        try {
            await initiateBkashPayment({ amount: amountNum, intent: 'add_balance' })
            // Page redirects to bKash — setOpen(false) not needed
        } catch (err) {
            toast({
                title: 'পেমেন্ট ব্যর্থ',
                description: err instanceof Error ? err.message : 'পুনরায় চেষ্টা করুন',
                variant: 'destructive',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-xl">ব্যালেন্স যোগ করুন</DialogTitle>
                    </div>
                    <DialogDescription>
                        bKash-এর মাধ্যমে সরাসরি আপনার ওয়ালেটে টাকা যোগ করুন।
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Quick amount selector */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">দ্রুত পরিমাণ</Label>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_AMOUNTS.map((val) => (
                                <Button
                                    key={val}
                                    type="button"
                                    variant={amount === val.toString() ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => handleAmountSelect(val)}
                                >
                                    ৳{val}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Custom amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-medium">কাস্টম পরিমাণ</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">৳</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="পরিমাণ লিখুন"
                                className="pl-8"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={10}
                                step={1}
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">সর্বনিম্ন: ৳১০</p>
                    </div>

                    {/* bKash Pay Button */}
                    <Button
                        className="w-full h-11 bg-[#d12053] hover:bg-[#b01845] text-white border-none shadow-md shadow-[#d12053]/20 text-sm font-semibold gap-2"
                        onClick={handlePay}
                        disabled={isLoading || !amount || parseFloat(amount) < 10}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <span className="font-black text-base">bKash</span>
                        )}
                        {isLoading ? 'প্রসেস হচ্ছে...' : `৳${amount || '0'} bKash দিয়ে পেমেন্ট`}
                    </Button>

                    {/* Security note */}
                    <div className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg">
                        <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            আপনার পেমেন্ট বাংলাদেশ ব্যাংক অনুমোদিত bKash-এর নিরাপদ গেটওয়ের মাধ্যমে সম্পন্ন হবে। পেমেন্ট সম্পন্ন হলে স্বয়ংক্রিয়ভাবে ব্যালেন্স যোগ হবে।
                        </p>
                    </div>
                </div>

                <div className="flex justify-center text-[10px] text-muted-foreground uppercase tracking-widest font-medium pt-2">
                    Next IT Solution • Secured by bKash
                </div>
            </DialogContent>
        </Dialog>
    )
}
