import { getUserShop } from '@/lib/get-user-shop'
import { getSales } from '@/app/actions/sales'
import { getProducts } from '@/app/actions/products'
import { getExpenses } from '@/app/actions/expenses'
import { ReportsClient } from './reports-client'

export default async function ReportsPage() {
  const { shop } = await getUserShop()

  const [sales, products, expenses] = await Promise.all([
    getSales(shop.id),
    getProducts(shop.id),
    getExpenses(shop.id),
  ])

  // Compute per-sale revenue/profit server-side for convenience
  const enrichedSales = sales.map(sale => {
    const revenue = Number(sale.total_amount || 0)
    const profit = sale.sale_items?.reduce((sum: number, item: any) => {
      const product = products.find(p => p.id === item.product_id)
      const costPrice = product?.cost_price || 0
      return sum + ((item.unit_price - costPrice) * item.quantity)
    }, 0) || 0
    return { ...sale, revenue, profit }
  })

  return (
    <ReportsClient
      sales={enrichedSales}
      products={products}
      expenses={expenses}
      currency={shop.currency || 'BDT'}
    />
  )
}
