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
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = data.title || notification.title || "VM RADIO";
  const body = data.body || notification.body || "Une nouvelle information est disponible.";
  const url = data.url || notification.click_action || "./";

  return self.registration.showNotification(title, {
    body,
    icon: data.icon || notification.icon || "./vmradio-app-icon-192.png",
    badge: data.badge || notification.badge || "./vmradio-app-icon-192.png",
    tag: data.tag || "vm-radio",
    renotify: true,
    data: { url }
  });
});

const CACHE_NAME = "vm-radio-app-v9";
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

self.addEventListener("push", event => {
  if (event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch (_) {
      data = { body: event.data.text() };
    }

    if (!data.from || data.from !== "firebase") {
      const title = data.title || "VM RADIO";
      event.waitUntil(self.registration.showNotification(title, {
        body: data.body || "Une nouvelle information est disponible.",
        icon: data.icon || "./vmradio-app-icon-192.png",
        badge: data.badge || "./vmradio-app-icon-192.png",
        tag: data.tag || "vm-radio",
        renotify: true,
        data: { url: data.url || "./" }
      }));
    }
  }
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

            /*
              Le nouveau popup est géré exclusivement par notifications.js.
              L'ancien bloc "Notifications VM RADIO" n'est plus injecté ici.
              Cela évite qu'un ancien modèle apparaisse puis disparaisse.
            */
            if (!injected.includes("./notifications.js")) {
              injected = injected.replace(
                /<\/body>/i,
                '<script type="module" src="./notifications.js?v=vm9"></script></body>'
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
