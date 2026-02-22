import { Metadata } from 'next'
import { SuppliersClient } from './suppliers-client'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'সাপ্লায়ার - Shop Area',
    description: 'Manage shop suppliers and payments',
}

export default async function SuppliersPage() {
    const supabase = await createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/auth/login')
    }

    // Verify shop context
    const { data: shopMember } = await supabase
        .from('shop_members')
        .select('shop_id')
        .eq('user_id', user.id)
        .single()

    if (!shopMember?.shop_id) {
        redirect('/dashboard')
    }

    const { data: suppliers } = await supabase
        .from('suppliers')
        .select('*')
        .eq('shop_id', shopMember.shop_id)
        .eq('is_active', true)
        .order('name')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">সাপ্লায়ার ব্যবস্থাপনা</h1>
                <p className="text-muted-foreground">
                    সব সাপ্লায়ারের তালিকা, পেমেন্ট এবং ডিউ (বকেয়া) ট্র্যাক করুন।
                </p>
            </div>

            <SuppliersClient
                initialSuppliers={suppliers || []}
                shopId={shopMember.shop_id}
            />
        </div>
    )
}
