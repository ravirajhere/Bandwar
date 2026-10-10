/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — SERVICE WORKER
   Strategy: network-first with cache fallback
   Version: bump CACHE_VERSION to force refresh
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const CACHE_VERSION = 'v5.0.0';
const CACHE_STATIC = `bandwar-static-${CACHE_VERSION}`;
const CACHE_IMAGES = `bandwar-images-${CACHE_VERSION}`;
const CACHE_RUNTIME = `bandwar-runtime-${CACHE_VERSION}`;

/* ─────────────── STATIC ASSETS (precache on install) ─────────────── */
const STATIC_ASSETS = [
  '/',
  '/section',
  '/place',
  '/time',
  '/vision',
  '/about',
  '/assets/css/theme.css',
  '/assets/css/style.css',
  '/assets/js/core.js',
  '/manifest.json',
  '/offline.html',
];

/* ─────────────── INSTALL ─────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('SW: precache partial failure', err);
      }))
      .then(() => self.skipWaiting())
  );
});

/* ─────────────── ACTIVATE ─────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !key.startsWith('bandwar-'))
          .concat(
            keys.filter(key =>
              key.startsWith('bandwar-') &&
              !key.includes(CACHE_VERSION)
            )
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ─────────────── FETCH STRATEGY ─────────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* ─── Skip non-GET requests ─── */
  if (request.method !== 'GET') return;

  /* ─── Skip cross-origin (fonts, tiles) ─── */
  if (url.origin !== self.location.origin) return;

  /* ─── IMAGES: cache-first (long-lived) ─── */
  if (request.destination === 'image' || /\.(webp|avif|jpe?g|png|svg|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => caches.match('/images/home/bandwar-hero.jpg'));
        })
      )
    );
    return;
  }

  /* ─── CSS / JS: network-first (fresh) ─── */
  if (/\.(css|js)$/i.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_RUNTIME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* ─── HTML & others: network-first with cache fallback ─── */
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && (request.destination === 'document' || request.destination === '')) {
          const clone = response.clone();
          caches.open(CACHE_STATIC).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached;
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
      )
  );
});

/* ─────────────── MESSAGE HANDLER ─────────────── */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    );
  }
});