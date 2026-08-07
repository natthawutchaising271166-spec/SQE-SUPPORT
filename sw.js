// อัปเดตเวอร์ชันแคชใหม่
const CACHE_NAME = 'sqe-portal-v2.4'; 

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './apple-touch-icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

/**
 * ฟังก์ชันช่วยระบุ Content-Type ตามนามสกุลไฟล์
 * เพื่อแก้ปัญหา "Response should include 'content-type' header"
 */
function getMimeType(url) {
  const extension = url.split('.').pop().split(/\#|\?/)[0];
  const mimeMap = {
    'html': 'text/html; charset=utf-8',
    'js':   'application/javascript; charset=utf-8',
    'css':  'text/css; charset=utf-8',
    'png':  'image/png',
    'jpg':  'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif':  'image/gif',
    'svg':  'image/svg+xml',
    'json': 'application/json; charset=utf-8',
    'ico':  'image/x-icon'
  };
  return mimeMap[extension] || 'application/octet-stream';
}

/**
 * ฟังก์ชันช่วย: แนบ Header ด้านความปลอดภัยและประเภทไฟล์
 * - Content-Type: แก้ปัญหา "Response should include 'content-type' header"
 * - Cache-Control: แก้ปัญหา "cache-control header is missing"
 * - X-Content-Type-Options: nosniff
 */
function withImprovedHeaders(response, requestUrl, cacheControlValue) {
  if (!response) return response;

  const newHeaders = new Headers(response.headers);
  
  // 1. ตั้งค่า Content-Type ถ้ายังไม่มี (สำคัญมากสำหรับการโหลดไฟล์จาก Cache)
  if (!newHeaders.has('Content-Type')) {
    newHeaders.set('Content-Type', getMimeType(requestUrl));
  }
  
  // 2. ตั้งค่าการควบคุมแคช
  newHeaders.set('Cache-Control', cacheControlValue);
  
  // 3. ตั้งค่าความปลอดภัย
  newHeaders.set('X-Content-Type-Options', 'nosniff');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate และลบ Cache เก่า
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// การ Fetch ข้อมูล
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ข้าม Supabase หรือไม่ใช่ GET
  if (url.hostname.endsWith('.supabase.co') || event.request.method !== 'GET') {
    return;
  }

  // Network-First สำหรับไฟล์หลัก (HTML, JS, CSS)
  if (url.pathname.endsWith('script.js') || url.pathname.endsWith('styles.css') || url.pathname.endsWith('index.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseWithHeaders = withImprovedHeaders(networkResponse, event.request.url, 'no-cache');
            const responseClone = responseWithHeaders.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            return responseWithHeaders;
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(event.request).then(cachedResponse =>
            withImprovedHeaders(cachedResponse, event.request.url, 'no-cache')
          )
        )
    );
    return;
  }

  // Cache-First สำหรับรูปภาพและไอคอน
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return withImprovedHeaders(cachedResponse, event.request.url, 'public, max-age=604800, immutable');
      }
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseWithHeaders = withImprovedHeaders(networkResponse, event.request.url, 'public, max-age=604800, immutable');
          const responseClone = responseWithHeaders.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return responseWithHeaders;
        }
        return networkResponse;
      });
    })
  );
});