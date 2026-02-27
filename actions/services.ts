import { createClient } from '@/lib/supabase/client'

export async function getAvailableServices() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
}

export async function getUserBalance(): Promise<number> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()
    if (error) return 0
    return data?.balance ?? 0
}

export async function getUserOrders() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('service_orders')
        .select('*, service:services(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
}

import { notifyUser, notifySuperAdmins } from './notifications'
import { checkFeatureLimit, incrementFeatureUsage } from './limits'

function isAutofillService(serviceName: string): boolean {
    const name = serviceName.toLowerCase()
    return name.includes('অটোমেশন') || name.includes('automation') || name.includes('form-fill')
}

export async function createServiceOrder(
    serviceId: string,
    requirements: string,
    price: number
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check balance
    const { data: profile } = await supabase
        .from('users')
        .select('balance, email')
        .eq('id', user.id)
        .single()

    if (!profile || profile.balance < price) {
        throw new Error('Insufficient balance')
    }

    // Get service details for notification and limit check
    const { data: serviceData } = await supabase.from('services').select('name').eq('id', serviceId).single()
    const serviceName = serviceData?.name || 'a service'

    // Check Rate Limits for Autofill Services
    const isAutofill = isAutofillService(serviceName)
    if (isAutofill) {
        const limitCheck = await checkFeatureLimit('autofill')
        if (!limitCheck.allowed) {
            throw new Error('আপনার এই মাসের অটো-ফিল আবেদন লিমিট শেষ হয়ে গেছে। দয়া করে আপনার প্ল্যানটি আপগ্রেড করুন।')
        }
    }

    // Create order
    const { data: orderData, error: orderError } = await supabase
        .from('service_orders')
        .insert({
            user_id: user.id,
            service_id: serviceId,
            requirements,
            total_price: price,
            status: 'pending',
        })
        .select('id')
        .single()

    if (orderError) throw new Error(orderError.message)

    // Deduct balance
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: profile.balance - price })
        .eq('id', user.id)

    if (balanceError) throw new Error(balanceError.message)

    // Send Notifications
    const orderIdShort = orderData?.id?.substring(0, 8) || ''
    await notifySuperAdmins(
        'নতুন অর্ডার এসেছে',
        `${profile.email || 'একজন ব্যবহারকারী'} ${serviceName} এর জন্য একটি নতুন অর্ডার প্লেস করেছেন (অর্ডার #${orderIdShort})`,
        '/superadmin/orders',
        'order_status'
    )

    await notifyUser(
        user.id,
        'অর্ডার সফলভাবে প্লেস করা হয়েছে',
        `আপনার ${serviceName} অর্ডারটি গ্রহণ করা হয়েছে এবং পর্যালোচনার জন্য অপেক্ষমান রয়েছে।`,
        '/dashboard/orders',
        'order_status'
    )

    // Increment usage for Autofill Services
    if (isAutofill) {
        await incrementFeatureUsage('autofill')
    }
}

