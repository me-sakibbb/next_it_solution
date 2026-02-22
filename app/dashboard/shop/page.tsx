'use client'

import { useShop } from '@/hooks/use-shop'
import { useSales } from '@/hooks/use-sales'
import { useProducts } from '@/hooks/use-products'
import { useStaff } from '@/hooks/use-staff'
import { ShopDashboardClient } from './shop-dashboard-client'
import { useExpenses } from '@/hooks/use-expenses'

import { useShopTasks } from '@/hooks/use-shop-tasks'

export default function ShopDashboardPage() {
  const { user, shop, loading: shopLoading } = useShop()
  const { sales, loading: salesLoading } = useSales(shop?.id || '')
  const { products, loading: productsLoading } = useProducts(shop?.id || '')
  const { staff, loading: staffLoading } = useStaff(shop?.id || '')
  const { tasks, loading: tasksLoading } = useShopTasks(shop?.id || '')
  const { expenses, loading: expensesLoading } = useExpenses(shop?.id || '')

  // Show loading state while fetching initial data
  if (shopLoading || salesLoading || productsLoading || staffLoading || tasksLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">দোকানের ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!shop || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-destructive">দোকানের তথ্য লোড করতে ব্যর্থ হয়েছে</p>
        </div>
      </div>
    )
  }

  const salesRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const tasksRevenue = tasks
    .filter((task) => task.status === 'completed')
    .reduce((sum, task) => sum + Number(task.price), 0)

  const totalRevenue = salesRevenue + tasksRevenue

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  const netProfit = totalRevenue - totalExpenses

  const activeProducts = products.filter((p) => p.is_active).length
  const lowStockProducts = products.filter((p) => p.available_quantity <= p.min_stock_level).length
  const activeStaff = staff?.filter((s) => s.is_active).length || 0
  const activeTasks = tasks.filter((t) => t.status === 'pending').length

  // Get recent 5 sales
  const recentSales = sales.slice(0, 5)

  // Get recent 5 pending tasks
  const pendingTasks = tasks
    .filter((t) => t.status === 'pending')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // oldest first
    .slice(0, 5)

  return (
    <ShopDashboardClient
      totalRevenue={totalRevenue}
      salesRevenue={salesRevenue}
      tasksRevenue={tasksRevenue}
      totalExpenses={totalExpenses}
      netProfit={netProfit}
      activeProducts={activeProducts}
      lowStockProducts={lowStockProducts}
      activeStaff={activeStaff}
      salesCount={sales.length}
      activeTasksCount={activeTasks}
      shopName={shop.name}
      productsTotal={products.length}
      staffTotal={staff?.length || 0}
      userEmail={user.email}
      recentSales={recentSales}
      pendingTasks={pendingTasks}
      currency={shop.currency}
    />
  )
}
