import { getUserShop } from '@/lib/get-user-shop'
import { POSClient } from './pos-client'

export default async function POSPage() {
  const { shop } = await getUserShop()

  return (
    <POSClient
      shopId={shop.id}
      currency={shop.currency}
    />
  )
}
