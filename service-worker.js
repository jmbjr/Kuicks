const CACHE_NAME = "kuicks-all-player-summary-v13";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/tokens.css?v=13",
  "./css/app.css?v=13",
  "./js/config.js",
  "./js/app.js?v=13",
  "./js/ui/all-player-summary.js",
  "./js/ui/play-surface.js",
  "./js/cpu/choose-action.js",
  "./js/cpu/run-game.js",
  "./js/game/random.js",
  "./js/rules/model.js",
  "./js/rules/legal-actions.js",
  "./js/rules/scoring.js",
  "./js/rules/transition.js",
  "./assets/icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
