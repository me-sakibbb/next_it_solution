'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotificationToUser } from '@/lib/push-notifications-server'

export async function notifyUser(
    userId: string,
    title: string,
    message: string,
    url: string = '/dashboard',
    type: string = 'general'
) {
    const supabase = await createAdminClient()

    // 1. Insert into database for in-app realtime
    const { data: notification, error } = await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        action_url: url,
        type
    }).select().single()

    if (error) {
        console.error('Error inserting DB notification:', error)
    }

    // 2. Send Web Push
    await sendPushNotificationToUser(userId, {
        title,
        body: message,
        url,
        notificationId: notification?.id
    })
}

export async function notifySuperAdmins(
    title: string,
    message: string,
    url: string = '/superadmin/orders',
    type: string = 'system'
) {
    const supabase = await createAdminClient()

    // Find all super admins
    const { data: admins, error: adminError } = await supabase
        .from('super_admins')
        .select('email')

    if (adminError || !admins) {
        console.error('Error fetching admins for notification:', adminError)
        return
    }

    const emails = admins.map(a => a.email)

    // Find user ids of those super admins
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .in('email', emails)

    if (userError || !users) return

    for (const user of users) {
        // 1. DB Insert
        const { data: notification } = await supabase.from('notifications').insert({
            user_id: user.id,
            title,
            message,
            action_url: url,
            type
        }).select().single()

        // 2. Push Notification
        await sendPushNotificationToUser(user.id, {
            title,
            body: message,
            url,
            notificationId: notification?.id
        })
    }
}
