const CACHE_NAME = "caderno-treino-v5";
const APP_FILES = ["./", "./index.html", "./styles.css?v=5", "./app.js?v=5", "./manifest.json", "./icon.svg", "./assets/class-archer-woman.jpg", "./assets/class-archer-man.jpg", "./assets/class-explorer-woman.jpg", "./assets/class-explorer-man.jpg", "./assets/class-alchemist-woman.jpg", "./assets/class-alchemist-man.jpg", "./assets/workout-push.jpg", "./assets/workout-pull.jpg", "./assets/workout-legs.jpg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
