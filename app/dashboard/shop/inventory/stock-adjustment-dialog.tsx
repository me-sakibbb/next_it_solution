'use client'

import React from "react"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateInventory } from '@/app/actions/products'
import { Loader2, Package } from 'lucide-react'

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  shopId: string
  onSuccess: () => void
}

export function StockAdjustmentDialog({ open, onOpenChange, product, shopId, onSuccess }: StockAdjustmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add')

  if (!product) return null

  const currentStock = product.inventory?.[0]?.quantity || 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const quantity = Number(formData.get('quantity'))
      const type = formData.get('type') as string
      const notes = formData.get('notes') as string

      const adjustment = adjustmentType === 'add' ? quantity : -quantity

      await updateInventory(product.id, shopId, adjustment, type, notes)
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock: {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Current Stock</div>
                <div className="text-2xl font-bold">{currentStock} {product.unit}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={adjustmentType === 'add' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setAdjustmentType('add')}
              >
                Add Stock
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'remove' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setAdjustmentType('remove')}
              >
                Remove Stock
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Reason *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>

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
                Adjust Stock
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
