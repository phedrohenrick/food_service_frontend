import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './src/components/layout/DashboardLayout';
import { Dashboard } from './src/pages';
import Orders from './src/pages/Orders';
import Menu from './src/pages/Menu';
import Settings from './src/pages/Settings';
import { StorefrontProvider } from '../../features/context/generalContext.jsx';

const RestaurantDashboard = () => {
  return (
    <StorefrontProvider>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </StorefrontProvider>
  );
};

export default RestaurantDashboard;