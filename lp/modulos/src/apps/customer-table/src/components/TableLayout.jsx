import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoRestaurant, IoReceiptOutline } from 'react-icons/io5';
import { LiaShoppingBagSolid } from 'react-icons/lia';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import api from '../../../../shared/services/api';
import useDraftOrder from '../../../../shared/hooks/useDraftOrder';
import { resolveAccent } from '../../../../shared/utils/accentColor';

const POLL_INTERVAL = 15000;

export default function TableLayout({ slug, tableId, session, children }) {
  const location = useLocation();
  const { tenant } = useStorefront();
  const [sentCount, setSentCount] = useState(0);

  const base = `/${slug}/mesa/${tableId}`;
  const tabId = session?.session?.tabId;
  const customerName = session?.session?.customerName;
  const tableNumber = session?.session?.tableNumber;
  const draft = useDraftOrder(slug, tableId, tabId);
  const itemCount = sentCount + draft.itemCount;

  const { accent, accentHover, accentContrast } = useMemo(
    () => resolveAccent(tenant?.main_color),
    [tenant?.main_color]
  );

  useEffect(() => {
    if (!tabId) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        const tab = await api.get(`/tabs/${tabId}`);
        if (cancelled) return;
        const count = (tab?.orders || [])
          .filter((o) => o.status !== 'CANCELED')
          .flatMap((o) => o.orderItem || [])
          .reduce((sum, item) => sum + (item.quantity || 0), 0);
        setSentCount(count);
      } catch (_) {}
    };
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tabId, location.pathname]);

  const navigation = [
    { label: 'Cardápio', to: base, exact: true, icon: <IoRestaurant /> },
    {
      label: 'Comanda',
      to: `${base}/comanda`,
      icon: <LiaShoppingBagSolid />,
      badge: itemCount > 0 ? itemCount : null,
    },
    { label: 'Conta', to: `${base}/conta`, icon: <IoReceiptOutline /> },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 text-gray-900 md:bg-gray-300"
      style={{
        '--accent': accent,
        '--accent-hover': accentHover,
        '--accent-contrast': accentContrast,
      }}
    >
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[680px] px-4 py-4 flex items-center gap-3">
          {tenant?.photo_url && (
            <img
              src={tenant.photo_url}
              alt={tenant.name}
              className="h-11 w-11 rounded-full border border-gray-100 object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">
              {tenant?.name || 'Restaurante'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              Mesa {tableNumber ?? tableId}
              {customerName ? ` · ${customerName}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Sair da mesa? Sua comanda continua aberta no restaurante.')) {
                session.reset();
              }
            }}
            className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[680px] flex-1 px-4 py-6 pb-28 md:bg-white md:shadow-[0_20px_80px_rgba(15,23,42,0.16)]">
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[-10px_-10px_30px_rgba(0,0,0,0.15)] md:left-1/2 md:w-full md:max-w-[680px] md:-translate-x-1/2 md:rounded-t-3xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto grid grid-cols-3 text-xs font-medium">
          {navigation.map((item) => {
            const active = item.exact
              ? location.pathname === item.to ||
                location.pathname === `${item.to}/`
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative flex flex-col items-center gap-1 py-3 transition ${
                  active
                    ? 'text-[var(--accent-contrast)] font-semibold'
                    : 'text-[var(--accent-contrast)]/75 hover:text-[var(--accent-contrast)]'
                }`}
              >
                <span className="relative text-lg">
                  {item.icon}
                  {item.badge != null && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[10px] font-bold text-gray-900 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
