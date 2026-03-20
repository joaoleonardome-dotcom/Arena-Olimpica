const CACHE = 'arena-olimpica-v5';
const STATIC = ['./icon-192.png', './icon-512.png', './manifest.json'];

// Instala e cacheia só os ícones/manifest (não o HTML)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// Remove caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Firebase sempre vai para a rede
  if (url.includes('firestore') || url.includes('firebase') || url.includes('googleapis')) return;

  // HTML (index.html) sempre busca na rede primeiro — nunca serve do cache
  if (e.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Ícones e manifest: cache primeiro
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
