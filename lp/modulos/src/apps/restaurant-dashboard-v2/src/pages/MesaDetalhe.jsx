import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../../../shared/services/api';

const formatCurrency = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatPhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return raw;
};

const formatElapsed = (openedAt) => {
  if (!openedAt) return '—';
  const diff = Math.floor((Date.now() - new Date(openedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
};

const formatDateTime = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function MesaDetalhe() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const basePrefix = useMemo(() => {
    const m = /^\/([^/]+)\/dashboard(\/|$)/i.exec(location.pathname || '');
    return m ? `/${m[1]}/dashboard` : '/dashboard';
  }, [location.pathname]);

  const [table, setTable] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [menuItemsMap, setMenuItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);
  const [confirmClose, setConfirmClose] = useState(null);
  const [expandedTabId, setExpandedTabId] = useState(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [tablesData, menuItems, tabsData] = await Promise.all([
        api.get('/tables'),
        api.get('/menu-items'),
        api.get(`/tabs/by-table/${tableId}`),
      ]);

      const found = (tablesData || []).find((t) => String(t.id) === String(tableId));
      setTable(found || null);

      const map = {};
      (menuItems || []).forEach((mi) => { map[mi.id] = mi; });
      setMenuItemsMap(map);

      const sorted = (tabsData || []).slice().sort(
        (a, b) => new Date(a.openedAt) - new Date(b.openedAt)
      );
      setTabs(sorted);
      if (sorted.length === 1) setExpandedTabId(sorted[0].id);
    } catch (e) {
      setError('Erro ao carregar dados da mesa.');
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseTab = async (tabId) => {
    setClosingId(tabId);
    setConfirmClose(null);
    setError('');
    try {
      await api.post(`/tabs/${tabId}/close`);
      await fetchData();
    } catch (e) {
      setError('Erro ao fechar comanda. Tente novamente.');
    } finally {
      setClosingId(null);
    }
  };

  const aggregateTotal = useMemo(
    () => tabs.reduce((sum, t) => sum + Number(t.total || 0), 0),
    [tabs]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="space-y-4">
        <BackLink basePrefix={basePrefix} navigate={navigate} />
        <p className="text-gray-500">Mesa não encontrada.</p>
      </div>
    );
  }

  const occupied = tabs.length > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <BackLink basePrefix={basePrefix} navigate={navigate} />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button className="underline ml-3" onClick={() => setError('')}>Fechar</button>
        </div>
      )}

      {/* Table header card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold ${
              occupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {table.number}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mesa {table.number}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  occupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${occupied ? 'bg-red-500' : 'bg-green-500'}`} />
                  {occupied
                    ? tabs.length === 1
                      ? 'Ocupada'
                      : `${tabs.length} comandas abertas`
                    : 'Disponível'}
                </span>
                {table.capacity && (
                  <span className="text-xs text-gray-400">{table.capacity} lugares</span>
                )}
              </div>
            </div>
          </div>

          {occupied && (
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total da mesa</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCurrency(aggregateTotal)}</p>
            </div>
          )}
        </div>
      </div>

      {!occupied ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-2">
          <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 font-medium text-sm">Mesa livre — sem comandas abertas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tabs.map((tab) => (
            <ComandaCard
              key={tab.id}
              tab={tab}
              menuItemsMap={menuItemsMap}
              expanded={expandedTabId === tab.id}
              onToggle={() => setExpandedTabId(expandedTabId === tab.id ? null : tab.id)}
              onClose={() => setConfirmClose(tab)}
              closing={closingId === tab.id}
            />
          ))}
        </div>
      )}

      {/* Confirm close modal */}
      {confirmClose && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmClose(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Fechar comanda?</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {confirmClose.customerName
                    ? `Cliente ${confirmClose.customerName}`
                    : `Comanda #${confirmClose.id}`}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Esta ação registra um pedido com{' '}
              <span className="font-semibold text-gray-900">{formatCurrency(confirmClose.total)}</span>{' '}
              e libera a comanda. Não será possível desfazer.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmClose(null)}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleCloseTab(confirmClose.id)}
                className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackLink({ basePrefix, navigate }) {
  return (
    <button
      type="button"
      onClick={() => navigate(`${basePrefix}/mesas`)}
      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Voltar para mesas
    </button>
  );
}

const ORDER_STATUS_LABEL = {
  CREATED: 'Recebido',
  IN_PREPARATION: 'Em preparo',
  READY: 'Pronto',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
};

const ORDER_STATUS_STYLE = {
  CREATED: 'bg-gray-100 text-gray-700',
  IN_PREPARATION: 'bg-blue-100 text-blue-700',
  READY: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELED: 'bg-red-100 text-red-700',
};

function ComandaCard({ tab, menuItemsMap, expanded, onToggle, onClose, closing }) {
  const activeOrders = (tab.orders || []).filter((o) => o.status !== 'CANCELED');
  const itemCount = activeOrders
    .flatMap((o) => o.orderItem || [])
    .reduce((s, i) => s + (i.quantity || 0), 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 shrink-0">
            {(tab.customerName || '?').trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {tab.customerName || `Comanda #${tab.id}`}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {tab.customerPhone && `${formatPhone(tab.customerPhone)} · `}
              Aberta há {formatElapsed(tab.openedAt)} · {itemCount} item(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-base font-bold text-gray-900">{formatCurrency(tab.total)}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {activeOrders.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-gray-400">
              Nenhum pedido enviado ainda.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activeOrders.map((order) => {
                const orderItems = order.orderItem || [];
                const style =
                  ORDER_STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-700';
                return (
                  <li key={order.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-xs text-gray-500">
                        Pedido #{order.id} ·{' '}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style}`}
                      >
                        {ORDER_STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {orderItems.map((item) => {
                        const menuItem = menuItemsMap[item.itemId];
                        const photoUrl =
                          item.menuItemPhotoUrl ||
                          menuItem?.photo_url ||
                          menuItem?.photoUrl ||
                          null;
                        const optionsTotal = (item.options || []).reduce(
                          (s, o) => s + Number(o.additionalCharge || 0),
                          0
                        );
                        const lineTotal =
                          (Number(item.unitPrice) + optionsTotal) * item.quantity;
                        return (
                          <li
                            key={item.id}
                            className="flex items-start gap-3 rounded-xl bg-gray-50 p-2.5"
                          >
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={item.itemNameSnapshot}
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.quantity}× {item.itemNameSnapshot}
                                </p>
                                <p className="text-sm font-bold text-gray-900 shrink-0">
                                  {formatCurrency(lineTotal)}
                                </p>
                              </div>
                              {item.options && item.options.length > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.options
                                    .map((o) => o.optionNameSnapshot)
                                    .join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-gray-400 italic mt-0.5">
                                  "{item.notes}"
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-gray-500">
              Aberta em {formatDateTime(tab.openedAt)} · {itemCount} item(s)
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={closing}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {closing ? 'Fechando...' : 'Fechar comanda'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
