import Keycloak from 'keycloak-js';

const kcConfig = {
  url: process.env.REACT_APP_KC_URL || 'http://localhost:8080',
  realm: process.env.REACT_APP_KC_REALM || 'food-service-realm',
  clientId: process.env.REACT_APP_KC_CLIENT_ID || 'frontend-web',
};

const keycloak = new Keycloak(kcConfig);
let initialized = false;
let refreshTimer = null;

export async function initKeycloak(onReady) {
  if (initialized) {
    if (onReady) onReady();
    return;
  }
  try {
    const authenticated = await keycloak.init({ onLoad: 'login-required', checkLoginIframe: false, pkceMethod: 'S256' });
    initialized = true;
    if (authenticated) {
      localStorage.setItem('authToken', keycloak.token || '');
      if (onReady) onReady();
      if (refreshTimer) clearInterval(refreshTimer);
      refreshTimer = setInterval(async () => {
        try {
          const refreshed = await keycloak.updateToken(30);
          if (refreshed) {
            localStorage.setItem('authToken', keycloak.token || '');
          }
        } catch (_) {}
      }, 20000);
    }
  } catch (_) {}
}

export function getKeycloak() {
  return keycloak;
}
