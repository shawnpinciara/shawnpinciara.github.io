const SCOPE = 'user-read-playback-state user-modify-playback-state user-read-private playlist-read-private playlist-read-collaborative user-library-read user-read-currently-playing';

function randStr(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(arr).map(b => chars[b % chars.length]).join('');
}

async function sha256(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function getToken() { return localStorage.getItem('sp_token'); }
function setToken(t) { localStorage.setItem('sp_token', t); }
function clearToken() { localStorage.removeItem('sp_token'); }
function getRefreshTk() { return localStorage.getItem('sp_refresh'); }
function setRefreshTk(t) { localStorage.setItem('sp_refresh', t); }
function clearRefreshTk() { localStorage.removeItem('sp_refresh'); }
function getCodeVerifier() { return localStorage.getItem('sp_code_verifier'); }
function setCodeVerifier(v) { localStorage.setItem('sp_code_verifier', v); }
function clearCodeVerifier() { localStorage.removeItem('sp_code_verifier'); }

function getAuthHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function redirectToSpotifyLogin() {
  const cv = randStr(64);
  setCodeVerifier(cv);
  const cc = await sha256(cv);
  const p = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: cc,
    scope: SCOPE,
  });
  window.location.href = 'https://accounts.spotify.com/authorize?' + p.toString();
}

async function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return false;

  const cv = getCodeVerifier();
  if (!cv) return false;
  clearCodeVerifier();

  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: cv,
    }),
  });

  if (!r.ok) throw new Error('Token exchange fallito');

  const d = await r.json();
  console.log('Token ottenuto, scope:', d.scope, 'expires_in:', d.expires_in);
  setToken(d.access_token);
  if (d.refresh_token) setRefreshTk(d.refresh_token);

  window.history.replaceState({}, '', REDIRECT_URI);
  return true;
}

async function refreshToken() {
  const rt = getRefreshTk();
  if (!rt) return false;

  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: rt,
    }),
  });

  if (!r.ok) { clearToken(); clearRefreshTk(); return false; }

  const d = await r.json();
  setToken(d.access_token);
  if (d.refresh_token) setRefreshTk(d.refresh_token);
  return true;
}
