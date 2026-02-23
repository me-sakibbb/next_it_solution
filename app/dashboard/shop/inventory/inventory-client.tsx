'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Package, AlertTriangle, Search, Pencil } from 'lucide-react'
import { ProductDialog } from './product-dialog'
import { CategoryDialog } from './category-dialog'
import { StockAdjustmentDialog } from './stock-adjustment-dialog'
import { useProducts } from '@/hooks/use-products'
import { formatCurrency } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface InventoryClientProps {
  categories: Category[]
  suppliers: any[]
  shopId: string
}

export function InventoryClient({ categories, suppliers, shopId }: InventoryClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  const {
    products,
    total,
    loading,
    page,
    limit,
    setPage,
    setLimit,
    setSearch,
    setFilters,
    refresh
  } = useProducts(shopId, selectedCategoryId === 'all' ? undefined : selectedCategoryId)

  useEffect(() => {
    setFilters({ category_id: selectedCategoryId === 'all' ? undefined : selectedCategoryId })
  }, [selectedCategoryId, setFilters])

  const columns = [
    {
      key: 'name',
      label: 'পণ্য',
      render: (product: any) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-muted-foreground">{product.sku || 'SKU নেই'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'ক্যাটাগরি',
      render: (product: any) => product.category?.name || 'ক্যাটাগরি নেই',
    },
    {
      key: 'selling_price',
      label: 'দাম',
      render: (product: any) => formatCurrency(product.selling_price),
    },
    {
      key: 'stock',
      label: 'স্টক',
      render: (product: any) => {
        const quantity = product.inventory?.[0]?.quantity || 0
        const isLow = quantity <= (product.min_stock_level || 0)
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-destructive font-medium' : ''}>
              {quantity} {product.unit}
            </span>
            {isLow && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'অবস্থা',
      render: (product: any) => {
        const quantity = product.inventory?.[0]?.quantity || 0
        if (quantity === 0) return <Badge variant="destructive">স্টক শেষ</Badge>
        if (quantity <= (product.min_stock_level || 0)) return <Badge variant="secondary">লো স্টক</Badge>
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">স্টক আছে</Badge>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => {
            setSelectedProduct(null)
            setShowProductDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            পণ্য যোগ করুন
          </Button>
          <Button variant="outline" onClick={() => setShowCategoryDialog(true)}>
            <Package className="h-4 w-4 mr-2" />
            ক্যাটাগরি
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="পণ্য খুঁজুন..."
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <div className="flex items-center border rounded-md p-1 bg-card">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="px-2"
              onClick={() => setViewMode('grid')}
            >
              <Package className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="px-2"
              onClick={() => setViewMode('list')}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M1 1H14V3H1V1ZM1 5H14V7H1V5ZM1 9H14V11H1V9ZM1 13H14V15H1V13Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable
          data={products}
          columns={columns}
          hideSearch={true}
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          loading={loading}
          onRowClick={(product) => {
            setSelectedProduct(product)
            setShowStockDialog(true)
          }}
          actions={(product) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProduct(product)
                setShowProductDialog(true)
              }}
            >
              এডিট
            </Button>
          )}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 content-start">
            {products.map((product) => {
              const stock = product.inventory?.[0]?.quantity || 0
              const isLowStock = stock <= (product.min_stock_level || 0)
              const isOutOfStock = stock === 0

              return (
                <div
                  key={product.id}
                  className={`
                      group relative flex flex-col justify-between h-fit
                      rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300
                      hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden
                      ${isOutOfStock ? 'opacity-60 grayscale' : ''}
                  `}
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowStockDialog(true)
                  }}
                >
                  <div className="h-24 w-full bg-muted flex items-center justify-center relative overflow-hidden">
                    <div className="relative z-10 h-12 w-12 rounded-full bg-background border flex items-center justify-center shadow-sm">
                      <span className="text-lg font-bold">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] h-5">
                        {product.category?.name || 'আইটেম'}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="h-5 text-[10px]">স্টক আউট</Badge>
                      ) : (
                        <Badge variant="outline" className={`bg-background/80 backdrop-blur-md text-[10px] h-5 ${isLowStock ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {stock} {product.unit}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-3 flex flex-col gap-2">
                    <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between pt-2 border-t mt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">দাম</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(product.selling_price)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProduct(product)
                          setShowProductDialog(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grid View Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Show</span>
                <select
                  className="h-8 w-16 rounded-md border border-input bg-transparent px-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
              >
                পূর্ববর্তী
              </Button>
              <span className="text-sm font-medium">পৃষ্ঠা {page} / {Math.ceil(total / limit)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / limit) || loading}
              >
                পরবর্তী
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={selectedProduct}
        categories={categories}
        suppliers={suppliers}
        shopId={shopId}
        onSuccess={() => {
          refresh()
          setShowProductDialog(false)
        }}
      />

      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        categories={categories}
        shopId={shopId}
      />

      <StockAdjustmentDialog
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        product={selectedProduct}
        shopId={shopId}
        onSuccess={() => {
          refresh()
          setShowStockDialog(false)
        }}
      />
    </div>
  )
}
