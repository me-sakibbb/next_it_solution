'use client'

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useSupplierTransactions } from "@/hooks/use-supplier-transactions"

interface DuePaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    supplier: any
    shopId: string
    onSuccess: () => void
}

export function DuePaymentDialog({ open, onOpenChange, supplier, shopId, onSuccess }: DuePaymentDialogProps) {
    const { addTransaction } = useSupplierTransactions(shopId)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const formData = new FormData(e.currentTarget)
            const amount = Number(formData.get('amount'))
            const type = formData.get('type') as 'payment' | 'due_added' | 'adjustment'
            const notes = formData.get('notes') as string

            await addTransaction(supplier.id, amount, type, notes)
            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (!supplier) return null

    const formatCurrency = (amount: number) => {
        return `৳${new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>সাপ্লায়ার পেমেন্ট / ডিউ আপডেট</DialogTitle>
                </DialogHeader>

                <div className="rounded-lg bg-muted p-3 mb-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="font-medium text-sm">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">বর্তমান ডিউ</p>
                    </div>
                    <p className="text-lg font-bold text-destructive">
                        {formatCurrency(supplier.due)}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">ট্রানজেকশনের ধরন</Label>
                        <Select name="type" required defaultValue="payment">
                            <SelectTrigger>
                                <SelectValue placeholder="ট্রানজেকশনের ধরন নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payment">সাপ্লায়ারকে পে করা হয়েছে (ডিউ কমবে)</SelectItem>
                                <SelectItem value="due_added">নতুন ডিউ যুক্ত হয়েছে (ডিউ বাড়বে)</SelectItem>
                                <SelectItem value="adjustment">অ্যাডজাস্টমেন্ট (+/-)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">টাকার পরিমাণ *</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">নোট (ঐচ্ছিক)</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            rows={2}
                            placeholder="পেমেন্ট বা ডিউ এর বিবরণ..."
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            বাতিল
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            নিশ্চিত করুন
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
