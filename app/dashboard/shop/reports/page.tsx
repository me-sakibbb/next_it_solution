import { getUserShop } from '@/lib/get-user-shop'
import { ReportsClient } from './reports-client'

export default async function ReportsPage() {
  const { shop } = await getUserShop()

  return (
    <ReportsClient
      shopId={shop.id}
      currency={shop.currency || 'BDT'}
    />
  )
}
