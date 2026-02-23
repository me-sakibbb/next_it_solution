import { getUserShop } from '@/lib/get-user-shop'
import { StaffClient } from './staff-client'

export default async function StaffPage() {
  const { shop } = await getUserShop()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">স্টাফ ম্যানেজমেন্ট</h1>
        <p className="text-muted-foreground">কর্মচারী, উপস্থিতি এবং ছুটি পরিচালনা করুন</p>
      </div>

      <StaffClient shop={shop} />
    </div>
  )
}
