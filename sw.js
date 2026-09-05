// Service Worker for SQE Portal & WAP System with Table Data Caching
const CACHE_NAME = 'sqe-portal-v4.6'; 
const DATA_CACHE_NAME = 'sqe-table-data-v2.3';
const IMAGE_CACHE_NAME = 'sqe-images-v2.3';

const STATIC_URLS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './favicon.ico',
  './favicon-32x32.png',
  './favicon-16x16.png',
  './apple-touch-icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './sqe_portal_badge.jpg',
  './sqe_portal_badge.png',
  './manifest.json'
];

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_URLS);
    })
  );
});

// Activate: ลบ Cache เก่าทั้งหมด
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME, IMAGE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ตรวจสอบและประมวลผลการ Fetch ข้อมูล
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // ข้าม Request ที่ไม่ใช่ GET (POST, PUT, DELETE ให้ผ่านเครือข่ายปกติ)
  if (request.method !== 'GET') {
    return;
  }

  // 1. แคชข้อมูลตารางจาก Supabase (REST API Table Data): Network-First พร้อม fallback ไปยัง Data Cache เมื่อออฟไลน์
  if (url.hostname.endsWith('.supabase.co') && url.pathname.includes('/rest/v1/')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[SW] Network offline, serving cached table data:', request.url);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // หากพารามิเตอร์ URL ต่างกันเล็กน้อย ค้นหาข้อมูลตารางจาก Cache ที่ตรงกับ Base Endpoint
          const cache = await caches.open(DATA_CACHE_NAME);
          const keys = await cache.keys();
          for (const key of keys) {
            if (key.url.split('?')[0] === request.url.split('?')[0]) {
              const matched = await cache.match(key);
              if (matched) return matched;
            }
          }
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // 2. แคชรูปภาพและรูปหลักฐาน (Supabase Storage หรือไฟล์รูปภาพ): Stale-While-Revalidate / Cache-First
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i) ||
    (url.hostname.endsWith('.supabase.co') && url.pathname.includes('/storage/v1/object/'))
  ) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              caches.open(IMAGE_CACHE_NAME).then(cache => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(IMAGE_CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => {
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // 3. ไฟล์หลัก App Shell (script.js, styles.css, index.html): Network-First
  if (
    url.origin === location.origin &&
    (url.pathname.endsWith('script.js') || url.pathname.endsWith('styles.css') || url.pathname.endsWith('index.html') || url.pathname === '/')
  ) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // 4. ทั่วไป: Cache-First
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok && url.origin === location.origin) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});