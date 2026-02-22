import { getUserShop } from '@/lib/get-user-shop'
import { CustomersClient } from './customers-client'
import { getCustomers } from '@/app/actions/sales'

export default async function CustomersPage() {
  const { shop } = await getUserShop()

  const customers = await getCustomers(shop.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">কাস্টমার</h1>
        <p className="text-muted-foreground">
          কাস্টমার সম্পর্ক এবং লয়্যালটি ম্যানেজ করুন
        </p>
      </div>

      <CustomersClient customers={customers} shopId={shop.id} />
    </div>
  )
}
