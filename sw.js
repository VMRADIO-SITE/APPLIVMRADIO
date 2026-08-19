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

// v21 : blocage du zoom tactile sur l'application mobile.
const CACHE_NAME = "vm-radio-app-v21";
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
  "./fcm-token-sync.js",
  "./audio-recovery.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
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

  if (notificationData.type === "vm-radio-update") {
    event.waitUntil(
      self.registration.update().catch(() => {}).then(() => {
        if (self.registration.waiting) self.registration.waiting.postMessage({ type: "SKIP_WAITING" });
        return clients.matchAll({ type: "window", includeUncontrolled: true });
      }).then(windowClients => {
        for (const client of windowClients) if ("focus" in client) return client.focus();
        if (clients.openWindow) return clients.openWindow("./");
      })
    );
    return;
  }

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
    fetch(event.request, { cache: "no-store" }).then(async response => {
      if (!response || !response.ok) return response;

      if (url.pathname.endsWith("/index.html") || url.pathname === "/") {
        const type = response.headers.get("content-type") || "";
        if (type.includes("text/html")) {
          const html = await response.text();
          let injected = html;

          // Verrouillage du zoom tactile : pas de pincement ni double-tap pour redimensionner l'application.
          injected = injected.replace(/<meta[^>]+name=["']viewport["'][^>]*>/i, '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">');
          if (!injected.includes("vm-radio-no-pinch-zoom")) {
            injected = injected.replace(/<\/head>/i, '<style id="vm-radio-no-pinch-zoom">html,body{touch-action:pan-x pan-y;overscroll-behavior-x:none}body{-webkit-text-size-adjust:100%}button,a,input,select,textarea{touch-action:manipulation}</style></head>');
          }

          if (!injected.includes("./notifications.js")) injected = injected.replace(/<\/body>/i, '<script type="module" src="./notifications.js?v=vm21"></script></body>');
          if (!injected.includes("./fcm-token-sync.js")) injected = injected.replace(/<\/body>/i, '<script type="module" src="./fcm-token-sync.js?v=1"></script></body>');
          if (!injected.includes("./audio-recovery.js")) injected = injected.replace(/<\/body>/i, '<script src="./audio-recovery.js?v=2"></script></body>');

          if (!injected.includes("vm-radio-audio-recovery")) {
            injected = injected.replace(/<\/body>/i, `<script id="vm-radio-audio-recovery">(function(){
const a=document.getElementById("audio");
if(!a||a.dataset.vmRecoveryBound)return;
a.dataset.vmRecoveryBound="1";
const STREAM="https://play.radioking.io/vm-radio2";
let wanted=false,retries=0,timer=0,stallTimer=0;
function recover(reason){if(!wanted)return;retries=Math.min(retries+1,8);const delay=Math.min(12000,700*Math.pow(1.55,retries-1));clearTimeout(timer);timer=setTimeout(()=>{if(!wanted)return;a.pause();a.src=STREAM+"?vm_retry="+Date.now();a.load();a.play().catch(()=>{});},delay);console.warn("VM RADIO flux audio : reconnexion",reason,"tentative",retries);}
a.addEventListener("play",()=>{wanted=true;retries=0;clearTimeout(stallTimer);});
a.addEventListener("pause",()=>{wanted=false;clearTimeout(timer);clearTimeout(stallTimer);});
a.addEventListener("error",()=>recover("error"));
a.addEventListener("stalled",()=>{clearTimeout(stallTimer);stallTimer=setTimeout(()=>recover("stalled"),7000);});
a.addEventListener("waiting",()=>{clearTimeout(stallTimer);stallTimer=setTimeout(()=>recover("waiting"),8000);});
a.addEventListener("playing",()=>{retries=0;clearTimeout(stallTimer);});
a.addEventListener("canplay",()=>clearTimeout(stallTimer));
})();</script></body>`);
          }

          if (!injected.includes("vm-radio-auto-update")) {
            injected = injected.replace(/<\/body>/i, `<script id="vm-radio-auto-update">(function(){
if(!("serviceWorker" in navigator))return;
let reloading=false,updatePending=false;
async function showUpdate(reg){
if(updatePending)return;updatePending=true;
if("Notification" in window&&Notification.permission==="granted"){try{await reg.showNotification("🔔 Mise à jour disponible",{body:"Une nouvelle version de VM RADIO est disponible.",icon:"./vmradio-app-icon-192.png",badge:"./vmradio-app-icon-192.png",tag:"vm-radio-update",renotify:true,data:{type:"vm-radio-update"},actions:[{action:"update",title:"Mettre à jour"},{action:"later",title:"Plus tard"}]});}catch(e){console.warn("Notification de mise à jour indisponible",e);}}
const n=document.createElement("div");n.id="vm-radio-update-notice";n.setAttribute("role","status");n.innerHTML='<div class="vm-update-card"><div class="vm-update-title">🔔 Nouvelle mise à jour</div><div class="vm-update-text">Une nouvelle version de VM RADIO est disponible.</div><div class="vm-update-actions"><button id="vm-update-now">Mettre à jour</button><button id="vm-update-later">Plus tard</button></div></div>';
const s=document.createElement("style");s.textContent='#vm-radio-update-notice{position:fixed;inset:auto 16px 16px;z-index:2147483646;display:flex;justify-content:center;font-family:Arial,Helvetica,sans-serif}.vm-update-card{width:min(100%,520px);padding:22px;border:2px solid #b85cff;border-radius:24px;background:linear-gradient(145deg,#050308,#0d0714);box-shadow:0 0 30px rgba(151,48,255,.5);color:#fff}.vm-update-title{font-size:22px;font-weight:900}.vm-update-text{margin:10px 0 18px;color:#d4ceda;line-height:1.4}.vm-update-actions{display:flex;gap:10px}.vm-update-actions button{flex:1;border-radius:14px;padding:13px;border:0;font-weight:800;cursor:pointer}.vm-update-actions button:first-child{background:linear-gradient(135deg,#c05cff,#6d20ed);color:#fff}.vm-update-actions button:last-child{background:#120d18;color:#fff;border:1px solid #8b2cff}';document.head.appendChild(s);document.body.appendChild(n);
n.querySelector("#vm-update-later").onclick=()=>n.remove();
n.querySelector("#vm-update-now").onclick=async()=>{n.remove();try{if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});else{await reg.update();if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});}}catch(e){location.reload();}};
}
navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!reloading){reloading=true;location.reload();}});
navigator.serviceWorker.ready.then(reg=>{const check=()=>reg.update().catch(()=>{});check();setInterval(check,300000);reg.addEventListener("updatefound",()=>{const w=reg.installing;if(!w)return;w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller)showUpdate(reg);});});});
})();</script></body>`);
          }

          const headers = new Headers(response.headers);
          headers.delete("content-length");
          return new Response(injected, { status: response.status, statusText: response.statusText, headers });
        }
      }

      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
