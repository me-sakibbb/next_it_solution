import { getUserShop } from '@/lib/get-user-shop'
import { SuppliersClient } from './suppliers-client'

import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'সাপ্লায়ার - Shop Area',
    description: 'Manage shop suppliers and payments',
}

export default async function SuppliersPage() {
    const { shop } = await getUserShop()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">সাপ্লায়ার ব্যবস্থাপনা</h1>
                <p className="text-muted-foreground">
                    সব সাপ্লায়ারের তালিকা, পেমেন্ট এবং ডিউ (বকেয়া) ট্র্যাক করুন।
                </p>
            </div>

            <SuppliersClient
                shopId={shop.id}
            />
        </div>
    )
}
