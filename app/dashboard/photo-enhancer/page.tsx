import { getUserShop } from '@/lib/get-user-shop'
import { PhotoEditorClient } from './photo-editor-client'

export default async function PhotoEditorPage() {
  const { shop } = await getUserShop()

  return (
    <div className="h-[calc(100vh-8rem)]">
      <PhotoEditorClient shopId={shop.id} />
    </div>
  )
}
