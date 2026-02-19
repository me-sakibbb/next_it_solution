'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createStaff, updateStaff } from '@/app/actions/staff'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface StaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: any
  shopId: string
  onSuccess: (staff: any) => void
}

export function StaffDialog({ open, onOpenChange, staff, shopId, onSuccess }: StaffDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)

      if (staff) {
        const updated = await updateStaff(staff.id, formData)
        onSuccess(updated)
      } else {
        const created = await createStaff(shopId, formData)
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
          <DialogTitle>{staff ? 'স্টাফ এডিট করুন' : 'নতুন স্টাফ যোগ করুন'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Essential Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">পুরো নাম *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={staff?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ফোন *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={staff?.phone}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">পদবী *</Label>
              <Input
                id="designation"
                name="designation"
                defaultValue={staff?.designation}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_salary">মূল বেতন *</Label>
              <Input
                id="base_salary"
                name="base_salary"
                type="number"
                step="0.01"
                min="0"
                defaultValue={staff?.base_salary || 0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_joining">যোগদানের তারিখ *</Label>
              <Input
                id="date_of_joining"
                name="date_of_joining"
                type="date"
                defaultValue={staff?.date_of_joining}
                required
              />
            </div>
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
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={staff?.email}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_id">এমপ্লয়ি আইডি</Label>
                <Input
                  id="employee_id"
                  name="employee_id"
                  defaultValue={staff?.employee_id}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">বিভাগ</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={staff?.department}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">চাকরির ধরন</Label>
                <Select name="employment_type" defaultValue={staff?.employment_type || 'full_time'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">ফুল টাইম</SelectItem>
                    <SelectItem value="part_time">পার্ট টাইম</SelectItem>
                    <SelectItem value="contract">চুক্তিভিত্তিক</SelectItem>
                    <SelectItem value="intern">ইন্টার্ন</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <h3 className="font-medium text-sm">জরুরি যোগাযোগ</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">যোগাযোগের নাম</Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  defaultValue={staff?.emergency_contact_name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">যোগাযোগের ফোন</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  type="tel"
                  defaultValue={staff?.emergency_contact_phone}
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
              {staff ? 'স্টাফ আপডেট করুন' : 'স্টাফ যোগ করুন'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
