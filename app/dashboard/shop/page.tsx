'use client'

import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { ShopDashboardClient } from './shop-dashboard-client'
import { SubscriptionWall } from '@/components/dashboard/subscription-wall'

export default function ShopDashboardPage() {
  const {
    user,
    shop,
    loading,
    totalRevenue,
    todayRevenue,
    salesRevenue,
    tasksRevenue,
    totalExpenses,
    todayExpenses,
    netProfit,
    todayProfit,
    totalDue,
    activeProducts,
    lowStockProducts,
    activeStaff,
    salesCount,
    activeTasksCount,
    productsTotal,
    staffTotal,
    recentSales,
    pendingTasks,
    recentExpenses,
    lowStockProductsList,
  } = useDashboardStats()

  if (loading) {
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

  return (
    <SubscriptionWall feature="shop">
      <ShopDashboardClient
        totalRevenue={totalRevenue}
        todayRevenue={todayRevenue}
        salesRevenue={salesRevenue}
        tasksRevenue={tasksRevenue}
        totalExpenses={totalExpenses}
        todayExpenses={todayExpenses}
        netProfit={netProfit}
        todayProfit={todayProfit}
        totalDue={totalDue}
        activeProducts={activeProducts}
        lowStockProducts={lowStockProducts}
        activeStaff={activeStaff}
        salesCount={salesCount}
        activeTasksCount={activeTasksCount}
        shopName={shop.name}
        productsTotal={productsTotal}
        staffTotal={staffTotal}
        userEmail={user.email}
        recentSales={recentSales}
        pendingTasks={pendingTasks}
        recentExpenses={recentExpenses}
        lowStockProductsList={lowStockProductsList}
        currency={shop.currency}
      />
    </SubscriptionWall>
  )
}
