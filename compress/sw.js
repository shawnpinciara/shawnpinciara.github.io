// sw.js (Service Worker)

// A unique name for our cache. Changing this will invalidate the old cache.
const CACHE_NAME = 'video-compressor-cache-v1';

// All the assets the app needs to function offline.
// We MUST cache the FFmpeg core files for it to work offline.
const assetsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/manifest.json',
    'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js',
    'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
    'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.wasm',
    'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.worker.js',
    'https://cdn.tailwindcss.com' // Cache Tailwind CSS
];

// --- Install Event ---
// This is fired when the service worker is first installed.
// We open the cache and add all our assets to it.
self.addEventListener('install', event => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching all: app shell and content');
                return cache.addAll(assetsToCache);
            })
            .catch(error => {
                console.error('[Service Worker] Caching failed', error);
            })
    );
});

// --- Fetch Event ---
// This is fired for every single request the page makes.
// We intercept the request and respond with the cached version if it exists.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // If the request is in the cache, return the cached response
                if (response) {
                    // console.log(`[Service Worker] Returning from cache: ${event.request.url}`);
                    return response;
                }
                // If the request is not in the cache, fetch it from the network
                // console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
                return fetch(event.request);
            })
    );
});

// --- Activate Event ---
// This is fired when the service worker is activated.
// It's a good place to clean up old caches.
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});
