const CACHE_NAME = 'stupikid-v5';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './edit.html',
  './favicon.ico',
  './assets/images/SK.png',
  './assets/css/style.css',
  './assets/css/edit-style.css',
  './assets/js/script.js',
  './assets/js/edit-script.js'
];

// 安裝 Service Worker 並快取核心靜態資產
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 啟用 Service Worker 並清除過期快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 網路請求攔截處理 (跳過 Firebase 與動態 JS 請求以防快取衝突)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 外部 Firebase / API 請求直接走網路
  if (url.includes('firebase') || url.includes('firestore') || url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // 若為有效回應則儲存至快取
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // 離線回退
      return caches.match('./index.html');
    })
  );
});
