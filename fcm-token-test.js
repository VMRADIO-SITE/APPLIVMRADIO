(()=>{
  const TOKEN_KEY="vmRadioFcmToken";
  const PANEL_ID="vm-fcm-token-test";
  const style=document.createElement("style");
  style.textContent=`#${PANEL_ID}{position:fixed;left:14px;right:14px;bottom:14px;z-index:2147483646;background:#0d0714;color:#fff;border:2px solid #b85cff;border-radius:18px;padding:16px;box-shadow:0 0 24px rgba(151,48,255,.45);font-family:Arial,sans-serif;box-sizing:border-box}#${PANEL_ID} h3{margin:0 0 8px;color:#c05cff;font-size:18px}#${PANEL_ID} p{margin:0 0 10px;color:#d4ceda;font-size:14px}#${PANEL_ID} textarea{width:100%;height:78px;resize:none;box-sizing:border-box;background:#050308;color:#fff;border:1px solid #8b2cff;border-radius:10px;padding:9px;font-size:11px}#${PANEL_ID} .actions{display:flex;gap:8px;margin-top:9px}#${PANEL_ID} button{flex:1;border:0;border-radius:10px;padding:10px;background:linear-gradient(135deg,#c05cff,#6d20ed);color:#fff;font-weight:800}#${PANEL_ID} button.secondary{background:#18101f;border:1px solid #8b2cff}`;
  document.head.appendChild(style);
  function show(token){
    if(!token||document.getElementById(PANEL_ID))return;
    const panel=document.createElement("section");panel.id=PANEL_ID;
    panel.innerHTML=`<h3>🧪 Test FCM — Token récupéré</h3><p>Le token FCM de cet appareil a bien été récupéré.</p><textarea id="vm-fcm-token-value" readonly></textarea><div class="actions"><button id="vm-fcm-copy">Copier le token</button><button class="secondary" id="vm-fcm-close">Fermer</button></div>`;
    document.body.appendChild(panel);
    document.getElementById("vm-fcm-token-value").value=token;
    document.getElementById("vm-fcm-copy").onclick=async()=>{try{await navigator.clipboard.writeText(token);document.getElementById("vm-fcm-copy").textContent="Token copié ✓";}catch(_){document.getElementById("vm-fcm-copy").textContent="Copie impossible";}};
    document.getElementById("vm-fcm-close").onclick=()=>panel.remove();
  }
  function check(){show(localStorage.getItem(TOKEN_KEY));}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",check,{once:true});else check();
  const timer=setInterval(()=>{check();if(document.getElementById(PANEL_ID))clearInterval(timer);},500);
})();
