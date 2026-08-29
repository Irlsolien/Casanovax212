/* Service worker minimal : rend l'app installable et charge la coquille hors-ligne.
   Les recherches (OSM) nécessitent internet ; le reste fonctionne offline. */
const CACHE = "cx-prospect-v3";
const SHELL = [
  "/prospect/", "/prospect/index.html", "/prospect/styles.css", "/prospect/app.js",
  "/prospect/manifest.webmanifest", "/prospect/icons/icon-192.png", "/prospect/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Ne jamais mettre en cache les appels réseau vers OSM (données fraîches).
  if (url.hostname.includes("openstreetmap") || url.hostname.includes("overpass")) return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
