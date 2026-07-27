const SPOTIFY_CLIENT_ID = '9e9bf7c4b17c4a48b48b947372103cd5';

// Redirect URI auto-detects based on environment:
// - Site:     https://shawnpinciara.github.io/spotifylooper
// - Local:    http://127.0.0.1:3000
// Add BOTH in Spotify Dashboard -> Settings -> Redirect URIs
const REDIRECT_URI = window.location.origin + window.location.pathname.replace(/\/$/, '');
