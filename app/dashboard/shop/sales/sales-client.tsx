'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { SaleDetailsDialog } from './sale-details-dialog'
import { formatCurrency } from '@/lib/utils'

interface SalesClientProps {
  sales: any[]
  shopId: string
}

export function SalesClient({ sales, shopId }: SalesClientProps) {
  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const totalCompleted = sales.filter(s => s.status === 'completed').length

  const columns = [
    {
      key: 'sale_number',
      label: 'Sale #',
      render: (sale: any) => (
        <div className="font-medium">{sale.sale_number}</div>
      ),
    },
    {
      key: 'sale_date',
      label: 'Date',
      render: (sale: any) => format(new Date(sale.sale_date), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (sale: any) => sale.customer?.name || 'Walk-in',
    },
    {
      key: 'items',
      label: 'Items',
      render: (sale: any) => sale.sale_items?.length || 0,
    },
    {
      key: 'total_amount',
      label: 'Amount',
      render: (sale: any) => formatCurrency(Number(sale.total_amount)),
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (sale: any) => {
        const statusMap = {
          paid: { label: 'Paid', variant: 'default' as const },
          partial: { label: 'Partial', variant: 'secondary' as const },
          pending: { label: 'Pending', variant: 'secondary' as const },
        }
        const status = statusMap[sale.payment_status as keyof typeof statusMap] || statusMap.pending
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (sale: any) => {
        const statusMap = {
          completed: { label: 'Completed', variant: 'default' as const },
          draft: { label: 'Draft', variant: 'secondary' as const },
          cancelled: { label: 'Cancelled', variant: 'destructive' as const },
        }
        const status = statusMap[sale.status as keyof typeof statusMap] || statusMap.draft
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">Total Sales</div>
          <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">Completed Sales</div>
          <div className="text-2xl font-bold">{totalCompleted}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm text-muted-foreground">Average Sale</div>
          <div className="text-2xl font-bold">
            ${sales.length > 0 ? (totalSales / sales.length).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Sales</h2>
        <Link href="/dashboard/shop/sales/pos">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </Link>
      </div>

      <DataTable
        data={sales}
        columns={columns}
        searchPlaceholder="Search sales..."
        onRowClick={(sale) => {
          setSelectedSale(sale)
          setShowDetailsDialog(true)
        }}
        actions={(sale) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSale(sale)
              setShowDetailsDialog(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      <SaleDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        sale={selectedSale}
      />
    </div>
  )
}
