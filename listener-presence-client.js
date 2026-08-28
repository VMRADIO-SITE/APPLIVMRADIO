/* VM RADIO — présence auditeur basée sur le vrai player */
(function(){
'use strict';
if(window.__VMRADIO_LISTENER_PRESENCE_CLIENT__)return;
window.__VMRADIO_LISTENER_PRESENCE_CLIENT__=true;

const ENDPOINT='https://admin.vmradio.fr/api/public/listeners';
const SOURCE='app';
const HEARTBEAT_MS=10000;
let timer=null;
let lastAudio=null;
let lastState=false;

function getClientId(){
  try{
    let id=localStorage.getItem('vmradio_listener_id')||'';
    if(/^vm_listener_[A-Za-z0-9_-]{12,96}$/.test(id))return id;
    const raw=(crypto.randomUUID?crypto.randomUUID().replace(/-/g,''):Math.random().toString(36).slice(2)+Date.now().toString(36));
    id='vm_listener_'+raw;
    localStorage.setItem('vmradio_listener_id',id);
    return id;
  }catch(_){
    return 'vm_listener_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  }
}
const clientId=getClientId();

async function send(action){
  try{
    await fetch(ENDPOINT,{
      method:'POST',
      mode:'cors',
      cache:'no-store',
      keepalive:true,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({clientId,source:SOURCE,action})
    });
  }catch(_){ }
}
function start(){
  send('heartbeat');
  if(timer)clearInterval(timer);
  timer=setInterval(()=>send('heartbeat'),HEARTBEAT_MS);
}
function stop(){
  if(timer){clearInterval(timer);timer=null;}
  send('stop');
}
function audio(){return window.VMRadioPlayer?.audio||document.getElementById('radioAudio')||null;}
function attach(){
  const a=audio();
  if(!a)return false;
  if(a!==lastAudio){
    lastAudio=a;
    a.addEventListener('play',start);
    a.addEventListener('playing',start);
    a.addEventListener('pause',stop);
    a.addEventListener('ended',stop);
    a.addEventListener('error',stop);
  }
  const playing=!a.paused&&!a.ended;
  if(playing&&!lastState)start();
  if(!playing&&lastState)stop();
  lastState=playing;
  return true;
}

let tries=0;
const watcher=setInterval(()=>{
  attach();
  if(++tries>240)clearInterval(watcher);
},500);

window.addEventListener('vmradio:pagechange',()=>setTimeout(attach,50));
window.addEventListener('focus',attach);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)attach();});
window.addEventListener('pagehide',stop);
})();