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

function createNotificationCard() {
  if (document.getElementById("vm-notifications-card")) return document.getElementById("vm-notifications-card");
  const card = document.createElement("section");
  card.id = "vm-notifications-card";
  card.innerHTML = `
    <div class="vm-notification-row">
      <div class="vm-notification-icon">🔔</div>
      <div class="vm-notification-copy">
        <strong>Notifications VM RADIO</strong>
        <small id="vm-notifications-status">Active les notifications pour recevoir les infos, nouveaux titres et mises à jour.</small>
      </div>
    </div>
    <button id="vm-notifications-button" type="button">Activer les notifications</button>`;
  return card;
}

const style = document.createElement("style");
style.textContent = `
#vm-notifications-card{margin:22px auto 0;width:min(92%,420px);padding:14px;border:1px solid rgba(184,92,255,.45);border-radius:18px;background:linear-gradient(145deg,rgba(35,17,51,.98),rgba(13,9,19,.98));box-shadow:0 8px 24px rgba(0,0,0,.25);color:#fff;text-align:left}
#vm-notifications-card .vm-notification-row{display:flex;align-items:center;gap:11px}
#vm-notifications-card .vm-notification-icon{width:40px;height:40px;flex:0 0 40px;border-radius:13px;display:grid;place-items:center;background:#28143a;font-size:20px}
#vm-notifications-card .vm-notification-copy{min-width:0;flex:1}
#vm-notifications-card strong{display:block;font-size:13px}
#vm-notifications-card small{display:block;margin-top:3px;color:#aaa5b4;font-size:9px;line-height:1.35}
#vm-notifications-button{width:100%;margin-top:11px;border:0;border-radius:12px;padding:11px;background:linear-gradient(135deg,#c05cff,#7433dd);color:#fff;font-weight:800;font-size:11px;cursor:pointer}
#vm-notifications-button:disabled{opacity:.6}
`;
document.head.appendChild(style);

function findWelcomePopup(){
  const s = document.getElementById("vmWelcomeSplash");
  if (s && getComputedStyle(s).display !== "none" && !s.classList.contains("vmWelcomeHide")) return s;
  return null;
}

function mountNotificationUI(){
  if (document.getElementById("vm-notifications-card")) return;
  const card = createNotificationCard();
  const popup = findWelcomePopup();
  if (popup) {
    const title = popup.querySelector(".vmWelcomeTitle");
    if (title && title.parentNode) title.insertAdjacentElement("afterend", card);
    else popup.querySelector(".vmWelcomeCard")?.appendChild(card);
    return;
  }
  const target = document.querySelector(".home-content") || document.querySelector(".app") || document.body;
  target.prepend(card);
}

async function activateNotifications(btn, stat){
  try{
    btn.disabled = true;
    stat.textContent = "Activation des notifications…";
    if (!("Notification" in window) || !("serviceWorker" in navigator)) throw new Error("Notifications non disponibles");

    const permission = await Notification.requestPermission();
    if(permission !== "granted"){
      stat.textContent = "Les notifications n’ont pas été autorisées.";
      btn.disabled = false;
      return;
    }

    stat.textContent = "Connexion au service de notifications…";
    const [{initializeApp},{getMessaging,getToken,onMessage}] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging.js")
    ]);

    const app = initializeApp(firebaseConfig,"vmRadioNotifications");
    const messaging = getMessaging(app);
    const registration = await navigator.serviceWorker.register("./sw.js",{scope:"./"});
    onMessage(messaging,payload=>{
      const n=payload.notification||{};
      if(Notification.permission==="granted" && document.visibilityState==="visible"){
        new Notification(n.title||"VM RADIO",{body:n.body||"Nouvelle information disponible.",icon:n.icon||"./vmradio-app-icon-192.png"});
      }
    });
    const token=await getToken(messaging,{vapidKey:VAPID_KEY,serviceWorkerRegistration:registration});
    if(!token) throw new Error("Token FCM indisponible");
    localStorage.setItem("vmRadioFcmToken",token);
    btn.textContent="Notifications activées ✓";
    stat.textContent="C’est activé ! Tu recevras les infos, titres et mises à jour VM RADIO.";
    btn.disabled=false;
  }catch(error){
    console.error("VM RADIO notifications:",error);
    stat.textContent="Impossible d’activer les notifications pour le moment.";
    btn.disabled=false;
  }
}

function bindButton(){
  const btn=document.getElementById("vm-notifications-button");
  const stat=document.getElementById("vm-notifications-status");
  if(!btn || btn.dataset.vmBound==="1") return;
  btn.dataset.vmBound="1";
  if("Notification" in window && Notification.permission==="granted"){
    btn.textContent="Notifications activées ✓";
    stat.textContent="Tu recevras les informations importantes de VM RADIO.";
  }
  btn.addEventListener("click",()=>activateNotifications(btn,stat));
}

function setupNotifications(){
  mountNotificationUI();
  bindButton();
  const observer=new MutationObserver(()=>{mountNotificationUI();bindButton();});
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","style"]});
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",setupNotifications,{once:true});
else setupNotifications();
