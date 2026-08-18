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
const NOTICE_KEY = "vmRadioNotificationPromptShown";

const style = document.createElement("style");
style.textContent = `
#vm-notification-overlay{position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,.78);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .25s ease,visibility .25s ease;font-family:Arial,Helvetica,sans-serif}
#vm-notification-overlay.vm-show{opacity:1;visibility:visible;pointer-events:auto}
#vm-notification-prompt{position:relative;width:min(100%,650px);max-height:calc(100vh - 36px);overflow:auto;padding:28px;border:2px solid #b85cff;border-radius:26px;background:linear-gradient(145deg,#08040d 0%,#12051d 52%,#08040d 100%);box-shadow:0 0 35px rgba(151,48,255,.5),inset 0 0 30px rgba(151,48,255,.08);color:#fff;box-sizing:border-box}
#vm-notification-prompt:before{content:"";position:absolute;inset:-2px;border-radius:26px;pointer-events:none;box-shadow:0 0 14px rgba(184,92,255,.85);opacity:.75}
#vm-notification-prompt .vm-close{position:absolute;right:18px;top:16px;width:42px;height:42px;border:2px solid #a944ff;border-radius:50%;background:transparent;color:#c45cff;font-size:30px;line-height:34px;cursor:pointer}
#vm-notification-prompt .vm-notification-layout{display:grid;grid-template-columns:minmax(180px,42%) 1fr;gap:28px;align-items:center}
#vm-notification-prompt .vm-logo-placeholder{min-height:210px;border:2px solid #9c3dff;border-radius:25px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,rgba(113,32,198,.2),rgba(0,0,0,.55) 65%);box-shadow:0 0 20px rgba(157,61,255,.4)}
#vm-notification-prompt .vm-logo-placeholder img{width:86%;max-height:190px;object-fit:contain;border-radius:16px}
#vm-notification-prompt h2{margin:0;font-size:clamp(32px,6vw,62px);line-height:.98;font-weight:900;letter-spacing:-1.5px}
#vm-notification-prompt h2 span{color:#8b2cff;text-shadow:0 0 16px rgba(139,44,255,.5)}
#vm-notification-prompt .vm-line{height:2px;margin:20px 0 22px;background:linear-gradient(90deg,#8b2cff,rgba(139,44,255,0))}
#vm-notification-prompt .vm-text{margin:0;color:#d4ceda;font-size:clamp(15px,2.4vw,22px);line-height:1.45}
#vm-notification-prompt .vm-text span{color:#9c35ff}
#vm-notification-prompt .vm-notification-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:26px}
#vm-notification-prompt button.vm-choice{border-radius:17px;padding:16px 14px;color:#fff;font-weight:900;font-size:clamp(14px,2vw,18px);cursor:pointer;min-height:62px}
#vm-notification-accept{border:0;background:linear-gradient(135deg,#c05cff,#6820e8);box-shadow:0 0 20px rgba(145,45,255,.45)}
#vm-notification-later{background:rgba(5,3,9,.85);border:1px solid rgba(176,74,255,.55)}
#vm-notification-prompt button.vm-choice:disabled{opacity:.55;cursor:wait}
@media(max-width:600px){
  #vm-notification-overlay{padding:12px}
  #vm-notification-prompt{padding:22px 18px;border-radius:22px}
  #vm-notification-prompt .vm-notification-layout{grid-template-columns:1fr;gap:18px}
  #vm-notification-prompt .vm-logo-placeholder{min-height:150px}
  #vm-notification-prompt .vm-logo-placeholder img{max-height:135px}
  #vm-notification-prompt .vm-close{right:12px;top:10px;width:38px;height:38px;font-size:26px}
  #vm-notification-prompt h2{padding-right:42px}
  #vm-notification-prompt .vm-line{margin:14px 0 16px}
  #vm-notification-prompt .vm-notification-actions{grid-template-columns:1fr;gap:9px}
}
`;
document.head.appendChild(style);

function createPrompt(){
  if(document.getElementById("vm-notification-overlay")) return document.getElementById("vm-notification-overlay");
  const overlay=document.createElement("div");
  overlay.id="vm-notification-overlay";
  overlay.innerHTML=`
    <section id="vm-notification-prompt" role="dialog" aria-modal="true" aria-label="Notifications VM RADIO">
      <button class="vm-close" id="vm-notification-close" type="button" aria-label="Plus tard">×</button>
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
        <button class="vm-choice" id="vm-notification-later" type="button">Plus tard</button>
        <button class="vm-choice" id="vm-notification-accept" type="button">🔔 Activer</button>
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
    btn.textContent="Activation…";
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
    btn.textContent="🔔 Activer";
  }
}

function setupPrompt(){
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
    const close=document.getElementById("vm-notification-close");
    accept.onclick=()=>activateNotifications(accept);
    later.onclick=chooseLater;
    close.onclick=chooseLater;
  };

  if(welcome){
    const observer=new MutationObserver(()=>{
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
