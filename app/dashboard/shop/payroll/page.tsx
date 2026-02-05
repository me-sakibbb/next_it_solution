import { getUserShop } from '@/lib/get-user-shop'
import { getPayroll, getStaff } from '@/app/actions/staff'
import { PayrollClient } from './payroll-client'

export default async function PayrollPage() {
  const { shop } = await getUserShop()
  const [payroll, staff] = await Promise.all([
    getPayroll(shop.id),
    getStaff(shop.id)
  ])

  return <PayrollClient payroll={payroll || []} staff={staff || []} shopId={shop.id} />
}
