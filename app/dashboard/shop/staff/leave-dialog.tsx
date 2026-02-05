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
import { createLeave } from '@/app/actions/staff'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface LeaveDialogProps {
  staff: any[]
  shopId: string
}

export function LeaveDialog({ staff, shopId }: LeaveDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

      await createLeave(shopId, formData)
      toast.success('Leave request created successfully')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating leave:', error)
      toast.error('Failed to create leave request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Submit a leave request for an employee.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="staff_id">Staff Member *</Label>
              <Select name="staff_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
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
              <Label htmlFor="leave_type">Leave Type *</Label>
              <Select name="leave_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                  <SelectItem value="paternity">Paternity Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="from_date">From Date *</Label>
                <Input
                  id="from_date"
                  name="from_date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="to_date">To Date *</Label>
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
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Please provide a reason for the leave request..."
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
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
