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
      accent: 'border-[var(--accent)]-200/80 bg-gradient-to-br from-white via-sky-50 to-[var(--accent)]-100/70 text-gray-900',
    },
    {
      label: 'Faturamento hoje',
      value: formatCurrency(revenueToday),
      helper: 'Total bruto',
      accent: 'border-[var(--accent)]-200/80 bg-gradient-to-br from-white via-sky-50 to-[var(--accent)]-100/70 text-gray-900',
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(ticketMedio),
      helper: 'Hoje',
      accent: 'border-[var(--accent)]-200/80 bg-gradient-to-br from-white via-sky-50 to-[var(--accent)]-100/70 text-gray-900',
    },
    {
      label: 'Tempo de preparo',
      value: tempoMedioPrepMin != null ? `${tempoMedioPrepMin} min` : '—',
      helper: 'IN_PREPARATION → READY',
      accent: 'border-[var(--accent)]-200/80 bg-gradient-to-br from-white via-sky-50 to-[var(--accent)]-100/70 text-gray-900',
    },
  ];

  const openText = tenant.is_open ? 'Loja aberta' : 'Loja fechada';
  const toggleOpen = () => updateTenant({ is_open: !tenant.is_open });
  const panelClass = 'rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm';
  const innerCardClass = 'rounded-2xl border border-slate-200/80 bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_36px_rgba(15,23,42,0.10)]';
  const badgeClass = 'inline-flex items-center rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-xs font-medium tracking-[0.01em] text-[var(--accent-contrast)] backdrop-blur-sm';
  const statusBadgeClass = 'inline-flex items-center rounded-full border border-[var(--accent)]/15 bg-[var(--accent)]/8 px-3 py-1 text-xs font-semibold tracking-[0.01em] text-[var(--accent)]';
  const basePrefix = (() => {
    const path = window.location?.pathname || '';
    const match = /^\/([^/]+)\/dashboard(\/|$)/i.exec(path);
    return match && match[1] ? `/${match[1]}/dashboard` : '/dashboard';
  })();

  return (
    <div className="w-full space-y-6 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(248,250,252,0.98)_38%,rgba(241,245,249,1))] px-4 pb-8 pt-1 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-contrast)] shadow-[0_26px_80px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_28%)]" aria-hidden />
        <div className="p-8 sm:p-9 md:p-10">
          <div className="relative flex items-center gap-4">
            {tenant.photo_url && (
              <img src={tenant.photo_url} alt={tenant.name} className="h-14 w-14 rounded-2xl border border-white/25 object-cover shadow-[0_12px_30px_rgba(0,0,0,0.20)]" />
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-contrast)]/72">{tenant.id}</p>
              <h1 className="text-3xl md:text-4xl font-bold mt-1">{tenant.name}</h1>
            </div>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-3 text-sm">
            <span className={badgeClass}>
              {openText}
            </span>
            {tenant.working_hours && (
            <span className={badgeClass}>
              Horário: {tenant.working_hours}
            </span>
            )}
            {tenant.delivery_method && (
            <span className={`${badgeClass} capitalize`}>
              Entrega: {tenant.delivery_method}
            </span>
            )}
            {typeof tenant.service_fee_percentage === 'number' && (
            <span className={badgeClass}>
              Taxa de serviço: {((tenant.service_fee_percentage ?? 0) * 100).toFixed(0)}%
            </span>
            )}
          </div>
          <div className="relative mt-7 flex flex-wrap gap-3">
            <Button variant="ghost" className="min-w-[160px] border-white/20 bg-white/12 text-[var(--accent-contrast)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-white/20" onClick={toggleOpen}>
              {tenant.is_open ? 'Fechar loja' : 'Abrir loja agora'}
            </Button>
            <Link to={`${basePrefix}/orders`}>
              <Button variant="secondary" className="min-w-[180px] border border-white/50 bg-white text-[var(--accent)] shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:bg-white/95">
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
            className={`${stat.accent} rounded-[26px] border p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.12)]`}
          >
            <p className="text-sm font-medium text-slate-500 capitalize">
              {stat.label}
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`lg:col-span-3 p-6 ${panelClass}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Status das entregas</p>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Fila em tempo real</h2>
            </div>
            <Link to={`${basePrefix}/orders`}>
              <Button size="sm" variant="ghost" className="border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:border-[var(--accent)]/35 hover:bg-[var(--accent)]/5">
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
              <div key={col.title} className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-medium text-slate-500">{col.title}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{col.value}</p>
                <div className="mt-3 h-2.5 rounded-full bg-slate-200/80">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset]" style={{ width: `${Math.min(col.value * 12, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {openOrders.slice(0, 6).map(({ order, status }) => (
              <div
                key={order.id}
                 className={`${innerCardClass} flex items-center justify-between p-4 sm:p-5`}
              >
                <div>
                  <p className="text-sm text-slate-500">Pedido #{order.id}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-slate-500">{formatTimeAgo(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-lg font-bold tracking-tight text-slate-900">{formatCurrency(order.total)}</p>
                  <span className={statusBadgeClass}>
                    {status?.status || '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className={`p-5 sm:p-6 ${panelClass}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Próximos pedidos</h3>
                <Link to={`${basePrefix}/orders`}>
                  <Button size="sm" variant="ghost" className="w-full sm:w-auto border-slate-200 bg-white/80 text-[var(--accent)] hover:border-[var(--accent)]/35 hover:bg-[var(--accent)]/5">
                    Ver todos
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {openOrders.slice(0, 3).map(({ order, status }) => (
                  <div key={order.id} className={`${innerCardClass} p-3`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-slate-500">#{order.id}</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                        <p className="text-sm text-slate-500">{formatTimeAgo(order.created_at)}</p>
                      </div>
                      <div className="text-right w-full sm:w-auto mt-2 sm:mt-0">
                        <p className="text-sm font-semibold text-slate-900">{order.payment_channel?.toUpperCase()}</p>
                        <span className={statusBadgeClass}>
                          {status?.status || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          <div className={`p-5 sm:p-6 ${panelClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Itens mais vendidos</h3>
            </div>
             <div className="space-y-3">
              {rankingItens.map((it) => (
                <div key={it.itemId} className={`${innerCardClass} p-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {it.photo_url && (
                        <img src={it.photo_url} alt={it.name} className="h-12 w-12 rounded-xl border border-slate-200 object-cover shadow-sm" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{it.name}</p>
                        <p className="text-sm text-slate-500">{formatCurrency(it.price)}</p>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto mt-2 sm:mt-0">
                      <span className={statusBadgeClass}>
                        {it.qty} vendidos
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-5 sm:p-6 ${panelClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Pedidos recentes</h3>
              <Link to={`${basePrefix}/orders`}>
                <Button size="sm" variant="ghost" className="w-full sm:w-auto border-slate-200 bg-white/80 text-[var(--accent)] hover:border-[var(--accent)]/35 hover:bg-[var(--accent)]/5">
                  Ver todos
                </Button>
              </Link>
            </div>
             <div className="space-y-3">
              {recentes.map((o) => (
                <div key={o.id} className={`${innerCardClass} p-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-slate-500">#{o.id} • {formatTimeAgo(o.created_at)}</p>
                      <p className="font-semibold text-slate-900">{o.resumo}{o.count > 2 ? '…' : ''}</p>
                    </div>
                    <div className="text-right w-full sm:w-auto mt-2 sm:mt-0">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(o.total)}</p>
                      <span className={statusBadgeClass}>
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
