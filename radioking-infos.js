(() => {
  const DATA_URL = './data/radioking-latest.json';
  const POLL_MS = 30000;
  const MARKER = 'vm-radioking-live-info';

  function esc(value) {
    return String(value ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  }

  function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  async function refresh() {
    const root = document.getElementById(MARKER);
    if (!root) return;

    try {
      const response = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Flux indisponible');
      const data = await response.json();

      if (!data.id || !data.title) {
        root.innerHTML = '<div class="vmrk-empty">Aucune nouvelle information pour le moment.</div>';
        return;
      }

      root.innerHTML = `
        <div class="vmrk-badge"><span></span> INFO EN TEMPS RÉEL</div>
        <div class="vmrk-main">
          ${data.cover ? `<img class="vmrk-cover" src="${esc(data.cover)}" alt="Pochette du titre">` : ''}
          <div class="vmrk-info">
            <div class="vmrk-label">Nouveau titre 🎵</div>
            <div class="vmrk-title">${esc(data.title)}</div>
            <div class="vmrk-artist">${esc(data.artist || 'Artiste inconnu')}</div>
            <div class="vmrk-date">Mis à jour : ${esc(formatDate(data.updated_at || data.started_at))}</div>
          </div>
        </div>`;
    } catch (_) {
      root.innerHTML = '<div class="vmrk-empty">Les informations seront mises à jour automatiquement.</div>';
    }
  }

  function start() {
    const root = document.getElementById(MARKER);
    if (!root) return;
    refresh();
    setInterval(refresh, POLL_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
