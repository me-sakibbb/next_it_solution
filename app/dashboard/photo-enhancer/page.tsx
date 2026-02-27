import { getUserShop } from '@/lib/get-user-shop'
import { PhotoEditorClient } from './photo-editor-client'
import { SubscriptionWall } from '@/components/dashboard/subscription-wall'

export default async function PhotoEditorPage() {
  const { shop } = await getUserShop()

  return (
    <div className="h-[calc(100vh-12rem)]">
      <SubscriptionWall feature="cv">
        <PhotoEditorClient shopId={shop.id} />
      </SubscriptionWall>
    </div>
  )
}
