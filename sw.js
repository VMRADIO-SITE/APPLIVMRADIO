importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyB0LSbKdAAEfLg48c4DJO2hdyvjx0TySko",
  authDomain: "vm-radio-notifications.firebaseapp.com",
  projectId: "vm-radio-notifications",
  storageBucket: "vm-radio-notifications.firebasestorage.app",
  messagingSenderId: "573483400068",
  appId: "1:573483400068:web:5e3b80a9ac49dc284ebbd1",
  measurementId: "G-ZJPS49DKG3"
};

firebase.initializeApp(firebaseConfig);
firebase.messaging();

/*
  IMPORTANT : aucune notification n'est créée manuellement ici.
  Pour les messages envoyés depuis Firebase Console avec un payload
  "notification", Firebase Messaging s'occupe lui-même de l'affichage
  en arrière-plan. Ajouter showNotification() ici provoquerait des doublons.
*/

const CACHE_NAME = "vm-radio-app-v11";
const APP_SHELL = [
  "./",
  "./index.html",
  "./dedicaces.html",
  "./infos.html",
  "./tiktok.html",
  "./conditions.html",
  "./vm-radio-home-logo.png",
  "./vmradio-app-icon-192.png",
  "./vmradio-app-icon-512.png",
  "./manifest.webmanifest",
  "./notifications.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : "./";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ("focus" in client) {
          if ("navigate" in client) client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith("/telecharger.html")) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  if (/radio|stream|audio/i.test(url.pathname)) return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then(async response => {
        if (!response || !response.ok) return response;

        if (url.pathname.endsWith("/index.html") || url.pathname === "/") {
          const type = response.headers.get("content-type") || "";
          if (type.includes("text/html")) {
            const html = await response.text();
            let injected = html;

            if (!injected.includes("./notifications.js")) {
              injected = injected.replace(
                /<\/body>/i,
                '<script type="module" src="./notifications.js?v=vm11"></script></body>'
              );
            }

            const headers = new Headers(response.headers);
            headers.delete("content-length");
            return new Response(injected, {
              status: response.status,
              statusText: response.statusText,
              headers
            });
          }
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
