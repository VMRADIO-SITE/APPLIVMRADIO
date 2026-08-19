(() => {
  'use strict';

  const STREAM_URL = 'https://play.radioking.io/vm-radio2';
  const AUDIO_SELECTORS = ['#audio', 'audio'];
  const KEY = 'vmradio-audio-wanted';

  let audio = null;
  let wanted = false;
  let reconnectTimer = 0;
  let stallTimer = 0;
  let reconnecting = false;
  let attempts = 0;
  let manualPause = false;

  const getAudio = () => {
    if (audio && document.contains(audio)) return audio;
    for (const selector of AUDIO_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) return (audio = el);
    }
    return null;
  };

  const saveWanted = value => {
    wanted = value;
    try { localStorage.setItem(KEY, value ? '1' : '0'); } catch (_) {}
  };

  const readWanted = () => {
    try { return localStorage.getItem(KEY) === '1'; } catch (_) { return false; }
  };

  const clearTimers = () => {
    clearTimeout(reconnectTimer);
    clearTimeout(stallTimer);
    reconnectTimer = 0;
    stallTimer = 0;
  };

  const reconnect = reason => {
    const a = getAudio();
    if (!a || !wanted || manualPause || reconnecting) return;

    reconnecting = true;
    attempts = Math.min(attempts + 1, 8);
    const delay = Math.min(10000, 500 * Math.pow(1.55, attempts - 1));

    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      reconnecting = false;
      if (!wanted || manualPause) return;

      const resume = !a.paused;
      try { a.pause(); } catch (_) {}
      a.src = STREAM_URL + '?vm_reconnect=' + Date.now();
      a.load();

      if (resume || wanted) {
        const p = a.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    }, delay);

    console.warn('[VM RADIO] reconnexion du flux:', reason, 'tentative', attempts);
  };

  const armStallRecovery = reason => {
    if (!wanted || manualPause) return;
    clearTimeout(stallTimer);
    stallTimer = setTimeout(() => reconnect(reason), 6500);
  };

  const bind = () => {
    const a = getAudio();
    if (!a || a.dataset.vmAudioRecoveryV2) return !!a;
    a.dataset.vmAudioRecoveryV2 = '1';

    if (readWanted() && !a.paused) wanted = true;

    a.addEventListener('play', () => {
      manualPause = false;
      saveWanted(true);
      attempts = 0;
      clearTimeout(stallTimer);
    });

    a.addEventListener('playing', () => {
      reconnecting = false;
      attempts = 0;
      clearTimers();
    });

    a.addEventListener('canplay', () => clearTimeout(stallTimer));

    a.addEventListener('pause', () => {
      // A pause event by itself is not enough to decide that the user stopped playback.
      // The player remains the authority for explicit user pause state.
      clearTimers();
      if (manualPause) saveWanted(false);
    });

    a.addEventListener('stalled', () => armStallRecovery('stalled'));
    a.addEventListener('waiting', () => armStallRecovery('waiting'));
    a.addEventListener('error', () => reconnect('error'));
    a.addEventListener('ended', () => reconnect('ended'));

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && wanted && !manualPause) {
        setTimeout(() => {
          const current = getAudio();
          if (!current) return;
          if (current.paused || current.readyState < 2) reconnect('retour au premier plan');
          else current.play().catch(() => {});
        }, 350);
      }
    });

    window.addEventListener('pageshow', () => {
      if (wanted && !manualPause) {
        setTimeout(() => reconnect('retour dans l’application'), 500);
      }
    });

    window.addEventListener('online', () => {
      if (wanted && !manualPause) reconnect('connexion rétablie');
    });

    return true;
  };

  const patchPlayerControls = () => {
    const a = getAudio();
    if (!a || a.dataset.vmAudioControlsV2) return;
    a.dataset.vmAudioControlsV2 = '1';

    // Mark an explicit pause only when the media was already playing and the user action
    // causes the audio to pause. The existing player remains responsible for the UI.
    a.addEventListener('pause', () => {
      if (document.visibilityState === 'visible') {
        manualPause = true;
        saveWanted(false);
      }
    }, true);
  };

  const init = () => {
    bind();
    patchPlayerControls();
    if (!audio) setTimeout(init, 500);
  };

  init();
})();
