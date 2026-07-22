// 1. อัปเดตเวอร์ชันแคช เพื่อให้เบราว์เซอร์ล้างอันเก่าแล้วดึงอันใหม่ที่ไม่มีโฟลเดอร์ icons
const CACHE_NAME = 'sqe-portal-v2.1.7'; 

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icon-192.png', // แก้ไข: ลบ icons/ ออกตามโครงสร้าง GitHub
  './icon-512.png'  // แก้ไข: ลบ icons/ ออกตามโครงสร้าง GitHub
];

// ติดตั้ง Service Worker และเก็บไฟล์ลง Cache
self.addEventListener('install', event => {
  // บังคับให้ Service Worker ตัวใหม่ทำงานทันที
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// ลบ Cache เก่าที่ไม่ได้ใช้
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ตรวจสอบการดึงข้อมูล (Fetch)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
