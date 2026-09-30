// Service worker: aplikacja działa bez internetu po pierwszym uruchomieniu.
// index.html — najpierw sieć (żeby szybko dostać nową wersję), potem pamięć podręczna.
// Pliki z /assets/ mają hash w nazwie — najpierw pamięć podręczna.
const CACHE = 'ww-v1';
const CORE = ['./', './index.html', './config.js', './manifest.webmanifest', './icon.svg', './icon-192.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => undefined)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, API — zawsze sieć

  const isHtml = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  const isConfig = url.pathname.endsWith('/config.js');
  if (isHtml || isConfig) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(isHtml ? './index.html' : req, copy));
          return res;
        })
        .catch(() => caches.match(isHtml ? './index.html' : req).then((r) => r || caches.match('./'))),
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
