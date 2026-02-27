// Web Push Service Worker
self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            const data = event.data.json()
            const title = data.title || 'Next AI Solution'
            const options = {
                body: data.body,
                icon: data.icon || '/VP_logo.svg',
                badge: '/VP_logo.svg',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: '2',
                    url: data.data?.url || '/'
                }
            }

            event.waitUntil(self.registration.showNotification(title, options))
        } catch (e) {
            console.error('Error parsing push data:', e)
            // Fallback if data is not JSON
            event.waitUntil(self.registration.showNotification('Next AI Solution', {
                body: event.data.text(),
                icon: '/VP_logo.svg'
            }))
        }
    }
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()

    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            const targetUrl = event.notification.data?.url || '/'

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
