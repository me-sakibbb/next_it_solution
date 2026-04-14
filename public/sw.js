// Web Push Service Worker
self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            const data = event.data.json()
            const title = data.title || 'Nex IT Solution'
            const options = {
                body: data.body,
                icon: data.icon || '/VP_logo.svg',
                badge: '/VP_logo.svg',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    url: data.data?.url || '/',
                    notificationId: data.data?.notificationId
                }
            }

            event.waitUntil(self.registration.showNotification(title, options))
        } catch (e) {
            console.error('Error parsing push data:', e)
            // Fallback if data is not JSON
            event.waitUntil(self.registration.showNotification('Nex IT Solution', {
                body: event.data.text(),
                icon: '/VP_logo.svg'
            }))
        }
    }
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()

    const targetUrl = event.notification.data?.url || '/'
    const notificationId = event.notification.data?.notificationId

    // 1. Mark as read in the background
    if (notificationId) {
        event.waitUntil(
            fetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            }).catch(err => console.error('Failed to mark notification as read in SW:', err))
        )
    }

    // 2. This looks to see if the current is already open and focuses if it is
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // If window already open, focus it and navigate
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i]
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl)
                    return client.focus()
                }
            }

            // If window not open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(targetUrl)
            }
        })
    )
})
