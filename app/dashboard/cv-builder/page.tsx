import { getUserShop } from '@/lib/get-user-shop'
import { CVBuilderClient } from './cv-builder-client'

export default async function CVBuilderPage() {
    const { user, shop } = await getUserShop()

    return <CVBuilderClient user={user} shop={shop} />
}
