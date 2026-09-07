/* VM RADIO — maintenance v6 : popup calé sur l'antenne VPS, audio jamais rechargé */
(function(){
  'use strict';
  if(window.__VMRADIO_MAINTENANCE_GATE_V2__)return;
  window.__VMRADIO_MAINTENANCE_GATE_V2__=true;

  var STATE_ENDPOINT='https://admin.vmradio.fr/api/public/maintenance';
  var NOWPLAYING_ENDPOINT='https://admin.vmradio.fr/api/public/radio/nowplaying';
  var POLL_MS=250;

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

  function getAudio(){
    return window.VMRadioPlayer?.audio || document.getElementById('audio') || document.querySelector('audio');
  }

  function ensureOverlay(){
    if(overlay&&document.documentElement.contains(overlay))return overlay;
    if(!document.body)return null;

    overlay=document.createElement('div');
    overlay.id='vmradioMaintenanceBlockingPopup';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Maintenance VM RADIO');
    overlay.style.cssText='position:fixed!important;inset:0!important;z-index:2147483647!important;width:100vw!important;height:100dvh!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:22px!important;background:radial-gradient(circle at 50% 0%,#32164d 0,#13091f 42%,#08060d 100%)!important;color:#fff!important;font-family:Arial,Helvetica,sans-serif!important;text-align:center!important;overflow:hidden!important;touch-action:none!important;overscroll-behavior:none!important;';
    overlay.innerHTML='<div style="width:min(92vw,520px);padding:34px 24px;border:1px solid rgba(190,92,255,.38);border-radius:28px;background:rgba(17,10,25,.96);box-shadow:0 28px 90px rgba(0,0,0,.55),0 0 42px rgba(184,92,255,.12)"><div style="font-size:46px;line-height:1">🛠️</div><h1 style="margin:16px 0 8px;font-size:28px;line-height:1.15;color:#fff">Maintenance en cours</h1><p style="margin:0 auto;max-width:420px;color:#d7ccdf;font-size:14px;line-height:1.6">L’application VM RADIO est temporairement indisponible pendant une intervention technique.</p><div style="margin-top:18px;color:#cf8cff;font-size:13px;font-weight:800">La musique continue sur VM RADIO.</div><button id="vmMaintenanceListen" type="button" style="margin-top:16px;border:0;border-radius:14px;padding:11px 16px;background:#8f42e6;color:#fff;font-weight:800;cursor:pointer">Écouter VM RADIO</button><div style="margin-top:9px;color:#8f8798;font-size:10px">La page se réouvrira automatiquement à la fin de la maintenance.</div></div>';
    document.body.appendChild(overlay);

    var listen=overlay.querySelector('#vmMaintenanceListen');
    if(listen){
      listen.addEventListener('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        try{
          if(window.VMRadioPlayer&&typeof window.VMRadioPlayer.play==='function'){
            window.VMRadioPlayer.play();
            return;
          }
          var audio=getAudio();
          if(audio){
            var p=audio.play();
            if(p&&typeof p.catch==='function')p.catch(function(){});
          }
        }catch(_){}
      });
    }

    return overlay;
  }

  function showMaintenance(){
    active=true;
    document.documentElement.dataset.vmMaintenance='on';
    document.documentElement.style.setProperty('overflow','hidden','important');
    if(document.body)document.body.style.setProperty('overflow','hidden','important');
    ensureOverlay();
  }

  function hideMaintenance(){
    active=false;
    document.documentElement.dataset.vmMaintenance='off';
    if(overlay){overlay.remove();overlay=null;}
    document.documentElement.style.removeProperty('overflow');
    if(document.body)document.body.style.removeProperty('overflow');
  }

  function radioMode(data){
    return String(
      data?.raw?.engine?.current?.type ||
      data?.now_playing?.playlist ||
      data?.playlist ||
      ''
    ).trim().toLowerCase();
  }

  async function getJson(url){
    var response=await fetch(url+(url.includes('?')?'&':'?')+'_vm='+Date.now(),{
      method:'GET',
      cache:'no-store',
      credentials:'omit',
      headers:{Accept:'application/json','Cache-Control':'no-cache'}
    });
    var data=await response.json().catch(function(){return null;});
    if(!response.ok||!data||data.ok===false)throw new Error('VM RADIO API');
    return data;
  }

  async function check(){
    if(busy)return;
    busy=true;
    try{
      /*
       * Les deux états sont lus en parallèle pour supprimer le décalage réseau.
       * Le Manager ne publie app=true qu'après confirmation audio_ready du VPS.
       */
      var values=await Promise.all([
        getJson(STATE_ENDPOINT),
        getJson(NOWPLAYING_ENDPOINT)
      ]);

      var state=values[0];
      var now=values[1];
      var requested=state.app===true;
      var mode=radioMode(now);
      var radioMaintenance=mode==='maintenance'||mode.indexOf('maintenance')!==-1;

      if(requested&&radioMaintenance){
        showMaintenance();
        return;
      }

      if(!requested&&!radioMaintenance){
        hideMaintenance();
        return;
      }

      /*
       * Pendant les quelques millisecondes d'un changement d'état,
       * on conserve l'affichage actuel au lieu d'anticiper l'antenne.
       */
      if(active)ensureOverlay();
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
