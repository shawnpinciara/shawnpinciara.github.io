const SPOTIFY_CLIENT_ID = '9e9bf7c4b17c4a48b48b947372103cd5';

// Redirect URI auto-adattato all'ambiente:
// - Sito:    https://shawnpinciara.github.io/spotifylooper
// - Locale:  http://127.0.0.1:3000
// Aggiungi ENTRAMBI nel Spotify Dashboard -> Impostazioni -> Redirect URIs
const REDIRECT_URI = window.location.origin + window.location.pathname.replace(/\/$/, '');
