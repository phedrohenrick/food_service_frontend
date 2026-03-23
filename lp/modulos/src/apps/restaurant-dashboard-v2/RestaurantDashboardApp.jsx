import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './src/components/layout/DashboardLayout';
import { Dashboard } from './src/pages';
import Orders from './src/pages/Orders';
import Menu from './src/pages/Menu';
import Settings from './src/pages/Settings';
import { initKeycloak, getKeycloak } from '../../shared/auth/keycloak';
import api from '../../shared/services/api';

const RestaurantDashboard = () => {
  const [ready, setReady] = useState(false);
  const [authDenied, setAuthDenied] = useState(false);
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
    const m = path.match(/^\/([^/]+)\/dashboard(\/|$)/i);
    const slug = m && m[1] ? m[1] : null;
    if (slug) {
      try { localStorage.setItem('tenantSlug', slug); } catch (_) {}
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
    (async () => {
      try {
        await api.get('/tenant-auth/tenant-access');
        setAuthDenied(false);
      } catch (e) {
        setAuthDenied(true);
      }
    })();
  }, [ready, location.pathname]);
  if (!ready) return null;
  if (authDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-2xl bg-white p-6 shadow text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Acesso negado a esta loja</h2>
          <p className="text-sm text-gray-600">Você não tem permissão para acessar este painel. Entre com uma conta autorizada para este tenant.</p>
          <button
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            onClick={() => getKeycloak().login({ prompt: 'login', redirectUri: window.location.href })}
          >Trocar de conta</button>
        </div>
      </div>
    );
  }
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
