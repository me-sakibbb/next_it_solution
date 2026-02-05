'use client'

import React from "react"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createProduct, updateProduct } from '@/app/actions/products'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Category } from '@/lib/types'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
  categories: Category[]
  shopId: string
  onSuccess: (product: any) => void
}

export function ProductDialog({ open, onOpenChange, product, categories, shopId, onSuccess }: ProductDialogProps) {
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
        const updated = await updateProduct(product.id, formData)
        onSuccess(updated)
      } else {
        const created = await createProduct(shopId, formData)
        onSuccess(created)
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
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Essential Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select name="category_id" defaultValue={product?.category_id || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price *</Label>
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
              <Label htmlFor="selling_price">Selling Price *</Label>
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
                <Label htmlFor="initial_quantity">Quantity *</Label>
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
                Hide more options
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show more options
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
                <Label htmlFor="barcode">Barcode</Label>
                <Input id="barcode" name="barcode" defaultValue={product?.barcode} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" defaultValue={product?.brand} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" name="model" defaultValue={product?.model} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrp">MRP</Label>
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
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
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
                <Label htmlFor="unit">Unit</Label>
                <Select name="unit" defaultValue={product?.unit || 'piece'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Min Stock Level</Label>
                <Input
                  id="min_stock_level"
                  name="min_stock_level"
                  type="number"
                  min="0"
                  defaultValue={product?.min_stock_level || 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_period">Warranty (months)</Label>
                <Input
                  id="warranty_period"
                  name="warranty_period"
                  type="number"
                  min="0"
                  defaultValue={product?.warranty_period}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty_type">Warranty Type</Label>
                <Input
                  id="warranty_type"
                  name="warranty_type"
                  defaultValue={product?.warranty_type}
                  placeholder="e.g., Manufacturer, Store"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
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
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
