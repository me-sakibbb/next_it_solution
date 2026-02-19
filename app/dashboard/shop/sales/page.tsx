import { getUserShop } from '@/lib/get-user-shop'
import { SalesClient } from './sales-client'
import { getSales } from '@/app/actions/sales'

export default async function SalesPage() {
  const { shop } = await getUserShop()

  const sales = await getSales(shop.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">বিক্রয় এবং পিওএস</h1>
        <p className="text-muted-foreground">
          পয়েন্ট অফ সেল, ইনভয়েস এবং বিক্রয় ট্র্যাকিং
        </p>
      </div>

      <SalesClient sales={sales} shopId={shop.id} />
    </div>
  )
}
