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
#vm-notification-prompt{position:fixed;z-index:999999;left:50%;bottom:calc(82px + env(safe-area-inset-bottom));transform:translate(-50%,18px);width:min(calc(100% - 28px),430px);padding:14px;border:1px solid rgba(184,92,255,.5);border-radius:18px;background:linear-gradient(145deg,rgba(35,17,51,.98),rgba(13,9,19,.99));box-shadow:0 14px 40px rgba(0,0,0,.45);color:#fff;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s ease,transform .3s ease,visibility .3s ease;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box}
#vm-notification-prompt.vm-show{opacity:1;visibility:visible;transform:translate(-50%,0);pointer-events:auto}
#vm-notification-prompt .vm-notification-row{display:flex;align-items:center;gap:11px}
#vm-notification-prompt .vm-notification-icon{width:40px;height:40px;flex:0 0 40px;border-radius:13px;display:grid;place-items:center;background:#28143a;font-size:20px}
#vm-notification-prompt .vm-notification-copy{min-width:0;flex:1}
#vm-notification-prompt strong{display:block;font-size:13px}
#vm-notification-prompt small{display:block;margin-top:3px;color:#aaa5b4;font-size:9px;line-height:1.35}
#vm-notification-prompt .vm-notification-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}
#vm-notification-prompt button{border:0;border-radius:11px;padding:10px;color:#fff;font-weight:800;font-size:11px;cursor:pointer}
#vm-notification-accept{background:linear-gradient(135deg,#c05cff,#7433dd)}
#vm-notification-later{background:#21162b;border:1px solid rgba(255,255,255,.08)!important}
`;
document.head.appendChild(style);

function createPrompt(){
  if(document.getElementById("vm-notification-prompt")) return document.getElementById("vm-notification-prompt");
  const box=document.createElement("section");
  box.id="vm-notification-prompt";
  box.setAttribute("role","dialog");
  box.setAttribute("aria-label","Notifications VM RADIO");
  box.innerHTML=`
    <div class="vm-notification-row">
      <div class="vm-notification-icon">🔔</div>
      <div class="vm-notification-copy">
        <strong>Activer les notifications ?</strong>
        <small>Reçois les infos, nouveaux titres et mises à jour de VM RADIO.</small>
      </div>
    </div>
    <div class="vm-notification-actions">
      <button id="vm-notification-accept" type="button">Activer</button>
      <button id="vm-notification-later" type="button">Plus tard</button>
    </div>`;
  document.body.appendChild(box);
  return box;
}

function closePrompt(){
  const box=document.getElementById("vm-notification-prompt");
  if(!box)return;
  box.classList.remove("vm-show");
  setTimeout(()=>box.remove(),350);
}

async function activateNotifications(btn){
  try{
    btn.disabled=true;
    btn.textContent="Activation…";
    if(!( "Notification" in window) || !("serviceWorker" in navigator)) throw new Error("Notifications non disponibles");
    const permission=await Notification.requestPermission();
    if(permission!=="granted") throw new Error("Autorisation refusée");
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
    btn.textContent="Activer";
  }
}

function setupPrompt(){
  if(localStorage.getItem(NOTICE_KEY)==="1")return;
  if("Notification" in window && Notification.permission==="granted"){
    localStorage.setItem(NOTICE_KEY,"1");
    return;
  }
  const popup=document.getElementById("vmWelcomeSplash");
  const prompt=createPrompt();
  const show=()=>{
    if(!document.body.contains(prompt))return;
    prompt.classList.add("vm-show");
    const accept=document.getElementById("vm-notification-accept");
    const later=document.getElementById("vm-notification-later");
    accept.onclick=()=>activateNotifications(accept);
    later.onclick=()=>{localStorage.setItem(NOTICE_KEY,"1");closePrompt();};
    setTimeout(()=>{if(document.body.contains(prompt)){localStorage.setItem(NOTICE_KEY,"1");closePrompt();}},10000);
  };
  if(popup){
    const observer=new MutationObserver(()=>{
      if(!document.getElementById("vmWelcomeSplash")){observer.disconnect();setTimeout(show,250);}
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>{if(document.getElementById("vmWelcomeSplash"))return;observer.disconnect();show();},12000);
  }else setTimeout(show,500);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setupPrompt,{once:true});
else setupPrompt();
