// Jalanea Works Service Worker
// Version-based cache for easy updates
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `jalanea-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `jalanea-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `jalanea-images-${CACHE_VERSION}`;

// App Shell - critical resources that must be cached
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;700&display=swap',
  'https://cdn.tailwindcss.com',
];

// Routes that should always go network-first
const NETWORK_FIRST_ROUTES = [
  '/api/',
  'firestore.googleapis.com',
  'firebase',
  'identitytoolkit.googleapis.com',
];

// Routes that should be cache-first
const CACHE_FIRST_ROUTES = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.tailwindcss.com',
  'logo.clearbit.com',
  'ui-avatars.com',
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        // Cache app shell files
        return cache.addAll(APP_SHELL).catch((error) => {
          console.warn('[SW] Some app shell files failed to cache:', error);
          // Continue even if some files fail
          return Promise.resolve();
        });
      })
      .then(() => {
        // Cache external resources separately (they may fail due to CORS)
        return caches.open(STATIC_CACHE).then((cache) => {
          return Promise.allSettled(
            EXTERNAL_RESOURCES.map((url) =>
              cache.add(url).catch((e) => console.warn(`[SW] Failed to cache ${url}:`, e))
            )
          );
        });
      })
      .then(() => {
        console.log('[SW] App shell cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old version caches
              return cacheName.startsWith('jalanea-') &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on URL
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirst(request));
  } else if (shouldUseCacheFirst(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirstWithExpiry(request, IMAGE_CACHE, 7 * 24 * 60 * 60 * 1000)); // 7 days
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Check if URL should use network-first strategy
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_ROUTES.some((route) => url.href.includes(route));
}

// Check if URL should use cache-first strategy
function shouldUseCacheFirst(url) {
  return CACHE_FIRST_ROUTES.some((route) => url.href.includes(route));
}

// Check if request is for an image
function isImageRequest(request) {
  const acceptHeader = request.headers.get('Accept') || '';
  return acceptHeader.includes('image') ||
         /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(request.url);
}

// Check if request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('Accept')?.includes('text/html'));
}

// Network First strategy - try network, fall back to cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || createOfflineResponse();
  }
}

// Cache First strategy - try cache, fall back to network
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache and network failed:', request.url);
    return createOfflineResponse();
  }
}

// Cache First with expiry - for images
async function cacheFirstWithExpiry(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is still valid
    const cachedDate = cachedResponse.headers.get('sw-cache-date');
    if (cachedDate && (Date.now() - new Date(cachedDate).getTime()) < maxAge) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone and add cache date header
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.append('sw-cache-date', new Date().toISOString());

      const modifiedResponse = new Response(await responseToCache.blob(), {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      cache.put(request, modifiedResponse);
    }

    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Return stale cache if network fails
    }
    return createOfflineResponse();
  }
}

// Stale While Revalidate - serve from cache, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached response immediately, or wait for network
  return cachedResponse || networkPromise || createOfflineResponse();
}

// Network First with offline fallback for navigation
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, serving offline page');

    // Try to serve cached version of the page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Serve offline fallback page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    // Last resort - return basic offline response
    return createOfflineResponse();
  }
}

// Create a basic offline response
function createOfflineResponse() {
  return new Response(
    '<html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html' },
    }
  );
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-job-applications') {
    event.waitUntil(syncJobApplications());
  }

  if (event.tag === 'sync-saved-jobs') {
    event.waitUntil(syncSavedJobs());
  }
});

// Sync job applications when back online
async function syncJobApplications() {
  try {
    // Get pending applications from IndexedDB
    const pendingApps = await getPendingFromIndexedDB('pending-applications');

    for (const app of pendingApps) {
      try {
        await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(app),
        });

        // Remove from pending queue after successful sync
        await removeFromIndexedDB('pending-applications', app.id);
      } catch (error) {
        console.error('[SW] Failed to sync application:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync saved jobs when back online
async function syncSavedJobs() {
  // Similar implementation for saved jobs
  console.log('[SW] Syncing saved jobs...');
}

// IndexedDB helpers for background sync
async function getPendingFromIndexedDB(storeName) {
  // This would connect to IndexedDB - simplified for now
  return [];
}

async function removeFromIndexedDB(storeName, id) {
  // This would remove from IndexedDB - simplified for now
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = { title: 'Jalanea Works', body: 'You have a new notification' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.tag || 'jalanea-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if none exists
        return clients.openWindow(urlToOpen);
      })
  );
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service worker loaded');
