/* VM RADIO — bootstrap moteur + thème Manager Admin global */
(function(){
  'use strict';
  var THEMES=[
    ['vm-manager-admin-theme','admin-theme-test.css?v=20260828-manager-global-5'],
    ['vm-manager-admin-theme-all-pages','admin-theme-all-pages.css?v=20260828-manager-all-pages-4'],
    ['vm-manager-admin-theme-specific','admin-theme-specific-pages.css?v=20260828-manager-specific-3'],
    ['vm-manager-admin-theme-home-final','admin-theme-home-final.css?v=20260828-manager-home-final-2']
  ];

  var INLINE_CSS='\
html body .home-original-module>article.card,\
html body #programme-direct.card,\
html body #programme-next.card,\
html body #top-titres.card{background:#f2edff!important;background-image:none!important;border:1px solid #e2daf3!important;color:#211832!important;box-shadow:0 8px 26px rgba(33,24,50,.08)!important;border-radius:26px!important;}\
html body .home-original-module>article.card h2,\
html body #programme-direct h2,html body #programme-next h2,html body #top-titres h2{color:#3b1468!important;}\
html body .home-original-module>article.card .module-subtitle{color:#c477f3!important;}\
html body #programme-direct .now,html body #programme-next .next,html body #top-titres [data-favorites],html body .home-original-module [data-previous]{background:#f7f4ff!important;background-image:none!important;border-color:#e2daf3!important;color:#211832!important;}\
html body .home-original-module .title,html body .home-original-module strong,html body .home-original-module b{color:#3b1468!important;}\
html body .home-original-module .artist,html body .home-original-module .track-info span{color:#c477f3!important;}\
html body .home-original-module .time,html body .home-original-module small,html body .home-original-module p{color:#756b83!important;}\
html body .home-original-module>article.card::after{background:rgba(255,255,255,.52)!important;}\
html body .player-shell{background:linear-gradient(115deg,#211832,#281b3b)!important;color:#fff!important;}\
html body .player-shell h1,html body .player-shell h2,html body .player-shell h3,html body .player-shell .title,html body .player-shell strong{color:#fff!important;}\
html body .player-shell .artist{color:#d8cfea!important;}\
html body .player-shell .time,html body .player-shell p,html body .player-shell small{color:#bdb2ca!important;}';

  function ensureInlineTheme(){
    var s=document.getElementById('vm-manager-inline-final');
    if(!s){s=document.createElement('style');s.id='vm-manager-inline-final';s.textContent=INLINE_CSS;}
    if(document.body){
      if(s.parentNode!==document.body)document.body.appendChild(s);
      else if(document.body.lastElementChild!==s)document.body.appendChild(s);
    }else if(s.parentNode!==document.head){document.head.appendChild(s);}
  }

  function ensureHeadThemes(){
    THEMES.forEach(function(item){
      var id=item[0],url=item[1];
      var link=document.getElementById(id);
      if(!link){link=document.createElement('link');link.rel='stylesheet';link.id=id;link.href=url;document.head.appendChild(link);}
      else if(link.getAttribute('href')!==url){link.href=url;}
    });
    ensureInlineTheme();
  }

  function ensureAll(){ensureHeadThemes();ensureInlineTheme();}
  ensureHeadThemes();
  document.addEventListener('DOMContentLoaded',function(){
    ensureAll();
    var observer=new MutationObserver(function(){setTimeout(ensureInlineTheme,0);});
    if(document.body)observer.observe(document.body,{childList:true});
  });
  document.addEventListener('click',function(){setTimeout(ensureAll,0);setTimeout(ensureAll,250);},true);
  window.addEventListener('popstate',function(){setTimeout(ensureAll,0);});
  window.addEventListener('hashchange',function(){setTimeout(ensureAll,0);});

  var core=document.createElement('script');
  core.src='vm-radio-flux-central-core.js?v=20260828-manager-global-5';
  core.async=false;
  document.head.appendChild(core);
})();
