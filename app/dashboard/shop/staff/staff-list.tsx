'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit } from 'lucide-react'
import { StaffDialog } from './staff-dialog'
import { useStaff } from '@/hooks/use-staff'

interface StaffListProps {
  shopId: string
}

export function StaffList({ shopId }: StaffListProps) {
  const {
    staff,
    total,
    loading,
    page,
    limit,
    setPage,
    setLimit,
    setSearch,
    refresh,
    stats
  } = useStaff(shopId)

  const [selectedStaff, setSelectedStaff] = useState<any | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const handleSuccess = () => {
    setShowDialog(false)
    setSelectedStaff(null)
    refresh()
  }

  const handleEdit = (staffMember: any) => {
    setSelectedStaff(staffMember)
    setShowDialog(true)
  }

  const handleAddNew = () => {
    setSelectedStaff(null)
    setShowDialog(true)
  }

  const columns = [
    {
      key: 'name',
      label: 'নাম',
      render: (s: any) => s.name || '-',
    },
    {
      key: 'employee_id',
      label: 'এমপ্লয়ি আইডি',
      render: (s: any) => s.employee_id || '-',
    },
    {
      key: 'contact',
      label: 'যোগাযোগ',
      render: (s: any) => (
        <div className="text-sm">
          <div>{s.phone || '-'}</div>
          {s.email && <div className="text-muted-foreground">{s.email}</div>}
        </div>
      ),
    },
    {
      key: 'department',
      label: 'বিভাগ',
      render: (s: any) => s.department || '-',
    },
    {
      key: 'designation',
      label: 'পদবী',
      render: (s: any) => s.designation || '-',
    },
    {
      key: 'employment_type',
      label: 'ধরন',
      render: (s: any) => (
        <Badge variant="secondary" className="capitalize">
          {s.employment_type?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'base_salary',
      label: 'বেতন',
      render: (s: any) => formatCurrency(Number(s.base_salary)),
    },
    {
      key: 'actions',
      label: 'অ্যাকশন',
      render: (s: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(s)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground font-medium">
          মোট স্টাফ: {stats.totalStaff} জন
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          স্টাফ যোগ করুন
        </Button>
      </div>

      <DataTable
        data={staff}
        columns={columns}
        searchPlaceholder="স্টাফ খুঁজুন..."
        onSearchChange={setSearch}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        loading={loading}
      />

      <StaffDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        staff={selectedStaff}
        shopId={shopId}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
