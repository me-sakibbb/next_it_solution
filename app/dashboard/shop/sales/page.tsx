import { getUserShop } from '@/lib/get-user-shop'
import { SalesClient } from './sales-client'
import { getSales } from '@/app/actions/sales'

export default async function SalesPage() {
  const { shop } = await getUserShop()

  const sales = await getSales(shop.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales & POS</h1>
        <p className="text-muted-foreground">
          Point of sale, invoices, and sales tracking
        </p>
      </div>

      <SalesClient sales={sales} shopId={shop.id} />
    </div>
  )
}
