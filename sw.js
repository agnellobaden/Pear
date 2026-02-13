const CACHE_NAME = 'pear-app-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './style.css',
    './style_table.css',
    './style_create_menu.css',
    './logo.svg',
    './icon-192.png',
    './icon-512.png'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.claim();
});

// Fetch Event (Stale-While-Revalidate Strategy)
self.addEventListener('fetch', (event) => {
    // Skip Firebase or external API calls for caching (Cloud Sync)
    if (event.request.url.includes('firebase') || event.request.url.includes('firestore')) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((response) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Cache the new version
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // If network fails, we already have the cache response (if any)
                });

                // Return cache immediately, then update in background
                return response || fetchPromise;
            });
        })
    );
});

// Post Message handling (Optional: for communication between app and SW)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Push Notification Event
self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Pear Update';
    const options = {
        body: data.body || 'Es gibt neue Updates in deinem Team.',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = event.notification.data.url || './index.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    // Send a message to the client to navigate to the specific view
                    if (url.includes('#')) {
                        const view = url.split('#')[1];
                        client.postMessage({ type: 'NAVIGATE', view: view });
                    }
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
