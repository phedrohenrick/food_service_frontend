import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../../shared/services/api';
import useDraftOrder from '../../../../shared/hooks/useDraftOrder';

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

export default function Conta({ slug, tableId, session }) {
  const tabId = session?.session?.tabId;
  const base = `/${slug}/mesa/${tableId}`;

  const draft = useDraftOrder(slug, tableId, tabId);
  const hasUnsent = draft.drafts.length > 0;

  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!tabId) return undefined;
    api
      .get(`/tabs/${tabId}`)
      .then((data) => {
        if (cancelled) return;
        setTab(data);
        if (data?.status === 'CLOSED') {
          session.reset();
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tabId, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tab) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm space-y-3">
        <p className="text-sm text-gray-500">Não conseguimos carregar sua conta.</p>
      </div>
    );
  }

  const orders = (tab.orders || []).filter((o) => o.status !== 'CANCELED');
  const items = orders.flatMap((o) => o.orderItem || []);
  const itemCount = items.reduce((s, i) => s + (i.quantity || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conta</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {tab.tableNumber ? `Mesa ${tab.tableNumber}` : `Mesa ${tableId}`}
          {tab.customerName ? ` · ${tab.customerName}` : ''}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Itens</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{itemCount}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Aberta há</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{formatElapsed(tab.openedAt) || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Total</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{formatCurrency(tab.total)}</p>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Resumo</h2>
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const optionsTotal = (item.options || []).reduce(
                (s, o) => s + Number(o.additionalCharge || 0),
                0
              );
              const lineTotal = (Number(item.unitPrice) + optionsTotal) * item.quantity;
              return (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.quantity}× {item.itemNameSnapshot}
                    </p>
                    {item.options && item.options.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.options.map((o) => o.optionNameSnapshot).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    {formatCurrency(lineTotal)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(tab.total)}</span>
          </div>
        </div>
      )}

      {hasUnsent && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">
                Você tem {draft.itemCount} item(s) ainda não enviado(s) à cozinha.
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Envie ou remova esses itens antes de chamar o garçom para pagar.
              </p>
            </div>
          </div>
          <Link
            to={`${base}/comanda`}
            className="block text-center rounded-xl bg-amber-900 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
          >
            Revisar pedido
          </Link>
        </div>
      )}

      {items.length === 0 && !hasUnsent ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center space-y-2">
          <p className="text-sm text-gray-500">Você ainda não pediu nada.</p>
          <Link to={base} className="inline-block text-sm font-semibold text-gray-900 underline">
            Ver cardápio
          </Link>
        </div>
      ) : requested ? (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-5 text-center space-y-2">
          <p className="text-2xl">🛎️</p>
          <p className="text-sm font-semibold text-green-800">Garçom avisado!</p>
          <p className="text-xs text-green-700">
            O garçom virá até sua mesa em instantes para fechar a comanda.
          </p>
        </div>
      ) : items.length > 0 ? (
        <button
          type="button"
          onClick={() => setRequested(true)}
          disabled={hasUnsent}
          className="w-full rounded-2xl bg-gray-900 py-4 text-base font-bold text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Chamar garçom para pagar
        </button>
      ) : null}

      <p className="text-[11px] text-center text-gray-400 px-4 leading-relaxed">
        O pagamento é feito diretamente com o garçom no caixa. A comanda só é fechada por um
        funcionário do restaurante.
      </p>
    </div>
  );
}
