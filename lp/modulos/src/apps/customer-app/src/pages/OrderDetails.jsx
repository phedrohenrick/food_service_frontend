import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import api from '../../../../shared/services/api';

// Fluxo canônico do pedido, em ordem cronológica natural.
// "heading" é o título do card de timeline quando este for o status atual.
const orderFlow = [
  { status: 'CREATED', label: 'Criado', heading: 'Pedido criado' },
  { status: 'PAYMENT_AUTHORIZED', label: 'Pagamento aprovado', heading: 'Pagamento aprovado' },
  { status: 'ACCEPTED', label: 'Confirmado', heading: 'Pedido confirmado' },
  { status: 'IN_PREPARATION', label: 'Preparando', heading: 'Seu pedido está sendo preparado' },
  { status: 'READY', label: 'Separado', heading: 'Seu pedido foi separado' },
  { status: 'WAITING_FOR_COLLECTION', label: 'Aguardando coleta', heading: 'Aguardando coleta' },
  { status: 'ON_ROUTE', label: 'A caminho', heading: 'Seu pedido está a caminho' },
  { status: 'DELIVERED', label: 'Entregue', heading: 'Já entregamos seu pedido' },
  { status: 'COMPLETED', label: 'Concluído', heading: 'Pedido concluído' },
  { status: 'CANCELED', label: 'Cancelado', heading: 'Pedido cancelado' },
];
const flowIndex = orderFlow.reduce((acc, step, idx) => {
  acc[step.status] = { ...step, idx };
  return acc;
}, {});

const formatTimelineDateTime = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const { orders, addresses, tenant, getOrderDetailed } = useStorefront();
  const basePrefix = (() => {
    const p = window.location?.pathname || '';
    const m = /^\/([^/]+)\/app(\/|$)/i.exec(p);
    return m && m[1] ? `/${m[1]}/app` : '/app';
  })();
  const detailed = getOrderDetailed(orderId);
  const order = detailed?.order || null;
  const [liveTimeline, setLiveTimeline] = React.useState(() => detailed?.timeline || []);
  const address = order ? (addresses || []).find((item) => item.id === order.address_id) : null;



  React.useEffect(() => {
    if (!orderId) return;
    let isMounted = true;

    const fetchTimeline = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (!isMounted || !res) return;
        const nextTimeline = Array.isArray(res.timeline) ? res.timeline : [];
        setLiveTimeline(nextTimeline);
      } catch (e) {
        console.error('Erro ao atualizar linha do tempo do pedido:', e);
      }
    };

    const intervalId = setInterval(fetchTimeline, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [orderId]);

  const timeline = (liveTimeline && liveTimeline.length > 0)
    ? liveTimeline
    : (detailed?.timeline || []);

  // Constrói os passos a exibir a partir da timeline real. Cada status do fluxo
  // só aparece se o backend já registrou o evento — passos futuros ficam ocultos.
  // Dedup por status (último timestamp vence).
  const reachedSteps = React.useMemo(() => {
    const byStatus = new Map();
    (timeline || []).forEach((t) => {
      if (!t?.status || !flowIndex[t.status]) return;
      const prev = byStatus.get(t.status);
      const ts = t.timestamp || t.created_at;
      if (!prev || new Date(ts) > new Date(prev.timestamp)) {
        byStatus.set(t.status, { ...flowIndex[t.status], timestamp: ts });
      }
    });
    return Array.from(byStatus.values()).sort((a, b) => a.idx - b.idx);
  }, [timeline]);

  // Mais recente no topo → reverso da ordem cronológica.
  const displaySteps = React.useMemo(() => [...reachedSteps].reverse(), [reachedSteps]);
  const currentStep = displaySteps[0] || flowIndex.CREATED;
  const currentStatus = currentStep?.status || 'CREATED';

  if (!order) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow">
        <p className="text-4xl mb-3">📦</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Não encontramos esse pedido
        </h2>
        <Link to={`${basePrefix}/pedidos`} className="text-[var(--accent-contrast)] font-semibold">
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Pedido #{order.id}
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-500">
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(order.created_at))}
          </p>
        </div>
        <Link to={`${basePrefix}/pedidos`}>
          <Button variant="ghost" className="text-[var(--accent)]">
            Voltar
          </Button>
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-3xl bg-white shadow overflow-hidden xl:col-span-2">
          <header className="bg-slate-50 px-6 py-5 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">
              {currentStep?.heading || 'Pedido em andamento'}
            </h2>
          </header>

          <div className="px-6 py-6">
            {displaySteps.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aguardando o restaurante confirmar o pedido...
              </p>
            ) : (
              <ol className="relative">
                {displaySteps.map((step, index) => {
                  const isCurrent = index === 0;
                  const isLast = index === displaySteps.length - 1;
                  const stepCanceled = step.status === 'CANCELED';
                  const currentAccent = stepCanceled ? 'bg-red-600' : 'bg-emerald-600';
                  const Icon = stepCanceled ? IoClose : IoCheckmark;
                  const titleColor = isCurrent
                    ? (stepCanceled ? 'text-red-600' : 'text-emerald-600')
                    : 'text-slate-800';

                  return (
                    <li key={`${step.status}-${index}`} className="flex gap-4">
                      <div className="flex flex-col items-center" aria-hidden="true">
                        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                          {isCurrent && (
                            <span
                              className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${
                                stepCanceled ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                            />
                          )}
                          <span
                            className={`relative flex h-7 w-7 items-center justify-center rounded-full ${
                              isCurrent ? currentAccent : 'bg-slate-200'
                            }`}
                          >
                            <Icon
                              className={`text-base ${
                                isCurrent ? 'text-white' : 'text-slate-500'
                              }`}
                            />
                          </span>
                        </span>
                        {!isLast && (
                          <span className="mt-1 w-px flex-1 bg-slate-200" />
                        )}
                      </div>
                      <div className={`flex-1 ${isLast ? '' : 'pb-7'}`}>
                        <p className={`text-base font-semibold ${titleColor}`}>
                          {step.label}
                        </p>
                        {step.timestamp && (
                          <p className="mt-1 text-sm text-slate-500">
                            {formatTimelineDateTime(step.timestamp)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </article>
        <article className="space-y-4 rounded-3xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">Resumo financeiro</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span >R$ {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Serviço</span>
              <span>R$ {order.service_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Entrega</span>
              <span>R$ {order.delivery_fee.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-3xl font-bold text-gray-900">
              R$ {order.total.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Pagamento via {order.payment_channel}
            {(order.payment_channel === 'dinheiro' || order.payment_channel === 'CASH') && order.change
              ? ` · Troco para ${order.change}`
              : ''}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Itens do pedido</h2>
          <div className="space-y-3 text-sm text-gray-600">
            {detailed.items.map((item) => {
              const grouped = (item.options || []).reduce((acc, opt) => {
                const key = opt.group?.name || opt.groupName || 'Opções';
                if (!acc[key]) acc[key] = [];
                acc[key].push(opt);
                return acc;
              }, {});
              const groupEntries = Object.entries(grouped);

              const optionsExtraPerUnit = (item.options || []).reduce(
                (acc, opt) =>
                  acc + (opt.additionalCharge || opt.option?.additional_charge || 0),
                0
              );

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.quantity}x {item.item_name_snapshot}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Preço unitário R$ {(item.unit_price ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      R$ {((item.unit_price ?? 0) * item.quantity + optionsExtraPerUnit * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {groupEntries.length > 0 && (
                    <div className="space-y-2">
                      {groupEntries.map(([groupName, opts]) => (
                        <div
                          key={groupName}
                          className="rounded-2xl border border-gray-100 p-4"
                        >
                          <p className="text-xs font-semibold text-gray-700">{groupName}</p>
                          <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                            {opts.map((opt, idx) => {
                              const optName =
                                opt.optionNameSnapshot || opt.option?.name || 'Opção';
                              const optPrice =
                                opt.additionalCharge || opt.option?.additional_charge || 0;
                              return (
                                <p key={idx}>
                                  {optName}
                                  {optPrice > 0
                                    ? ` (+ R$ ${Number(optPrice).toFixed(2)})`
                                    : ''}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Endereço de entrega</h2>
          <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{address?.label || 'Endereço'}</p>
            <p>
              {address?.street}, {address?.streetNumber || address?.street_number}
            </p>
            <p>
              {address?.city}
            </p>
            <p>CEP {address?.zipCode || address?.zip_code}</p>
            {address?.complement && <p>Complemento: {address.complement}</p>}
          </div>
          <p className="text-xs text-gray-500">
            Precisa atualizar algo? Edite a sacola antes de emitir um novo pedido.
          </p>
        </article>
      </section>
    </div>
  );
};

export default OrderDetails;
