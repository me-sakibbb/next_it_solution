import { InventoryClient } from './inventory-client'
import { getCategories } from '@/app/actions/products'
import { getSuppliers } from '@/app/actions/suppliers'
import { getUserShop } from '@/lib/get-user-shop'

export default async function InventoryPage() {
  const { shop } = await getUserShop()

  const [categories, suppliers] = await Promise.all([
    getCategories(shop.id),
    getSuppliers(shop.id)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ইনভেন্টরি</h1>
        <p className="text-muted-foreground">
          আপনার প্রোডাক্ট এবং স্টক ম্যানেজ করুন
        </p>
      </div>

      <InventoryClient
        categories={categories}
        suppliers={suppliers}
        shopId={shop.id}
      />
    </div>
  )
}
