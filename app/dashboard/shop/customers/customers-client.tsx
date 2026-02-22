'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Wallet, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerDialog } from './customer-dialog'
import type { Customer } from '@/lib/types'

interface CustomersClientProps {
  customers: Customer[]
  shopId: string
}

export function CustomersClient({ customers: initialCustomers, shopId }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const columns = [
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

  const totalDue = customers.reduce((sum, c) => sum + (Number(c.outstanding_balance) || 0), 0)
  const totalDebtors = customers.filter(c => (Number(c.outstanding_balance) || 0) > 0).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">মোট কাস্টমার</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">মোট বাকি টাকা</CardTitle>
            <Wallet className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ৳{totalDue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">বকেয়া কাস্টমার</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDebtors}</div>
            <p className="text-xs text-muted-foreground mt-1">যাদের কাছে টাকা পাওনা আছে</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end">
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
        searchPlaceholder="কাস্টমার খুঁজুন..."
        onRowClick={(customer) => {
          setSelectedCustomer(customer)
          setShowDialog(true)
        }}
        actions={(customer) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCustomer(customer)
              setShowDialog(true)
            }}
          >
            এডিট
          </Button>
        )}
      />

      <CustomerDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        customer={selectedCustomer}
        shopId={shopId}
        onSuccess={(updatedCustomer) => {
          if (selectedCustomer) {
            setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c))
          } else {
            setCustomers([updatedCustomer, ...customers])
          }
          setShowDialog(false)
        }}
      />
    </div>
  )
}
