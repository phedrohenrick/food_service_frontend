import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';

const formatCurrency = (n) =>
  (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatTimeAgo = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  const diff = Math.max(0, Date.now() - d.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `há ${hours} h`;
};

const Dashboard = () => {
  const {
    tenant,
    orders,
    statuses,
    orderItems,
    menuItems,
    updateTenant,
  } = useStorefront();

  const todayRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }, []);

  const ordersToday = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= todayRange.start && d < todayRange.end && o.tenant_id === tenant.id;
    });
  }, [orders, todayRange, tenant.id]);

  const revenueToday = useMemo(() => {
    return ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [ordersToday]);

  const ticketMedio = useMemo(() => {
    const count = ordersToday.length || 1;
    return revenueToday / count;
  }, [revenueToday, ordersToday.length]);

  const latestStatusByOrder = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const timeline = statuses
        .filter((s) => s.order_id === o.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (timeline[0]) map.set(o.id, timeline[0]);
    });
    return map;
  }, [orders, statuses]);

  const openOrders = useMemo(() => {
    const closed = new Set(['COMPLETED', 'CANCELED', 'DELIVERED']);
    return orders
      .map((o) => ({ order: o, status: latestStatusByOrder.get(o.id) }))
      .filter((p) => !closed.has(p.status?.status));
  }, [orders, latestStatusByOrder]);

  const tempoMedioPrepMin = useMemo(() => {
    const diffs = orders.map((o) => {
      const t = statuses.filter((s) => s.order_id === o.id);
      const prep = t.find((s) => s.status === 'IN_PREPARATION');
      const ready = t.find((s) => s.status === 'READY');
      if (!prep || !ready) return null;
      return (new Date(ready.created_at) - new Date(prep.created_at)) / 60000;
    }).filter((x) => typeof x === 'number' && x >= 0);
    if (!diffs.length) return null;
    return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }, [orders, statuses]);

  const rankingItens = useMemo(() => {
    const agg = new Map();
    orderItems.forEach((oi) => {
      const prev = agg.get(oi.item_id) || { qty: 0, name: oi.item_name_snapshot };
      agg.set(oi.item_id, { qty: prev.qty + (oi.quantity || 0), name: prev.name });
    });
    const arr = Array.from(agg.entries())
      .map(([itemId, { qty, name }]) => ({ itemId, qty, name }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
    const mapItems = new Map(menuItems.map((mi) => [mi.id, mi]));
    return arr.map((r) => ({
      ...r,
      photo_url: mapItems.get(r.itemId)?.photo_url,
      price: mapItems.get(r.itemId)?.price,
    }));
  }, [orderItems, menuItems]);

  const recentes = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
      .map((o) => {
        const status = latestStatusByOrder.get(o.id);
        const items = orderItems.filter((oi) => oi.order_id === o.id);
        const resumo = items
          .slice(0, 2)
          .map((oi) => `${oi.quantity}x ${oi.item_name_snapshot}`)
          .join(', ');
        return { ...o, status, resumo, count: items.length };
      });
  }, [orders, latestStatusByOrder, orderItems]);

  const stats = [
    {
      label: 'Pedidos hoje',
      value: `${ordersToday.length}`,
      helper: 'Últimas 24h',
      accent: 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-white',
    },
    {
      label: 'Faturamento hoje',
      value: formatCurrency(revenueToday),
      helper: 'Total bruto',
      accent: 'bg-white text-gray-900',
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(ticketMedio),
      helper: 'Hoje',
      accent: 'bg-white text-gray-900',
    },
    {
      label: 'Tempo de preparo',
      value: tempoMedioPrepMin != null ? `${tempoMedioPrepMin} min` : '—',
      helper: 'IN_PREPARATION → READY',
      accent: 'bg-white text-gray-900',
    },
  ];

  const openText = tenant.is_open ? 'Loja aberta' : 'Loja fechada';
  const toggleOpen = () => updateTenant({ is_open: !tenant.is_open });

  return (
    // CHANGE 1: removi mx-auto e max-w-screen-2xl para não limitar largura em telas grandes
    <div className="w-full space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white shadow-xl">
        <div className="p-8 sm:p-9 md:p-10">
          <div className="flex items-center gap-4">
            {tenant.photo_url && (
              <img src={tenant.photo_url} alt={tenant.name} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
            )}
            <div>
              <p className="text-sm uppercase tracking-widest text-white/80">{tenant.id}</p>
              <h1 className="text-3xl md:text-4xl font-bold mt-1">{tenant.name}</h1>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10">
              {openText}
            </span>
            {tenant.working_hours && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10">
                Horário: {tenant.working_hours}
              </span>
            )}
            {tenant.delivery_method && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 capitalize">
                Entrega: {tenant.delivery_method}
              </span>
            )}
            {typeof tenant.service_fee_percentage === 'number' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10">
                Taxa de serviço: {(tenant.service_fee_percentage * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20 border-white/20" onClick={toggleOpen}>
              {tenant.is_open ? 'Fechar loja' : 'Abrir loja agora'}
            </Button>
            <Link to="/dashboard/orders">
              <Button variant="secondary" className="bg-white text-[var(--accent)] hover:bg-white/90">
                Ver pedidos ao vivo
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.accent} rounded-2xl p-4 shadow-lg border border-gray-100/60`}
          >
            <p className="text-sm text-gray-500/90 capitalize">
              {stat.label}
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-2">{stat.value}</p>
            <p className="text-sm text-gray-500/90 mt-1">{stat.helper}</p>
          </div>
        ))}
      </div>

      {/* CHANGE 2: reajustei grid para o "menu lateral" não ficar estreito e o conteúdo principal ganhar mais largura */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CHANGE 3: col-span novo para combinar com lg:grid-cols-4 */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Status das entregas</p>
              <h2 className="text-xl font-semibold text-gray-900">Fila em tempo real</h2>
            </div>
            <Link to="/dashboard/orders">
              <Button size="sm" variant="ghost" className="border border-gray-200 text-gray-700">
                Ver todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: 'Recebidos', value: openOrders.length },
              { title: 'Preparando', value: openOrders.filter((p) => p.status?.status === 'IN_PREPARATION').length },
              { title: 'Prontos', value: openOrders.filter((p) => p.status?.status === 'READY').length },
            ].map((col) => (
              <div key={col.title} className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <p className="text-sm text-gray-500">{col.title}</p>
                <p className="text-3xl font-bold text-gray-900">{col.value}</p>
                <div className="mt-2 h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${col.value * 12}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {openOrders.slice(0, 6).map(({ order, status }) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 sm:p-5 bg-gray-50/50"
              >
                <div>
                  <p className="text-sm text-gray-500">Pedido #{order.id}</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-gray-500">{formatTimeAgo(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    {status?.status || '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHANGE 4: garantindo que o menu lateral ocupe sua coluna inteira */}
        <div className="lg:col-span-1 space-y-4">
          {/* Próximos pedidos */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Próximos pedidos</h3>
                <Link to="/dashboard/orders">
                  <Button size="sm" variant="ghost" className="text-[var(--accent)] border border-gray-200">
                    Ver todos
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {openOrders.slice(0, 3).map(({ order, status }) => (
                  <div key={order.id} className="border border-gray-100 rounded-2xl p-3 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">#{order.id}</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                        <p className="text-sm text-gray-500">{formatTimeAgo(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{order.payment_channel?.toUpperCase()}</p>
                        <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                          {status?.status || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          {/* Itens mais vendidos */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Itens mais vendidos</h3>
            </div>
            <div className="space-y-3">
              {rankingItens.map((it) => (
                <div key={it.itemId} className="border border-gray-100 rounded-2xl p-3 hover:shadow-sm transition">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {it.photo_url && (
                        <img src={it.photo_url} alt={it.name} className="w-12 h-12 rounded-xl object-cover" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{it.name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(it.price)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                        {it.qty} vendidos
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pedidos recentes */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pedidos recentes</h3>
              <Link to="/dashboard/orders">
                <Button size="sm" variant="ghost" className="text-[var(--accent)] border border-gray-200">
                  Ver todos
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentes.map((o) => (
                <div key={o.id} className="border border-gray-100 rounded-2xl p-3 hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">#{o.id} • {formatTimeAgo(o.created_at)}</p>
                      <p className="font-semibold text-gray-900">{o.resumo}{o.count > 2 ? '…' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(o.total)}</p>
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                        {o.status?.status || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
