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

const notificationMarkup = `
  <div class="vm-notification-row">
    <div class="vm-notification-icon">🔔</div>
    <div class="vm-notification-copy">
      <strong>Notifications VM RADIO</strong>
      <small id="vm-notifications-status">Active les notifications pour recevoir les infos, nouveaux titres et mises à jour.</small>
    </div>
  </div>
  <button id="vm-notifications-button" type="button">Activer les notifications</button>
`;

const notificationStyle = document.createElement("style");
notificationStyle.id = "vm-notifications-style";
notificationStyle.textContent = `
  #vm-notifications-card{
    margin:12px 0 0;padding:13px;border:1px solid rgba(184,92,255,.45);
    border-radius:16px;background:linear-gradient(145deg,rgba(35,17,51,.96),rgba(13,9,19,.98));
    box-shadow:0 8px 24px rgba(0,0,0,.2);color:#fff;text-align:left;
  }
  #vm-notifications-card .vm-notification-row{display:flex;align-items:center;gap:10px}
  #vm-notifications-card .vm-notification-icon{width:38px;height:38px;flex:0 0 38px;border-radius:12px;display:grid;place-items:center;background:#28143a;font-size:19px}
  #vm-notifications-card .vm-notification-copy{min-width:0;flex:1}
  #vm-notifications-card strong{display:block;font-size:13px}
  #vm-notifications-card small{display:block;margin-top:3px;color:#aaa5b4;font-size:9px;line-height:1.35}
  #vm-notifications-button{width:100%;margin-top:10px;border:0;border-radius:11px;padding:10px;background:linear-gradient(135deg,#c05cff,#7433dd);color:#fff;font-weight:800;font-size:11px;cursor:pointer}
  #vm-notifications-button:disabled{opacity:.55;cursor:default}
`;

document.head.appendChild(notificationStyle);

function isVisible(el) {
  if (!el) return false;
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && parseFloat(style.opacity || "1") > 0 && rect.width > 0 && rect.height > 0;
}

function findWelcomePopup() {
  const selectors = [
    '[role="dialog"]',
    '.modal', '[class*="modal"]', '[id*="modal"]',
    '.popup', '[class*="popup"]', '[id*="popup"]',
    '[class*="welcome"]', '[id*="welcome"]'
  ];

  const candidates = [...new Set(selectors.flatMap(selector => [...document.querySelectorAll(selector)]))]
    .filter(isVisible)
    .filter(el => {
      const text = (el.innerText || el.textContent || "").toLowerCase();
      return /bienvenue|welcome|vm radio|commencer|démarrer|ouvrir/.test(text);
    })
    .sort((a,b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height);

  return candidates[0] || null;
}

function createNotificationCard() {
  if (document.getElementById("vm-notifications-card")) return document.getElementById("vm-notifications-card");

  const card = document.createElement("section");
  card.id = "vm-notifications-card";
  card.innerHTML = notificationMarkup;
  return card;
}

function mountNotificationUI() {
  if (document.getElementById("vm-notifications-card")) return document.getElementById("vm-notifications-card");

  const card = createNotificationCard();
  const popup = findWelcomePopup();

  if (popup) {
    // Le bouton est placé directement dans le pop-up de bienvenue, sans remplacer son contenu.
    const container = popup.querySelector(".modal-content,.popup-content,[class*="content"],.dialog-content") || popup;
    container.appendChild(card);
    return card;
  }

  // Si le pop-up n'est pas encore ouvert, on le remontera automatiquement lorsqu'il apparaîtra.
  return null;
}

async function setupNotifications() {
  let card = mountNotificationUI();

  const observer = new MutationObserver(() => {
    if (!document.getElementById("vm-notifications-card")) {
      card = mountNotificationUI() || card;
    }
    if (document.getElementById("vm-notifications-card")) observer.disconnect();
  });
  observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class","style","aria-hidden"] });

  // Sécurité : si aucun pop-up de bienvenue n'existe dans cette version de l'appli,
  // le module reste accessible sur l'accueil au lieu de disparaître complètement.
  setTimeout(() => {
    if (!document.getElementById("vm-notifications-card")) {
      const fallback = createNotificationCard();
      const target = document.querySelector(".home-content") || document.querySelector(".app") || document.body;
      target.prepend(fallback);
      observer.disconnect();
    }
  }, 8000);

  try {
    const supported = await isSupported();
    const button = () => document.getElementById("vm-notifications-button");
    const status = () => document.getElementById("vm-notifications-status");

    if (!supported || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setTimeout(() => {
        if (status()) status().textContent = "Les notifications ne sont pas disponibles sur ce navigateur/appareil.";
        if (button()) { button().disabled = true; button().style.opacity = ".5"; }
      }, 50);
      return;
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

    const attachButton = () => {
      const btn = button();
      const stat = status();
      if (!btn || btn.dataset.vmBound === "1") return;
      btn.dataset.vmBound = "1";

      if (Notification.permission === "granted") {
        btn.textContent = "Notifications activées ✓";
        stat.textContent = "Tu recevras les informations importantes de VM RADIO.";
      }

      btn.addEventListener("click", async () => {
        try {
          btn.disabled = true;
          stat.textContent = "Activation des notifications…";

          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            stat.textContent = "Les notifications n’ont pas été autorisées.";
            btn.disabled = false;
            return;
          }

          const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (!token) throw new Error("Token FCM indisponible");

          localStorage.setItem("vmRadioFcmToken", token);
          btn.textContent = "Notifications activées ✓";
          stat.textContent = "C’est activé ! Tu recevras les infos, titres et mises à jour VM RADIO.";
          btn.disabled = false;
        } catch (error) {
          console.error("VM RADIO notifications:", error);
          stat.textContent = "Impossible d’activer les notifications pour le moment.";
          btn.disabled = false;
        }
      });
    };

    // Le bouton peut être créé quelques instants après l'ouverture du pop-up.
    const binder = setInterval(() => {
      attachButton();
      if (document.getElementById("vm-notifications-button")?.dataset.vmBound === "1") clearInterval(binder);
    }, 250);
    setTimeout(() => clearInterval(binder), 10000);
  } catch (error) {
    console.error("VM RADIO notifications init:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupNotifications, { once: true });
} else {
  setupNotifications();
}
