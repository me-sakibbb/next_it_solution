'use client'

import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { AttendanceDialog } from './attendance-dialog'

interface AttendanceListProps {
  attendance: any[]
  staff: any[]
  shopId: string
  onSuccess?: () => void
  onCreateAttendance: (formData: FormData) => Promise<boolean>
}

export function AttendanceList({ attendance, staff, shopId, onSuccess, onCreateAttendance }: AttendanceListProps) {
  const columns = [
    {
      key: 'date',
      label: 'তারিখ',
      render: (a: any) => format(new Date(a.date), 'MMM dd, yyyy'),
    },
    {
      key: 'staff',
      label: 'স্টাফ',
      render: (a: any) => a.staff?.employee_id || '-',
    },
    {
      key: 'check_in',
      label: 'চেক ইন',
      render: (a: any) => a.check_in ? format(new Date(a.check_in), 'HH:mm') : '-',
    },
    {
      key: 'check_out',
      label: 'চেক আউট',
      render: (a: any) => a.check_out ? format(new Date(a.check_out), 'HH:mm') : '-',
    },
    {
      key: 'status',
      label: 'অবস্থা',
      render: (a: any) => {
        const statusMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
          present: 'default',
          absent: 'destructive',
          half_day: 'secondary',
          leave: 'secondary',
          holiday: 'secondary',
        }
        return (
          <Badge variant={statusMap[a.status] || 'secondary'} className="capitalize">
            {a.status.replace('_', ' ')}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">উপস্থিতির রেকর্ড</h3>
          <p className="text-sm text-muted-foreground">
            সকল স্টাফ সদস্যদের দৈনিক উপস্থিতি ট্র্যাক করুন
          </p>
        </div>
        <AttendanceDialog
          staff={staff}
          shopId={shopId}
          onSuccess={onSuccess}
          onCreateAttendance={onCreateAttendance}
        />
      </div>
      <DataTable
        data={attendance}
        columns={columns}
        searchPlaceholder="উপস্থিতি খুঁজুন..."
      />
    </div>
  )
}
