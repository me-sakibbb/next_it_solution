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
import { useRealtimeUpdates } from '@/hooks/use-realtime'
import { getProducts } from '@/app/actions/products'
import { formatCurrency } from '@/lib/utils'
import type { Product, Category } from '@/lib/types'

interface InventoryClientProps {
  initialProducts: any[]
  categories: Category[]
  suppliers: any[]
  shopId: string
}

export function InventoryClient({ initialProducts, categories, suppliers, shopId }: InventoryClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  // Real-time updates for products
  useRealtimeUpdates('products', async () => {
    const updated = await getProducts(shopId)
    setProducts(updated)
  }, `shop_id=eq.${shopId}`)

  // Real-time updates for inventory
  useRealtimeUpdates('inventory', async () => {
    const updated = await getProducts(shopId)
    setProducts(updated)
  }, `shop_id=eq.${shopId}`)

  const lowStockProducts = products.filter(p =>
    p.inventory?.[0]?.quantity <= p.min_stock_level
  )

  const filteredProducts = products.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

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
        const isLow = quantity <= product.min_stock_level
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
        if (quantity <= product.min_stock_level) return <Badge variant="secondary">লো স্টক</Badge>
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">স্টক আছে</Badge>
      },
    },
  ]

  return (
    <div className="space-y-6">
      {lowStockProducts.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">লো স্টক অ্যালার্ট</h3>
              <p className="text-sm text-destructive/80">
                {lowStockProducts.length} টি পণ্যের স্টক সর্বনিম্ব লেভেলের নিচে
              </p>
            </div>
          </div>
        </div>
      )}

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center border rounded-md p-1 bg-card">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="px-2"
              onClick={() => setViewMode('grid')}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M1 1H7V7H1V1ZM8 1H14V7H8V1ZM1 8H7V14H1V8ZM8 8H14V14H8V8Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="px-2"
              onClick={() => setViewMode('list')}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M1 1H14V3H1V1ZM1 5H14V7H1V5ZM1 9H14V11H1V9ZM1 13H14V15H1V13Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        মোট পণ্য: {filteredProducts.length}
      </div>

      {viewMode === 'list' ? (
        <DataTable
          data={filteredProducts}
          columns={columns}
          hideSearch={true}
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
              Edit
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 content-start">
          {filteredProducts.map((product) => {
            const stock = product.inventory?.[0]?.quantity || 0
            const isLowStock = stock <= product.min_stock_level
            const isOutOfStock = stock === 0

            // Expanded color palette
            const colorMap = [
              { name: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100', ring: 'ring-blue-100' },
              { name: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', iconBg: 'bg-emerald-100', ring: 'ring-emerald-100' },
              { name: 'violet', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', iconBg: 'bg-violet-100', ring: 'ring-violet-100' },
              { name: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', iconBg: 'bg-amber-100', ring: 'ring-amber-100' },
              { name: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', iconBg: 'bg-rose-100', ring: 'ring-rose-100' },
              { name: 'cyan', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', iconBg: 'bg-cyan-100', ring: 'ring-cyan-100' },
              { name: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', iconBg: 'bg-indigo-100', ring: 'ring-indigo-100' },
              { name: 'orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', iconBg: 'bg-orange-100', ring: 'ring-orange-100' },
            ];

            const colorIndex = (product.category?.name || product.name).charCodeAt(0) % colorMap.length;
            const theme = colorMap[colorIndex];

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
                {/* Top Visual Area */}
                <div className={`h-24 w-full ${theme.bg} flex items-center justify-center relative overflow-hidden`}>
                  {/* Decorative Elements */}
                  <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${theme.iconBg} opacity-50 blur-2xl transition-transform duration-500 group-hover:scale-150`} />
                  <div className={`absolute -left-6 -bottom-6 h-20 w-20 rounded-full ${theme.iconBg} opacity-50 blur-xl transition-transform duration-500 group-hover:scale-150`} />

                  {/* Center Initial/Icon */}
                  <div className={`relative z-10 h-12 w-12 rounded-full ${theme.bg} border-2 ${theme.border} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <span className={`text-lg font-bold ${theme.text}`}>
                      {product.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Category Badge - Top Left */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm text-[10px] font-normal px-2 h-5">
                      {product.category?.name || 'আইটেম'}
                    </Badge>
                  </div>

                  {/* Stock Badge - Top Right */}
                  <div className="absolute top-2 right-2 z-10">
                    {isOutOfStock ? (
                      <Badge variant="destructive" className="h-5 px-1.5 text-[10px] shadow-sm">স্টক আউট</Badge>
                    ) : (
                      <Badge variant="outline" className={`bg-background/80 backdrop-blur-md border-0 shadow-sm text-[10px] h-5 ${isLowStock ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {stock} {product.unit}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-3 pb-3 flex flex-col gap-2 relative">
                  <div className="min-h-[2.5rem] flex items-center">
                    <h3 className="font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors text-sm">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">দাম</span>
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(product.selling_price)}
                      </span>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProduct(product)
                        setShowProductDialog(true)
                      }}
                      className={`h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm cursor-pointer hover:scale-110`}
                      title="Edit Product"
                    >
                      <Pencil className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={selectedProduct}
        categories={categories}
        suppliers={suppliers}
        shopId={shopId}
        onSuccess={(updatedProduct) => {
          if (selectedProduct) {
            setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p))
          } else {
            setProducts([updatedProduct, ...products])
          }
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
        onSuccess={async () => {
          setShowStockDialog(false)
          const updated = await getProducts(shopId)
          setProducts(updated)
        }}
      />
    </div>
  )
}
