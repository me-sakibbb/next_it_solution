'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, AlertTriangle } from 'lucide-react'
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
  shopId: string
}

export function InventoryClient({ initialProducts, categories, shopId }: InventoryClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)

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

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (product: any) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-muted-foreground">{product.sku || 'No SKU'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (product: any) => product.category?.name || 'Uncategorized',
    },
    {
      key: 'selling_price',
      label: 'Price',
      render: (product: any) => formatCurrency(product.selling_price),
    },
    {
      key: 'stock',
      label: 'Stock',
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
      label: 'Status',
      render: (product: any) => {
        const quantity = product.inventory?.[0]?.quantity || 0
        if (quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>
        if (quantity <= product.min_stock_level) return <Badge variant="secondary">Low Stock</Badge>
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">In Stock</Badge>
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
              <h3 className="font-semibold text-destructive">Low Stock Alert</h3>
              <p className="text-sm text-destructive/80">
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} below minimum stock level
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => {
            setSelectedProduct(null)
            setShowProductDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button variant="outline" onClick={() => setShowCategoryDialog(true)}>
            <Package className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Products: {products.length}
        </div>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder="Search products..."
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

      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={selectedProduct}
        categories={categories}
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
        onSuccess={() => {
          setShowStockDialog(false)
          window.location.reload()
        }}
      />
    </div>
  )
}
