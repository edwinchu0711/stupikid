const CACHE_NAME = 'stupikid-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/1534128869.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
