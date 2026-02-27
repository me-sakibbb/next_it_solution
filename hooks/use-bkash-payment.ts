'use client'

import { useState } from 'react'

interface BkashPaymentOptions {
    amount: number
    intent: 'add_balance' | 'subscribe'
    planType?: string
}

interface UseBkashPaymentReturn {
    initiateBkashPayment: (options: BkashPaymentOptions) => Promise<void>
    initiateWalletSubscribe: (planType: string) => Promise<{ success: boolean; newBalance?: number; error?: string }>
    isLoading: boolean
    error: string | null
}

export function useBkashPayment(): UseBkashPaymentReturn {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const initiateBkashPayment = async ({ amount, intent, planType }: BkashPaymentOptions) => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/bkash/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, intent, planType }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'পেমেন্ট শুরু করতে ব্যর্থ হয়েছে')
            }

            if (!data.bkashURL) {
                throw new Error('bKash পেমেন্ট URL পাওয়া যায়নি')
            }

            // Redirect to bKash payment page
            window.location.href = data.bkashURL
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'অজানা ত্রুটি হয়েছে'
            setError(msg)
            setIsLoading(false)
            throw err
        }
        // Note: setIsLoading(false) not called here because we redirect away from the page
    }

    const initiateWalletSubscribe = async (planType: string): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/bkash/wallet-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType }),
            })

            const data = await res.json()

            if (!res.ok) {
                const msg = data.error || 'পেমেন্ট প্রক্রিয়া করতে ব্যর্থ হয়েছে'
                setError(msg)
                return { success: false, error: msg }
            }

            return { success: true, newBalance: data.newBalance }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'অজানা ত্রুটি'
            setError(msg)
            return { success: false, error: msg }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        initiateBkashPayment,
        initiateWalletSubscribe,
        isLoading,
        error,
    }
}
