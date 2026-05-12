import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../../shared/services/api';

const formatCurrency = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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

  const [table, setTable] = useState(null);
  const [tab, setTab] = useState(null);
  const [menuItemsMap, setMenuItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState('');

  const basePrefix = (() => {
    const m = /^\/([^/]+)\/dashboard(\/|$)/i.exec(location.pathname || '');
    return m ? `/${m[1]}/dashboard` : '/dashboard';
  })();

  const fetchData = useCallback(async () => {
    try {
      const [tables, menuItems] = await Promise.all([
        api.get('/tables'),
        api.get('/menu-items'),
      ]);

      const found = (tables || []).find((t) => String(t.id) === String(tableId));
      setTable(found || null);

      const itemsById = {};
      (menuItems || []).forEach((mi) => { itemsById[mi.id] = mi; });
      setMenuItemsMap(itemsById);

      if (found?.currentTabId) {
        const tabData = await api.get(`/tabs/${found.currentTabId}`);
        setTab(tabData);
      } else {
        setTab(null);
      }
    } catch (e) {
      setError('Erro ao carregar dados da mesa');
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseTab = async () => {
    if (!tab) return;
    setConfirmOpen(false);
    setClosing(true);
    setError('');
    try {
      await api.post(`/tabs/${tab.id}/close`);
      navigate(`${basePrefix}/mesas`);
    } catch (e) {
      setError('Erro ao fechar comanda. Tente novamente.');
      setClosing(false);
    }
  };

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
        <button
          onClick={() => navigate(`${basePrefix}/mesas`)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para mesas
        </button>
        <p className="text-gray-500">Mesa não encontrada.</p>
      </div>
    );
  }

  const occupied = table.status === 'OCCUPIED';
  const itemCount = tab?.items?.length || 0;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb / back */}
      <button
        onClick={() => navigate(`${basePrefix}/mesas`)}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para mesas
      </button>

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
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  occupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${occupied ? 'bg-red-500' : 'bg-green-500'}`} />
                  {occupied ? 'Ocupada' : 'Disponível'}
                </span>
                {table.capacity && (
                  <span className="text-xs text-gray-400">{table.capacity} lugares</span>
                )}
              </div>
            </div>
          </div>

          {occupied && tab && (
            <div className="flex gap-6 text-right flex-wrap">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Aberta em</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateTime(tab.openedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Tempo aberta</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatElapsed(tab.openedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Itens</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{itemCount}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!occupied || !tab ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-2">
          <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 font-medium text-sm">Mesa livre — sem comanda aberta</p>
        </div>
      ) : (
        <>
          {/* Items list */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Itens da comanda</h2>
            </div>

            {itemCount === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400">Nenhum item adicionado ainda</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {tab.items.map((item) => {
                  const menuItem = menuItemsMap[item.menuItemId];
                  const photoUrl = menuItem?.photo_url || menuItem?.photoUrl || null;
                  const optionsTotal = (item.options || []).reduce(
                    (s, o) => s + Number(o.additionalCharge || 0), 0
                  );
                  const unitWithOptions = Number(item.unitPrice) + optionsTotal;
                  const lineTotal = unitWithOptions * item.quantity;

                  return (
                    <li key={item.id} className="flex items-start gap-4 px-6 py-4">
                      {/* Foto */}
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={item.menuItemName}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-14 h-14 rounded-xl bg-gray-100 items-center justify-center shrink-0"
                        style={{ display: photoUrl ? 'none' : 'flex' }}
                      >
                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.quantity}× {item.menuItemName}
                          </p>
                          <p className="text-sm font-bold text-gray-900 shrink-0">
                            {formatCurrency(lineTotal)}
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatCurrency(item.unitPrice)} cada
                          {optionsTotal > 0 && ` + ${formatCurrency(optionsTotal)} em adicionais`}
                        </p>

                        {item.options && item.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.options.map((o) => (
                              <span
                                key={o.id}
                                className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                              >
                                {o.optionNameSnapshot}
                                {o.additionalCharge > 0 && ` (+${formatCurrency(o.additionalCharge)})`}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-xs text-gray-400 italic mt-1">"{item.notes}"</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Total + close */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-700">Total da comanda</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(tab.total)}</span>
            </div>

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={closing}
              className="w-full rounded-2xl bg-gray-900 py-3.5 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {closing ? 'Fechando comanda...' : 'Fechar comanda e liberar mesa'}
            </button>
          </div>
        </>
      )}

      {/* Confirm modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmOpen(false)}
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
                <p className="text-sm text-gray-500 mt-0.5">Mesa {table?.number}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Esta ação vai registrar um pedido com{' '}
              <span className="font-semibold text-gray-900">{formatCurrency(tab?.total)}</span>{' '}
              e liberar a mesa. Não será possível desfazer.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCloseTab}
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
