'use client'

import { useShop } from '@/hooks/use-shop'
import { useSales } from '@/hooks/use-sales'
import { useProducts } from '@/hooks/use-products'
import { useStaff } from '@/hooks/use-staff'
import { ShopDashboardClient } from './shop-dashboard-client'

export default function ShopDashboardPage() {
  const { user, shop, loading: shopLoading } = useShop()
  const { sales, loading: salesLoading } = useSales(shop?.id || '')
  const { products, loading: productsLoading } = useProducts(shop?.id || '')
  const { staff, loading: staffLoading } = useStaff(shop?.id || '')

  // Show loading state while fetching initial data
  if (shopLoading || salesLoading || productsLoading || staffLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading shop dashboard...</p>
        </div>
      </div>
    )
  }

  if (!shop || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load shop data</p>
        </div>
      </div>
    )
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const activeProducts = products.filter((p) => p.is_active).length
  const activeStaff = staff?.filter((s) => s.is_active).length || 0

  return (
    <ShopDashboardClient
      totalRevenue={totalRevenue}
      activeProducts={activeProducts}
      activeStaff={activeStaff}
      salesCount={sales.length}
      shopName={shop.name}
      productsTotal={products.length}
      staffTotal={staff?.length || 0}
      userEmail={user.email}
    />
  )
}
