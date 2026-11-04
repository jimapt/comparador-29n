// Generado en el build por integraciones/sin-conexion.mjs. No editar a mano.
const VERSION = '__VERSION__';
const BASE = __BASE__;
const URLS = __URLS__;
const CACHE = `estotetoca-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('estotetoca-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Páginas: primero la red, para ver siempre la versión al día; sin red, la copia.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(async () => {
        const c = await caches.open(CACHE);
        const ruta = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
        return (await c.match(ruta)) || (await c.match(`${BASE}404.html`)) || Response.error();
      }),
    );
    return;
  }

  // Resto (CSS, JS, fuentes, imágenes): primero la copia, si no la red.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((r) => r || fetch(req)));
});
