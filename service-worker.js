const CACHE_NAME = 'stupikid-v1';
const urlsToCache = [
  '/stupikid/',
  '/stupikid/1534128869.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// 在 fetch 事件中添加
self.addEventListener('fetch', event => {
    // 跳過 JavaScript 文件的快取
    if (event.request.url.includes('.js') || event.request.url.includes('firebase')) {
        return; // 讓瀏覽器正常處理，不進行快取
    }
    
    // 其他文件正常快取
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

