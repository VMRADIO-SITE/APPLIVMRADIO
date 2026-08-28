/* VM RADIO — bootstrap moteur + thème Manager Admin global */
(function(){
  'use strict';
  var THEMES=[
    ['vm-manager-admin-theme','admin-theme-test.css?v=20260828-manager-global-3'],
    ['vm-manager-admin-theme-all-pages','admin-theme-all-pages.css?v=20260828-manager-all-pages-2'],
    ['vm-manager-admin-theme-specific','admin-theme-specific-pages.css?v=20260828-manager-specific-1']
  ];

  function ensureHeadThemes(){
    THEMES.forEach(function(item){
      var id=item[0],url=item[1];
      var link=document.getElementById(id);
      if(!link){
        link=document.createElement('link');
        link.rel='stylesheet';link.id=id;link.href=url;
        document.head.appendChild(link);
      }else if(link.getAttribute('href')!==url){link.href=url;}
    });
  }

  function ensureBodyFinalTheme(){
    if(!document.body)return;
    var id='vm-manager-admin-theme-body-final';
    var final=document.getElementById(id);
    if(!final){
      final=document.createElement('link');
      final.rel='stylesheet';
      final.id=id;
      final.href='admin-theme-specific-pages.css?v=20260828-manager-specific-1';
      document.body.appendChild(final);
    }else if(document.body.lastElementChild!==final){
      document.body.appendChild(final);
    }
  }

  function ensureAll(){ensureHeadThemes();ensureBodyFinalTheme();}
  ensureHeadThemes();
  document.addEventListener('DOMContentLoaded',function(){
    ensureAll();
    var bodyObserver=new MutationObserver(function(){
      if(document.body && document.body.lastElementChild && document.body.lastElementChild.id!=='vm-manager-admin-theme-body-final'){
        setTimeout(ensureBodyFinalTheme,0);
      }
    });
    if(document.body)bodyObserver.observe(document.body,{childList:true});
  });
  document.addEventListener('click',function(){setTimeout(ensureAll,0);setTimeout(ensureAll,250);},true);
  window.addEventListener('popstate',function(){setTimeout(ensureAll,0);setTimeout(ensureAll,250);});
  window.addEventListener('hashchange',function(){setTimeout(ensureAll,0);setTimeout(ensureAll,250);});

  var core=document.createElement('script');
  core.src='vm-radio-flux-central-core.js?v=20260828-manager-global-3';
  core.async=false;
  document.head.appendChild(core);
})();
