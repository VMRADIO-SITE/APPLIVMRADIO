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
const NOTICE_KEY = "vmRadioNotificationPromptShownV2";

/* Supprime l'ancien petit bloc injecté par l'ancien système de notifications. */
function removeLegacyNotificationCard(){
  document.querySelectorAll("#vm-notifications-card").forEach(el=>el.remove());
}
removeLegacyNotificationCard();

const style = document.createElement("style");
style.textContent = `
#vm-notification-overlay{position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,.82);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .25s ease,visibility .25s ease;font-family:Arial,Helvetica,sans-serif}
#vm-notification-overlay.vm-show{opacity:1;visibility:visible;pointer-events:auto}
#vm-notification-prompt{position:relative;width:min(100%,1360px);max-height:calc(100vh - 36px);overflow:auto;padding:54px 60px 52px;border:2px solid #b85cff;border-radius:34px;background:linear-gradient(145deg,#050308 0%,#0d0714 55%,#050308 100%);box-shadow:0 0 38px rgba(151,48,255,.55),inset 0 0 34px rgba(151,48,255,.07);color:#fff;box-sizing:border-box}
#vm-notification-prompt:before{content:"";position:absolute;inset:-2px;border-radius:34px;pointer-events:none;box-shadow:0 0 18px rgba(184,92,255,.9);opacity:.78}
#vm-notification-prompt .vm-notification-layout{display:grid;grid-template-columns:minmax(430px,46%) 1fr;gap:58px;align-items:center}
#vm-notification-prompt .vm-logo-placeholder{min-height:420px;border:2px solid #9c3dff;border-radius:34px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,rgba(113,32,198,.22),rgba(0,0,0,.6) 68%);box-shadow:0 0 24px rgba(157,61,255,.45);overflow:hidden}
#vm-notification-prompt .vm-logo-placeholder img{width:92%;max-height:390px;object-fit:contain;border-radius:18px}
#vm-notification-prompt h2{margin:0;font-size:clamp(50px,5.6vw,92px);line-height:.98;font-weight:900;letter-spacing:-2px}
#vm-notification-prompt h2 span{color:#7e22ff;text-shadow:0 0 18px rgba(139,44,255,.55)}
#vm-notification-prompt .vm-line{height:3px;margin:30px 0 34px;background:linear-gradient(90deg,#8b2cff 0%,#8b2cff 48%,rgba(139,44,255,0) 100%);box-shadow:0 0 8px rgba(139,44,255,.6)}
#vm-notification-prompt .vm-text{margin:0;color:#d4ceda;font-size:clamp(22px,2vw,34px);line-height:1.42}
#vm-notification-prompt .vm-text span{color:#9c35ff}
#vm-notification-prompt .vm-notification-actions{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:44px;padding:0 10px}
#vm-notification-prompt button.vm-choice{border-radius:24px;padding:20px 24px;color:#fff;font-weight:800;font-size:clamp(22px,2vw,32px);cursor:pointer;min-height:100px;display:flex;align-items:center;justify-content:center;gap:22px}
#vm-notification-accept{border:0;background:linear-gradient(135deg,#c05cff 0%,#6d20ed 100%);box-shadow:0 0 28px rgba(145,45,255,.5)}
#vm-notification-later{background:rgba(5,3,9,.86);border:2px solid rgba(176,74,255,.58)}
#vm-notification-prompt button.vm-choice:disabled{opacity:.55;cursor:wait}
.vm-notification-icon-svg{width:42px;height:42px;display:block;flex:0 0 42px}
@media(max-width:800px){
  #vm-notification-overlay{padding:10px}
  #vm-notification-prompt{padding:30px 22px 26px;border-radius:26px;max-height:calc(100vh - 20px)}
  #vm-notification-prompt .vm-notification-layout{grid-template-columns:1fr;gap:22px}
  #vm-notification-prompt .vm-logo-placeholder{min-height:230px;border-radius:25px}
  #vm-notification-prompt .vm-logo-placeholder img{max-height:215px}
  #vm-notification-prompt h2{font-size:clamp(38px,12vw,62px)}
  #vm-notification-prompt .vm-line{margin:18px 0 20px}
  #vm-notification-prompt .vm-text{font-size:clamp(17px,5vw,23px)}
  #vm-notification-prompt .vm-notification-actions{grid-template-columns:1fr 1fr;gap:10px;margin-top:28px;padding:0}
  #vm-notification-prompt button.vm-choice{min-height:68px;padding:12px 8px;border-radius:17px;font-size:clamp(15px,4vw,19px);gap:9px}
  .vm-notification-icon-svg{width:28px;height:28px;flex-basis:28px}
}
@media(max-width:430px){
  #vm-notification-prompt .vm-logo-placeholder{min-height:180px}
  #vm-notification-prompt .vm-logo-placeholder img{max-height:165px}
  #vm-notification-prompt .vm-notification-actions{grid-template-columns:1fr 1fr}
}
`;
document.head.appendChild(style);

const clockIcon=`<svg class="vm-notification-icon-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="25" stroke="currentColor" stroke-width="4"/><path d="M32 17v16l10 7" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bellIcon=`<svg class="vm-notification-icon-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M18 28c0-9 6-15 14-15s14 6 14 15v10l6 8H12l6-8V28Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M26 51c1 4 3 6 6 6s5-2 6-6" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;

function createPrompt(){
  if(document.getElementById("vm-notification-overlay")) return document.getElementById("vm-notification-overlay");
  const overlay=document.createElement("div");
  overlay.id="vm-notification-overlay";
  overlay.innerHTML=`
    <section id="vm-notification-prompt" role="dialog" aria-modal="true" aria-label="Notifications VM RADIO">
      <div class="vm-notification-layout">
        <div class="vm-logo-placeholder">
          <img src="./vmradio-app-logo.jpg" alt="VM RADIO" onerror="this.style.display='none'">
        </div>
        <div>
          <h2>Restez<br><span>informé</span> !</h2>
          <div class="vm-line"></div>
          <p class="vm-text">Activez les notifications pour ne rien manquer de nos <span>nouveautés</span>, <span>informations</span> et <span>mises à jour</span> sur <span>VM Radio</span>.</p>
        </div>
      </div>
      <div class="vm-notification-actions">
        <button class="vm-choice" id="vm-notification-later" type="button">${clockIcon}<span>Plus tard</span></button>
        <button class="vm-choice" id="vm-notification-accept" type="button">${bellIcon}<span>Activer</span></button>
      </div>
    </section>`;
  document.body.appendChild(overlay);
  return overlay;
}

function closePrompt(){
  const overlay=document.getElementById("vm-notification-overlay");
  if(!overlay)return;
  overlay.classList.remove("vm-show");
  setTimeout(()=>overlay.remove(),250);
}

function chooseLater(){
  localStorage.setItem(NOTICE_KEY,"1");
  closePrompt();
}

async function activateNotifications(btn){
  try{
    btn.disabled=true;
    btn.querySelector("span").textContent="Activation…";
    if(!( "Notification" in window) || !("serviceWorker" in navigator)) throw new Error("Notifications non disponibles");
    const permission=await Notification.requestPermission();
    if(permission!=="granted"){
      chooseLater();
      return;
    }
    const [{initializeApp},{getMessaging,getToken,onMessage}]=await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging.js")
    ]);
    const app=initializeApp(firebaseConfig,"vmRadioNotifications");
    const messaging=getMessaging(app);
    const registration=await navigator.serviceWorker.register("./sw.js",{scope:"./"});
    onMessage(messaging,payload=>{
      const n=payload.notification||{};
      if(Notification.permission==="granted"&&document.visibilityState==="visible"){
        new Notification(n.title||"VM RADIO",{body:n.body||"Nouvelle information disponible.",icon:n.icon||"./vmradio-app-icon-192.png"});
      }
    });
    const token=await getToken(messaging,{vapidKey:VAPID_KEY,serviceWorkerRegistration:registration});
    if(!token)throw new Error("Token FCM indisponible");
    localStorage.setItem("vmRadioFcmToken",token);
    localStorage.setItem(NOTICE_KEY,"1");
    closePrompt();
  }catch(error){
    console.error("VM RADIO notifications:",error);
    btn.disabled=false;
    btn.querySelector("span").textContent="Activer";
  }
}

function setupPrompt(){
  removeLegacyNotificationCard();
  if(localStorage.getItem(NOTICE_KEY)==="1")return;
  if("Notification" in window && Notification.permission==="granted"){
    localStorage.setItem(NOTICE_KEY,"1");
    return;
  }

  const welcome=document.getElementById("vmWelcomeSplash");
  const overlay=createPrompt();

  const showAfterWelcome=()=>{
    if(!document.body.contains(overlay))return;
    overlay.classList.add("vm-show");
    const accept=document.getElementById("vm-notification-accept");
    const later=document.getElementById("vm-notification-later");
    accept.onclick=()=>activateNotifications(accept);
    later.onclick=chooseLater;
  };

  if(welcome){
    const observer=new MutationObserver(()=>{
      removeLegacyNotificationCard();
      const current=document.getElementById("vmWelcomeSplash");
      if(!current || getComputedStyle(current).display==="none" || current.classList.contains("vmWelcomeHide")){
        observer.disconnect();
        setTimeout(showAfterWelcome,300);
      }
    });
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","style"]});
    setTimeout(()=>{
      if(!document.getElementById("vmWelcomeSplash")){observer.disconnect();showAfterWelcome();}
    },15000);
  }else{
    setTimeout(showAfterWelcome,500);
  }
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setupPrompt,{once:true});
else setupPrompt();
