const CACHE_NAME = 'kacida-pro-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 1. INSTALASI: Menyimpan file penting ke memori HP
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. AKTIVASI: Membersihkan memori lama jika ada versi baru
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. FETCHING: Memuat aplikasi lebih cepat 
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Jika ada di memori HP, pakai itu. Jika tidak, ambil dari internet.
            return response || fetch(event.request);
        })
    );
});

// 4. MENDENGARKAN PUSH NOTIFICATION DARI SISTEM
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Kacida Bersatu';
    
    const options = {
        body: data.body || 'Anda memiliki pemberitahuan baru.',
        icon: 'https://lh3.googleusercontent.com/d/10-ZwZ0NXA55yPuLXfd1KlJjDU-mNPSyQ',
        badge: 'https://lh3.googleusercontent.com/d/10-ZwZ0NXA55yPuLXfd1KlJjDU-mNPSyQ',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
});

// 5. AKSI SAAT NOTIFIKASI DIKLIK OLEH USER
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const urlToOpen = event.notification.data.url;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Jika web sudah terbuka di background, langsung buka dan fokuskan
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Jika web sedang ditutup sepenuhnya, buka tab/aplikasi baru
            if (clients.openWindow && urlToOpen) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});