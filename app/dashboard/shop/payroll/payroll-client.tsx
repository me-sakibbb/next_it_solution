'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { createPayroll, markPayrollPaid } from '@/app/actions/staff'
import { toast } from 'sonner'
import { PlusCircle, CheckCircle } from 'lucide-react'

interface PayrollClientProps {
  payroll: any[]
  staff: any[]
  shopId: string
}

export function PayrollClient({ payroll, staff, shopId }: PayrollClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string>('')

  const handleCreatePayroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await createPayroll(shopId, formData)
      toast.success('পে-রোল রেকর্ড সফলভাবে তৈরি হয়েছে')
      setOpen(false)
      e.currentTarget.reset()
      setSelectedStaff('')
    } catch (error: any) {
      toast.error(error.message || 'পে-রোল তৈরি করতে ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (payrollId: string) => {
    try {
      await markPayrollPaid(payrollId)
      toast.success('পে-রোল পরিশোধিত হিসেবে মার্ক করা হয়েছে')
    } catch (error: any) {
      toast.error(error.message || 'পে-রোল পরিশোধিত হিসেবে মার্ক করতে ব্যর্থ হয়েছে')
    }
  }
  const columns = [
    {
      key: 'period',
      label: 'সময়কাল',
      render: (p: any) => `${new Date(p.year, p.month - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' })}`,
    },
    {
      key: 'staff',
      label: 'স্টাফ',
      render: (p: any) => p.staff?.name || p.staff?.employee_id || '-',
    },
    {
      key: 'base_salary',
      label: 'মূল',
      render: (p: any) => formatCurrency(Number(p.base_salary || p.basic_salary)),
    },
    {
      key: 'allowances',
      label: 'ভাতা',
      render: (p: any) => formatCurrency(Number(p.allowances || 0)),
    },
    {
      key: 'bonus',
      label: 'বোনাস',
      render: (p: any) => formatCurrency(Number(p.bonus || 0)),
    },
    {
      key: 'deductions',
      label: 'কর্তন',
      render: (p: any) => formatCurrency(Number(p.deductions || 0)),
    },
    {
      key: 'net_salary',
      label: 'নিট বেতন',
      render: (p: any) => formatCurrency(Number(p.net_salary)),
    },
    {
      key: 'status',
      label: 'অবস্থা',
      render: (p: any) => {
        const status = p.status || p.payment_status
        const statusMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
          paid: 'default',
          pending: 'secondary',
          processing: 'secondary',
          on_hold: 'destructive',
        }
        return (
          <Badge variant={statusMap[status] || 'secondary'} className="capitalize">
            {status?.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      label: 'অ্যাকশন',
      render: (p: any) => {
        const status = p.status || p.payment_status
        return status !== 'paid' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkPaid(p.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            পরিশোধ হিসেবে মার্ক করুন
          </Button>
        ) : null
      },
    },
  ]

  const totalPayroll = payroll?.reduce((sum, p) => sum + Number(p.net_salary), 0) || 0
  const pendingCount = payroll?.filter(p => (p.status || p.payment_status) === 'pending').length || 0
  const paidCount = payroll?.filter(p => (p.status || p.payment_status) === 'paid').length || 0

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">পে-রোল ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">বেতন, অগ্রিম এবং কর্তন প্রসেস করুন</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              পে-রোল তৈরি করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>পে-রোল রেকর্ড তৈরি করুন</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePayroll} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff_id">স্টাফ মেম্বার *</Label>
                  <Select name="staff_id" value={selectedStaff} onValueChange={setSelectedStaff} required>
                    <SelectTrigger>
                      <SelectValue placeholder="স্টাফ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">মাস *</Label>
                  <Select name="month" defaultValue={String(currentMonth)} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {new Date(2000, m - 1).toLocaleDateString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">বছর *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    defaultValue={currentYear}
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
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowances">ভাতা</Label>
                  <Input
                    id="allowances"
                    name="allowances"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductions">কর্তন</Label>
                  <Input
                    id="deductions"
                    name="deductions"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtime_hours">ওভারটাইম ঘণ্টা</Label>
                  <Input
                    id="overtime_hours"
                    name="overtime_hours"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtime_pay">ওভারটাইম পেমেন্ট</Label>
                  <Input
                    id="overtime_pay"
                    name="overtime_pay"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonus">বোনাস</Label>
                  <Input
                    id="bonus"
                    name="bonus"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_date">পেমেন্টের তারিখ</Label>
                  <Input
                    id="payment_date"
                    name="payment_date"
                    type="date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">পেমেন্ট মেথড</Label>
                  <Select name="payment_method">
                    <SelectTrigger>
                      <SelectValue placeholder="মেথড নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">ব্যাংক ট্রান্সফার</SelectItem>
                      <SelectItem value="cash">নগদ</SelectItem>
                      <SelectItem value="check">চেক</SelectItem>
                      <SelectItem value="mobile_money">মোবাইল মানি</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">নোট</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="অতিরিক্ত নোট..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'তৈরি হচ্ছে...' : 'পে-রোল তৈরি করুন'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">মোট পে-রোল</div>
          <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">মোট রেকর্ড</div>
          <div className="text-2xl font-bold">{payroll?.length || 0}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">অপেক্ষমান</div>
          <div className="text-2xl font-bold">
            {pendingCount}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">পরিশোধিত</div>
          <div className="text-2xl font-bold">
            {paidCount}
          </div>
        </div>
      </div>

      <DataTable
        data={payroll || []}
        columns={columns}
        searchPlaceholder="পে-রোল খুঁজুন..."
      />
    </div>
  )
}
