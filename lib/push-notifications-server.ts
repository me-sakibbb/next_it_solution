import webpush from 'web-push';
import { createAdminClient } from './supabase/admin';

// Configure Web Push with VAPID keys
// This should only be executed on the server side
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        'mailto:admin@nextitsolution.com',
        vapidPublicKey,
        vapidPrivateKey
    );
}

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    url?: string;
}

/**
 * Sends a push notification to all active subscriptions for a given user.
 */
export async function sendPushNotificationToUser(userId: string, payload: PushPayload) {
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn('VAPID keys not configured, skipping push notification');
        return { success: false, error: 'VAPID keys missing' };
    }

    try {
        const supabase = await createAdminClient();

        // Fetch all subscriptions for the user
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching push subscriptions:', error);
            return { success: false, error: 'Database error' };
        }

        if (!subscriptions || subscriptions.length === 0) {
            return { success: true, count: 0, message: 'No active subscriptions' };
        }

        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/VP_logo.svg', // Default icon
            data: {
                url: payload.url || '/dashboard' // Default URL to open on click
            }
        });

        const promises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth_key
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, notificationPayload);
                return { success: true, endpoint: sub.endpoint };
            } catch (err: any) {
                // If subscription is invalid/expired (status 410 or 404), remove it from DB
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', sub.id);
                }
                console.error('Failed to send push to subscription:', err);
                return { success: false, endpoint: sub.endpoint, error: err };
            }
        });

        const results = await Promise.all(promises);
        const successfulCount = results.filter(r => r.success).length;

        return {
            success: true,
            count: successfulCount,
            total: subscriptions.length
        };

    } catch (err) {
        console.error('Error in sendPushNotificationToUser:', err);
        return { success: false, error: 'Internal error' };
    }
}
