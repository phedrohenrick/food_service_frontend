import { isLoginInProgress, loginWithRedirect } from '../auth/keycloak';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:81';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = { ...options };
    config.headers = {
      ...(options.headers || {}),
    };

    if (config.method && config.method !== 'GET') {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const deriveSlugFromLocation = () => {
      try {
        if (typeof window !== 'undefined' && window.location) {
          const p = window.location.pathname || '';
          const m = /^\/([^/]+)\/(dashboard|app)(\/|$)/i.exec(p);
          if (m && m[1]) return m[1];
        }
      } catch (_) {}
      return null;
    };
    const urlSlug = deriveSlugFromLocation();
    const storedSlug = (() => {
      try { return localStorage.getItem('tenantSlug'); } catch (_) { return null; }
    })();
    const finalSlug = urlSlug || storedSlug;
    if (finalSlug && !config.headers['X-Tenant-Slug']) {
      config.headers['X-Tenant-Slug'] = finalSlug;
    }

    const publicGetPrefixes = [
      '/tenants', '/menu-items', '/menu-categories', '/options', '/option-groups', '/banners', '/neighborhoods'
    ];
    const isGet = !config.method || config.method.toUpperCase() === 'GET';
    const isPublicGet = isGet && publicGetPrefixes.some(p => String(endpoint || '').startsWith(p));
    if (!isPublicGet) {
      const token = (() => { try { return localStorage.getItem('authToken'); } catch (_) { return null; } })();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Reautentica apenas em 401. Em 403 o usuário está autenticado, mas sem permissão.
        if (response.status === 401 && typeof window !== 'undefined') {
          const path = window.location?.pathname || '';
          const isCustomerApp = /\/app(\/|$)/i.test(path);
          const hasAuthCallbackParams = /[?#].*(code=|session_state=|state=|iss=)/.test(window.location.href || '');
          if (isCustomerApp && !hasAuthCallbackParams && !isLoginInProgress()) {
            try { localStorage.removeItem('authToken'); } catch (_) {}
            try {
              await loginWithRedirect(window.location.href);
            } catch (_) {}
          }
        }
        const errorBody = await response.text().catch(() => '');
        console.error('API Error Body:', errorBody);
        throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
      }

      // Handle empty responses (like 204 No Content or empty 200 OK)
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
