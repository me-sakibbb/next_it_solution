'use client'

import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { LeaveDialog } from './leave-dialog'

interface LeavesListProps {
  leaves: any[]
  staff: any[]
  shopId: string
  onSuccess?: () => void
  onCreateLeave: (formData: FormData) => Promise<boolean>
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => Promise<boolean>
}

export function LeavesList({
  leaves,
  staff,
  shopId,
  onSuccess,
  onCreateLeave,
  onUpdateStatus
}: LeavesListProps) {
  const handleApprove = async (leaveId: string) => {
    const success = await onUpdateStatus(leaveId, 'approved')
    if (success && onSuccess) onSuccess()
  }

  const handleReject = async (leaveId: string) => {
    const success = await onUpdateStatus(leaveId, 'rejected')
    if (success && onSuccess) onSuccess()
  }

  const columns = [
    {
      key: 'staff',
      label: 'স্টাফ',
      render: (l: any) => l.staff?.employee_id || '-',
    },
    {
      key: 'leave_type',
      label: 'ধরন',
      render: (l: any) => (
        <Badge variant="secondary" className="capitalize">
          {l.leave_type}
        </Badge>
      ),
    },
    {
      key: 'dates',
      label: 'তারিখ',
      render: (l: any) => (
        <div className="text-sm">
          {format(new Date(l.from_date), 'MMM dd')} - {format(new Date(l.to_date), 'MMM dd')}
          <div className="text-muted-foreground">{l.days} দিন</div>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'কারণ',
      render: (l: any) => l.reason || '-',
    },
    {
      key: 'status',
      label: 'অবস্থা',
      render: (l: any) => {
        const statusMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
          pending: 'secondary',
          approved: 'default',
          rejected: 'destructive',
        }
        return (
          <Badge variant={statusMap[l.status]} className="capitalize">
            {l.status}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">ছুটির আবেদন</h3>
          <p className="text-sm text-muted-foreground">
            কর্মচারী ছুটির আবেদন এবং অনুমোদন পরিচালনা করুন
          </p>
        </div>
        <LeaveDialog
          staff={staff}
          shopId={shopId}
          onSuccess={onSuccess}
          onCreateLeave={onCreateLeave}
        />
      </div>
      <DataTable
        data={leaves}
        columns={columns}
        searchPlaceholder="ছুটি খুঁজুন..."
        actions={(leave) =>
          leave.status === 'pending' ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(leave.id)}
                title="Approve"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReject(leave.id)}
                title="Reject"
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ) : null
        }
      />
    </div>
  )
}
