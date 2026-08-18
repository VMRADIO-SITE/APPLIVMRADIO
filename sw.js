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

self.addEventListener("push", event => {
  console.log("VM RADIO FCM PUSH EVENT", event.data ? event.data.text() : "<no payload>");
});

messaging.onBackgroundMessage(payload => {
  console.log("VM RADIO FCM BACKGROUND MESSAGE", payload);
  if (payload && payload.notification) return;
  const data = payload?.data || {};
  const title = data.title || "VM RADIO";
  const body = data.body || "Une nouvelle information est disponible.";
  const link = data.url || data.link || data.click_action || "./";
  const icon = data.icon || "./vmradio-app-icon-192.png";
  const tag = data.tag || "vm-radio";
  self.registration.showNotification(title, { body, icon, badge: icon, tag, data: { url: link } });
});

// v16 : cache séparé pour forcer l'activation des nouvelles versions de l'application.
const CACHE_NAME = "vm-radio-app-v16";
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
  "./notifications.js",
  "./fcm-token-test.js",
  "./fcm-token-sync.js"
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
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const fcmMessage = notificationData.FCM_MSG || notificationData.fcmMessage || {};
  const fcmOptions = fcmMessage.notification?.click_action ? { link: fcmMessage.notification.click_action } : (fcmMessage.fcmOptions || {});
  const targetUrl = notificationData.url || notificationData.link || fcmOptions.link || fcmOptions.click_action || "./";
  const absoluteTarget = new URL(targetUrl, self.location.href).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ("focus" in client) {
          if ("navigate" in client) client.navigate(absoluteTarget);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(absoluteTarget);
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
              injected = injected.replace(/<\/body>/i, '<script type="module" src="./notifications.js?v=vm20"></script></body>');
            }
            if (!injected.includes("./fcm-token-test.js")) {
              injected = injected.replace(/<\/body>/i, '<script src="./fcm-token-test.js?v=vm2"></script></body>');
            }
            if (!injected.includes("./fcm-token-sync.js")) {
              injected = injected.replace(/<\/body>/i, '<script type="module" src="./fcm-token-sync.js?v=1"></script></body>');
            }

            // Correctif flux : reconnexion automatique en cas de décrochage du direct.
            if (!injected.includes("vm-radio-audio-recovery")) {
              injected = injected.replace(/<\/body>/i, `<script id="vm-radio-audio-recovery">(function(){\nconst a=document.getElementById("audio");\nif(!a||a.dataset.vmRecoveryBound)return;\na.dataset.vmRecoveryBound="1";\nconst STREAM="https://play.radioking.io/vm-radio2";\nlet wanted=false,retries=0,timer=0,stallTimer=0;\nfunction play(){if(!wanted)return;clearTimeout(timer);timer=setTimeout(()=>a.play().catch(()=>{}),250);}\nfunction recover(reason){if(!wanted)return;retries=Math.min(retries+1,8);const delay=Math.min(12000,700*Math.pow(1.55,retries-1));clearTimeout(timer);timer=setTimeout(()=>{if(!wanted)return;a.pause();a.src=STREAM+"?vm_retry="+Date.now();a.load();a.play().catch(()=>{});},delay);console.warn("VM RADIO flux audio : reconnexion",reason,"tentative",retries);}\na.addEventListener("play",()=>{wanted=true;retries=0;clearTimeout(stallTimer);});\na.addEventListener("pause",()=>{wanted=false;clearTimeout(timer);clearTimeout(stallTimer);});\na.addEventListener("error",()=>recover("error"));\na.addEventListener("stalled",()=>{clearTimeout(stallTimer);stallTimer=setTimeout(()=>recover("stalled"),7000);});\na.addEventListener("waiting",()=>{clearTimeout(stallTimer);stallTimer=setTimeout(()=>recover("waiting"),8000);});\na.addEventListener("playing",()=>{retries=0;clearTimeout(stallTimer);});\na.addEventListener("canplay",()=>{clearTimeout(stallTimer);});\n})();</script></body>`);
            }

            // Mise à jour automatique : vérifie régulièrement le Service Worker et recharge seulement lorsqu'une nouvelle version prend le contrôle.
            if (!injected.includes("vm-radio-auto-update")) {
              injected = injected.replace(/<\/body>/i, `<script id="vm-radio-auto-update">(function(){\nif(!("serviceWorker" in navigator))return;\nconst hadController=!!navigator.serviceWorker.controller;\nlet reloading=false;\nnavigator.serviceWorker.addEventListener("controllerchange",function(){if(hadController&&!reloading){reloading=true;location.reload();}});\nnavigator.serviceWorker.ready.then(reg=>{\n  const check=()=>reg.update().catch(()=>{});\n  check();\n  setInterval(check,300000);\n  reg.addEventListener("updatefound",function(){const w=reg.installing;if(!w)return;w.addEventListener("statechange",function(){if(w.state==="installed"&&navigator.serviceWorker.controller){w.postMessage({type:"SKIP_WAITING"});}});});\n});\n})();</script></body>`);
            }

            const headers = new Headers(response.headers);
            headers.delete("content-length");
            return new Response(injected, { status: response.status, statusText: response.statusText, headers });
          }
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
