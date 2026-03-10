'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface OTPVerificationModalProps {
    email: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function OTPVerificationModal({
    email,
    isOpen,
    onOpenChange,
    onSuccess,
}: OTPVerificationModalProps) {
    const [otp, setOtp] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const handleVerify = async () => {
        if (otp.length !== 8) return

        setIsVerifying(true)
        try {
            const cleanEmail = email.trim().toLowerCase()
            let { error } = await supabase.auth.verifyOtp({
                email: cleanEmail,
                token: otp,
                type: 'signup',
            })

            // Fallback: Some configurations use 'email' instead of 'signup' for confirmation OTPs
            if (error && (error.status === 403 || error.message.toLowerCase().includes('forbidden'))) {
                console.log('Signup type failed, trying email type...')
                const fallback = await supabase.auth.verifyOtp({
                    email: cleanEmail,
                    token: otp,
                    type: 'email',
                })
                error = fallback.error
            }

            if (error) {
                console.error('OTP Verification Error:', error)

                let errorMessage = error.message === 'Token has expired or is invalid'
                    ? 'ভুল অথবা মেয়াদোত্তীর্ণ কোড। অনুগ্রহ করে সঠিক কোডটি দিন।'
                    : error.message

                if (error.status === 403 || error.message.toLowerCase().includes('forbidden')) {
                    errorMessage = 'সার্ভার থেকে অনুমতি পাওয়া যাচ্ছে না। অনুগ্রহ করে নিশ্চিত করুন যে Supabase ড্যাশবোর্ডে "Email OTP" সুবিধাটি চালু আছে।'
                }

                toast({
                    title: 'ভেরিফিকেশন ব্যর্থ',
                    description: errorMessage,
                    variant: 'destructive',
                })
            } else {
                toast({
                    title: 'সফলভাবে ভেরিফাই করা হয়েছে!',
                    description: 'আপনার অ্যাকাউন্ট এখন সক্রিয়। আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...',
                })

                // Close modal immediately
                onOpenChange(false)

                // Use hard reload redirect to ensure cookies are synced and middleware catches the new session
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 1000)
            }
        } catch (err) {
            toast({
                title: 'ত্রুটি',
                description: 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে',
                variant: 'destructive',
            })
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
            })

            if (error) {
                toast({
                    title: 'কোড পাঠাতে ব্যর্থ',
                    description: error.message,
                    variant: 'destructive',
                })
            } else {
                toast({
                    title: 'নতুন কোড পাঠানো হয়েছে',
                    description: 'আপনার ইমেইল ইনবক্স চেক করুন।',
                })
            }
        } catch (err) {
            toast({
                title: 'ত্রুটি',
                description: 'কোড পুনরায় পাঠাতে সমস্যা হয়েছে',
                variant: 'destructive',
            })
        } finally {
            // Start 30s cooldown
            setTimeout(() => setIsResending(false), 30000)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center">ইমেইল ভেরিফিকেশন</DialogTitle>
                    <DialogDescription className="text-center">
                        আমরা <span className="font-semibold text-foreground">{email}</span> ঠিকানায় একটি ভেরিফিকেশন ইমেইল পাঠিয়েছি। আপনি ইমেইলের <span className="font-semibold text-foreground">লিঙ্কে ক্লিক করে</span> অথবা নিচের <span className="font-semibold text-foreground">৮-সংখ্যার কোডটি</span> দিয়ে ভেরিফাই করতে পারেন।
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                    <InputOTP
                        maxLength={8}
                        value={otp}
                        onChange={setOtp}
                        disabled={isVerifying}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                        </InputOTPGroup>
                        <div className="w-2" />
                        <InputOTPGroup>
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                            <InputOTPSlot index={6} />
                            <InputOTPSlot index={7} />
                        </InputOTPGroup>
                    </InputOTP>

                    <Button
                        className="w-full h-11 text-lg font-bold"
                        disabled={otp.length !== 8 || isVerifying}
                        onClick={handleVerify}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                যাচাই করা হচ্ছে...
                            </>
                        ) : (
                            'ভেরিফাই করুন'
                        )}
                    </Button>
                </div>

                <DialogFooter className="sm:justify-center border-t pt-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                            কোড পাননি?
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                            onClick={handleResend}
                            disabled={isResending}
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                                    নতুন কোডের জন্য অপেক্ষা করুন (৩০সে)
                                </>
                            ) : (
                                'আবার কোড পাঠান'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
