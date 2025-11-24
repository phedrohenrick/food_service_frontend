import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStorefront } from '../../../../../shared/generalContext.jsx';
import { IoIosPin } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { IoRestaurant } from "react-icons/io5";
import { GrRestaurant } from "react-icons/gr";
import { IoFastFoodOutline } from "react-icons/io5";



const CustomerLayout = ({ children }) => {
  const location = useLocation();
  const { tenant, cart, cartItems, cartTotals } = useStorefront();
  const accent = tenant.main_color || '#EA1D2C';
  const accentHover = accent.length === 7 ? `${accent}e6` : accent;
  
  const getContrast = (hex) => {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized.padEnd(6, '0');
    const r = parseInt(full.substring(0, 2), 16) / 255;
    const g = parseInt(full.substring(2, 4), 16) / 255;
    const b = parseInt(full.substring(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.6 ? '#0f172a' : '#ffffff';
  };
  const accentContrast = getContrast(accent);
  const showCardapioHeader = location.pathname === '/app';

  const navigation = [
    { label: 'Cardápio', to: '/app', exact: true, icon: <IoRestaurant /> },
    { label: 'Sacola', to: '/app/sacola', icon:  <LiaShoppingBagSolid /> },
    { label: 'Endereços', to: '/app/enderecos', icon: <IoIosPin /> },
    { label: 'Pedidos', to: '/app/pedidos', icon: <GrRestaurant />},
  ];

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-1000 pb-32"
      style={{
        '--accent': accent,
        '--accent-hover': accentHover,
        '--accent-contrast': accentContrast,
      }}
    >
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-[var(--accent)]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {showCardapioHeader ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1  className="text-2xl font-semibold text-black flex items-center gap-2">
                      Seja bem-vindo(a)<IoFastFoodOutline/>
                    </h1>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto md:min-w-[320px] flex items-center gap-3 w-full">
                <form
                  className="flex flex-1 items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <span className="text-gray-400 mr-3 text-lg"><IoSearch className='text-black' /></span>
                  <input
                    type="search"
                    placeholder="Pesquisar no cardápio"
                    className="flex-1 border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                  />
                </form>
                <Link
                  to="/app/sacola"
                  className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)] transition"
                >
                  <LiaShoppingBagSolid className="text-lg" />
                  Sacola
                  {cartItems.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)} · R$ {cartTotals.total.toFixed(2)}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          ) : (<div className="flex items-center gap-4">
            <img
              src={tenant.photo_url}
              alt={tenant.name}
              className="h-14 w-14 rounded-full border border-gray-100 object-cover"
            />
            <Link to="/app" className="text-2xl font-semibold text-background-black">
              {tenant.name}
            </Link>
          </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--accent)]/30 bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[-10px_-10px_30px_rgba(0,0,0,0.15)]">
        <div className="mx-auto grid max-w-4xl grid-cols-4 text-xs font-medium">
          {navigation.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-3 transition ${
                  active
                    ? 'text-[var(--accent-contrast)] font-semibold'
                    : 'text-[var(--accent-contrast)]/80 hover:text-[var(--accent-contrast)]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default CustomerLayout;
