// อัปเดตเวอร์ชันแคชใหม่เพื่อบังคับให้ทุกเครื่องดึงสคริปต์ล่าสุด
const CACHE_NAME = 'sqe-portal-v2.3'; 

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icon-192.png',
  './icon-512.png'
];

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ลบ Cache เก่าทั้งหมดทันทีที่ Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ตรวจสอบการ Fetch ข้อมูล
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ปล่อยผ่าน Request ของ Supabase หรือที่ไม่ใช่ GET โดยตรง ไม่แตะต้อง Cache
  if (url.hostname.endsWith('.supabase.co') || event.request.method !== 'GET') {
    return;
  }

  // Network-First สำหรับ script.js และ styles.css เพื่อให้ได้เวอร์ชันล่าสุดเสมอ
  if (url.pathname.endsWith('script.js') || url.pathname.endsWith('styles.css') || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-First สำหรับไฟล์รูปภาพ/ไอคอนคงที่
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});