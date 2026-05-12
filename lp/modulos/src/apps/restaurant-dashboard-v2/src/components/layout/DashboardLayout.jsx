import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStorefront } from '../../../../../shared/generalContext.jsx';
import { getKeycloak } from '../../../../../shared/auth/keycloak';
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { GrRestaurant } from "react-icons/gr";
import { MdMenuBook } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { IoBarChartOutline } from "react-icons/io5";
import { MdTableRestaurant } from "react-icons/md";

const navItems = [
  { label: 'Visão geral', suffix: '', icon: <RiDashboardHorizontalFill /> },
  { label: 'Pedidos', suffix: 'orders', icon: <MdMenuBook /> },
  { label: 'Mesas', suffix: 'mesas', icon: <MdTableRestaurant /> },
  { label: 'Cardápio', suffix: 'menu', icon: <MdOutlineRestaurantMenu /> },
  { label: 'Métricas', suffix: 'metricas', icon: <IoBarChartOutline /> },
  { label: 'Configurações', suffix: 'settings', icon: <MdOutlineSettings /> },
];

const DashboardLayoutv2 = ({ children, onHelp }) => {
  const { tenant, user, updateTenant } = useStorefront();
  // normaliza cor para formato hex #RRGGBB
  // aceita: #RGB, #RRGGBB, #RRGGBBAA, RGB/RGBA
  function normalizeHex(input) {
    const s = String(input || '').trim();
    if (!s) return '#EA1D2C';

    // Se já for hex sem #, adiciona
    const maybeHash = s.startsWith('#') ? s : (/^[0-9a-fA-F]{3,8}$/.test(s) ? `#${s}` : s);
    const short3 = /^#([0-9a-fA-F]{3})$/;
    const long6 = /^#([0-9a-fA-F]{6})$/;
    const long8 = /^#([0-9a-fA-F]{8})$/;

    if (short3.test(maybeHash)) {
      const m = maybeHash.slice(1);
      const full = m.split('').map((c) => c + c).join('');
      return `#${full}`;
    }
    if (long6.test(maybeHash)) return maybeHash;
    if (long8.test(maybeHash)) {
      // Ignora alpha (#RRGGBBAA → #RRGGBB)
      return `#${maybeHash.slice(1, 7)}`;
    }

    // rgb/rgba(r,g,b[,a]) → #RRGGBB
    const rgbaMatch = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*(?:\.\d+)?))?\s*\)$/i.exec(s);
    if (rgbaMatch) {
      const toHex2 = (n) => {
        const v = Math.max(0, Math.min(255, parseInt(n, 10) || 0));
        return v.toString(16).padStart(2, '0');
      };
      const r = toHex2(rgbaMatch[1]);
      const g = toHex2(rgbaMatch[2]);
      const b = toHex2(rgbaMatch[3]);
      return `#${r}${g}${b}`;
    }

    return '#EA1D2C';
  }
  function toRgba(hex, alpha = 0.9) {
    const h = normalizeHex(hex).slice(1);
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const accent = normalizeHex(tenant?.main_color || '#EA1D2C');
  const accentHover = toRgba(accent, 0.90);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  const initials = useMemo(() => {
    const name = tenant?.name || '';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return 'RS';
  }, [tenant?.name]);

  useEffect(() => {
    if (!showUserDropdown) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserDropdown]);

  const handleLogout = () => {
    try { localStorage.removeItem('authToken'); } catch (_) {}
    try { localStorage.removeItem('tenantSlug'); } catch (_) {}
    try { localStorage.removeItem('authTenantSlug'); } catch (_) {}
    getKeycloak().logout({ redirectUri: window.location.origin });
  };

  function getContrast(hex) {
    const normalized = (hex || '').replace('#', '');
    const full = normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized.padEnd(6, '0');
    const r = parseInt(full.substring(0, 2), 16) / 255;
    const g = parseInt(full.substring(2, 4), 16) / 255;
    const b = parseInt(full.substring(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.6 ? '#0f172a' : '#ffffff';
  }
  const accentContrast = getContrast(accent);

  

  const basePrefix = (() => {
    const m = /^\/([^/]+)\/dashboard(\/|$)/i.exec(location.pathname || '');
    if (m && m[1]) return `/${m[1]}/dashboard`;
    return '/dashboard';
  })();

  const isActive = (suffix) => {
    const target = suffix ? `${basePrefix}/${suffix}` : basePrefix;
    if (!suffix) return location.pathname === basePrefix;
    return location.pathname.startsWith(target);
  };

  return (
    
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-10"
      style={{
        '--accent': accent,
        '--accent-hover': accentHover,
        '--accent-contrast': accentContrast,
      }}
    >
      {/* CHANGE 1: removi max-w e mx-auto, e garanti largura total */}
      <div className="flex w-full">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 bg-white/80 backdrop-blur-lg border-r border-gray-100 shadow-xl transform transition-transform duration-300 ease-in-out 
          lg:static lg:translate-x-0 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Painel</p>
              <h1 className="text-xl font-bold text-gray-900">Restaurante</h1>
            </div>
            <span className="text-2xl"><GrRestaurant /></span>
          </div>

          <nav className="px-3 py-6 space-y-2">
            {navItems.map((item) => {
              const target = item.suffix ? `${basePrefix}/${item.suffix}` : basePrefix;
              return (
              <Link
                key={item.label}
                to={target}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.suffix)
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-lg shadow-[var(--accent)]/20'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )})}
          </nav>

          <div className="mt-auto px-6 py-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => updateTenant({ is_open: !tenant?.is_open })}
              className={`w-full rounded-2xl p-4 shadow-lg text-left transition-colors ${
                tenant?.is_open
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide opacity-80">status</p>
                <span className={`w-2 h-2 rounded-full ${tenant?.is_open ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
              </div>
              <p className="text-lg font-semibold mt-1">
                {tenant?.is_open ? 'Loja aberta' : 'Loja fechada'}
              </p>
              <p className="text-sm opacity-90 mt-1">
                {tenant?.is_open ? 'Toque para fechar' : 'Toque para abrir'}
              </p>
            </button>
          </div>
        </aside>

        {/* Main */}
        {/* CHANGE 2: tirei lg:pl-72 porque no lg a sidebar já está no fluxo do flex */}
        {/* CHANGE 3: adicionei min-w-0 para o conteúdo poder esticar sem overflow estranho */}
        <div className="flex-1 w-full min-w-0">
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-xl border border-gray-200 text-gray-600 hover:border-[var(--accent)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex-1 mx-4 hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar pedidos, clientes ou itens"
                    className="w-full rounded-2xl border border-gray-200 bg-white/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent shadow-sm"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400"><IoSearch/></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {onHelp && (
                  <button
                    type="button"
                    onClick={onHelp}
                    className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    Ajuda
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Tempo médio</span>
                  <span className="text-sm font-semibold text-gray-900">32 min</span>
                </div>
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown((v) => !v)}
                    className="w-11 h-11 rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center font-bold shadow-lg hover:opacity-90 transition-opacity"
                    aria-label="Menu do usuário"
                  >
                    {initials}
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{tenant?.name || 'Restaurante'}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || tenant?.email || ''}</p>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => { setShowUserDropdown(false); setShowLogoutModal(true); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Encerrar sessão
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {showLogoutModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowLogoutModal(false)}
            >
              <div
                className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Encerrar sessão</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Você sairá do painel agora.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o painel do restaurante.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="p-6 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutv2;
