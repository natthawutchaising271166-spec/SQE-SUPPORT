// 1. อัปเดตเวอร์ชันแคชทุกครั้งที่มีการเปลี่ยนไฟล์ เพื่อให้เบราว์เซอร์ดึงไฟล์ใหม่
const CACHE_NAME = 'sqe-portal-v2.1.6'; 

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icons/icon-192.png', // แก้ไขเส้นทางให้เข้าโฟลเดอร์ icons
  './icons/icon-512.png', // แก้ไขเส้นทางให้เข้าโฟลเดอร์ icons
  './favicon.ico'         // เพิ่ม favicon เข้าไปด้วยเพื่อป้องกันบัค 404
];

// ติดตั้ง Service Worker และเก็บไฟล์ลง Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// ลบ Cache เก่าที่ไม่ได้ใช้ (สำคัญมาก: ช่วยให้ไฟล์เวอร์ชันใหม่ทำงานทันที)
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
        // ถ้าเจอใน Cache ให้ใช้จาก Cache ถ้าไม่เจอให้ไปดึงจาก Network
        return response || fetch(event.request);
      })
  );
});