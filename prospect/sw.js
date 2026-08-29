/* Service worker minimal : rend l'app installable et charge la coquille hors-ligne.
   Les recherches (OSM) nécessitent internet ; le reste fonctionne offline. */
const CACHE = "cx-prospect-v5";
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
  // Ne jamais toucher aux appels réseau vers OSM (données fraîches).
  if (url.hostname.includes("openstreetmap") || url.hostname.includes("overpass")
      || url.hostname.includes("kumi") || url.hostname.includes("coffee")) return;
  if (e.request.method !== "GET") return;
  // Network-first : toujours la dernière version en ligne, cache en secours hors-ligne.
  e.respondWith(
    fetch(e.request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
