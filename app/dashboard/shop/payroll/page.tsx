import { getUserShop } from '@/lib/get-user-shop'
import { getPayrollStats, getPaginatedStaff } from '@/app/actions/staff'
import { PayrollClient } from './payroll-client'

export default async function PayrollPage() {
  const { shop } = await getUserShop()

  const staffData = await getPaginatedStaff({ shopId: shop.id, page: 1, limit: 1000 })

  return (
    <PayrollClient
      staff={staffData.data || []}
      shopId={shop.id}
    />
  )
}
