// Service Worker for SQE Portal & WAP System with Table Data Caching
const CACHE_NAME = 'sqe-portal-v1.1.0'; // ปรับเวอร์ชันเล็กน้อยเพื่อทดสอบ
const DATA_CACHE_NAME = 'sqe-table-data-v1';
const IMAGE_CACHE_NAME = 'sqe-images-v1';

const STATIC_URLS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json'
];

// --- [จุดสำคัญที่เพิ่ม 1: รับข้อความสั่งข้ามสถานะ Waiting] ---
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // บังคับให้ Service Worker ตัวใหม่ทำงานทันที
  }
});

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  // บังคับให้ตัวใหม่เข้าสู่สถานะพร้อมทำงานทันที
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_URLS);
    })
  );
});

// Activate: ลบ Cache เก่า และเข้าควบคุมหน้าเว็บทันที
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
    }).then(() => {
      // --- [จุดสำคัญที่เพิ่ม 2: เข้าควบคุมคลุมทุก Tab ทันที] ---
      return self.clients.claim(); 
    })
  );
});

// --- ส่วน fetch ยังคงเดิมตามที่คุณเขียนไว้ ---
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // 1. แคชข้อมูลตารางจาก Supabase
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
          const cachedResponse = await caches.match(request);
          return cachedResponse || new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // 2. แคชรูปภาพ
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(res => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(IMAGE_CACHE_NAME).then(cache => cache.put(request, resClone));
          }
          return res;
        });
      })
    );
    return;
  }

  // 3. ไฟล์หลัก App Shell
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});