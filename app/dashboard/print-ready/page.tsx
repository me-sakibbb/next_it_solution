import { getUserShop } from '@/lib/get-user-shop'
import { PrintReadyClient } from './print-ready-client'
import { SubscriptionWall } from '@/components/dashboard/subscription-wall'

export default async function PrintReadyPage() {
    const { shop } = await getUserShop()

    return (
        <div className="h-[calc(100vh-12rem)]">
            <SubscriptionWall feature="cv">
                <PrintReadyClient shopId={shop.id} />
            </SubscriptionWall>
        </div>
    )
}
