/* VM RADIO — blocage maintenance application v3 : interface bloquée, audio conservé */
(function(){
  'use strict';
  if(window.__VMRADIO_MAINTENANCE_GATE_V2__)return;
  window.__VMRADIO_MAINTENANCE_GATE_V2__=true;

  var ENDPOINT='https://admin.vmradio.fr/api/public/maintenance';
  var POLL_MS=500;
  var active=false;
  var busy=false;
  var overlay=null;

  function blockEvent(event){
    if(!active)return;
    if(overlay&&overlay.contains(event.target))return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  }

  ['click','dblclick','submit','touchstart','touchend','pointerdown','pointerup','keydown'].forEach(function(name){
    document.addEventListener(name,blockEvent,true);
  });

  function ensureOverlay(){
    if(overlay&&document.documentElement.contains(overlay))return overlay;
    if(!document.body)return null;

    overlay=document.createElement('div');
    overlay.id='vmradioMaintenanceBlockingPopup';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Maintenance VM RADIO');
    overlay.style.cssText='position:fixed!important;inset:0!important;z-index:2147483647!important;width:100vw!important;height:100dvh!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:22px!important;background:radial-gradient(circle at 50% 0%,#32164d 0,#13091f 42%,#08060d 100%)!important;color:#fff!important;font-family:Arial,Helvetica,sans-serif!important;text-align:center!important;overflow:hidden!important;touch-action:none!important;overscroll-behavior:none!important;';
    overlay.innerHTML='<div style="width:min(92vw,520px);padding:34px 24px;border:1px solid rgba(190,92,255,.38);border-radius:28px;background:rgba(17,10,25,.96);box-shadow:0 28px 90px rgba(0,0,0,.55),0 0 42px rgba(184,92,255,.12)"><div style="font-size:46px;line-height:1">🛠️</div><h1 style="margin:16px 0 8px;font-size:28px;line-height:1.15;color:#fff">Maintenance en cours</h1><p style="margin:0 auto;max-width:420px;color:#d7ccdf;font-size:14px;line-height:1.6">L’application VM RADIO est temporairement indisponible pendant une intervention technique.</p><div style="margin-top:18px;color:#cf8cff;font-size:13px;font-weight:800">La musique continue sur VM RADIO.</div><div style="margin-top:9px;color:#8f8798;font-size:10px">La page se réouvrira automatiquement à la fin de la maintenance.</div></div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function setMaintenance(enabled){
    active=enabled===true;
    document.documentElement.dataset.vmMaintenance=active?'on':'off';

    if(active){
      /* IMPORTANT : ne jamais mettre en pause le flux radio pendant la maintenance. */
      document.documentElement.style.setProperty('overflow','hidden','important');
      if(document.body)document.body.style.setProperty('overflow','hidden','important');
      ensureOverlay();
    }else{
      if(overlay){overlay.remove();overlay=null;}
      document.documentElement.style.removeProperty('overflow');
      if(document.body)document.body.style.removeProperty('overflow');
    }
  }

  async function check(){
    if(busy)return;
    busy=true;
    try{
      var response=await fetch(ENDPOINT+'?_maintenance='+Date.now(),{
        method:'GET',
        cache:'no-store',
        credentials:'omit',
        headers:{Accept:'application/json','Cache-Control':'no-cache'}
      });
      var data=await response.json().catch(function(){return null;});
      if(response.ok&&data&&data.ok!==false){
        setMaintenance(data.app===true);
      }
    }catch(_){}
    finally{busy=false;}
  }

  function start(){
    check();
    setInterval(check,POLL_MS);
    setInterval(function(){if(active)ensureOverlay();},1000);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
  window.addEventListener('focus',check);
  window.addEventListener('pageshow',check);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)check();});
})();
