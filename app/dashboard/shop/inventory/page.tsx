import { getUserShop } from '@/lib/get-user-shop'
import { InventoryClient } from './inventory-client'
import { getProducts, getCategories } from '@/app/actions/products'

export default async function InventoryPage() {
  const { shop } = await getUserShop()

  const products = await getProducts(shop.id)
  const categories = await getCategories(shop.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ইনভেন্টরি ম্যানেজমেন্ট</h1>
        <p className="text-muted-foreground">
          আপনার পণ্য, স্টকের পরিমাণ এবং ক্যাটাগরি ম্যানেজ করুন
        </p>
      </div>

      <InventoryClient
        initialProducts={products}
        categories={categories}
        shopId={shop.id}
      />
    </div>
  )
}
