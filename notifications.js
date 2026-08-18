import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0LSbKdAAEfLg48c4DJO2hdyvjx0TySko",
  authDomain: "vm-radio-notifications.firebaseapp.com",
  projectId: "vm-radio-notifications",
  storageBucket: "vm-radio-notifications.firebasestorage.app",
  messagingSenderId: "573483400068",
  appId: "1:573483400068:web:5e3b80a9ac49dc284ebbd1",
  measurementId: "G-ZJPS49DKG3"
};

const VAPID_KEY = "BNJ2HTuiALjnhLqWHI9RmK6PJsXVmrizzennfo_anzDJBBXgEdXzZy70hIpQao-hxRtylbSsquww8p05uRk1Sgk";

function createNotificationUI() {
  if (document.getElementById("vm-notifications-card")) return;

  const card = document.createElement("section");
  card.id = "vm-notifications-card";
  card.style.cssText = [
    "margin:16px 0;padding:15px;border:1px solid rgba(184,92,255,.45)",
    "border-radius:18px;background:linear-gradient(145deg,rgba(35,17,51,.95),rgba(13,9,19,.98))",
    "box-shadow:0 8px 24px rgba(0,0,0,.2);color:#fff"
  ].join(";");

  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#28143a;font-size:21px">🔔</div>
      <div style="min-width:0;flex:1">
        <strong style="display:block;font-size:14px">Notifications VM RADIO</strong>
        <small id="vm-notifications-status" style="display:block;margin-top:4px;color:#aaa5b4;font-size:10px">Active les notifications pour recevoir les infos, nouveaux titres et mises à jour.</small>
      </div>
    </div>
    <button id="vm-notifications-button" type="button" style="width:100%;margin-top:12px;border:0;border-radius:12px;padding:11px;background:linear-gradient(135deg,#c05cff,#7433dd);color:#fff;font-weight:800;font-size:11px;cursor:pointer">Activer les notifications</button>
  `;

  const target = document.querySelector(".home-content") || document.querySelector(".app") || document.body;
  target.prepend(card);

  return card;
}

async function setupNotifications() {
  const card = createNotificationUI();
  if (!card) return;

  const button = document.getElementById("vm-notifications-button");
  const status = document.getElementById("vm-notifications-status");

  try {
    const supported = await isSupported();
    if (!supported || !("Notification" in window) || !("serviceWorker" in navigator)) {
      status.textContent = "Les notifications ne sont pas disponibles sur ce navigateur/appareil.";
      button.disabled = true;
      button.style.opacity = ".5";
      return;
    }

    if (Notification.permission === "granted") {
      button.textContent = "Notifications activées ✓";
      status.textContent = "Tu recevras les informations importantes de VM RADIO.";
    }

    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });

    onMessage(messaging, payload => {
      const notification = payload.notification || {};
      if (Notification.permission === "granted" && document.visibilityState === "visible") {
        new Notification(notification.title || "VM RADIO", {
          body: notification.body || "Nouvelle information disponible.",
          icon: notification.icon || "./vmradio-app-icon-192.png"
        });
      }
    });

    button.addEventListener("click", async () => {
      try {
        button.disabled = true;
        status.textContent = "Activation des notifications…";

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          status.textContent = "Les notifications n’ont pas été autorisées.";
          button.disabled = false;
          return;
        }

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (!token) throw new Error("Token FCM indisponible");

        localStorage.setItem("vmRadioFcmToken", token);
        button.textContent = "Notifications activées ✓";
        status.textContent = "C’est activé ! Tu recevras les infos, titres et mises à jour VM RADIO.";
        button.disabled = false;
      } catch (error) {
        console.error("VM RADIO notifications:", error);
        status.textContent = "Impossible d’activer les notifications pour le moment.";
        button.disabled = false;
      }
    });
  } catch (error) {
    console.error("VM RADIO notifications init:", error);
    status.textContent = "Le système de notifications n’est pas encore disponible.";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupNotifications, { once: true });
} else {
  setupNotifications();
}
