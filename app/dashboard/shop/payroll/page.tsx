import { getUserShop } from '@/lib/get-user-shop'
import { PayrollClient } from './payroll-client'

export default async function PayrollPage() {
  const { shop } = await getUserShop()

  return (
    <PayrollClient
      shopId={shop.id}
    />
  )
}
