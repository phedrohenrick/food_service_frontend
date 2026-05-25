import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../shared/services/api';

const formatCurrency = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatElapsed = (openedAt) => {
  if (!openedAt) return '';
  const diff = Math.floor((Date.now() - new Date(openedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
};

const formatPhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return raw;
};

export default function GarcomMesaTabs({ slug }) {
  const navigate = useNavigate();
  const { tableId } = useParams();

  const [tableNumber, setTableNumber] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTab, setShowNewTab] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [tablesData, tabsData] = await Promise.all([
        api.get('/tables'),
        api.get(`/tabs/by-table/${tableId}`),
      ]);
      const match = (tablesData || []).find((t) => String(t.id) === String(tableId));
      setTableNumber(match?.number ?? null);
      const sorted = (tabsData || []).slice().sort(
        (a, b) => new Date(a.openedAt) - new Date(b.openedAt)
      );
      setTabs(sorted);
    } catch (e) {
      setError('Erro ao carregar comandas');
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateTab = async (e) => {
    e?.preventDefault?.();
    setCreating(true);
    setError('');
    try {
      const trimmed = newName.trim();
      const tab = await api.post(`/tabs/open/${tableId}`, {
        customerName: trimmed || null,
        customerPhone: null,
      });
      setShowNewTab(false);
      setNewName('');
      navigate(`/${slug}/garcom/comanda/${tab.id}`);
    } catch (e) {
      setError('Erro ao abrir nova comanda. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/${slug}/garcom`)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Mesas
        </button>
        <p className="text-sm font-bold text-gray-900">
          {tableNumber != null ? `Mesa ${tableNumber}` : `Mesa ${tableId}`}
        </p>
        <div className="w-16" />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comandas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tabs.length === 0
              ? 'Nenhuma comanda aberta nesta mesa.'
              : `${tabs.length} comanda${tabs.length === 1 ? '' : 's'} aberta${tabs.length === 1 ? '' : 's'}.`}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            {error}
            <button className="underline ml-3" onClick={() => setError('')}>OK</button>
          </div>
        )}

        {tabs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center space-y-3">
            <svg className="mx-auto w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-500">Toque em <span className="font-semibold">"Nova comanda"</span> para começar.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tabs.map((tab) => {
              const itemCount = (tab.orders || [])
                .filter((o) => o.status !== 'CANCELED')
                .flatMap((o) => o.orderItem || [])
                .reduce((s, i) => s + (i.quantity || 0), 0);
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/${slug}/garcom/comanda/${tab.id}`)}
                    className="w-full flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 shrink-0">
                      {(tab.customerName || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {tab.customerName || `Comanda #${tab.id}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {tab.customerPhone && `${formatPhone(tab.customerPhone)} · `}
                        {formatElapsed(tab.openedAt)} · {itemCount} item(s)
                      </p>
                    </div>
                    <p className="text-base font-bold text-gray-900 shrink-0">{formatCurrency(tab.total)}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setShowNewTab(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3.5 text-sm font-bold text-white shadow-2xl hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova comanda
        </button>
      </div>

      {showNewTab && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => !creating && setShowNewTab(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-lg font-bold text-gray-900">Nova comanda</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Mesa {tableNumber ?? tableId}. Nome do cliente é opcional.
              </p>
            </div>

            <form onSubmit={handleCreateTab} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Nome (opcional)
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: João"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewTab(false)}
                  disabled={creating}
                  className="flex-1 rounded-2xl border border-gray-200 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-2xl bg-gray-900 py-3.5 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {creating ? 'Abrindo...' : 'Abrir comanda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
