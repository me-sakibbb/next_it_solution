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
import { createAttendance } from '@/app/actions/staff'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AttendanceDialogProps {
  staff: any[]
  shopId: string
}

export function AttendanceDialog({ staff, shopId }: AttendanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await createAttendance(shopId, formData)
      toast.success('Attendance record created successfully')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating attendance:', error)
      toast.error('Failed to create attendance record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          উপস্থিতি মার্ক করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>উপস্থিতি মার্ক করুন</DialogTitle>
            <DialogDescription>
              একজন কর্মচারীর উপস্থিতি রেকর্ড করুন।
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
              <Label htmlFor="date">তারিখ *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="check_in">চেক ইন</Label>
                <Input
                  id="check_in"
                  name="check_in"
                  type="time"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="check_out">চেক আউট</Label>
                <Input
                  id="check_out"
                  name="check_out"
                  type="time"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">অবস্থা *</Label>
              <Select name="status" defaultValue="present" required>
                <SelectTrigger>
                  <SelectValue placeholder="অবস্থা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">উপস্থিত</SelectItem>
                  <SelectItem value="absent">অনুপস্থিত</SelectItem>
                  <SelectItem value="half_day">হাফ ডে</SelectItem>
                  <SelectItem value="leave">ছুটিতে</SelectItem>
                  <SelectItem value="holiday">ছুটির দিন</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">নোট</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="ঐচ্ছিক নোট..."
                className="min-h-20"
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
              {loading ? 'তৈরি হচ্ছে...' : 'রেকর্ড তৈরি করুন'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
