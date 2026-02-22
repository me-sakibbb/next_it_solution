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
import { getExpenses } from '@/app/actions/expenses'
import { ReportsClient } from './reports-client'
import { TrendingUp, ShoppingCart, Package, Receipt } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const { shop } = await getUserShop()

  const [sales, products, expenses] = await Promise.all([
    getSales(shop.id),
    getProducts(shop.id),
    getExpenses(shop.id),
  ])

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0)
  const grossProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)
  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
  const netProfit = grossProfit - totalExpensesAmount
  const lowStockProducts = products.filter(p => p.inventory?.[0]?.quantity <= p.low_stock_threshold || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">রিপোর্ট এবং অ্যানালিটিক্স</h1>
        <p className="text-muted-foreground">
          ভিজ্যুয়াল চার্ট সহ বিস্তারিত বিজনেস ইন্টেলিজেন্স এবং রিপোর্টিং
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">ওভারভিউ</TabsTrigger>
          <TabsTrigger value="sales">বিক্রয়</TabsTrigger>
          <TabsTrigger value="inventory">ইনভেন্টরি</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">সর্বমোট</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট খরচ</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpensesAmount)}</div>
                <p className="text-xs text-muted-foreground">সিস্টেম ও ম্যানুয়াল</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">নীট লাভ</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(netProfit)}</div>
                <p className="text-xs text-muted-foreground">
                  খরচ বাদে
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">মোট বিক্রয়</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sales.length}</div>
                <p className="text-xs text-muted-foreground">সম্পন্ন লেনদেন</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">পণ্য</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {lowStockProducts.length} লো স্টক
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">গড় বিক্রয় মূল্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">মোট বিক্রিত পণ্য</CardTitle>
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
                <CardTitle className="text-sm">পরিশোধিত বিক্রয়</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sales.filter(s => s.payment_status === 'paid').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sales.length > 0
                    ? ((sales.filter(s => s.payment_status === 'paid').length / sales.length) * 100).toFixed(0)
                    : '0'}% পেমেন্ট রেট
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">মোট পণ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {products.filter(p => p.is_active).length} সক্রিয়
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">লো স্টক পণ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {lowStockProducts.length}
                </div>
                <p className="text-xs text-muted-foreground">রিস্টক করা প্রয়োজন</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">মোট স্টক মূল্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${products.reduce((sum, p) => {
                    const qty = p.inventory?.[0]?.quantity || 0
                    return sum + (qty * Number(p.cost_price))
                  }, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">ক্রয় মূল্যে</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
