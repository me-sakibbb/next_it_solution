'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useSales } from '@/hooks/use-sales'
import { SaleDetailsDialog } from './sale-details-dialog'
import { formatCurrency } from '@/lib/utils'

interface SalesClientProps {
  initialSales: any[]
  shopId: string
}

export function SalesClient({ shopId }: SalesClientProps) {
  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const {
    sales,
    isLoading,
    total,
    page,
    limit,
    setPage,
    setLimit,
    setSearch
  } = useSales(shopId)

  const columns = [
    {
      key: 'sale_number',
      label: 'বিক্রয় #',
      render: (sale: any) => (
        <div className="font-medium">{sale.sale_number}</div>
      ),
    },
    {
      key: 'sale_date',
      label: 'তারিখ',
      render: (sale: any) => format(new Date(sale.created_at || sale.sale_date), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'customer',
      label: 'কাস্টমার',
      render: (sale: any) => sale.customer?.name || 'ওয়াক-ইন',
    },
    {
      key: 'items',
      label: 'আইটেম',
      render: (sale: any) => sale.sale_items?.length || 0,
    },
    {
      key: 'total_amount',
      label: 'পরিমাণ',
      render: (sale: any) => formatCurrency(Number(sale.total_amount)),
    },
    {
      key: 'payment_status',
      label: 'পেমেন্ট',
      render: (sale: any) => {
        const statusMap = {
          paid: { label: 'পরিশোধিত', variant: 'default' as const },
          partial: { label: 'আংশিক', variant: 'secondary' as const },
          pending: { label: 'অপেক্ষমান', variant: 'secondary' as const },
        }
        const status = statusMap[sale.payment_status as keyof typeof statusMap] || statusMap.pending
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">সাম্প্রতিক বিক্রয়</h2>
        <Link href="/dashboard/shop/sales/pos">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            নতুন বিক্রয়
          </Button>
        </Link>
      </div>

      <DataTable
        data={sales}
        columns={columns}
        searchPlaceholder="বিক্রয় নম্বর দিয়ে খুঁজুন..."
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onLimitChange={setLimit}
        loading={isLoading}
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
