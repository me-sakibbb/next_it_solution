'use client'

import { useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, ShoppingCart, Package } from 'lucide-react'
import { SalesChart, TopProductsChart, CategoryDistributionChart, RevenueChart } from '@/components/dashboard/charts'
import { formatCurrency } from '@/lib/utils'

interface ReportsClientProps {
  sales: any[]
  products: any[]
}

export function ReportsClient({ sales, products }: ReportsClientProps) {
  const salesData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    return last30Days.map(date => {
      const daySales = sales.filter(s => s.sale_date?.startsWith(date))
      const revenue = daySales.reduce((sum, s) => sum + Number(s.total_amount), 0)
      const profit = daySales.reduce((sum, sale) => {
        const saleProfit = sale.sale_items?.reduce((itemSum: number, item: any) => {
          const product = products.find(p => p.id === item.product_id)
          const costPrice = product?.cost_price || 0
          return itemSum + ((item.unit_price - costPrice) * item.quantity)
        }, 0) || 0
        return sum + saleProfit
      }, 0)

      return {
        date: new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
        revenue,
        profit,
      }
    })
  }, [sales, products])

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; sales: number }> = {}

    sales.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const product = products.find(p => p.id === item.product_id)
        if (product) {
          if (!productSales[product.id]) {
            productSales[product.id] = { name: product.name, sales: 0 }
          }
          productSales[product.id].sales += item.quantity
        }
      })
    })

    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)
  }, [sales, products])

  const categoryDistribution = useMemo(() => {
    const categorySales: Record<string, number> = {}

    sales.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const product = products.find(p => p.id === item.product_id)
        const category = product?.category?.name || 'Uncategorized'
        categorySales[category] = (categorySales[category] || 0) + (item.quantity * item.unit_price)
      })
    })

    return Object.entries(categorySales).map(([name, value]) => ({ name, value }))
  }, [sales, products])

  const monthlyRevenue = useMemo(() => {
    const months = [...Array(12)].map((_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        month: date.toLocaleDateString('default', { month: 'short' }),
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      }
    })

    return months.map(({ month, key }) => {
      const monthSales = sales.filter(s => s.sale_date?.startsWith(key))
      const revenue = monthSales.reduce((sum, s) => sum + Number(s.total_amount), 0)
      return { month, revenue }
    })
  }, [sales])

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const totalProfit = sales.reduce((sum, sale) => {
    const profit = sale.sale_items?.reduce((itemSum: number, item: any) => {
      const product = products.find(p => p.id === item.product_id)
      const costPrice = product?.cost_price || 0
      return itemSum + ((item.unit_price - costPrice) * item.quantity)
    }, 0) || 0
    return sum + profit
  }, 0)

  const lowStockProducts = products.filter(p => 
    (p.inventory?.[0]?.quantity || 0) <= p.min_stock_level
  )

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
        <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">
                {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">Completed transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SalesChart data={salesData} />
          <RevenueChart data={monthlyRevenue} />
        </div>
      </TabsContent>

      <TabsContent value="sales" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TopProductsChart data={topProducts} />
          <CategoryDistributionChart data={categoryDistribution} />
        </div>
        <SalesChart data={salesData} />
      </TabsContent>

      <TabsContent value="inventory" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground">Needs restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Stock Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${products.reduce((sum, p) => {
                  const qty = p.inventory?.[0]?.quantity || 0
                  return sum + (qty * Number(p.cost_price))
                }, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">At cost price</p>
            </CardContent>
          </Card>
        </div>

        <CategoryDistributionChart data={categoryDistribution} />
      </TabsContent>
    </Tabs>
  )
}
