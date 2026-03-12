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
      try { localStorage.setItem('authToken', keycloak.token || ''); } catch (_) {}
      if (onReady) onReady();
      if (refreshTimer) clearInterval(refreshTimer);
      refreshTimer = setInterval(async () => {
        try {
          const refreshed = await keycloak.updateToken(30);
          if (refreshed) {
            try { localStorage.setItem('authToken', keycloak.token || ''); } catch (_) {}
          }
        } catch (_) {}
      }, 20000);
    }
  } catch (_) {}
}

export function getKeycloak() {
  return keycloak;
}

export async function loginWithRedirect(redirectUri) {
  try {
    if (!initialized) {
      await keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false, pkceMethod: 'S256' });
      initialized = true;
      if (keycloak.authenticated) {
        try { localStorage.setItem('authToken', keycloak.token || ''); } catch (_) {}
      }
    }
  } catch (_) {}
  try {
    await keycloak.login({ redirectUri });
  } catch (_) {}
}

export async function ensureSso() {
  try {
    if (!initialized) {
      await keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false, pkceMethod: 'S256' });
      initialized = true;
    } else {
      // Refresh token storage if possible
      await keycloak.updateToken(0).catch(() => {});
    }
    if (keycloak.authenticated) {
      try { localStorage.setItem('authToken', keycloak.token || ''); } catch (_) {}
    }
  } catch (_) {}
  return keycloak.authenticated === true;
}
