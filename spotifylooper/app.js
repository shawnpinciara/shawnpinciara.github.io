const API = 'https://api.spotify.com/v1';

const LOOP_IDLE = 0, LOOP_REC = 1, LOOP_ACTIVE = 2;

const state = {
  playlistId: null,
  playlistName: null,
  track: null,
  contextUri: null,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  deviceActive: false,
  punchIn: null,
  punchOut: null,
  looping: false,
  loopCooldown: false,
  pollInt: null,
  punchTrackId: null,
  seeking: false,
  seekCooldown: 0,
  loopState: LOOP_IDLE,
  isPremium: false,
};

const $ = id => document.getElementById(id);
const show = id => document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')) || $(id).classList.remove('hidden');
const fmt = ms => { const s = Math.floor(Math.max(0, ms) / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

/* ---- toast ---- */
let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

/* ---- API wrapper ---- */
async function api(method, path, body) {
  const doFetch = async () => {
    const opts = { method, headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const token = getToken();
    console.debug('API req', method, path, token ? 'token:' + token.slice(0,10) + '...' : 'no token');
    const r = await fetch(API + path, opts);
    if (r.status === 204) return null;
    if (r.status === 401) { throw new Error('401'); }
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      console.error('API error', r.status, method, path, body);
      let msg;
      try { const j = JSON.parse(body); msg = j.error?.message || j.error_description || 'Errore ' + r.status; } catch(_) { msg = 'Errore ' + r.status; }
      throw new Error(msg);
    }
    return r.json().catch(() => null);
  };
  try {
    return await doFetch();
  } catch (e) {
    if (e.message === '401') {
      const ok = await refreshToken();
      if (ok) return doFetch();
      throw new Error('SESSION_EXPIRED');
    }
    throw e;
  }
}

/* ---- screens ---- */
function showLogin() { show('login-screen'); }
function showLoading() { show('loading-screen'); }

/* ---- playlists ---- */
async function loadPlaylists() {
  show('playlists-screen');
  const el = $('playlists-list');
  el.innerHTML = '<div class="loading-content"><div class="spinner"></div></div>';

  try {
    const [profile, data] = await Promise.all([
      api('GET', '/me'),
      api('GET', '/me/playlists?limit=50'),
    ]);
    if (!data) return;
    state.user = profile;

    const html = [];
    html.push(`<div class="item" data-id="liked">
      <div class="item-img" style="background:linear-gradient(135deg,#450af5,#c4efd9);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:22px">&#9829;</div>
      <div class="item-info"><div class="item-name">Brani salvati</div><div class="item-sub">Salvati &middot; Spotify</div></div>
    </div>`);

    for (const pl of data.items) {
      const img = pl.images?.[0]?.url || '';
      html.push(`<div class="item" data-id="${pl.id}">
        <img class="item-img" src="${img}" alt="" loading="lazy" crossorigin="anonymous" onerror="this.style.display='none'">
        <div class="item-info"><div class="item-name">${esc(pl.name)}</div><div class="item-sub">${pl.tracks?.total || 0} brani</div></div>
      </div>`);
    }
    el.innerHTML = html.join('');

    el.querySelectorAll('.item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        if (id === 'liked') loadLikedTracks();
        else loadTracks(id, item.querySelector('.item-name')?.textContent || 'Playlist');
      });
    });
  } catch (e) {
    console.error('loadPlaylists error:', e);
    clearToken(); clearRefreshTk(); showLogin();
  }
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ---- liked tracks ---- */
async function loadLikedTracks() {
  show('tracks-screen');
  $('tracks-title').textContent = 'Brani salvati';
  state.playlistId = 'liked';
  state.playlistName = 'Brani salvati';
  const el = $('tracks-list');
  el.innerHTML = '<div class="loading-content"><div class="spinner"></div></div>';

  try {
    const data = await api('GET', '/me/tracks?limit=50');
    if (!data) return;
    renderTracks(data.items.map(i => i.track), null);
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') { clearToken(); clearRefreshTk(); showLogin(); return; }
    el.innerHTML = '<p style="color:#b3b3b3;text-align:center">Errore</p>';
    toast(e.message);
  }
}

/* ---- tracks in playlist ---- */
async function loadTracks(playlistId, name) {
  show('tracks-screen');
  $('tracks-title').textContent = name;
  state.playlistId = playlistId;
  state.playlistName = name;
  const el = $('tracks-list');
  el.innerHTML = '<div class="loading-content"><div class="spinner"></div></div>';

  try {
    const data = await api('GET', `/playlists/${playlistId}/tracks?limit=50`);
    if (!data) return;
    const tracks = data.items.map(i => i.track).filter(Boolean);
    renderTracks(tracks, `spotify:playlist:${playlistId}`);
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') { clearToken(); clearRefreshTk(); showLogin(); return; }
    el.innerHTML = '<p style="color:#b3b3b3;text-align:center">Errore</p>';
    toast(e.message);
  }
}

function renderTracks(tracks, contextUri) {
  const el = $('tracks-list');
  if (!tracks.length) {
    el.innerHTML = '<p style="color:#b3b3b3;text-align:center;padding:20px">Nessun brano</p>';
    return;
  }

  const html = tracks.map((t, i) => {
    if (!t) return '';
    const img = t.album?.images?.[2]?.url || t.album?.images?.[0]?.url || '';
    const artists = t.artists?.map(a => a.name).join(', ') || '';
    return `<div class="item" data-uri="${t.uri}" data-context="${contextUri||''}">
      <span class="item-idx">${i + 1}</span>
      <img class="item-img" src="${img}" alt="" loading="lazy" crossorigin="anonymous" onerror="this.style.display='none'">
      <div class="item-info"><div class="item-name">${esc(t.name)}</div><div class="item-sub">${esc(artists)}</div></div>
    </div>`;
  }).join('');

  el.innerHTML = html;
  el.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
      const uri = item.dataset.uri;
      const ctx = item.dataset.context || null;
      playTrack(uri, ctx);
    });
  });
}

/* ---- player ---- */
async function playTrack(uri, contextUri) {
  resetLoop();
  show('player-screen');
  $('player-ui').classList.add('hidden');
  $('no-device-msg').classList.add('hidden');

  state.contextUri = contextUri;
  state.track = null;

  try {
    const body = { position_ms: 0 };
    if (contextUri) {
      body.context_uri = contextUri;
      body.offset = { uri };
    } else {
      body.uris = [uri];
    }

    await api('PUT', '/me/player/play', body);

    const trackUri = uri;
    const trackId = uri.split(':').pop();

    state.currentTrackUri = trackUri;
    state.currentTrackId = trackId;

    const trackInfo = await findTrackInfo(uri);
    if (trackInfo) {
      state.track = trackInfo;
      updatePlayerUI(trackInfo);
    }

    $('player-ui').classList.remove('hidden');
    state.deviceActive = true;
    startPolling();

  } catch (e) {
    if (e.message?.includes('NO_ACTIVE_DEVICE') || e.message?.includes('no active') || e.message?.includes('device')) {
      $('no-device-msg').classList.remove('hidden');
      $('player-ui').classList.add('hidden');
      state.deviceActive = false;
      toast('Nessun dispositivo attivo. Apri Spotify e riprova.');
    } else {
      toast(e.message);
      show('tracks-screen');
    }
  }
}

async function findTrackInfo(uri) {
  try {
    const id = uri.split(':').pop();
    const t = await api('GET', `/tracks/${id}`);
    if (t) {
      return {
        id: t.id,
        uri: t.uri,
        name: t.name,
        artists: t.artists?.map(a => a.name).join(', ') || '',
        image: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
        duration_ms: t.duration_ms,
      };
    }
  } catch (_) {}
  return null;
}

function updatePlayerUI(track) {
  if (!track) return;
  $('track-img').src = track.image || '';
  $('track-name').textContent = track.name;
  $('track-artist').textContent = track.artists;
  $('time-total').textContent = fmt(track.duration_ms || 0);
}

function updateProgress(positionMs, durationMs) {
  if (durationMs <= 0) return;
  const pct = Math.min(positionMs / durationMs, 1);
  $('progress-bar').value = pct * 1000;
  $('time-current').textContent = fmt(positionMs);
  updateLoopOverlay(durationMs);
}

function updateLoopOverlay(durationMs) {
  const ov = $('loop-overlay');
  if (!state.looping || !durationMs) {
    ov.classList.remove('active');
    return;
  }
  const inPct = Math.max(0, Math.min((state.punchIn || 0) / durationMs, 1));
  const outPct = Math.max(0, Math.min((state.punchOut || durationMs) / durationMs, 1));
  ov.style.left = (inPct * 100) + '%';
  ov.style.width = ((outPct - inPct) * 100) + '%';
  ov.classList.add('active');
}

/* ---- polling ---- */
function startPolling() {
  stopPolling();
  state.pollInt = setInterval(pollPlayback, 800);
  pollPlayback();
}

function stopPolling() {
  if (state.pollInt) { clearInterval(state.pollInt); state.pollInt = null; }
}

async function pollPlayback() {
  try {
    const data = await api('GET', '/me/player');
    if (!data || !data.item) {
      state.deviceActive = false;
      return;
    }

    state.deviceActive = true;
    state.isPlaying = data.is_playing;
    if (Date.now() >= state.seekCooldown || !state.seekCooldown) {
      state.positionMs = data.progress_ms || 0;
      state.seekCooldown = 0;
    }
    state.durationMs = data.item.duration_ms || 0;

    const trackId = data.item.id;
    if (state.currentTrackId !== trackId) {
      state.currentTrackId = trackId;
      state.currentTrackUri = data.item.uri;
      state.loopState = LOOP_IDLE;
      state.punchIn = null;
      state.punchOut = null;
      state.punchTrackId = null;
      state.looping = false;
      state.loopCooldown = false;
      $('loop-overlay').classList.remove('active');
      updateLoopBtn();

      state.track = {
        id: trackId,
        uri: data.item.uri,
        name: data.item.name,
        artists: data.item.artists?.map(a => a.name).join(', ') || '',
        image: data.item.album?.images?.[1]?.url || data.item.album?.images?.[0]?.url || '',
        duration_ms: state.durationMs,
      };
      updatePlayerUI(state.track);
    } else if (state.track) {
      state.track.duration_ms = state.durationMs;
    }

    updateProgress(state.positionMs, state.durationMs);
    updatePlayPauseBtn(data.is_playing);

    if (state.looping && !state.loopCooldown && state.punchIn != null && state.punchOut != null) {
      if (state.positionMs >= state.punchOut) {
        state.loopCooldown = true;
        doSeek(state.punchIn);
        setTimeout(() => { state.loopCooldown = false; }, 600);
      }
    }

  } catch (e) {
    if (e.message?.includes('NO_ACTIVE_DEVICE')) {
      state.deviceActive = false;
    }
  }
}

function updatePlayPauseBtn(playing) {
  $('playpause-btn').textContent = playing ? '\u23F8' : '\u25B6';
}

/* ---- seek ---- */
async function doSeek(posMs) {
  const p = Math.max(0, Math.min(posMs, state.durationMs || 999999999));
  state.positionMs = p; state.seekCooldown = Date.now() + 1000;
  updateProgress(p, state.durationMs);
  try {
    await api('PUT', '/me/player/seek?position_ms=' + Math.round(p));
  } catch (e) { toast(e.message); }
}

function seekBy(sec) {
  if (!state.deviceActive) { toast('Nessun dispositivo attivo'); return; }
  doSeek(state.positionMs + sec * 1000);
}

/* ---- playback controls ---- */
async function togglePlayPause() {
  if (!state.deviceActive) { toast('Nessun dispositivo attivo'); return; }
  try {
    if (state.isPlaying) {
      await api('PUT', '/me/player/pause');
      state.isPlaying = false;
    } else {
      await api('PUT', '/me/player/play');
      state.isPlaying = true;
    }
    updatePlayPauseBtn(state.isPlaying);
  } catch (e) { toast(e.message); }
}

async function nextTrack() {
  if (!state.deviceActive) { toast('Nessun dispositivo attivo'); return; }
  try {
    await api('POST', '/me/player/next');
    resetLoop();
  } catch (e) { toast(e.message); }
}

async function prevTrack() {
  if (!state.deviceActive) { toast('Nessun dispositivo attivo'); return; }
  try {
    await api('POST', '/me/player/previous');
    resetLoop();
  } catch (e) { toast(e.message); }
}

function resetLoop() {
  state.punchIn = null;
  state.punchOut = null;
  state.punchTrackId = null;
  state.loopState = LOOP_IDLE;
  state.looping = false;
  state.loopCooldown = false;
  $('loop-overlay').classList.remove('active');
  updateLoopBtn();
}

function updateLoopBtn() {
  const btn = $('loop-btn');
  const ts = $('loop-ts');
  btn.className = 'btn btn-loop';
  switch (state.loopState) {
    case LOOP_IDLE:
      btn.textContent = 'START RECORD LOOP';
      btn.classList.add('btn-loop-idle');
      ts.classList.add('hidden');
      break;
    case LOOP_REC:
      btn.textContent = 'STOP RECORD LOOP';
      btn.classList.add('btn-loop-recording');
      ts.classList.add('hidden');
      break;
    case LOOP_ACTIVE:
      btn.textContent = 'STOP LOOP';
      btn.classList.add('btn-loop-looping');
      ts.textContent = fmt(state.punchIn) + ' \u2192 ' + fmt(state.punchOut);
      ts.classList.remove('hidden');
      break;
  }
}

function handleLoopBtn() {
  if (!state.deviceActive) { toast('Nessun dispositivo attivo'); return; }

  switch (state.loopState) {
    case LOOP_IDLE:
      state.punchIn = state.positionMs;
      state.punchTrackId = state.currentTrackId;
      state.loopState = LOOP_REC;
      updateLoopBtn();
      toast('IN: ' + fmt(state.punchIn));
      break;

    case LOOP_REC:
      state.punchOut = state.positionMs;
      if (state.punchOut <= state.punchIn) {
        toast('Il loop deve essere di almeno 1 secondo');
        state.punchOut = null;
        return;
      }
      state.looping = true;
      state.loopCooldown = false;
      state.loopState = LOOP_ACTIVE;
      updateLoopBtn();
      if (state.positionMs >= state.punchOut) {
        doSeek(state.punchIn);
      }
      toast('Loop: ' + fmt(state.punchIn) + ' \u2192 ' + fmt(state.punchOut));
      break;

    case LOOP_ACTIVE:
      state.looping = false;
      state.loopCooldown = false;
      state.punchIn = null;
      state.punchOut = null;
      state.punchTrackId = null;
      state.loopState = LOOP_IDLE;
      $('loop-overlay').classList.remove('active');
      updateLoopBtn();
      toast('Loop fermato');
      break;
  }
}

/* ---- init ---- */
async function init() {
  toggleTheme();
  const token = getToken();

  if (await handleRedirect()) {
    await loadPlaylists();
    return;
  }

  if (!token) { showLogin(); return; }

  try {
    state.user = await api('GET', '/me');
    if (!state.user?.id) { showLogin(); return; }
    await loadPlaylists();
  } catch (e) {
    console.error('init error:', e);
    clearToken(); clearRefreshTk();
    showLogin();
  }
}

function toggleTheme() {
  if (!document.querySelector('meta[name="theme-color"]')) {
    const m = document.createElement('meta'); m.name = 'theme-color'; m.content = '#F5F0EB'; document.head.appendChild(m);
  }
}

/* ---- event wiring ---- */
document.addEventListener('DOMContentLoaded', () => {
  $('login-btn').addEventListener('click', redirectToSpotifyLogin);
  $('logout-btn').addEventListener('click', () => {
    stopLoop(); stopPolling();
    clearToken(); clearRefreshTk();
    state.deviceActive = false;
    showLogin();
  });

  $('back-from-tracks').addEventListener('click', () => loadPlaylists());
  $('back-from-player').addEventListener('click', () => {
    stopPolling();
    show(state.playlistId ? 'tracks-screen' : 'playlists-screen');
  });

  $('retry-btn').addEventListener('click', async () => {
    $('no-device-msg').classList.add('hidden');
    $('player-ui').classList.add('hidden');
    try {
      const devices = await api('GET', '/me/player/devices');
      if (devices?.devices?.length) {
        toast('Dispositivo trovato!');
        $('player-ui').classList.remove('hidden');
        state.deviceActive = true;
        startPolling();
      } else {
        $('no-device-msg').classList.remove('hidden');
        toast('Nessun dispositivo Spotify attivo');
      }
    } catch (_) {
      $('no-device-msg').classList.remove('hidden');
    }
  });

  document.querySelectorAll('.btn-seek').forEach(btn => {
    btn.addEventListener('click', () => seekBy(parseInt(btn.dataset.offset)));
  });

  $('playpause-btn').addEventListener('click', togglePlayPause);
  $('prev-btn').addEventListener('click', prevTrack);
  $('next-btn').addEventListener('click', nextTrack);

  $('loop-btn').addEventListener('click', handleLoopBtn);

  $('progress-bar').addEventListener('input', () => {
    if (!state.deviceActive || !state.durationMs) return;
    if (state.looping) resetLoop();
    const pct = parseFloat($('progress-bar').value) / 1000;
    const pos = Math.round(pct * state.durationMs);
    state.positionMs = pos;
    $('time-current').textContent = fmt(pos);
  });

  $('progress-bar').addEventListener('change', () => {
    if (!state.deviceActive || !state.durationMs) return;
    const pct = parseFloat($('progress-bar').value) / 1000;
    doSeek(Math.round(pct * state.durationMs));
  });

  init();
});
