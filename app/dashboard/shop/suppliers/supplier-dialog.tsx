'use client'

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { useSuppliers } from "@/hooks/use-suppliers"

interface SupplierDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    supplier?: any
    shopId: string
    onSuccess: (supplier: any) => void
}

export function SupplierDialog({ open, onOpenChange, supplier, shopId, onSuccess }: SupplierDialogProps) {
    const { createSupplier, updateSupplier } = useSuppliers(shopId)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showMoreOptions, setShowMoreOptions] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const formData = new FormData(e.currentTarget)

            if (supplier) {
                const updated = await updateSupplier(supplier.id, formData)
                onSuccess(updated)
            } else {
                const created = await createSupplier(formData)
                onSuccess(created)
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{supplier ? 'সাপ্লায়ার এডিট করুন' : 'নতুন সাপ্লায়ার যোগ করুন'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="name">সাপ্লায়ারের নাম / কোম্পানির নাম *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={supplier?.name}
                                required
                            />
                        </div>

                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="contact_person">যোগাযোগের ব্যক্তি</Label>
                            <Input
                                id="contact_person"
                                name="contact_person"
                                defaultValue={supplier?.contact_person}
                            />
                        </div>

                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="phone">মোবাইল নম্বর</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={supplier?.phone}
                            />
                        </div>

                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="email">ইমেইল</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={supplier?.email}
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="address">ঠিকানা</Label>
                            <Textarea
                                id="address"
                                name="address"
                                defaultValue={supplier?.address}
                                rows={2}
                            />
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                    >
                        {showMoreOptions ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                আরও অপশন লুকান
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                আরও অপশন দেখুন
                            </>
                        )}
                    </Button>

                    {showMoreOptions && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">শহর</Label>
                                <Input id="city" name="city" defaultValue={supplier?.city} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">জেলা / বিভাগ</Label>
                                <Input id="state" name="state" defaultValue={supplier?.state} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="zip_code">পোস্টাল কোড</Label>
                                <Input id="zip_code" name="zip_code" defaultValue={supplier?.zip_code} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">দেশ</Label>
                                <Input id="country" name="country" defaultValue={supplier?.country || 'Bangladesh'} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tax_id">Tax/BIN ID</Label>
                                <Input id="tax_id" name="tax_id" defaultValue={supplier?.tax_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_terms">পেমেন্টের শর্তাবলী</Label>
                                <Input id="payment_terms" name="payment_terms" defaultValue={supplier?.payment_terms} placeholder="যেমন: 30 দিন" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="credit_limit">ক্রেডিট লিমিট</Label>
                                <Input id="credit_limit" name="credit_limit" type="number" step="0.01" min="0" defaultValue={supplier?.credit_limit} />
                            </div>
                        </div>
                    )}

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
                            {supplier ? 'আপডেট করুন' : 'যোগ করুন'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
