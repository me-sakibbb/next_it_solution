'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit } from 'lucide-react'
import { StaffDialog } from './staff-dialog'
import { getStaff } from '@/app/actions/staff'

interface StaffListProps {
  staff: any[]
  shopId: string
}

export function StaffList({ staff: initialStaff, shopId }: StaffListProps) {
  const [staff, setStaff] = useState(initialStaff)
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const handleSuccess = async (newStaff: any) => {
    setShowDialog(false)
    setSelectedStaff(null)
    // Refresh staff list
    const updated = await getStaff(shopId)
    setStaff(updated)
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
      label: 'Name',
      render: (s: any) => s.name || '-',
    },
    {
      key: 'employee_id',
      label: 'Employee ID',
      render: (s: any) => s.employee_id || '-',
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (s: any) => (
        <div className="text-sm">
          <div>{s.phone || '-'}</div>
          {s.email && <div className="text-muted-foreground">{s.email}</div>}
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (s: any) => s.department || '-',
    },
    {
      key: 'designation',
      label: 'Designation',
      render: (s: any) => s.designation || '-',
    },
    {
      key: 'employment_type',
      label: 'Type',
      render: (s: any) => (
        <Badge variant="secondary" className="capitalize">
          {s.employment_type?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'base_salary',
      label: 'Salary',
      render: (s: any) => formatCurrency(Number(s.base_salary)),
    },
    {
      key: 'actions',
      label: 'Actions',
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
        <div className="text-sm text-muted-foreground">
          Total Staff: {staff.length}
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>
      
      <DataTable
        data={staff}
        columns={columns}
        searchPlaceholder="Search staff..."
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
