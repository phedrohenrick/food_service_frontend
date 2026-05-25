import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../../shared/services/api';
import useDraftOrder from '../../../../shared/hooks/useDraftOrder';
import { SendButton } from '../../../../shared/components/ui';

const formatCurrency = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatTime = (dt) => {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const STATUS_LABEL = {
  CREATED: 'Recebido',
  PAYMENT_AUTHORIZED: 'Pagamento autorizado',
  ACCEPTED: 'Aceito',
  IN_PREPARATION: 'Em preparo',
  READY: 'Pronto',
  WAITING_FOR_COLLECTION: 'Aguardando retirada',
  ON_ROUTE: 'A caminho',
  DELIVERED: 'Entregue',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
};

const STATUS_STYLE = {
  CREATED: 'bg-gray-100 text-gray-700',
  IN_PREPARATION: 'bg-blue-100 text-blue-700',
  READY: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELED: 'bg-red-100 text-red-700',
};

const POLL_INTERVAL = 12000;

export default function Comanda({ slug, tableId, session }) {
  const navigate = useNavigate();
  const tabId = session?.session?.tabId;
  const base = `/${slug}/mesa/${tableId}`;

  const draft = useDraftOrder(slug, tableId, tabId);

  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sentToast, setSentToast] = useState('');

  const load = useCallback(async () => {
    if (!tabId) return;
    try {
      const data = await api.get(`/tabs/${tabId}`);
      setTab(data);
      if (data?.status === 'CLOSED') {
        session.reset();
      }
    } catch (e) {
      setError('Erro ao carregar comanda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [tabId, session]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  const handleSend = async () => {
    if (draft.sending || draft.drafts.length === 0) return;
    const result = await draft.sendAll();
    if (result.sent > 0) {
      setSentToast('Pedido enviado para a cozinha!');
      setTimeout(() => setSentToast(''), 2500);
      await load();
    }
  };

  const sentOrders = useMemo(
    () => (tab?.orders || []).filter((o) => o.status !== 'CANCELED'),
    [tab]
  );
  const sentItemCount = useMemo(
    () =>
      sentOrders.reduce(
        (sum, o) =>
          sum +
          (o.orderItem || []).reduce((s, it) => s + (it.quantity || 0), 0),
        0
      ),
    [sentOrders]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  const empty = draft.drafts.length === 0 && sentOrders.length === 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sua comanda</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {empty
            ? 'Sua comanda está vazia.'
            : `${draft.itemCount + sentItemCount} item(s) total`}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button className="underline ml-3" onClick={() => setError('')}>
            OK
          </button>
        </div>
      )}

      {draft.sendError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {draft.sendError}
          <button className="underline ml-3" onClick={() => draft.setSendError('')}>
            OK
          </button>
        </div>
      )}

      {empty && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center space-y-3">
          <svg
            className="mx-auto w-12 h-12 text-gray-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-500 font-medium text-sm">Adicione itens pelo cardápio.</p>
          <Link
            to={base}
            className="inline-block rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ver cardápio
          </Link>
        </div>
      )}

      {/* Rascunho — pedindo agora */}
      {draft.drafts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Pedindo agora
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Confira o pedido e envie para a cozinha.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
              Não enviado
            </span>
          </div>

          <ul className="space-y-2">
            {draft.drafts.map((item) => {
              const optionsTotal = (item.options || []).reduce(
                (s, o) => s + Number(o.additionalCharge || 0),
                0
              );
              const lineTotal = (Number(item.unitPrice) + optionsTotal) * item.quantity;
              return (
                <li
                  key={item.draftId}
                  className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm border border-amber-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.quantity}× {item.menuItemName}
                    </p>
                    {item.options && item.options.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.options.map((o) => o.optionNameSnapshot).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5">"{item.notes}"</p>
                    )}
                    <p className="text-sm font-bold text-gray-900 mt-1.5">
                      {formatCurrency(lineTotal)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => draft.removeDraft(item.draftId)}
                    disabled={draft.sending}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 transition-colors"
                    title="Remover do pedido"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-2xl bg-white p-4 shadow-sm flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Subtotal do pedido</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(draft.totalDraft)}
            </span>
          </div>

          <SendButton
            onClick={handleSend}
            loading={draft.sending}
            loadingLabel="Enviando para a cozinha..."
          >
            Enviar para a cozinha · {formatCurrency(draft.totalDraft)}
          </SendButton>

          <Link
            to={base}
            className="block text-center text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            ← Adicionar mais itens
          </Link>
        </section>
      )}

      {/* Pedidos já enviados — um card por Order */}
      {sentOrders.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Já enviado para a cozinha
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Para alterar, chame o garçom.
              </p>
            </div>
            <span className="rounded-full bg-green-100 text-green-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
              {sentOrders.length} pedido{sentOrders.length === 1 ? '' : 's'}
            </span>
          </div>

          <ul className="space-y-3">
            {sentOrders.map((order) => {
              const items = order.orderItem || [];
              const style = STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-700';
              return (
                <li key={order.id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Pedido #{order.id} · {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {items.map((item) => {
                      const optionsTotal = (item.options || []).reduce(
                        (s, o) => s + Number(o.additionalCharge || 0),
                        0
                      );
                      const lineTotal = (Number(item.unitPrice) + optionsTotal) * item.quantity;
                      return (
                        <li key={item.id} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {item.quantity}× {item.itemNameSnapshot}
                              </p>
                              {item.options && item.options.length > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.options.map((o) => o.optionNameSnapshot).join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-gray-400 italic mt-0.5">"{item.notes}"</p>
                              )}
                            </div>
                            <p className="text-sm font-bold text-gray-900 shrink-0">
                              {formatCurrency(lineTotal)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Subtotal</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="rounded-2xl bg-white p-4 shadow-sm flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total parcial</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(tab.total)}</span>
          </div>

          {draft.drafts.length === 0 && (
            <>
              <button
                type="button"
                onClick={() => navigate(`${base}/conta`)}
                className="w-full rounded-2xl bg-gray-900 py-3.5 text-sm font-bold text-white hover:bg-gray-700 transition-colors"
              >
                Ver conta
              </button>
              <Link
                to={base}
                className="block text-center text-sm font-semibold text-gray-500 hover:text-gray-900"
              >
                ← Adicionar mais itens
              </Link>
            </>
          )}
        </section>
      )}

      {sentToast && (
        <div className="fixed inset-x-4 bottom-24 z-50 flex justify-center pointer-events-none">
          <div className="rounded-2xl bg-green-600 text-white px-5 py-3 shadow-2xl text-sm font-semibold">
            {sentToast}
          </div>
        </div>
      )}
    </div>
  );
}
