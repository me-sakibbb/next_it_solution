import { getUserShop } from '@/lib/get-user-shop'
import { SalesClient } from './sales-client'

export default async function SalesPage() {
  const { shop } = await getUserShop()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">বিক্রয়</h1>
        <p className="text-muted-foreground">
          আপনার দোকানের বিক্রয় ট্র্যাক এবং ম্যানেজ করুন
        </p>
      </div>

      <SalesClient initialSales={[]} shopId={shop.id} />
    </div>
  )
}
