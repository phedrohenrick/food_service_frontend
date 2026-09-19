import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { getKeycloak, clearToken } from '../../../../../shared/auth/keycloak';

// Accent fixo da marca Priatoo (o painel admin não é de um tenant específico).
const ACCENT_VARS = {
  '--accent': '#FF7F27',
  '--accent-hover': '#DD3F0C',
  '--accent-contrast': '#ffffff',
};

const BASE = '/admin';

const navItems = [
  { label: 'Visão geral', to: BASE, icon: LayoutDashboard, end: true },
];

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const kc = getKeycloak();
  const displayName =
    kc?.tokenParsed?.name || kc?.tokenParsed?.preferred_username || 'Admin';
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    try {
      clearToken();
      kc?.logout?.({ redirectUri: window.location.origin });
    } catch (_) {
      window.location.assign('/login/lojista');
    }
  };

  const isActive = (item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={ACCENT_VARS}
    >
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-[1px_0_0_0_rgba(15,23,42,0.06)] transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-contrast)] font-bold shadow-sm shadow-orange-500/30">
              P
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Priatoo</p>
              <h1 className="text-lg font-semibold text-gray-900">Painel Admin</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm shadow-orange-500/25'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Conteúdo */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 backdrop-blur-xl shadow-[0_1px_0_0_rgba(15,23,42,0.06)] px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
            <p className="text-sm text-gray-500 hidden sm:block">Administração da plataforma</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-gray-600 sm:block">{displayName}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold ring-2 ring-white shadow-sm">
              {initials}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-6">{children}</main>
      </div>
    </div>
  );
}
