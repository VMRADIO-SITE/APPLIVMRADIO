/* VM RADIO — bootstrap moteur + thème Manager Admin forcé dans le DOM */
(function(){
  'use strict';

  var THEMES=[
    ['vm-manager-admin-theme','admin-theme-test.css?v=20260828-manager-global-6'],
    ['vm-manager-admin-theme-all-pages','admin-theme-all-pages.css?v=20260828-manager-all-pages-5'],
    ['vm-manager-admin-theme-specific','admin-theme-specific-pages.css?v=20260828-manager-specific-4'],
    ['vm-manager-admin-theme-home-final','admin-theme-home-final.css?v=20260828-manager-home-final-3']
  ];

  function imp(el,prop,value){if(el&&el.style)el.style.setProperty(prop,value,'important');}
  function all(sel,fn){document.querySelectorAll(sel).forEach(fn);}

  function forceManagerTheme(){
    all('.home-original-module > article.card',function(card){
      imp(card,'background','#f2edff');
      imp(card,'background-image','none');
      imp(card,'border','1px solid #e2daf3');
      imp(card,'border-radius','24px');
      imp(card,'box-shadow','0 8px 26px rgba(33,24,50,.08)');
      imp(card,'color','#211832');
    });

    all('.home-original-module > article.card h1,.home-original-module > article.card h2,.home-original-module > article.card h3,.home-original-module > article.card .title,.home-original-module > article.card .previous-title,.home-original-module > article.card strong,.home-original-module > article.card b',function(el){
      imp(el,'color','#3b1468');
    });
    all('.home-original-module > article.card .module-subtitle,.home-original-module > article.card .artist,.home-original-module > article.card .previous-artist,.home-original-module > article.card .vm-api-artist',function(el){
      imp(el,'color','#c477f3');
    });
    all('.home-original-module > article.card p,.home-original-module > article.card small,.home-original-module > article.card .time,.home-original-module > article.card .previous-time',function(el){
      imp(el,'color','#756b83');
    });

    all('#programme-direct .now,#programme-next .next,#top-titres [data-favorites],.home-original-module [data-previous],.home-original-module .vm-home-list-card,.home-original-module .vm-programme-previous-item',function(el){
      imp(el,'background','#f7f4ff');
      imp(el,'background-image','none');
      imp(el,'border-color','#e2daf3');
      imp(el,'color','#211832');
      imp(el,'box-shadow','none');
    });

    all('.info-card,.ded-card,.news-card,.contact-card,.tiktok-highlight,.tiktok-video,.tiktok-content,.module,.mini,.promo,.tile,.music-program,.dedication-form',function(card){
      imp(card,'background','#f2edff');
      imp(card,'background-image','none');
      imp(card,'border-color','#e2daf3');
      imp(card,'color','#211832');
      imp(card,'box-shadow','0 8px 26px rgba(33,24,50,.08)');
    });
    all('.info-card h1,.info-card h2,.ded-card h1,.ded-card h2,.news-card h3,.contact-card h2,.tiktok-highlight h3,.tiktok-content h2,.module h2,.mini b,.promo h2,.tile b',function(el){imp(el,'color','#3b1468');});
    all('.module-subtitle,.contact-subtitle,.info-title p,.dedications-title p,.tiktok-page-title p',function(el){imp(el,'color','#c477f3');});

    all('#vm-update-popup .vm-update-box,.popup,.popup-box,.modal,.modal-content,.notification-box,.notification-card,.dialog,.gate',function(el){
      imp(el,'background','#f2edff');
      imp(el,'background-image','none');
      imp(el,'border-color','#e2daf3');
      imp(el,'color','#211832');
    });

    all('.player-shell',function(el){
      imp(el,'background','linear-gradient(115deg,#211832,#281b3b)');
      imp(el,'color','#fff');
      imp(el,'border','0');
    });
    all('.player-shell h1,.player-shell h2,.player-shell h3,.player-shell .title,.player-shell strong',function(el){imp(el,'color','#fff');});
    all('.player-shell .artist',function(el){imp(el,'color','#d8cfea');});
    all('.player-shell .time,.player-shell p,.player-shell small',function(el){imp(el,'color','#bdb2ca');});

    all('nav.nav,.bottom-nav',function(el){
      imp(el,'background','linear-gradient(135deg,#3b1468,#6828d8)');
      imp(el,'background-image','linear-gradient(135deg,#3b1468,#6828d8)');
    });
  }

  function ensureThemes(){
    THEMES.forEach(function(item){
      var id=item[0],url=item[1],link=document.getElementById(id);
      if(!link){link=document.createElement('link');link.rel='stylesheet';link.id=id;link.href=url;document.head.appendChild(link);}
      else if(link.getAttribute('href')!==url)link.href=url;
    });
  }

  function refresh(){ensureThemes();forceManagerTheme();}
  ensureThemes();

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){
    refresh();
    setTimeout(refresh,100);setTimeout(refresh,500);setTimeout(refresh,1500);
  },{once:true});
  else {refresh();setTimeout(refresh,100);setTimeout(refresh,500);}

  var observer=new MutationObserver(function(){setTimeout(forceManagerTheme,0);});
  function watch(){if(document.body)observer.observe(document.body,{childList:true,subtree:true});}
  if(document.body)watch();else document.addEventListener('DOMContentLoaded',watch,{once:true});
  window.addEventListener('vmradio:pagechange',function(){setTimeout(forceManagerTheme,0);setTimeout(forceManagerTheme,150);});
  document.addEventListener('click',function(){setTimeout(forceManagerTheme,0);setTimeout(forceManagerTheme,250);},true);
  window.addEventListener('pageshow',function(){setTimeout(forceManagerTheme,0);});

  var core=document.createElement('script');
  core.src='vm-radio-flux-central-core.js?v=20260828-manager-global-7';
  core.async=false;
  document.head.appendChild(core);

  var presence=document.createElement('script');
  presence.src='listener-presence-client.js?v=20260828-1';
  presence.async=false;
  document.head.appendChild(presence);
})();
