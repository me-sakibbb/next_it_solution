import { getUserShop } from '@/lib/get-user-shop'
import { CustomersClient } from './customers-client'
import { getCustomers } from '@/app/actions/sales'

export default async function CustomersPage() {
  const { shop } = await getUserShop()
  const currentShop = shop; // Declare the currentShop variable

  const customers = await getCustomers(currentShop.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          Manage customer relationships and loyalty
        </p>
      </div>

      <CustomersClient customers={customers} shopId={shop.id} />
    </div>
  )
}
