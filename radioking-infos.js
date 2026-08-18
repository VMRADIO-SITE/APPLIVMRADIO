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

  function placeInsideRadio() {
    const root = document.getElementById(MARKER);
    if (!root) return;
    const radioCard = document.querySelector('.info-card');
    if (radioCard && root.parentElement !== radioCard) radioCard.appendChild(root);
  }

  function installFrameStyle() {
    if (document.getElementById('vm-radioking-live-frame-style')) return;
    const style = document.createElement('style');
    style.id = 'vm-radioking-live-frame-style';
    style.textContent = `
      #${MARKER}{position:relative;overflow:hidden;margin:14px 0 2px;padding:13px;border:1px solid rgba(184,92,255,.72);border-radius:14px;background:linear-gradient(145deg,rgba(24,13,37,.98),rgba(8,7,14,.98));box-shadow:0 0 0 1px rgba(184,92,255,.10),0 0 18px rgba(121,44,188,.16),inset 0 1px rgba(255,255,255,.04)}
      #${MARKER}::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#b85cff,#e39aff,transparent)}
      #${MARKER} .vmrk-badge{display:flex;align-items:center;gap:7px;color:#d68cff;font-size:10px;font-weight:800;letter-spacing:.45px;margin-bottom:10px}
      #${MARKER} .vmrk-badge span{width:7px;height:7px;border-radius:50%;background:#31d17b;box-shadow:0 0 8px #31d17b;flex:0 0 7px}
      #${MARKER} .vmrk-main{display:flex;align-items:center;gap:11px}
      #${MARKER} .vmrk-cover{width:58px;height:58px;flex:0 0 58px;border-radius:9px;object-fit:cover;border:1px solid #6d2a95;background:#0b0711;box-shadow:0 0 10px rgba(121,44,188,.16)}
      #${MARKER} .vmrk-info{min-width:0;flex:1}
      #${MARKER} .vmrk-label{font-size:9px;color:#aaa5b4;margin-bottom:3px}
      #${MARKER} .vmrk-title{font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff}
      #${MARKER} .vmrk-artist{font-size:10px;color:#b85cff;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${MARKER} .vmrk-date{font-size:8px;color:#777080;margin-top:5px}
      #${MARKER} .vmrk-empty{text-align:center;color:#aaa5b4;font-size:9px;padding:5px}
    `;
    document.head.appendChild(style);
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
    placeInsideRadio();
    installFrameStyle();
    const root = document.getElementById(MARKER);
    if (!root) return;
    refresh();
    setInterval(refresh, POLL_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
