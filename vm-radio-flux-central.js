/* VM RADIO — bootstrap moteur + thème Manager Admin global */
(function(){
  'use strict';
  var THEME_ID='vm-manager-admin-theme';
  var THEME_URL='admin-theme-test.css?v=20260828-manager-global-1';

  function ensureThemeLast(){
    var theme=document.getElementById(THEME_ID);
    if(!theme){
      theme=document.createElement('link');
      theme.rel='stylesheet';
      theme.href=THEME_URL;
      theme.id=THEME_ID;
      document.head.appendChild(theme);
      return;
    }
    if(theme.href.indexOf('manager-global-1')===-1) theme.href=THEME_URL;
    if(document.head.lastElementChild!==theme) document.head.appendChild(theme);
  }

  ensureThemeLast();
  document.addEventListener('DOMContentLoaded',ensureThemeLast);
  document.addEventListener('click',function(){setTimeout(ensureThemeLast,0);setTimeout(ensureThemeLast,250);},true);
  window.addEventListener('popstate',function(){setTimeout(ensureThemeLast,0);setTimeout(ensureThemeLast,250);});
  window.addEventListener('hashchange',function(){setTimeout(ensureThemeLast,0);setTimeout(ensureThemeLast,250);});

  var observer=new MutationObserver(function(mutations){
    var needs=false;
    for(var i=0;i<mutations.length;i++){
      if(mutations[i].target===document.head){needs=true;break;}
    }
    if(needs) setTimeout(ensureThemeLast,0);
  });
  if(document.head) observer.observe(document.head,{childList:true});

  var core=document.createElement('script');
  core.src='vm-radio-flux-central-core.js?v=20260828-manager-global-1';
  core.async=false;
  document.head.appendChild(core);
  setTimeout(ensureThemeLast,0);
})();
