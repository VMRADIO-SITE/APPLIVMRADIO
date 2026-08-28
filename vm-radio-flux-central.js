/* VM RADIO — bootstrap moteur + thème Manager Admin global */
(function(){
  'use strict';
  var BASE_ID='vm-manager-admin-theme';
  var BASE_URL='admin-theme-test.css?v=20260828-manager-global-2';
  var ALL_ID='vm-manager-admin-theme-all-pages';
  var ALL_URL='admin-theme-all-pages.css?v=20260828-manager-all-pages-1';

  function ensureLink(id,url){
    var link=document.getElementById(id);
    if(!link){
      link=document.createElement('link');
      link.rel='stylesheet';
      link.id=id;
      link.href=url;
      document.head.appendChild(link);
    }else if(link.getAttribute('href')!==url){
      link.href=url;
    }
    return link;
  }

  function ensureThemesLast(){
    var base=ensureLink(BASE_ID,BASE_URL);
    var all=ensureLink(ALL_ID,ALL_URL);
    if(document.head.lastElementChild!==all){
      document.head.appendChild(base);
      document.head.appendChild(all);
    }
  }

  ensureThemesLast();
  document.addEventListener('DOMContentLoaded',ensureThemesLast);
  document.addEventListener('click',function(){setTimeout(ensureThemesLast,0);setTimeout(ensureThemesLast,250);},true);
  window.addEventListener('popstate',function(){setTimeout(ensureThemesLast,0);setTimeout(ensureThemesLast,250);});
  window.addEventListener('hashchange',function(){setTimeout(ensureThemesLast,0);setTimeout(ensureThemesLast,250);});

  var observer=new MutationObserver(function(mutations){
    for(var i=0;i<mutations.length;i++){
      if(mutations[i].target===document.head){setTimeout(ensureThemesLast,0);break;}
    }
  });
  if(document.head) observer.observe(document.head,{childList:true});

  var core=document.createElement('script');
  core.src='vm-radio-flux-central-core.js?v=20260828-manager-global-2';
  core.async=false;
  document.head.appendChild(core);
  setTimeout(ensureThemesLast,0);
})();
