const CACHE_NAME = 'pear-app-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './style.css',
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

// Fetch Event (Network First Strategy for dynamic content, Cache Fallback)
self.addEventListener('fetch', (event) => {
    // Skip Firebase or external API calls for caching
    if (event.request.url.includes('firebase') || event.request.url.includes('firestore')) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
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
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
