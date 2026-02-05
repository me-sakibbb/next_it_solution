'use client'

import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { AttendanceDialog } from './attendance-dialog'

interface AttendanceListProps {
  attendance: any[]
  staff: any[]
  shopId: string
}

export function AttendanceList({ attendance, staff, shopId }: AttendanceListProps) {
  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (a: any) => format(new Date(a.date), 'MMM dd, yyyy'),
    },
    {
      key: 'staff',
      label: 'Staff',
      render: (a: any) => a.staff?.employee_id || '-',
    },
    {
      key: 'check_in',
      label: 'Check In',
      render: (a: any) => a.check_in ? format(new Date(a.check_in), 'HH:mm') : '-',
    },
    {
      key: 'check_out',
      label: 'Check Out',
      render: (a: any) => a.check_out ? format(new Date(a.check_out), 'HH:mm') : '-',
    },
    {
      key: 'status',
      label: 'Status',
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
          <h3 className="text-lg font-semibold">Attendance Records</h3>
          <p className="text-sm text-muted-foreground">
            Track daily attendance for all staff members
          </p>
        </div>
        <AttendanceDialog staff={staff} shopId={shopId} />
      </div>
      <DataTable
        data={attendance}
        columns={columns}
        searchPlaceholder="Search attendance..."
      />
    </div>
  )
}
