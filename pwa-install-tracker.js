(() => {
  'use strict';

  const KEY = 'vmradioPwaInstallReportedV2';
  const INSTALL_ID_KEY = 'vmradioPwaInstallIdV1';
  const ADMIN_INSTALL_ENDPOINT = 'https://vmradio-admin.valentinrasle707.workers.dev/api/pwa/install';

  function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function getInstallId() {
    let id = localStorage.getItem(INSTALL_ID_KEY);
    if (id) return id;
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    id = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(INSTALL_ID_KEY, id);
    return id;
  }

  async function relayInstall() {
    try {
      const payload = JSON.stringify({
        installId: getInstallId(),
        platform: 'web',
        version: document.querySelector('meta[name="vm-radio-version"]')?.content || ''
      });
      const response = await fetch(ADMIN_INSTALL_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: payload
      });
      if (!response.ok) return false;
      const result = await response.json().catch(() => null);
      return result?.ok === true;
    } catch (_) {
      return false;
    }
  }

  async function reportInstall() {
    if (!isStandalone()) return;
    if (localStorage.getItem(KEY) === '1') return;

    const success = await relayInstall();
    if (!success) {
      console.warn('[VM RADIO] PWA install relay unavailable; will retry later');
      return;
    }

    localStorage.setItem(KEY, '1');
    window.dispatchEvent(new CustomEvent('vmradio:pwa-installed', {
      detail: { installed: true, timestamp: new Date().toISOString() }
    }));
    console.info('[VM RADIO] PWA install detected and relayed');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reportInstall, { once: true });
  } else {
    reportInstall();
  }

  window.addEventListener('pageshow', reportInstall);
})();
