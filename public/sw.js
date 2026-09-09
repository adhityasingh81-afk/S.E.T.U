/**
 * SETU • NEXUS Service Worker
 * Scoped specifically to /sos route for zero-connectivity offline capability
 * and Background Sync ('sync-sos')
 */

const CACHE_NAME = 'nexus-sos-cache-v1';
const DB_NAME = 'nexus-sos-db';
const DB_STORE = 'pending-sos';

// Static resources needed for the /sos page
const SOS_URL = '/sos';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        // Pre-cache the /sos navigation shell
        await cache.addAll([
          '/sos',
          '/',
          '/index.html'
        ]);
      } catch (err) {
        console.warn('[SW] Pre-caching /sos initial shell:', err);
      }
      return self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      return self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Do NOT intercept non-GET or cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Do NOT intercept /api routes (those must go to network or fail to trigger IndexedDB queue)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests to /sos
  if (request.mode === 'navigate' && url.pathname.startsWith('/sos')) {
    event.respondWith(
      (async () => {
        try {
          // Attempt network first
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (err) {
          // Offline fallback
        }

        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/sos') ||
                               await cache.match('/') ||
                               await cache.match('/index.html');
        if (cachedResponse) {
          return cachedResponse;
        }

        return new Response(
          '<!DOCTYPE html><html><head><title>NEXUS Offline SOS</title></head><body><h1>Offline SOS Ready</h1></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })()
    );
    return;
  }

  // 2. Only cache and serve assets (JS, CSS, fonts, SVG) needed when loading /sos
  const isAsset = url.pathname.startsWith('/assets/') ||
                  url.pathname.endsWith('.js') ||
                  url.pathname.endsWith('.css') ||
                  url.pathname.endsWith('.woff2') ||
                  url.pathname.endsWith('.svg');

  if (isAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        // Network with fallback to cache, and dynamically cache bundle assets
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            // Only cache if referer or destination is relevant
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          if (cached) {
            return cached;
          }
          throw err;
        }
      })()
    );
  }
});

/**
 * Background Sync Implementation ('sync-sos') for Android/Chrome
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sos') {
    console.log('[SW] Background sync triggered: sync-sos');
    event.waitUntil(flushIndexedDbInWorker());
  }
});

/**
 * Reads pending alerts directly from IndexedDB in the Service Worker context
 * and posts them to /api/sos
 */
async function flushIndexedDbInWorker() {
  return new Promise((resolve) => {
    const openReq = indexedDB.open(DB_NAME, 1);

    openReq.onerror = () => {
      console.warn('[SW] Could not open IndexedDB for background sync');
      resolve();
    };

    openReq.onsuccess = async (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        resolve();
        return;
      }

      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const getAllReq = store.getAll();

      getAllReq.onsuccess = async () => {
        const alerts = getAllReq.result || [];
        console.log(`[SW] Found ${alerts.length} pending alert(s) in IndexedDB to sync`);

        for (const alert of alerts) {
          try {
            const resp = await fetch('/api/sos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(alert)
            });

            if (resp.ok) {
              const result = await resp.json();
              // Delete from IndexedDB
              const delTx = db.transaction(DB_STORE, 'readwrite');
              delTx.objectStore(DB_STORE).delete(alert.id);

              // Notify all connected clients so the UI updates
              const clients = await self.clients.matchAll({ includeUncontrolled: true });
              for (const client of clients) {
                client.postMessage({
                  type: 'SOS_SYNCED',
                  id: alert.id,
                  sentAt: Date.now(),
                  result
                });
              }
            }
          } catch (fetchErr) {
            console.warn(`[SW] Failed to sync alert ${alert.id}:`, fetchErr);
          }
        }
        resolve();
      };

      getAllReq.onerror = () => resolve();
    };
  });
}
