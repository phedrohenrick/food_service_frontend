import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import api from '../../../../shared/services/api';
import FeatureLock from '../components/FeatureLock';
import {
  Lock,
  Trophy,
  Lightbulb,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
} from 'lucide-react';

const formatCurrency = (n) =>
  (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PERIODS = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
];

const BLOCKED_STATUSES = ['CANCELED', 'PAST_DUE'];

const panelClass =
  'rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm';

const sectionTitle = 'text-xl font-semibold tracking-tight text-slate-900';
const sectionSub = 'text-sm text-slate-500 mt-0.5';

const HOURS_LABELS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`);

const TODAY_LABEL = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const pad2 = (n) => String(n).padStart(2, '0');
const fmtDay = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

function PctBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const num = Number(pct);
  const isUp = num >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
      }`}
    >
      {isUp ? '▲' : '▼'} {Math.abs(num).toFixed(1)}% vs média
    </span>
  );
}

// ---- Insights estratégicos ----------------------------------------------
// Estilo por tipo de ação. "win" = conquista, "opportunity" = oportunidade de
// crescer, "alert" = precisa de atenção.
const KIND = {
  win: {
    soft: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    ring: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    icon: 'text-emerald-600',
    chip: 'bg-emerald-100 text-emerald-700',
    label: 'Conquista',
  },
  opportunity: {
    soft: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    ring: 'border-blue-200',
    iconBg: 'bg-blue-100',
    icon: 'text-blue-600',
    chip: 'bg-blue-100 text-blue-700',
    label: 'Oportunidade',
  },
  alert: {
    soft: 'bg-gradient-to-br from-amber-50 to-orange-50',
    ring: 'border-amber-200',
    iconBg: 'bg-amber-100',
    icon: 'text-amber-600',
    chip: 'bg-amber-100 text-amber-700',
    label: 'Atenção',
  },
};

const BACKEND_KIND = { CELEBRATION: 'win', TIP: 'opportunity', ALERT: 'alert' };
const KIND_ICON = { win: Trophy, opportunity: Lightbulb, alert: AlertTriangle };

function InsightIcon({ kind, Icon, size = 'h-11 w-11' }) {
  const k = KIND[kind] || KIND.opportunity;
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-2xl ${k.iconBg}`}>
      <Icon className={`h-5 w-5 ${k.icon}`} strokeWidth={2.2} />
    </span>
  );
}

// Destaque: a ação mais importante do período.
function InsightHero({ insight }) {
  const k = KIND[insight.kind] || KIND.opportunity;
  const Icon = insight.icon;
  return (
    <div className={`relative overflow-hidden rounded-[26px] border ${k.ring} ${k.soft} p-5 sm:p-6`}>
      <div className="flex items-start gap-4">
        <InsightIcon kind={insight.kind} Icon={Icon} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${k.chip}`}>
              {k.label}
            </span>
            {insight.metric && (
              <span className="text-xs font-semibold text-slate-500">{insight.metric}</span>
            )}
          </div>
          <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">{insight.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{insight.body}</p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }) {
  const k = KIND[insight.kind] || KIND.opportunity;
  const Icon = insight.icon;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-3">
        <InsightIcon kind={insight.kind} Icon={Icon} size="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${k.chip}`}>
              {k.label}
            </span>
            {insight.metric && (
              <span className="text-[11px] font-semibold text-slate-400">{insight.metric}</span>
            )}
          </div>
          <h4 className="mt-1 text-sm font-semibold text-slate-900">{insight.title}</h4>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{insight.body}</p>
        </div>
      </div>
    </div>
  );
}

// Combina os insights curados do backend com insights derivados dos próprios
// dados (pico, mix de cardápio, tendência, cancelamentos, ticket) — cada um
// com uma ação concreta. Retorna no máximo 6, sem repetição de título.
function buildInsights(data, days, totalRevenue) {
  if (!data) return [];
  const list = [];

  (data.feedbackMessages || []).forEach((m) => {
    const kind = BACKEND_KIND[m.type] || 'opportunity';
    list.push({ kind, icon: KIND_ICON[kind], title: m.title, body: m.body });
  });

  const { peakHours = [], topItems = [], lowItems = [], cancellation, revenueTrend = [], todayInsight } = data;

  // Concentração nos horários de pico
  if (peakHours.length) {
    const total = peakHours.reduce((s, h) => s + (h.orderCount || 0), 0);
    const sorted = [...peakHours].sort((a, b) => b.orderCount - a.orderCount);
    const best = sorted[0];
    const top3 = sorted.slice(0, 3).reduce((s, h) => s + (h.orderCount || 0), 0);
    const share = total ? Math.round((top3 / total) * 100) : 0;
    if (best && best.orderCount > 0) {
      list.push({
        kind: 'opportunity',
        icon: Clock,
        title: `Seu pico é às ${pad2(best.hour)}h`,
        body: `${share}% dos pedidos saem nos 3 horários mais movimentados. Reforce equipe e estoque nesse intervalo para não perder venda.`,
        metric: `${share}% no pico`,
      });
    }
  }

  // Prato campeão concentra receita
  if (topItems.length && totalRevenue > 0) {
    const t = topItems[0];
    const share = Math.round((Number(t.totalRevenue) / totalRevenue) * 100);
    if (share >= 5) {
      list.push({
        kind: 'win',
        icon: Trophy,
        title: `${t.name} é seu campeão`,
        body: `Sozinho representa ${share}% do faturamento do período. Mantenha sempre disponível e destaque no topo do cardápio.`,
        metric: `${share}% da receita`,
      });
    }
  }

  // Item parado
  if (lowItems.length) {
    const l = lowItems[0];
    list.push({
      kind: 'alert',
      icon: Target,
      title: `${l.name} está parado`,
      body: `Apenas ${l.totalQty} venda${l.totalQty !== 1 ? 's' : ''} em ${days} dias. Crie um combo, ajuste o preço ou avalie tirar do cardápio.`,
      metric: `${l.totalQty} vendas`,
    });
  }

  // Tendência: 1ª metade x 2ª metade do período
  if (revenueTrend.length >= 4) {
    const mid = Math.floor(revenueTrend.length / 2);
    const sum = (arr) => arr.reduce((s, d) => s + (Number(d.revenue) || 0), 0);
    const first = sum(revenueTrend.slice(0, mid));
    const second = sum(revenueTrend.slice(mid));
    const pct = first > 0 ? Math.round(((second - first) / first) * 100) : null;
    if (pct !== null && Math.abs(pct) >= 8) {
      const up = pct >= 0;
      list.push({
        kind: up ? 'win' : 'alert',
        icon: up ? TrendingUp : TrendingDown,
        title: up ? `Vendas em alta` : `Vendas em queda`,
        body: up
          ? `Seu faturamento cresceu na segunda metade do período. Aproveite o embalo investindo nos pratos campeões.`
          : `Seu faturamento caiu na segunda metade do período. Reative clientes com uma promoção pontual ou cupom.`,
        metric: `${up ? '+' : ''}${pct}% no período`,
      });
    }
  }

  // Cancelamentos altos
  if (cancellation && Number(cancellation.cancellationRate) > 10) {
    list.push({
      kind: 'alert',
      icon: AlertTriangle,
      title: `Cancelamentos em ${cancellation.cancellationRate}%`,
      body: `Acima do saudável. Confirme e despache os pedidos mais rápido e revise itens em falta no estoque.`,
      metric: `${cancellation.cancellationRate}%`,
    });
  }

  // Ticket de hoje abaixo da média
  if (todayInsight && todayInsight.todayOrders > 0 && todayInsight.periodAvgTicket > 0) {
    const pct = Math.round(((todayInsight.todayTicket - todayInsight.periodAvgTicket) / todayInsight.periodAvgTicket) * 100);
    if (pct <= -8) {
      list.push({
        kind: 'opportunity',
        icon: ShoppingBag,
        title: `Ticket de hoje abaixo da média`,
        body: `Está ${Math.abs(pct)}% abaixo do normal. Ofereça adicionais e bebidas no checkout para elevar o valor por pedido.`,
        metric: `${pct}%`,
      });
    }
  }

  const seen = new Set();
  const out = [];
  for (const it of list) {
    const key = (it.title || '').toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out.slice(0, 6);
}

// Gráfico de área de receita (SVG, responsivo, sem dependências) com hover.
function RevenueAreaChart({ points }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 210;
  const padT = 16;
  const padB = 26;
  const innerH = H - padT - padB;
  const n = points.length;
  const max = Math.max(...points.map((p) => Number(p.revenue) || 0), 1);
  const xAt = (i) => (n <= 1 ? w / 2 : (i / (n - 1)) * w);
  const yAt = (v) => padT + innerH - (Number(v) / max) * innerH;

  const coords = points.map((p, i) => ({ ...p, cx: xAt(i), cy: yAt(p.revenue), i }));
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`).join(' ');
  const areaPath = w
    ? `${linePath} L ${xAt(n - 1).toFixed(1)} ${padT + innerH} L ${xAt(0).toFixed(1)} ${padT + innerH} Z`
    : '';

  const onMove = (e) => {
    if (!w) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let nearest = coords[0];
    for (const c of coords) if (Math.abs(c.cx - mx) < Math.abs(nearest.cx - mx)) nearest = c;
    setHover(nearest);
  };

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{ height: H }}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      {w > 0 && (
        <svg width={w} height={H} className="block">
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.28 }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <line x1="0" y1={padT + innerH} x2={w} y2={padT + innerH} stroke="#e2e8f0" strokeWidth="1" />
          <path d={areaPath} fill="url(#revFill)" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {hover && (
            <>
              <line x1={hover.cx} y1={padT} x2={hover.cx} y2={padT + innerH} stroke="var(--accent)" strokeOpacity="0.3" strokeWidth="1" />
              <circle cx={hover.cx} cy={hover.cy} r="4.5" fill="#fff" stroke="var(--accent)" strokeWidth="2.5" />
            </>
          )}
        </svg>
      )}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: Math.min(Math.max(hover.cx, 64), Math.max(w - 64, 64)), top: 0 }}
        >
          <p className="font-semibold text-slate-900">{formatCurrency(hover.revenue)}</p>
          <p className="text-slate-500">
            {fmtDay(hover.day)} · {hover.orderCount} pedido{hover.orderCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
      {w > 0 && n > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-slate-400">
          <span>{fmtDay(points[0].day)}</span>
          {n > 2 && <span>{fmtDay(points[Math.floor(n / 2)].day)}</span>}
          <span>{fmtDay(points[n - 1].day)}</span>
        </div>
      )}
    </div>
  );
}

const TEASER_SECTIONS = [
  { title: 'Hoje em destaque', sub: 'Faturamento, pedidos e ticket médio do dia' },
  { title: 'Insights estratégicos', sub: 'Recomendações pra vender mais' },
  { title: 'Tendência de receita', sub: 'Sua evolução de vendas no período' },
  { title: 'Horários de pico', sub: 'Quando seu restaurante mais vende' },
  { title: 'Itens campeões de venda', sub: 'Seus pratos que mais dão lucro' },
  { title: 'Itens com baixa saída', sub: 'O que está parado no cardápio' },
];

// Teaser exibido quando as métricas estão bloqueadas: mostra só os TÍTULOS do que o
// lojista teria, pra deixar claro o que ele está perdendo (sem revelar os dados).
function MetricsTeaser() {
  return (
    <div className="w-full space-y-6 px-4 pb-8 pt-1 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Métricas</h1>
        <p className="mt-1 text-sm text-slate-500">Insights para aumentar o lucro do restaurante</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEASER_SECTIONS.map((s) => (
          <div key={s.title} className={`${panelClass} p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{s.title}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{s.sub}</p>
              </div>
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: 'rgba(255,127,39,0.12)', color: '#EA1D2C' }}
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </div>
            <div className="mt-4 flex items-end gap-1.5" aria-hidden="true">
              {[40, 70, 30, 85, 55, 65, 45].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${h * 0.5}px`, background: 'linear-gradient(to top, rgba(13,31,51,0.10), rgba(13,31,51,0.03))' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Metricas() {
  const { tenant, canUseFeature, entitlements } = useStorefront();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Só bloqueia depois que os entitlements carregaram (evita piscar o overlay no load).
  const entitlementsLoaded = entitlements && Object.keys(entitlements).length > 0;
  const isInactive = BLOCKED_STATUSES.includes(tenant?.subscription_status);
  const isBlocked = isInactive || (entitlementsLoaded && !canUseFeature('analytics'));

  const lockStatus = tenant?.subscription_status;
  const lockTitle = lockStatus === 'TRIALING'
    ? 'Período de teste expirado'
    : isInactive ? 'Assinatura inativa' : 'Seu plano não cobre esse recurso';
  const lockMessage = lockStatus === 'TRIALING'
    ? 'Seu período de avaliação gratuito terminou. Ative um plano para acompanhar suas métricas e relatórios.'
    : isInactive
      ? 'Regularize sua assinatura para voltar a acessar os relatórios.'
      : 'Métricas e relatórios estão disponíveis a partir do plano Delivery.';
  const lockCta = (lockStatus === 'TRIALING' || isInactive) ? 'Ativar assinatura' : 'Ver planos';
  const lockBadge = lockStatus === 'TRIALING'
    ? 'Período grátis expirado'
    : isInactive ? 'Assinatura inativa' : 'Recurso bloqueado';

  useEffect(() => {
    if (isBlocked) return;
    setLoading(true);
    setError(null);
    api
      .get(`/reports/insights?days=${days}`)
      .then((res) => setData(res))
      .catch(() => setError('Não foi possível carregar os dados. Tente novamente.'))
      .finally(() => setLoading(false));
  }, [days, isBlocked]);

  const maxPeakCount = useMemo(() => {
    if (!data?.peakHours?.length) return 1;
    return Math.max(...data.peakHours.map((h) => h.orderCount || 0), 1);
  }, [data]);

  const peakHourMap = useMemo(() => {
    const m = {};
    (data?.peakHours || []).forEach((h) => { m[h.hour] = h.orderCount; });
    return m;
  }, [data]);

  const totalRevenue = useMemo(
    () => (data?.revenueTrend || []).reduce((s, d) => s + (Number(d.revenue) || 0), 0),
    [data]
  );

  const totalOrders = useMemo(
    () => (data?.revenueTrend || []).reduce((s, d) => s + (Number(d.orderCount) || 0), 0),
    [data]
  );

  const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const maxItemRevenue = useMemo(() => {
    if (!data?.topItems?.length) return 1;
    return Math.max(...data.topItems.map((i) => Number(i.totalRevenue) || 0), 1);
  }, [data]);

  const insights = useMemo(() => buildInsights(data, days, totalRevenue), [data, days, totalRevenue]);

  if (isBlocked) {
    return (
      <FeatureLock
        locked
        blur={false}
        title={lockTitle}
        benefit="Veja seus horários de pico, pratos campeões e onde está o seu lucro."
        message={lockMessage}
        ctaLabel={lockCta}
        badgeLabel={lockBadge}
      >
        <MetricsTeaser />
      </FeatureLock>
    );
  }

  return (
    <div className="w-full space-y-6 px-4 pb-8 pt-1 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Métricas</h1>
          <p className="mt-1 text-sm text-slate-500">Insights para aumentar o lucro do restaurante</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                days === p.value
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-lg shadow-[var(--accent)]/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[var(--accent)]/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
      )}

      {/* Hoje em destaque */}
      <div className={`${panelClass} p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className={sectionTitle}>Hoje em destaque</h2>
            <p className={sectionSub}>Desempenho do dia comparado à sua média</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 capitalize">
            {TODAY_LABEL}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Faturamento hoje */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Faturamento hoje</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {loading
                ? <span className="inline-block h-7 w-28 animate-pulse rounded-lg bg-slate-200" />
                : formatCurrency(data?.todayInsight?.todayRevenue ?? 0)}
            </p>
            {!loading && data?.todayInsight && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <PctBadge pct={data.todayInsight.revenuePctVsAvg} />
                {data.todayInsight.dailyAvgRevenue > 0 && (
                  <span className="text-[11px] text-slate-400">
                    média: {formatCurrency(data.todayInsight.dailyAvgRevenue)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pedidos hoje */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Pedidos hoje</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {loading
                ? <span className="inline-block h-7 w-16 animate-pulse rounded-lg bg-slate-200" />
                : (data?.todayInsight?.todayOrders ?? 0)}
            </p>
            {!loading && data?.todayInsight && (
              <p className="mt-2 text-[11px] text-slate-400">
                {data.todayInsight.todayOrders === 0
                  ? 'Ainda sem pedidos hoje'
                  : `${data.todayInsight.todayOrders} pedido${data.todayInsight.todayOrders !== 1 ? 's' : ''} concluído${data.todayInsight.todayOrders !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>

          {/* Ticket médio hoje */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Ticket médio hoje</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {loading
                ? <span className="inline-block h-7 w-24 animate-pulse rounded-lg bg-slate-200" />
                : formatCurrency(data?.todayInsight?.todayTicket ?? 0)}
            </p>
            {!loading && data?.todayInsight && data.todayInsight.periodAvgTicket > 0 && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {(() => {
                  const todayT = Number(data.todayInsight.todayTicket);
                  const avgT = Number(data.todayInsight.periodAvgTicket);
                  const pct = avgT > 0 ? ((todayT - avgT) / avgT) * 100 : null;
                  return (
                    <>
                      {pct !== null && data.todayInsight.todayOrders > 0 && <PctBadge pct={pct} />}
                      <span className="text-[11px] text-slate-400">
                        média período: {formatCurrency(avgT)}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights estratégicos */}
      {(loading || insights.length > 0) && (
        <div>
          <div className="mb-3">
            <h2 className={sectionTitle}>Insights estratégicos</h2>
            <p className={sectionSub}>Ações recomendadas com base no seu desempenho</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              <div className="h-28 rounded-[26px] bg-slate-100 animate-pulse" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <InsightHero insight={insights[0]} />
              {insights.length > 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {insights.slice(1).map((it, i) => (
                    <InsightCard key={`${it.title}-${i}`} insight={it} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* KPI cards do período */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Faturamento no período', value: formatCurrency(totalRevenue), helper: `últimos ${days} dias` },
          { label: 'Total de pedidos', value: totalOrders, helper: 'pedidos concluídos' },
          { label: 'Ticket médio', value: formatCurrency(ticketMedio), helper: 'por pedido no período' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]"
          >
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {loading ? <span className="inline-block h-8 w-32 animate-pulse rounded-lg bg-slate-200" /> : kpi.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{kpi.helper}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className={`${panelClass} p-6`}>
        <div className="mb-5">
          <h2 className={sectionTitle}>Tendência de receita</h2>
          <p className={sectionSub}>Faturamento diário nos últimos {days} dias</p>
        </div>
        {loading ? (
          <div className="h-[210px] rounded-2xl bg-slate-100 animate-pulse" />
        ) : !data?.revenueTrend?.length ? (
          <p className="text-sm text-slate-400">Nenhuma venda no período.</p>
        ) : (
          <RevenueAreaChart points={data.revenueTrend} />
        )}
      </div>

      {/* Peak hours + cancellations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Peak hours */}
        <div className={`${panelClass} p-6`}>
          <div className="mb-5">
            <h2 className={sectionTitle}>Horários de pico</h2>
            <p className={sectionSub}>Volume de pedidos por hora do dia</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-12 w-full rounded-md bg-slate-200 animate-pulse" />
                  <div className="h-2 w-4 rounded bg-slate-200 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-1 h-28">
              {HOURS_LABELS.map((label, hour) => {
                const count = peakHourMap[hour] || 0;
                const heightPct = Math.round((count / maxPeakCount) * 100);
                const isPeak = count >= maxPeakCount * 0.8 && count > 0;
                return (
                  <div key={hour} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative w-full flex-1 rounded-t-md overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isPeak
                            ? 'bg-[var(--accent)] shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]'
                            : count > 0
                            ? 'bg-[var(--accent)]/40'
                            : 'bg-slate-100'
                        }`}
                        style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 4)}%` }}
                      />
                      {count > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 hidden rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white group-hover:block whitespace-nowrap">
                          {count}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 leading-none">{hour % 3 === 0 ? label : ''}</span>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && data?.peakHours?.length > 0 && (() => {
            const best = data.peakHours.reduce((a, b) => (b.orderCount > a.orderCount ? b : a));
            return (
              <p className="mt-3 text-xs text-slate-500">
                Pico às <strong>{String(best.hour).padStart(2, '0')}h</strong> com{' '}
                <strong>{best.orderCount} pedido{best.orderCount !== 1 ? 's' : ''}</strong>. Garanta equipe disponível neste horário.
              </p>
            );
          })()}
        </div>

        {/* Cancellations */}
        <div className={`${panelClass} p-6`}>
          <div className="mb-5">
            <h2 className={sectionTitle}>Análise de cancelamentos</h2>
            <p className={sectionSub}>Taxa de cancelamento no período</p>
          </div>
          {loading ? (
            <div className="space-y-4">
              <div className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
            </div>
          ) : data?.cancellation ? (
            <>
              <div className="flex items-center gap-6">
                <div className="relative h-28 w-28 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                    <circle
                      cx="18" cy="18" r="15.9155" fill="none"
                      stroke={Number(data.cancellation.cancellationRate) > 15 ? '#ef4444' : Number(data.cancellation.cancellationRate) > 5 ? '#f59e0b' : '#22c55e'}
                      strokeWidth="3.5"
                      strokeDasharray={`${data.cancellation.cancellationRate} ${100 - Number(data.cancellation.cancellationRate)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{data.cancellation.cancellationRate}%</span>
                    <span className="text-[10px] text-slate-400">taxa</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { label: 'Total de pedidos', value: data.cancellation.totalOrders, color: 'bg-slate-200' },
                    { label: 'Cancelados', value: data.cancellation.canceledOrders, color: 'bg-red-400' },
                    { label: 'Concluídos', value: data.cancellation.totalOrders - data.cancellation.canceledOrders, color: 'bg-green-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <span className="text-sm text-slate-600">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                {Number(data.cancellation.cancellationRate) > 15
                  ? 'Taxa alta de cancelamentos. Revise os tempos de preparo e confirmação de pedidos.'
                  : Number(data.cancellation.cancellationRate) > 5
                  ? 'Taxa de cancelamentos moderada. Monitore pedidos recusados e problemas de estoque.'
                  : 'Taxa de cancelamentos saudável. Continue mantendo a consistência operacional.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Sem dados no período.</p>
          )}
        </div>
      </div>

      {/* Menu insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top items */}
        <div className={`${panelClass} p-6`}>
          <div className="mb-5">
            <h2 className={sectionTitle}>Itens campeões de venda</h2>
            <p className={sectionSub}>Maior receita gerada no período — priorize estoque e visibilidade</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.topItems?.length ? (
            <p className="text-sm text-slate-400">Nenhum dado disponível.</p>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, idx) => {
                const pct = Math.round((Number(item.totalRevenue) / maxItemRevenue) * 100);
                return (
                  <div key={item.itemId} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                      {idx + 1}
                    </div>
                    {item.photoUrl && (
                      <img src={item.photoUrl} alt={item.name} className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                        <span className="shrink-0 text-sm font-bold text-[var(--accent)]">{formatCurrency(item.totalRevenue)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">{item.totalQty} und</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low items */}
        <div className={`${panelClass} p-6`}>
          <div className="mb-5">
            <h2 className={sectionTitle}>Itens com baixa saída</h2>
            <p className={sectionSub}>Menor receita no período — considere promoções ou retirada do cardápio</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.lowItems?.length ? (
            <p className="text-sm text-slate-400">Nenhum dado disponível.</p>
          ) : (
            <div className="space-y-3">
              {data.lowItems.map((item) => (
                <div key={item.itemId} className="flex items-center gap-3">
                  {item.photoUrl && (
                    <img src={item.photoUrl} alt={item.name} className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 object-cover opacity-70" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="truncate text-sm font-medium text-slate-700">{item.name}</p>
                      <span className="shrink-0 text-sm font-semibold text-slate-500">{formatCurrency(item.totalRevenue)}</span>
                    </div>
                    <p className="text-xs text-slate-400">{item.totalQty} unidade{item.totalQty !== 1 ? 's' : ''} vendida{item.totalQty !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                    Baixa saída
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && data?.lowItems?.length > 0 && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 border border-amber-100">
              Considere criar combos, promoções ou remover do cardápio os itens com menos de 3 vendas no período.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
