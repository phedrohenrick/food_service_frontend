import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './src/components/layout/DashboardLayout.jsx';
import { Dashboard, Orders, Menu, Settings } from './src/pages/index.js';
import { TenantProvider, useTenant } from './src/context/TenantContext.jsx';

const ThemedFrame = ({ children }) => {
  const { accent, accentHover, accentContrast } = useTenant();
  return (
    <div
      style={{
        '--accent': accent,
        '--accent-hover': accentHover,
        '--accent-contrast': accentContrast,
      }}
      className="min-h-screen"
    >
      {children}
    </div>
  );
};

const RestaurantDashboardApp = () => {
  return (
    <TenantProvider>
      <ThemedFrame>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </DashboardLayout>
      </ThemedFrame>
    </TenantProvider>
  );
};

export default RestaurantDashboardApp;