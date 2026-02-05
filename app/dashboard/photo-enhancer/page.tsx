import { getUserShop } from '@/lib/get-user-shop'
import { PhotoEditorClient } from './photo-editor-client'

export default async function PhotoEditorPage() {
  const { shop } = await getUserShop()

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-4rem)]">
      <PhotoEditorClient shopId={shop.id} />
    </div>
  )
}
