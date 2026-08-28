/* VM RADIO — bootstrap moteur + thème Manager Admin global */
(function(){
  'use strict';
  var THEMES=[
    ['vm-manager-admin-theme','admin-theme-test.css?v=20260828-manager-global-4'],
    ['vm-manager-admin-theme-all-pages','admin-theme-all-pages.css?v=20260828-manager-all-pages-3'],
    ['vm-manager-admin-theme-specific','admin-theme-specific-pages.css?v=20260828-manager-specific-2'],
    ['vm-manager-admin-theme-home-final','admin-theme-home-final.css?v=20260828-manager-home-final-1']
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
    var ids=['vm-manager-admin-theme-body-final','vm-manager-admin-theme-home-body-final'];
    var configs=[
      ['vm-manager-admin-theme-body-final','admin-theme-specific-pages.css?v=20260828-manager-specific-2'],
      ['vm-manager-admin-theme-home-body-final','admin-theme-home-final.css?v=20260828-manager-home-final-1']
    ];
    configs.forEach(function(cfg){
      var id=cfg[0],url=cfg[1];
      var link=document.getElementById(id);
      if(!link){
        link=document.createElement('link');
        link.rel='stylesheet';
        link.id=id;
        link.href=url;
        document.body.appendChild(link);
      }else if(link.getAttribute('href')!==url){
        link.href=url;
      }
    });
    var final=document.getElementById('vm-manager-admin-theme-home-body-final');
    if(final && document.body.lastElementChild!==final)document.body.appendChild(final);
  }

  function ensureAll(){ensureHeadThemes();ensureBodyFinalTheme();}
  ensureHeadThemes();
  document.addEventListener('DOMContentLoaded',function(){
    ensureAll();
    var bodyObserver=new MutationObserver(function(){
      var final=document.getElementById('vm-manager-admin-theme-home-body-final');
      if(!final || document.body.lastElementChild!==final){setTimeout(ensureBodyFinalTheme,0);}
    });
    if(document.body)bodyObserver.observe(document.body,{childList:true});
  });
  document.addEventListener('click',function(){setTimeout(ensureAll,0);setTimeout(ensureAll,250);},true);
  window.addEventListener('popstate',function(){setTimeout(ensureAll,0);setTimeout(ensureAll,250);});
  window.addEventListener('hashchange',function(){setTimeout(ensureAll,0);setTimeout(ensureAll,250);});

  var core=document.createElement('script');
  core.src='vm-radio-flux-central-core.js?v=20260828-manager-global-4';
  core.async=false;
  document.head.appendChild(core);
})();
