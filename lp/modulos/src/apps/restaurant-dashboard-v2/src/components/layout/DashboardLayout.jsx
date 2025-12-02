import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStorefront } from '../../../../../shared/generalContext.jsx';
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { GrRestaurant } from "react-icons/gr";
import { MdMenuBook } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { MdOutlineRestaurantMenu } from "react-icons/md";

const navItems = [
  { label: 'Visão geral', path: '/dashboard', icon: <RiDashboardHorizontalFill /> },
  { label: 'Pedidos', path: '/dashboard/orders', icon: <MdMenuBook /> },
  { label: 'Cardápio', path: '/dashboard/menu', icon: <MdOutlineRestaurantMenu /> },
  { label: 'Configurações', path: '/dashboard/settings', icon: <MdOutlineSettings /> },
];

const DashboardLayoutv2 = ({ children }) => {
  const { tenant } = useStorefront();
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





  const isActive = (path) => {
    // Evita marcar "Visão geral" ("/dashboard") em todas as subrotas
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
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
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-lg shadow-[var(--accent)]/20'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-6 py-6 border-t border-gray-100">
            <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-contrast)] rounded-2xl p-4 shadow-lg">
              <p className="text-xs uppercase tracking-wide opacity-80">status</p>
              <p className="text-lg font-semibold">Loja aberta</p>
              <p className="text-sm opacity-90 mt-1">Recebendo pedidos em tempo real</p>
            </div>
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
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Tempo médio</span>
                  <span className="text-sm font-semibold text-gray-900">32 min</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center font-bold shadow-lg">
                  RS
                </div>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutv2;
