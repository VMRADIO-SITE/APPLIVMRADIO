(() => {
  'use strict';
  const KEY = 'vmradioPwaInstallReportedV1';

  function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function reportInstall() {
    if (!isStandalone()) return;
    if (localStorage.getItem(KEY) === '1') return;
    // Test hook only: records a local anonymous install event.
    // A server endpoint can be connected later without exposing email credentials.
    localStorage.setItem(KEY, '1');
    window.dispatchEvent(new CustomEvent('vmradio:pwa-installed', {
      detail: { installed: true, timestamp: new Date().toISOString() }
    }));
    console.info('[VM RADIO] PWA install detected');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reportInstall, { once: true });
  } else {
    reportInstall();
  }
  window.addEventListener('pageshow', reportInstall);
})();
