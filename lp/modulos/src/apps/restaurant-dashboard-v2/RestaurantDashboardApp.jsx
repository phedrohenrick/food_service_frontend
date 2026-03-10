import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './src/components/layout/DashboardLayout';
import { Dashboard } from './src/pages';
import Orders from './src/pages/Orders';
import Menu from './src/pages/Menu';
import Settings from './src/pages/Settings';
import { initKeycloak } from './keycloak';

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
      } catch (_) {}
    }
  }, [location.pathname, location.search]);
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
