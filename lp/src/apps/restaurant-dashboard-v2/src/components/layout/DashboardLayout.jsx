import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { tenant } = useTenant();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Pedidos', href: '/dashboard/orders', icon: '📋' },
    { name: 'Cardápio', href: '/dashboard/menu', icon: '🍽️' },
    { name: 'Configurações', href: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-100 bg-[var(--accent)] text-[var(--accent-contrast)]">
          <img src={tenant.logoUrl} alt={tenant.name} className="w-8 h-8 rounded-full object-cover" />
          <div>
            <p className="text-sm opacity-80">Workspace</p>
            <h1 className="text-base font-semibold">{tenant.name}</h1>
          </div>
        </div>

        <nav className="mt-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors ${
                location.pathname === item.href ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-r-2 border-[var(--accent)]' : ''
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 bg-white shadow-sm px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Bem-vindo(a)</span>
            <div className="w-9 h-9 bg-[var(--accent)] rounded-full flex items-center justify-center">
              <span className="text-[var(--accent-contrast)] text-sm font-semibold">{tenant.name?.[0] || 'R'}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;