'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
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
      key: 'credit_limit',
      label: 'ক্রেডিট লিমিট',
      render: (customer: Customer) => `$${Number(customer.credit_limit).toFixed(2)}`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          মোট কাস্টমার: {customers.length}
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
