import { getUserShop } from '@/lib/get-user-shop'
import { CategoriesClient } from './categories-client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
    title: 'খরচের ক্যাটাগরি | দোকান',
}

export default async function ExpenseCategoriesPage() {
    const { shop } = await getUserShop()

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/dashboard/shop/expenses">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">খরচের ক্যাটাগরি</h1>
                </div>
                <p className="text-muted-foreground ml-12">
                    আপনার ব্যবসার সকল প্রকার খরচের তালিকা ও শ্রেণীবিভাগ পরিচালনা করুন
                </p>
            </div>

            <div className="ml-12">
                <CategoriesClient shopId={shop.id} />
            </div>
        </div>
    )
}
