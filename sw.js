// Service Worker for SQE Portal & WAP System with Table Data Caching
const CACHE_NAME = 'sqe-portal-v6.2'; 
const DATA_CACHE_NAME = 'sqe-table-data-v1';
const IMAGE_CACHE_NAME = 'sqe-images-v1';

const STATIC_URLS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './apple-touch-icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
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

  // 1. แคชข้อมูลตารางจาก Supabase (REST API Table Data): Network-First พร้อม fallback ไปยัง Data Cache เมื่อออฟไลน์หรือติดโควต้า (Quota Exceeded)
  if (url.hostname.endsWith('.supabase.co') && url.pathname.includes('/rest/v1/')) {
    event.respondWith(
      fetch(request)
        .then(async networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then(cache => cache.put(request, responseClone));
            return networkResponse;
          }
          // ถ้า Supabase ส่ง HTTP Error เช่น 402 Payment Required (exceed_egress_quota) หรือ 403/429/500
          console.warn('[SW] Supabase returned status ' + (networkResponse ? networkResponse.status : 'error') + ', falling back to cache');
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
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
            headers: { 
              'Content-Type': 'application/json',
              'content-range': '0-0/0'
            }
          });
        })
        .catch(async () => {
          console.log('[SW] Network offline, serving cached table data:', request.url);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
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
            headers: { 
              'Content-Type': 'application/json',
              'content-range': '0-0/0'
            }
          });
        })
    );
    return;
  }

  // 2. แคชรูปภาพภายนอกและรูป Supabase Storage: Stale-While-Revalidate / Cache-First
  if (
    url.hostname.endsWith('.supabase.co') && url.pathname.includes('/storage/v1/object/')
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

  // 3. ไฟล์ Same-Origin (HTML, CSS, JS, Assets): Network-First เสมอเพื่อให้โค้ดอัปเดตทันที
  if (url.origin === location.origin) {
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

  // 4. ทั่วไป (Third-party CDN etc.): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});