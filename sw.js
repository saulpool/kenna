// Service Worker for Pomodoro Pet PWA
// Provides offline capability and asset caching

const CACHE_NAME = 'pomodoro-pet-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/storage.js',
  '/timer.js',
  '/pet.js',
  '/reminders.js',
  '/app.js',
  '/manifest.json',
  '/images/Standing.png',
  '/images/Sitting.png',
  '/images/Sleeping.png',
  '/images/Yawning.png',
  '/images/Laying_Down_A.png',
  '/images/Laying_Down_B.png',
  '/images/Laying_Down_C.png',
  '/images/Belly_Up.png',
  '/images/Curled_Up.png',
  '/images/Running_A.png',
  '/images/Running_B.png',
  '/images/Tail_Wagging.png',
  '/images/Playing.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});
