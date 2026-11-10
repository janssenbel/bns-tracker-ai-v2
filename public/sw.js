// BelBros Car Trading - Offline PWA Service Worker
const CACHE_NAME = 'belbros-bns-v3';

// Core assets to pre-cache immediately on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './apple-touch-icon.png?v=3',
  './apple-touch-icon-180x180.png',
  './apple-touch-icon-152x152.png',
  './apple-touch-icon-120x120.png',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './pwa-maskable-512x512.png',
  './favicon-32x32.png',
  './favicon.ico',
  './icon.svg'
];

// Install Event: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use catch on each item so one missing asset doesn't abort the entire install
      return Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Precache item skipped: ${url}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: handle navigation and asset requests offline
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Navigation requests (Opening the app, refreshing, home screen launcher)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online and successful, update the cached app shell
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // OFFLINE: Return cached index.html or root
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('./index.html') || 
                              await cache.match('./') || 
                              await cache.match(request);
          if (cachedIndex) return cachedIndex;

          // Fallback to any cached HTML
          const keys = await cache.keys();
          for (const key of keys) {
            if (key.url.endsWith('index.html') || key.url.endsWith('/')) {
              return cache.match(key);
            }
          }
          return new Response('Offline: App shell is loading.', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 2. Static Assets (Scripts, Styles, Fonts, Images, Icons)
  // Check if same origin or external fonts/cdn
  const isGoogleFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  const isCdn = url.hostname.includes('cdnjs.cloudflare.com');
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin || isGoogleFont || isCdn) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Cache-First with Background Revalidation
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline and not in cache
            return cachedResponse;
          });

        // If we already have it in cache, return immediately (super fast & offline-ready!)
        return cachedResponse || fetchPromise;
      })
    );
  }
});
