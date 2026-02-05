'use client'

import React from "react"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory } from '@/app/actions/products'
import { Loader2, Plus } from 'lucide-react'
import type { Category } from '@/lib/types'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  shopId: string
}

export function CategoryDialog({ open, onOpenChange, categories, shopId }: CategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      await createCategory(shopId, formData)
      window.location.reload()
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
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Existing Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories yet</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="rounded-lg border p-3">
                    <div className="font-medium">{cat.name}</div>
                    {cat.description && (
                      <div className="text-sm text-muted-foreground">{cat.description}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Add New Category</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
