/* VM RADIO — bootstrap moteur + thème Manager Admin */
(function(){
  'use strict';
  var theme=document.createElement('link');
  theme.rel='stylesheet';
  theme.href='admin-theme-test.css?v=20260828-manager-exact-3';
  theme.id='vm-manager-admin-theme';
  document.head.appendChild(theme);

  var core=document.createElement('script');
  core.src='vm-radio-flux-central-core.js?v=20260828-manager-exact-3';
  core.async=false;
  document.head.appendChild(core);
})();
