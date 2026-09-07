/* VM RADIO — maintenance audio v7 : force le lecteur sur le flux MP3 direct du VPS avant toute lecture */
(function(){
  'use strict';
  if(window.__VMRADIO_MAINTENANCE_AUDIO_V7__)return;
  window.__VMRADIO_MAINTENANCE_AUDIO_V7__=true;

  var DIRECT_MP3='https://radio.vmradio.fr/listen/vm_radio/radio.mp3';
  var applied=false;
  var timer=null;
  var attempts=0;

  function applyDirectMp3(){
    var player=window.VMRadioPlayer||null;
    var audio=(player&&player.audio)||document.getElementById('audio')||document.querySelector('audio');
    if(!audio)return false;

    var current=String(audio.currentSrc||audio.getAttribute('src')||'');
    var alreadyDirect=current.indexOf('/listen/vm_radio/radio.mp3')!==-1;
    var wasPlaying=!audio.paused&&!audio.ended;

    if(!alreadyDirect){
      try{
        audio.src=DIRECT_MP3;
        audio.load();
        if(wasPlaying){
          var p=audio.play();
          if(p&&typeof p.catch==='function')p.catch(function(){});
        }
      }catch(_){}
    }

    window.__VMRADIO_STREAM_URL__=DIRECT_MP3;
    window.__VMRADIO_HLS_NATIVE__=false;

    if(player){
      player.stream=DIRECT_MP3;
      player.isHls=false;
    }

    applied=true;
    console.info('[VM RADIO] Flux audio verrouillé sur MP3 direct VPS',DIRECT_MP3);
    return true;
  }

  function tryApply(){
    attempts++;
    if(applyDirectMp3()){
      if(timer){clearInterval(timer);timer=null;}
      return;
    }
    if(attempts>=100&&timer){
      clearInterval(timer);
      timer=null;
    }
  }

  function start(){
    tryApply();
    if(!applied&&!timer)timer=setInterval(tryApply,50);
    setTimeout(tryApply,250);
    setTimeout(tryApply,750);
    setTimeout(tryApply,1500);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }

  window.addEventListener('pageshow',tryApply);
})();
