'use client'

import React from "react"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Category } from '@/lib/types'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
  categories: Category[]
  suppliers?: any[]
  shopId: string
  onSuccess: (product: any) => void
  onCreateProduct?: (formData: FormData) => Promise<any>
  onUpdateProduct?: (id: string, formData: FormData) => Promise<any>
}

export function ProductDialog({ open, onOpenChange, product, categories, suppliers = [], shopId, onSuccess, onCreateProduct, onUpdateProduct }: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)

      if (product) {
        const updated = onUpdateProduct
          ? await onUpdateProduct(product.id, formData)
          : null
        if (updated) onSuccess(updated)
      } else {
        const created = onCreateProduct
          ? await onCreateProduct(formData)
          : null
        if (created) onSuccess(created)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'পণ্য এডিট করুন' : 'নতুন পণ্য যোগ করুন'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Essential Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">পণ্যের নাম *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">ক্যাটাগরি</Label>
              <Select name="category_id" defaultValue={product?.category_id || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ক্যাটাগরি নেই</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_id">সাপ্লায়ার</Label>
              <Select name="supplier_id" defaultValue={product?.supplier_id || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="সাপ্লায়ার নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">সাপ্লায়ার নেই</SelectItem>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">ক্রয় মূল্য *</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.cost_price || 0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">বিক্রয় মূল্য *</Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.selling_price || 0}
                required
              />
            </div>

            {!product && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="initial_quantity">পরিমাণ *</Label>
                <Input
                  id="initial_quantity"
                  name="initial_quantity"
                  type="number"
                  min="0"
                  defaultValue={0}
                  required
                />
              </div>
            )}
          </div>

          {/* Show More Options Toggle */}
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

          {/* Additional Fields */}
          {showMoreOptions && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" defaultValue={product?.sku} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">বারকোড</Label>
                <Input id="barcode" name="barcode" defaultValue={product?.barcode} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">ব্র্যান্ড</Label>
                <Input id="brand" name="brand" defaultValue={product?.brand} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">মডেল</Label>
                <Input id="model" name="model" defaultValue={product?.model} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrp">এমআরপি</Label>
                <Input
                  id="mrp"
                  name="mrp"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.mrp}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_rate">ট্যাক্স রেট (%)</Label>
                <Input
                  id="tax_rate"
                  name="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={product?.tax_rate || 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">ইউনিট</Label>
                <Select name="unit" defaultValue={product?.unit || 'piece'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">পিস</SelectItem>
                    <SelectItem value="box">বক্স</SelectItem>
                    <SelectItem value="set">সেট</SelectItem>
                    <SelectItem value="kg">কেজি</SelectItem>
                    <SelectItem value="liter">লিটার</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock_level">সর্বনিম্ন স্টক লেভেল</Label>
                <Input
                  id="min_stock_level"
                  name="min_stock_level"
                  type="number"
                  min="0"
                  defaultValue={product?.min_stock_level || 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_period">ওয়ারেন্টি (মাস)</Label>
                <Input
                  id="warranty_period"
                  name="warranty_period"
                  type="number"
                  min="0"
                  defaultValue={product?.warranty_period}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_type">ওয়ারেন্টি ধরণ</Label>
                <Input
                  id="warranty_type"
                  name="warranty_type"
                  defaultValue={product?.warranty_type}
                  placeholder="যেমন: ম্যানুফ্যাকচারার, দোকান"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description}
                  rows={3}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

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
              {product ? 'পণ্য আপডেট করুন' : 'পণ্য তৈরি করুন'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
