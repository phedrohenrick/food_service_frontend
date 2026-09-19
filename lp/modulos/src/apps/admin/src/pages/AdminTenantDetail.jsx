import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardList,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Package,
  TrendingDown,
  User,
  Wallet,
} from 'lucide-react';
import api from '../../../../shared/services/api';

const STATUS_PILL = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  TRIALING: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  PAST_DUE: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20',
  CANCELED: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10',
};

const STATUS_DOT = {
  ACTIVE: 'bg-emerald-500',
  TRIALING: 'bg-sky-500',
  PAST_DUE: 'bg-amber-500',
  CANCELED: 'bg-gray-400',
};
const STATUS_LABEL = {
  ACTIVE: 'Ativo',
  TRIALING: 'Em teste',
  PAST_DUE: 'Inadimplente',
  CANCELED: 'Cancelado',
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch (_) {
    return '—';
  }
};
const fmtCurrency = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n || 0));

function Field({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="shrink-0 text-xs uppercase tracking-[0.15em] text-gray-400">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-gray-900" title={value || undefined}>
        {value || '—'}
      </dd>
    </div>
  );
}

const METRIC_TONES = {
  neutral: { icon: 'bg-gray-100 text-gray-500', value: 'text-gray-900' },
  accent: { icon: 'bg-[var(--accent)]/10 text-[var(--accent)]', value: 'text-[var(--accent)]' },
  amber: { icon: 'bg-amber-100 text-amber-600', value: 'text-amber-600' },
};

function Metric({ icon: Icon, label, value, tone = 'neutral' }) {
  const t = METRIC_TONES[tone] || METRIC_TONES.neutral;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">{label}</p>
          <p className={`mt-2 text-2xl font-semibold tabular-nums ${t.value}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminTenantDetail() {
  const { id } = useParams();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await api.get(`/admin/tenants/${id}`);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError('Não foi possível carregar o cliente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-inset ring-red-100">
          {error || 'Cliente não encontrado.'}
        </div>
      </div>
    );
  }

  const totalOrders = Number(data.totalOrders || 0);
  const canceledOrders = Number(data.canceledOrders || 0);
  const cancelRate = totalOrders > 0 ? Math.round((canceledOrders / totalOrders) * 100) : 0;
  const statusCls = STATUS_PILL[data.subscriptionStatus] || 'bg-gray-100 text-gray-500';
  const statusDot = STATUS_DOT[data.subscriptionStatus] || 'bg-gray-400';
  const statusLabel = STATUS_LABEL[data.subscriptionStatus] || (data.subscriptionStatus || 'Sem assinatura');

  // Checklist "o que falta configurar" — pendências primeiro
  const configItems = [
    { label: 'Cardápio com itens', done: Number(data.menuItemsCount || 0) > 0 },
    { label: 'Bairros de entrega', done: Number(data.neighborhoodsCount || 0) > 0 },
    { label: 'Forma de entrega', done: !!data.deliveryMethod },
    { label: 'Formas de pagamento', done: Number(data.paymentChannelsCount || 0) > 0 },
    { label: 'Horário de funcionamento', done: !!data.workingHours },
    { label: 'Logo / foto da loja', done: !!data.photoUrl },
    { label: 'Endereço', done: !!data.address },
    { label: 'WhatsApp de contato', done: !!data.whatsappPhone },
    { label: 'CNPJ / CPF', done: !!data.cnpjCpf },
    { label: 'Assinatura ativa', done: data.subscriptionStatus === 'ACTIVE' || data.subscriptionStatus === 'TRIALING' },
  ].sort((a, b) => Number(a.done) - Number(b.done));
  const configDone = configItems.filter((i) => i.done).length;
  const configPct = Math.round((configDone / configItems.length) * 100);
  const configComplete = configDone === configItems.length;

  return (
    <div className="space-y-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para a lista
      </Link>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {data.photoUrl ? (
            <img
              src={data.photoUrl}
              alt={data.name}
              className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-1 ring-gray-900/5"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-contrast)] text-xl font-bold shadow-md shadow-orange-500/20">
              {(data.name || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 truncate">{data.name || data.slug}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusCls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                {statusLabel}
              </span>
              <span className="text-sm text-gray-500">{data.planName || data.planCode || 'Sem plano'}</span>
            </div>
          </div>
        </div>
        {data.slug && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href={`/${data.slug}/dashboard`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:bg-[var(--accent-hover)]"
            >
              <LayoutDashboard className="h-4 w-4" /> Ver dashboard
            </a>
            <a
              href={`/${data.slug}/app`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Ver loja <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      {/* Métricas de pedidos */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={Package} label="Pedidos (total)" value={totalOrders} />
        <Metric icon={Wallet} label="Receita acumulada" value={fmtCurrency(data.lifetimeRevenue)} tone="accent" />
        <Metric
          icon={TrendingDown}
          label="Taxa de cancelamento"
          value={`${cancelRate}%`}
          tone={cancelRate > 20 ? 'amber' : 'neutral'}
        />
        <Metric icon={Activity} label="Pedidos hoje" value={Number(data.todayOrders || 0)} />
      </div>

      {/* Configuração da loja */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configuração da loja</h2>
              <p className="text-xs text-gray-500">
                {configComplete
                  ? 'Tudo configurado — loja pronta para operar.'
                  : `${configItems.length - configDone} item(ns) pendente(s) para operar.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:w-56">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${configComplete ? 'bg-emerald-500' : 'bg-[var(--accent)]'}`}
                style={{ width: `${configPct}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-700">
              {configDone}/{configItems.length}
            </span>
          </div>
        </div>

        <ul className="mt-5 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {configItems.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm ${
                item.done ? 'text-gray-500' : 'bg-amber-50/60 font-medium text-gray-900'
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-amber-500" />
              )}
              <span className={item.done ? 'line-through decoration-gray-300' : ''}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contato + Assinatura */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Contato</h2>
          </div>
          <dl className="divide-y divide-gray-100">
            <Field label="Dono" value={data.ownerName} />
            <Field label="E-mail" value={data.ownerEmail || data.email} />
            <Field label="WhatsApp" value={data.whatsappPhone} />
            <Field label="CNPJ / CPF" value={data.cnpjCpf} />
            <Field label="Endereço" value={data.address} />
            <Field label="Slug" value={data.slug} />
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <CreditCard className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Assinatura</h2>
          </div>
          <dl className="divide-y divide-gray-100">
            <Field label="Plano" value={data.planName || data.planCode} />
            <Field label="Status" value={statusLabel} />
            <Field label="Início" value={fmtDate(data.startedAt)} />
            <Field label="Fim do teste" value={fmtDate(data.trialEndsAt)} />
            <Field label="Renovação" value={fmtDate(data.currentPeriodEnd)} />
            <Field label="Cadastro" value={fmtDate(data.createdAt)} />
            <Field label="Stripe customer" value={data.providerCustomerId} />
            <Field label="Stripe subscription" value={data.providerSubscriptionId} />
          </dl>
        </div>
      </div>
    </div>
  );
}
