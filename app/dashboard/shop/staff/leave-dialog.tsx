'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
interface LeaveDialogProps {
  staff: any[]
  shopId: string
  onSuccess?: () => void
  onCreateLeave: (formData: FormData) => Promise<boolean>
}

export function LeaveDialog({ staff, shopId, onSuccess, onCreateLeave }: LeaveDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const fromDate = new Date(formData.get('from_date') as string)
      const toDate = new Date(formData.get('to_date') as string)

      if (toDate < fromDate) {
        toast.error('End date must be after start date')
        setLoading(false)
        return
      }

      const success = await onCreateLeave(formData)
      if (success) {
        setOpen(false)
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error('Error creating leave:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          ছুটির আবেদন করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>ছুটির আবেদন করুন</DialogTitle>
            <DialogDescription>
              একজন কর্মচারীর জন্য ছুটির আবেদন জমা দিন।
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="staff_id">স্টাফ মেম্বার *</Label>
              <Select name="staff_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="স্টাফ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.employee_id || s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="leave_type">ছুটির ধরন *</Label>
              <Select name="leave_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="ছুটির ধরন নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">অসুস্থতা জনিত ছুটি</SelectItem>
                  <SelectItem value="casual">নৈমিত্তিক ছুটি</SelectItem>
                  <SelectItem value="annual">বার্ষিক ছুটি</SelectItem>
                  <SelectItem value="maternity">মাতৃত্বকালীন ছুটি</SelectItem>
                  <SelectItem value="paternity">পিতৃত্বকালীন ছুটি</SelectItem>
                  <SelectItem value="unpaid">বেতনহীন ছুটি</SelectItem>
                  <SelectItem value="other">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="from_date">শুরুর তারিখ *</Label>
                <Input
                  id="from_date"
                  name="from_date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="to_date">শেষের তারিখ *</Label>
                <Input
                  id="to_date"
                  name="to_date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">কারণ *</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="অনুগ্রহ করে ছুটির আবেদনের কারণ প্রদান করুন..."
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              বাতিল
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
