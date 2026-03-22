const CACHE_NAME = 'roundup-v1';
const STATIC_ASSETS = [
  '/dashboard',
  '/charities',
  '/tax',
  '/notifications',
  '/settings',
  '/offline',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    // Network first for API
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    // Cache first for static assets
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  } else {
    // Network first for pages
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match('/offline')))
    );
  }
});
