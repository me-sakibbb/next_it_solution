import { getUserShop } from '@/lib/get-user-shop'
import { POSClient } from './pos-client'
import { getProducts } from '@/app/actions/products'
import { getCustomers } from '@/app/actions/sales'

export default async function POSPage() {
  const { shop } = await getUserShop()

  const products = await getProducts(shop.id)
  const customers = await getCustomers(shop.id)

  return (
    <POSClient 
      products={products} 
      customers={customers}
      shopId={shop.id}
    />
  )
}
