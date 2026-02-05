import { CardContent } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { TabsTrigger } from "@/components/ui/tabs"
import { TabsList } from "@/components/ui/tabs"
import { Tabs } from "@/components/ui/tabs"
import { getUserShop } from '@/lib/get-user-shop'
import { getSales } from '@/app/actions/sales'
import { getProducts } from '@/app/actions/products'
import { ReportsClient } from './reports-client'
import { TrendingUp, ShoppingCart, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const { shop } = await getUserShop()

  const [sales, products] = await Promise.all([
    getSales(shop.id),
    getProducts(shop.id),
  ])

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0)
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)
  const lowStockProducts = products.filter(p => p.inventory?.[0]?.quantity <= p.low_stock_threshold || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive business intelligence and reporting with visual charts
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
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
                  {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.00'}% margin
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
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {lowStockProducts.length} low stock
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Sale Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Items Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sales.reduce((sum, sale) => 
                    sum + (sale.sale_items?.reduce((itemSum: number, item: any) => 
                      itemSum + item.quantity, 0) || 0), 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Paid Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sales.filter(s => s.payment_status === 'paid').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sales.length > 0 
                    ? ((sales.filter(s => s.payment_status === 'paid').length / sales.length) * 100).toFixed(0) 
                    : '0'}% payment rate
                </p>
              </CardContent>
            </Card>
          </div>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
