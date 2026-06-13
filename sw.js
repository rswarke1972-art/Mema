// sw.js – Service worker for offline capabilities
const CACHE_NAME = 'mema-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './config.js',
  './utils.js',
  './dialogue.js',
  './choices.js',
  './relationships.js',
  './progress.js',
  './chapters.js',
  './endings.js',
  './music.js',
  './achievements.js',
  './save.js',
  './settings.js',
  './mobile.js',
  './manifest.json',
  './assets/data/story.json',
  './assets/svg/logo.svg',
  './assets/svg/first_dance.svg',
  './assets/svg/broken_heart.svg',
  './assets/svg/wise_lady.svg',
  './assets/svg/matchmaker.svg',
  './assets/svg/reputation_queen.svg',
  './assets/svg/true_love.svg',
  './assets/svg/social_disaster.svg',
  './assets/images/first_dance.png',
  './assets/images/garden_walk.png',
  './assets/images/confession.png',
  './assets/images/finale.png'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(response => {
        // Return response from network
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Cache dynamic calls if needed
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Check if we should cache this type of resource
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, responseToCache);
          }
        });
        return response;
      }).catch(() => {
        // Fail silently or load offline page
      });
    })
  );
});
