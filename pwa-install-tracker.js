(() => {
  'use strict';

  const KEY = 'vmradioPwaInstallReportedV3';
  const INSTALL_ID_KEY = 'vmradioPwaInstallIdV2';
  const ADMIN_INSTALL_ENDPOINT = 'https://admin.vmradio.fr/api/pwa/install';

  // TEST DESIGN — charge le thème visuel inspiré du tableau de bord Admin.
  // Cette injection est indépendante du player, des dédicaces et du routage SPA.
  function loadAdminThemeTest() {
    if (document.getElementById('vm-admin-theme-test')) return;
    const link = document.createElement('link');
    link.id = 'vm-admin-theme-test';
    link.rel = 'stylesheet';
    link.href = './admin-theme-test.css?v=20260828-1';
    document.head.appendChild(link);
  }

  loadAdminThemeTest();

  const reapplyAdminThemeTest = () => {
    const link = document.getElementById('vm-admin-theme-test');
    if (link && link.parentNode === document.head) document.head.appendChild(link);
  };
  window.addEventListener('vmradio:pagechange', reapplyAdminThemeTest);

  function isVmRadioApp() {
    return location.hostname === 'app.vmradio.fr' || location.hostname === 'www.app.vmradio.fr';
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const payload = JSON.stringify({
        installId: getInstallId(),
        platform: 'web',
        version: document.querySelector('meta[name="vm-radio-version"]')?.content || '',
        source: 'APPLIVMRADIO'
      });
      const response = await fetch(ADMIN_INSTALL_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: payload,
        signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        console.warn('[VM RADIO] PWA relay rejected', response.status, result);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('[VM RADIO] PWA relay failed', error);
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function reportInstall() {
    // app.vmradio.fr est exclusivement le domaine de l'application :
    // on ne dépend donc plus de display-mode standalone, qui est peu fiable
    // selon le navigateur (notamment iOS/Safari).
    if (!isVmRadioApp()) return;
    if (localStorage.getItem(KEY) === '1') return;

    const success = await relayInstall();
    if (!success) return;

    localStorage.setItem(KEY, '1');
    window.dispatchEvent(new CustomEvent('vmradio:pwa-installed', {
      detail: { installed: true, timestamp: new Date().toISOString() }
    }));
    console.info('[VM RADIO] App installation relayed successfully');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reportInstall, { once: true });
  } else {
    reportInstall();
  }

  window.addEventListener('pageshow', reportInstall);
})();
