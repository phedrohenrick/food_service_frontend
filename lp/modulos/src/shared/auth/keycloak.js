import Keycloak from 'keycloak-js';

const kcBaseConfig = {
  url: process.env.REACT_APP_KC_URL || 'http://localhost:8080',
  realm: process.env.REACT_APP_KC_REALM || 'priatoo',
};
const defaultClientId = process.env.REACT_APP_KC_CLIENT_ID || 'frontend-web';
const merchantClientId = process.env.REACT_APP_KC_MERCHANT_CLIENT_ID || 'restaurant-owner-portal';

let keycloak = null;
let currentClientId = null;
let initialized = false;
let refreshTimer = null;
let initPromise = null;
let ssoPromise = null;
const LOGIN_IN_PROGRESS_KEY = 'kcLoginInProgress';
const LOGIN_TS_KEY = 'kcLoginStartedAt';

function getPathFromTarget(target) {
  if (!target) {
    return typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
  }
  try {
    if (/^https?:\/\//i.test(target)) {
      return new URL(target).pathname || '/';
    }
    if (target.startsWith('/')) {
      return target;
    }
    if (typeof window !== 'undefined') {
      return new URL(target, window.location.origin).pathname || '/';
    }
  } catch (_) {}
  return typeof target === 'string' ? target : '/';
}

function isMerchantRoute(pathname) {
  return /^\/onboarding(\/|$)/i.test(pathname || '')
    || /^\/(?:[^/]+\/)?dashboard(\/|$)/i.test(pathname || '');
}

function resolveClientId(target) {
  const pathname = getPathFromTarget(target);
  return isMerchantRoute(pathname) ? merchantClientId : defaultClientId;
}

function clearRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

function setLoginInProgress(flag) {
  try {
    if (flag) {
      sessionStorage.setItem(LOGIN_IN_PROGRESS_KEY, '1');
      sessionStorage.setItem(LOGIN_TS_KEY, String(Date.now()));
    } else {
      sessionStorage.removeItem(LOGIN_IN_PROGRESS_KEY);
      sessionStorage.removeItem(LOGIN_TS_KEY);
    }
  } catch (_) {}
}

export function isLoginInProgress() {
  try {
    const active = sessionStorage.getItem(LOGIN_IN_PROGRESS_KEY) === '1';
    const startedAt = Number(sessionStorage.getItem(LOGIN_TS_KEY) || 0);
    if (!active) {
      return false;
    }
    if (!startedAt || (Date.now() - startedAt) > 120000) {
      setLoginInProgress(false);
      return false;
    }
    return true;
  } catch (_) {
    return false;
  }
}

function hasAuthCallbackParamsInUrl(urlValue) {
  return /[?#].*(code=|session_state=|state=|iss=)/.test(urlValue || '');
}

function hasAuthCallbackParams() {
  if (typeof window === 'undefined') {
    return false;
  }
  return hasAuthCallbackParamsInUrl(window.location.href || '');
}

function clearAuthCallbackParams() {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const url = new URL(window.location.href);
    ['code', 'session_state', 'state', 'iss'].forEach((key) => {
      url.searchParams.delete(key);
    });
    url.hash = '';
    const next = `${url.pathname}${url.search}`;
    window.history.replaceState(null, '', next || '/');
  } catch (_) {}
}

function persistToken(instance) {
  try {
    localStorage.setItem('authToken', instance.token || '');
  } catch (_) {}
}

function ensureKeycloak(target) {
  const clientId = resolveClientId(target);
  if (!keycloak || currentClientId !== clientId) {
    clearRefreshTimer();
    initialized = false;
    initPromise = null;
    currentClientId = clientId;
    keycloak = new Keycloak({ ...kcBaseConfig, clientId });
  }
  return keycloak;
}

function startRefreshLoop(instance) {
  clearRefreshTimer();
  refreshTimer = setInterval(async () => {
    try {
      const refreshed = await instance.updateToken(30);
      if (refreshed) {
        persistToken(instance);
      }
    } catch (_) {}
  }, 20000);
}

export async function initKeycloak(onReady) {
  const instance = ensureKeycloak();
  if (initialized) {
    if (onReady) onReady();
    return;
  }
  if (initPromise) {
    await initPromise;
    if (initialized && onReady) onReady();
    return;
  }
  try {
    initPromise = instance.init({ onLoad: 'login-required', checkLoginIframe: false, pkceMethod: 'S256' });
    const authenticated = await initPromise;
    initialized = true;
    if (authenticated) {
      setLoginInProgress(false);
      persistToken(instance);
      if (hasAuthCallbackParams()) {
        clearAuthCallbackParams();
      }
      if (onReady) onReady();
      startRefreshLoop(instance);
    }
  } catch (_) {}
  finally {
    initPromise = null;
  }
}

export function getKeycloak() {
  return ensureKeycloak();
}

export async function tryRefreshToken() {
  const instance = ensureKeycloak();
  if (!initialized) {
    try { await ensureSso(); } catch (_) {}
  }
  if (!instance.authenticated) return false;
  try {
    await instance.updateToken(0);
    if (instance.authenticated) {
      persistToken(instance);
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

export async function loginWithRedirect(redirectUri, options = {}) {
  const { forcePrompt = false } = options;
  try {
    const instance = ensureKeycloak(redirectUri);
    setLoginInProgress(true);
    // createLoginUrl/login dependem dos endpoints carregados no init(). Em páginas públicas
    // (ex.: tela de planos) o adapter ainda não foi inicializado — sem isto, createLoginUrl
    // lança e o clique "não faz nada". check-sso inicializa sem forçar login nem redirecionar.
    if (!initialized) {
      try {
        await instance.init({ onLoad: 'check-sso', checkLoginIframe: false, pkceMethod: 'S256' });
        initialized = true;
      } catch (_) {}
    }
    const loginOpts = { redirectUri };
    if (forcePrompt) loginOpts.prompt = 'login';
    const url = await instance.createLoginUrl(loginOpts);
    if (typeof window !== 'undefined' && url) {
      window.location.assign(url);
      return;
    }
    await instance.login(loginOpts);
  } catch (_) {
    setLoginInProgress(false);
  }
}

export async function ensureSso() {
  if (ssoPromise) {
    return ssoPromise;
  }
  const instance = ensureKeycloak();
  ssoPromise = (async () => {
    try {
      const href = typeof window !== 'undefined' ? window.location.href : '';
      const hasCallbackParams = hasAuthCallbackParamsInUrl(href);
      if (!initialized || hasCallbackParams) {
        let authenticated = false;
        try {
          authenticated = await instance.init({ onLoad: 'check-sso', checkLoginIframe: false, pkceMethod: 'S256' });
        } catch (_) {
          // init pode falhar se o code já foi consumido / PKCE bateu / etc.
        }
        initialized = true;
        if (hasCallbackParams && typeof window !== 'undefined') {
          // Limpa os params sempre que tentamos processar — code expirado/duplicado
          // ficaria na URL e reprocessaria a cada ensureSso, causando loop.
          clearAuthCallbackParams();
        }
        if (authenticated && typeof window !== 'undefined') {
          persistToken(instance);
          startRefreshLoop(instance);
          setLoginInProgress(false);
        }
      } else {
        try {
          const refreshed = await instance.updateToken(30);
          if (refreshed) persistToken(instance);
        } catch (_) {}
      }
      if (instance.authenticated) {
        persistToken(instance);
        if (!refreshTimer) startRefreshLoop(instance);
        setLoginInProgress(false);
      }
    } catch (_) {}
    return instance.authenticated === true;
  })();
  try {
    return await ssoPromise;
  } finally {
    ssoPromise = null;
  }
}
