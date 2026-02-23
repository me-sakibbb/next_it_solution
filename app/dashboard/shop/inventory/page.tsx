import { InventoryClient } from './inventory-client'
import { getUserShop } from '@/lib/get-user-shop'

export default async function InventoryPage() {
  const { shop } = await getUserShop()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ইনভেন্টরি</h1>
        <p className="text-muted-foreground">
          আপনার প্রোডাক্ট এবং স্টক ম্যানেজ করুন
        </p>
      </div>

      <InventoryClient
        shopId={shop.id}
      />
    </div>
  )
}
