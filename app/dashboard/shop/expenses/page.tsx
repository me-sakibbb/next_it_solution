import { getUserShop } from '@/lib/get-user-shop'
import { ExpensesClient } from './expenses-client'
import { getExpenseStats } from '@/app/actions/expenses'

export const metadata = {
    title: 'খরচ ব্যবস্থাপনা | দোকান',
}

export default async function ExpensesPage() {
    const { shop } = await getUserShop()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">খরচ ব্যবস্থাপনা</h1>
                <p className="text-muted-foreground">
                    দোকানের সমস্ত খরচ এবং ক্যাশ আউট ট্র্যাক করুন
                </p>
            </div>

            <ExpensesClient
                shopId={shop.id}
                currency={shop.currency || 'BDT'}
            />
        </div>
    )
}
