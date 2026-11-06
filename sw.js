const V = 'ptplanner-v1';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'export.js', 'exercises.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), same = url.origin === location.origin;
  if (same) {
    // เปิดไว: ใช้แคชก่อน แล้วอัปเดตเบื้องหลัง
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(r => { if (r.ok) caches.open(V).then(c => c.put(req, r.clone())); return r; }).catch(() => hit);
      return hit || net;
    }));
  } else if (/jsdelivr|fonts\.(googleapis|gstatic)/.test(url.hostname)) {
    // ภาพท่า/ฟอนต์: แคชไว้ใช้ออฟไลน์
    e.respondWith(caches.open(V + '-ext').then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit))));
  }
});
