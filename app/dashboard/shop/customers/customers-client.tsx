'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Users, Wallet, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerDialog } from './customer-dialog'
import { useCustomers } from '@/hooks/use-customers'
import type { Customer } from '@/lib/types'

interface CustomersClientProps {
  shopId: string
}

export function CustomersClient({ shopId }: CustomersClientProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [onlyDebtors, setOnlyDebtors] = useState(false)

  const {
    customers,
    total,
    loading,
    page,
    limit,
    setPage,
    setLimit,
    setSearch,
    setFilters,
    refresh,
    handleDeleteCustomer,
    stats,
  } = useCustomers(shopId, onlyDebtors)

  useEffect(() => {
    setFilters({ only_debtors: onlyDebtors })
  }, [onlyDebtors, setFilters])

  const columns = [
    // ... existing columns ...
    {
      key: 'name',
      label: 'নাম',
      render: (customer: Customer) => (
        <div>
          <div className="font-medium">{customer.name}</div>
          <div className="text-sm text-muted-foreground">{customer.email || 'ইমেইল নেই'}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'ফোন',
      render: (customer: Customer) => customer.phone || '-',
    },
    {
      key: 'customer_type',
      label: 'ধরণ',
      render: (customer: Customer) => (
        <Badge variant="secondary" className="capitalize">
          {customer.customer_type}
        </Badge>
      ),
    },
    {
      key: 'address',
      label: 'লোকেশন',
      render: (customer: Customer) => {
        const parts = [customer.city, customer.state].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : '-'
      },
    },
    {
      key: 'outstanding_balance',
      label: 'বাকি টাকা',
      render: (customer: Customer) => {
        const balance = Number(customer.outstanding_balance) || 0
        return (
          <span className={balance > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
            ৳{balance.toFixed(2)}
          </span>
        )
      }
    },
  ]

  return (
    <div className="space-y-6">
      {/* ... stats cards ... */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">মোট কাস্টমার</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">মোট বাকি টাকা</CardTitle>
            <Wallet className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ৳{stats.totalDue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">বকেয়া কাস্টমার</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDebtors}</div>
            <p className="text-xs text-muted-foreground mt-1">যাদের কাছে টাকা পাওনা আছে</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="কাস্টমার খুঁজুন..."
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="debtors-only"
              checked={onlyDebtors}
              onChange={(e) => setOnlyDebtors(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="debtors-only" className="text-sm font-medium leading-none">
              শুধুমাত্র বকেয়া
            </label>
          </div>
        </div>
        <Button onClick={() => {
          setSelectedCustomer(null)
          setShowDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          কাস্টমার যোগ করুন
        </Button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        hideSearch={true}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        loading={loading}
        onRowClick={(customer) => {
          setSelectedCustomer(customer)
          setShowDialog(true)
        }}
        actions={(customer) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedCustomer(customer)
                setShowDialog(true)
              }}
            >
              এডিট
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('আপনি কি এই কাস্টমারটি ডিলিট করতে চান?')) {
                  handleDeleteCustomer(customer.id)
                }
              }}
            >
              ডিলিট
            </Button>
          </div>
        )}
      />

      <CustomerDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        customer={selectedCustomer}
        shopId={shopId}
        onSuccess={() => {
          setShowDialog(false)
        }}
      />
    </div>
  )
}
