const CACHE_NAME = "egerak-ptis-kbb-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/css/style.css",
  "/assets/images/logo-ptis.png",
  "/assets/images/icon-192.png",
  "/assets/images/icon-512.png",
  "/assets/images/apple-touch-icon.png"
];


/* =========================================
   INSTALL
========================================= */

self.addEventListener("install", (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL);
      })
  );

  self.skipWaiting();

});


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.keys().then((cacheNames) => {

      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );

    })
  );

  self.clients.claim();

});


/* =========================================
   FETCH
========================================= */

self.addEventListener("fetch", (event) => {

  // Hanya proses GET request
  if (event.request.method !== "GET") {
    return;
  }

  // Jangan cache request luar domain
  const requestURL = new URL(event.request.url);

  if (requestURL.origin !== self.location.origin) {
    return;
  }

  event.respondWith(

    fetch(event.request)
      .then((response) => {

        // Simpan salinan resource yang berjaya
        if (response && response.status === 200) {

          const responseClone = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });

        }

        return response;

      })
      .catch(() => {

        return caches.match(event.request)
          .then((cachedResponse) => {

            if (cachedResponse) {
              return cachedResponse;
            }

            // Jika pengguna offline dan membuka halaman
            if (event.request.mode === "navigate") {
              return caches.match("/index.html");
            }

          });

      })

  );

});