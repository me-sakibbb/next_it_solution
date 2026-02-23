'use client'

import React from "react"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCustomers } from '@/hooks/use-customers'
import { Loader2 } from 'lucide-react'
import type { Customer } from '@/lib/types'

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  shopId: string
  onSuccess: (customer: Customer) => void
}

export function CustomerDialog({ open, onOpenChange, customer, shopId, onSuccess }: CustomerDialogProps) {
  const { handleCreateCustomer, handleUpdateCustomer } = useCustomers(shopId)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      let result

      if (customer) {
        result = await handleUpdateCustomer(customer.id, formData)
      } else {
        result = await handleCreateCustomer(formData)
      }

      if (result) {
        onSuccess(result)
        onOpenChange(false)
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'কাস্টমার এডিট করুন' : 'নতুন কাস্টমার যোগ করুন'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">নাম *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={customer?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ফোন</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer?.phone || ''}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer?.email || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_type">কাস্টমারের ধরণ</Label>
              <Select name="customer_type" defaultValue={customer?.customer_type || 'retail'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">খুচরা</SelectItem>
                  <SelectItem value="wholesale">পাইকারি</SelectItem>
                  <SelectItem value="vip">ভিআইপি</SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">ঠিকানা</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={customer?.address || ''}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">শহর</Label>
              <Input
                id="city"
                name="city"
                defaultValue={customer?.city || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">বিভাগ/রাজ্য</Label>
              <Input
                id="state"
                name="state"
                defaultValue={customer?.state || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">জিপ কোড</Label>
              <Input
                id="zip_code"
                name="zip_code"
                defaultValue={customer?.zip_code || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">দেশ</Label>
              <Input
                id="country"
                name="country"
                defaultValue={customer?.country || ''}
              />
            </div>
          </div>


          <div className="flex justify-end gap-3">
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
              {customer ? 'কাস্টমার আপডেট করুন' : 'কাস্টমার তৈরি করুন'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
