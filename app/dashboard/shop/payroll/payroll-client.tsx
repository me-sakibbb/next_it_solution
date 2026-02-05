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
      toast.success('Payroll record created successfully')
      setOpen(false)
      e.currentTarget.reset()
      setSelectedStaff('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payroll')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (payrollId: string) => {
    try {
      await markPayrollPaid(payrollId)
      toast.success('Payroll marked as paid')
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark payroll as paid')
    }
  }
  const columns = [
    {
      key: 'period',
      label: 'Period',
      render: (p: any) => `${new Date(p.year, p.month - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' })}`,
    },
    {
      key: 'staff',
      label: 'Staff',
      render: (p: any) => p.staff?.name || p.staff?.employee_id || '-',
    },
    {
      key: 'base_salary',
      label: 'Base',
      render: (p: any) => formatCurrency(Number(p.base_salary || p.basic_salary)),
    },
    {
      key: 'allowances',
      label: 'Allowances',
      render: (p: any) => formatCurrency(Number(p.allowances || 0)),
    },
    {
      key: 'bonus',
      label: 'Bonus',
      render: (p: any) => formatCurrency(Number(p.bonus || 0)),
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (p: any) => formatCurrency(Number(p.deductions || 0)),
    },
    {
      key: 'net_salary',
      label: 'Net Salary',
      render: (p: any) => formatCurrency(Number(p.net_salary)),
    },
    {
      key: 'status',
      label: 'Status',
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
      label: 'Actions',
      render: (p: any) => {
        const status = p.status || p.payment_status
        return status !== 'paid' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkPaid(p.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Paid
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
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Process salaries, advances, and deductions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Payroll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Payroll Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePayroll} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff_id">Staff Member *</Label>
                  <Select name="staff_id" value={selectedStaff} onValueChange={setSelectedStaff} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
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
                  <Label htmlFor="month">Month *</Label>
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
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    defaultValue={currentYear}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_salary">Base Salary *</Label>
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
                  <Label htmlFor="allowances">Allowances</Label>
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
                  <Label htmlFor="deductions">Deductions</Label>
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
                  <Label htmlFor="overtime_hours">Overtime Hours</Label>
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
                  <Label htmlFor="overtime_pay">Overtime Pay</Label>
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
                  <Label htmlFor="bonus">Bonus</Label>
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
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    name="payment_date"
                    type="date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select name="payment_method">
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Payroll'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">Total Payroll</div>
          <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">Total Records</div>
          <div className="text-2xl font-bold">{payroll?.length || 0}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold">
            {pendingCount}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-2xl font-bold">
            {paidCount}
          </div>
        </div>
      </div>

      <DataTable
        data={payroll || []}
        columns={columns}
        searchPlaceholder="Search payroll..."
      />
    </div>
  )
}
