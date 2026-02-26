import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';

// Estilos para colunas da pipeline
const pipelineStyles = {
  novo: 'bg-blue-50 text-blue-700 border border-blue-100',
  preparando: 'bg-amber-50 text-amber-700 border border-amber-100',
  pronto: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  enviado: 'bg-slate-50 text-slate-700 border border-slate-200',
};

// Estilos para status atuais (último status do pedido)
const statusPills = {
  CREATED: 'bg-green-100 text-green-800 border border-green-400',
  PAYMENT_AUTHORIZED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  IN_PREPARATION: 'bg-amber-100 text-amber-800',
  READY: 'bg-emerald-100 text-emerald-700',
  ON_ROUTE: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-200 text-green-800',
  CANCELED: 'bg-red-100 text-red-700',
};

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  );
const money = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const pipelineKeyForStatus = (status) => {
  switch (status) {
    case 'CREATED':
    case 'PAYMENT_AUTHORIZED':
    case 'ACCEPTED':
      return 'novo';
    case 'IN_PREPARATION':
      return 'preparando';
    case 'READY':
      return 'pronto';
    case 'ON_ROUTE':
    case 'DELIVERED':
    case 'COMPLETED':
    case 'CANCELED':
      return 'enviado';
    default:
      return 'novo';
  }
};

const nextStatus = (current) => {
  switch (current) {
    case 'CREATED':
      return 'ACCEPTED';
    case 'PAYMENT_AUTHORIZED':
    case 'ACCEPTED':
      return 'IN_PREPARATION';
    case 'IN_PREPARATION':
      return 'READY';
    case 'READY':
      return 'ON_ROUTE';
    case 'ON_ROUTE':
      return 'DELIVERED';
    case 'DELIVERED':
      return 'COMPLETED';
    default:
      return 'COMPLETED';
  }
};

const Orders = () => {
  const { orders, user, tenant, updateTenant, maps, getOrderDetailed, addOrderStatus, updateOrderStatus, reloadOrders } = useStorefront();
  const [filter, setFilter] = useState('todos');
  const [expanded, setExpanded] = useState(null);
  const [dayClosed, setDayClosed] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDate, setExportDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [exportSending, setExportSending] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  useEffect(() => {
    if (!reloadOrders) return;
    reloadOrders();
    const intervalId = setInterval(() => {
      reloadOrders();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [reloadOrders]);

  const isToday = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return d >= start && d < end;
  };

  const columns = useMemo(
    () => [
      { key: 'novo', title: 'Novos', helper: 'chegaram agora' },
      { key: 'preparando', title: 'Preparando', helper: 'na cozinha' },
      { key: 'pronto', title: 'Prontos', helper: 'para retirar' },
      { key: 'enviado', title: 'Em entrega', helper: 'a caminho' },
    ],
    []
  );

  const ordersWithLast = useMemo(() => {
    return (orders || []).map((o) => {
      const detailed = getOrderDetailed(o.id);
      const last = detailed?.timeline?.[detailed.timeline.length - 1] || null;
      return { order: o, detailed, lastStatus: last?.status || 'CREATED', lastAt: last?.created_at };
    });
  }, [orders, getOrderDetailed]);

  const filteredOrders = useMemo(() => {
    const base = filter === 'todos'
      ? ordersWithLast
      : ordersWithLast.filter((row) => pipelineKeyForStatus(row.lastStatus) === filter);
    return base.filter((row) => (dayClosed ? !isToday(row.order.created_at) : true));
  }, [ordersWithLast, filter, dayClosed]);

  const openOrdersCount = useMemo(() => {
    return ordersWithLast.filter(
      (row) => !(row.lastStatus === 'DELIVERED' || row.lastStatus === 'COMPLETED' || row.lastStatus === 'CANCELED')
    ).length;
  }, [ordersWithLast]);

  const countByColumn = (key) =>
    ordersWithLast.filter((row) => pipelineKeyForStatus(row.lastStatus) === key && (dayClosed ? !isToday(row.order.created_at) : true)).length;

  const handleCloseDayClick = () => {
    if (openOrdersCount > 0) {
      setConfirmClose(true);
    } else {
      setDayClosed(true);
    }
  };

  const isSameDay = (iso, ymd) => {
    if (!iso || !ymd) return false;
    const d = new Date(iso);
    const [y, m, d2] = ymd.split('-').map((x) => parseInt(x, 10));
    return d.getFullYear() === y && (d.getMonth() + 1) === m && d.getDate() === d2;
  };

  const handleConfirmExport = async () => {
    setExportSending(true);
    setExportMessage('');
    try {
      const dayOrders = ordersWithLast.filter((row) => isSameDay(row.order.created_at, exportDate));
      if (!dayOrders.length) {
        setExportMessage('Nenhum pedido encontrado para o dia selecionado.');
        setExportSending(false);
        return;
      }
      // Simular envio de PDF por e-mail (placeholder de integração backend)
      // Aqui poderíamos fazer um POST para um endpoint: /api/export-orders
      await new Promise((res) => setTimeout(res, 800));
      setExportMessage(`Exportação agendada: ${dayOrders.length} pedidos serão enviados para ${user?.email || 'email do restaurante'}.`);
    } catch (e) {
      setExportMessage('Falha ao agendar exportação. Tente novamente.');
    } finally {
      setExportSending(false);
    }
  };

  const canAct = (status) => !(status === 'COMPLETED' || status === 'CANCELED');
  const isClosed = (status) => status === 'COMPLETED' || status === 'CANCELED' || status === 'DELIVERED';

  return (
    <div className="space-y-6">
      {/* Banner de Status da Loja */}
      <div
        className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-4 transition-colors ${
          tenant?.is_open
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div>
          <h2
            className={`text-lg font-semibold ${
              tenant?.is_open ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {tenant?.is_open ? 'Loja aberta' : 'Loja fechada'}
          </h2>
          <p
            className={`text-sm ${
              tenant?.is_open ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {tenant?.is_open
              ? 'Recebendo pedidos em tempo real'
              : 'Não está recebendo novos pedidos'}
          </p>
        </div>
        <Button
          variant="ghost"
          className={`border ${
            tenant?.is_open
              ? 'border-green-200 text-green-700 hover:bg-green-100'
              : 'border-red-200 text-red-700 hover:bg-red-100'
          }`}
          onClick={() => updateTenant({ is_open: !tenant?.is_open })}
        >
          {tenant?.is_open ? 'Fechar loja' : 'Abrir loja'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Pedidos em andamento</p>
          <h1 className="text-2xl font-bold text-gray-900">Trilha de preparação do dia</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => setExportOpen(true)}>Exportar</Button>
          <Button
            variant={dayClosed ? 'ghost' : undefined}
            className={dayClosed ? 'border border-gray-200 text-gray-700' : ''}
            onClick={handleCloseDayClick}
          >
            Fechar expediente (limpar hoje)
          </Button>
        </div>
      </div>

      {confirmClose && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Há {openOrdersCount} pedidos em aberto (não entregues). Deseja limpar mesmo a aba?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setDayClosed(true); setConfirmClose(false); }}>
              Limpar mesmo
            </Button>
            <Button size="sm" variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => setConfirmClose(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={exportOpen} onClose={() => { setExportOpen(false); setExportMessage(''); }} title="Exportar pedidos do dia" size="md">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Selecione o dia e confirme para enviar um PDF com os pedidos para o e-mail do restaurante.</p>
          <Input label="Dia para exportar" type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)} />
          <Input label="E-mail de destino" type="email" value={user?.email || ''} disabled />
          {exportMessage && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {exportMessage}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConfirmExport} disabled={exportSending}>
              {exportSending ? 'Enviando…' : 'Confirmar envio'}
            </Button>
            <Button variant="ghost" className="border border-gray-200 text-gray-700" onClick={() => { setExportOpen(false); setExportMessage(''); }}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-wrap gap-3">
        {['todos', ...columns.map((c) => c.key)].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              filter === key
              ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--accent)]/50'
            }`}
          >
            {key === 'todos' ? 'Todos' : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {columns.map((column) => (
          <div key={column.key} className="bg-white rounded-3xl border border-gray-100 shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{column.helper}</p>
                <h3 className="text-lg font-semibold text-gray-900">{column.title}</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {countByColumn(column.key)}
              </span>
            </div>

            {filteredOrders
              .filter((row) => pipelineKeyForStatus(row.lastStatus) === column.key)
              .map(({ order, detailed, lastStatus, lastAt }) => {
                const address = maps.addressMap[order.address_id];
                const neighborhood = address ? maps.neighborhoodMap[address.neighborhood_id] : null;
                const statusClass = statusPills[lastStatus] || 'bg-gray-100 text-gray-700';
                const serviceFee = order.service_fee ?? (order.subtotal || 0) * (0.08); // fallback
                const isExpanded = expanded === order.id;

                return (
                  <div key={order.id} className="rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Pedido #{order.id}</p>
                        <p className="font-semibold text-gray-900">{user?.name || 'Cliente'}</p>
                        <p className="text-xs text-gray-500">{user?.phone}</p>
                      </div>
                      <div className="text-right">
                        <div className="relative inline-flex items-center justify-center">
                          {lastStatus === 'CREATED' && (
                            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping"></span>
                          )}
                          <span className={`relative text-xs px-3 py-1 rounded-full ${statusClass}`}>
                            {lastStatus}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{lastAt ? fmtDate(lastAt) : ''}</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="truncate">
                        {address
                          ? `${address.street}, ${address.street_number} · ${neighborhood?.name} (${money(neighborhood?.price)})`
                          : 'Sem endereço'}
                      </p>
                      {address?.complement && (
                        <p className="truncate">{address.complement}</p>
                      )}
                      {address && (
                        <p className="truncate">{address.city} · CEP {address.zip_code}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="text-xs text-gray-600">
                        <p>Criado</p>
                        <p className="font-medium text-gray-900">{fmtDate(order.created_at)}</p>
                      </div>
                      <div className="text-xs text-gray-600 text-right">
                        <p>Total</p>
                        <p className="font-semibold text-gray-900">{money(order.total)}</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Subtotal</p>
                        <p>{money(order.subtotal)}</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Taxa serviço</p>
                        <p>{money(serviceFee)}</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Entrega</p>
                        <p>{money(order.delivery_fee)}</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Desconto</p>
                        <p>{money(order.discount)}</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Pagamento</p>
                        <p className="uppercase">{order.payment_channel}</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Troco</p>
                        <p>{order.change || '-'}</p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-gray-100 space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Itens do pedido</p>
                          <div className="mt-2 space-y-2">
                            {(detailed?.items || []).map((item) => (
                              <div key={item.id} className="rounded-xl border border-gray-100 p-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.item_name_snapshot}
                                  </p>
                                  <p className="text-sm text-gray-700">{item.quantity} × {money(item.unit_price)}</p>
                                </div>
                                {item?.highlights?.length > 0 && (
                                  <p className="text-[10px] text-amber-700">{item.highlights.join(', ')}</p>
                                )}
                                {item.notes && (
                                  <p className="text-xs text-gray-700 mt-1">Observação: {item.notes}</p>
                                )}
                                {(item.options || []).length > 0 && (
                                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                                    {item.options.map((opt) => (
                                      <div key={opt.id} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-800">
                                          + {opt.groupName ? `${opt.groupName}: ` : ''}
                                          {opt.option?.name || opt.option_name_snapshot}
                                        </span>
                                        <span>{money(opt.option?.additional_charge ?? opt.additional_charge ?? 0)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Timeline de status</p>
                          <div className="mt-2 space-y-1">
                            {(detailed?.timeline || []).map((st) => (
                              <div key={st.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className={`px-2 py-1 rounded ${statusPills[st.status] || 'bg-gray-100 text-gray-700'}`}>{st.status}</span>
                                <span className="text-gray-600 w-full sm:w-auto text-right">{fmtDate(st.created_at)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="border border-gray-200 text-gray-700"
                        onClick={() => setExpanded((prev) => (prev === order.id ? null : order.id))}
                      >
                        {isExpanded ? 'Ocultar' : 'Detalhes'}
                      </Button>
                      {!isClosed(lastStatus) && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 min-w-[160px]"
                            onClick={() => updateOrderStatus(order.id, nextStatus(lastStatus))}
                          >
                            {lastStatus === 'CREATED' ? 'Aceitar pedido' : 'Avançar etapa'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="border border-gray-200 text-gray-700 w-full sm:w-auto"
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          >
                            Entregue
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-700 border border-red-200 w-full sm:w-auto"
                            onClick={() => updateOrderStatus(order.id, 'CANCELED')}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {isClosed(lastStatus) && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => updateOrderStatus(order.id, 'IN_PREPARATION')}
                        >
                          Reabrir
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
