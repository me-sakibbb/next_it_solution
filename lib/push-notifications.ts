// Utility functions for client-side Web Push standard

/**
 * Utility function to convert a base64 string to a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Request notification permissions and subscribe to push notifications
 * @returns boolean indicating success
 */
export async function subscribeToPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported.');
        return false;
    }

    try {
        // 1. Request Permission
        const permissionContent = await Notification.requestPermission();
        if (permissionContent !== 'granted') {
            console.warn('Notification permission denied.');
            return false;
        }

        // 2. Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // 3. Subscribe
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            // Already subscribed, we can optionally update the backend just in case
            await sendSubscriptionToBackend(existingSubscription);
            return true;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            console.error('VAPID public key is missing.');
            return false;
        }

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });

        // 4. Send to Backend
        await sendSubscriptionToBackend(subscription);
        return true;

    } catch (err) {
        console.error('Failed to subscribe the user: ', err);
        return false;
    }
}

/**
 * Unsubscribe from push notifications
 * @returns boolean indicating success
 */
export async function unsubscribeFromPushNotifications() {
    if (!('serviceWorker' in navigator)) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            // 1. Unsubscribe locally
            await subscription.unsubscribe();

            // 2. Tell backend to delete
            await fetch('/api/push/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error unsubscribing:', error);
        return false;
    }
}

async function sendSubscriptionToBackend(subscription: PushSubscription) {
    try {
        const response = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
        });

        if (!response.ok) {
            throw new Error('Failed to save subscription on server');
        }
        return true;
    } catch (error) {
        console.error('Error sending subscription to backend:', error);
        throw error;
    }
}
