import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './src/components/layout/DashboardLayout';
import { Dashboard } from './src/pages';
import Orders from './src/pages/Orders';
import Menu from './src/pages/Menu';
import Settings from './src/pages/Settings';
import { initKeycloak, getKeycloak } from './keycloak';

const RestaurantDashboard = () => {
  const [ready, setReady] = useState(false);
  const initGuard = useRef(false);
  const location = useLocation();
  useEffect(() => {
    if (initGuard.current) {
      setReady(true);
      return;
    }
    initGuard.current = true;
    initKeycloak(() => setReady(true));
  }, []);
  useEffect(() => {
    const path = location.pathname || '';
    let slug = null;
    const m = path.match(/^\/([^/]+)\/dashboard(\/|$)/i);
    if (m && m[1]) slug = m[1];
    if (!slug) {
      const sp = new URLSearchParams(location.search);
      slug = sp.get('slug');
    }
    if (slug) {
      try {
        localStorage.setItem('tenantSlug', slug);
        // Detect tenant switch and enforce fresh authentication
        const prev = sessionStorage.getItem('dashboardPrevSlug');
        const authSlug = localStorage.getItem('authTenantSlug');
        const changed = (prev && prev !== slug) || (authSlug && authSlug !== slug);
        sessionStorage.setItem('dashboardPrevSlug', slug);
        if (changed) {
          try { localStorage.removeItem('authToken'); } catch (_) {}
          const kc = getKeycloak();
          kc.login({ prompt: 'login', redirectUri: window.location.href });
        }
      } catch (_) {}
    }
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (!ready) return;
    const path = location.pathname || '';
    const m = path.match(/^\/([^/]+)\/dashboard(\/|$)/i);
    const slug = m && m[1] ? m[1] : null;
    if (slug) {
      try { localStorage.setItem('authTenantSlug', slug); } catch (_) {}
    }
  }, [ready, location.pathname]);
  if (!ready) return null;
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<Menu />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default RestaurantDashboard;
