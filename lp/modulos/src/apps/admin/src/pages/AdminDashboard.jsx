import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Search,
  Users,
  Wallet,
  XCircle,
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
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(iso));
  } catch (_) {
    return '—';
  }
};

const fmtCurrency = (n) => {
  const value = Number(n || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const daysUntil = (iso) => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};

const KPI_TONES = {
  neutral: { icon: 'bg-gray-100 text-gray-500', value: 'text-gray-900' },
  accent: { icon: 'bg-[var(--accent)]/10 text-[var(--accent)]', value: 'text-[var(--accent)]' },
  green: { icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-600' },
  sky: { icon: 'bg-sky-50 text-sky-600', value: 'text-sky-600' },
  amber: { icon: 'bg-amber-50 text-amber-600', value: 'text-amber-600' },
  gray: { icon: 'bg-gray-100 text-gray-500', value: 'text-gray-500' },
};

function KpiCard({ icon: Icon, label, value, hint, tone = 'neutral', hero = false }) {
  const t = KPI_TONES[tone] || KPI_TONES.neutral;
  if (hero) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] p-5 shadow-md shadow-orange-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/70">{label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums leading-none text-white">{value}</p>
            {hint && <p className="mt-2 text-xs text-white/70">{hint}</p>}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">{label}</p>
          <p className={`mt-2 text-3xl font-semibold tabular-nums leading-none ${t.value}`}>{value}</p>
          {hint && <p className="mt-2 text-xs text-gray-400">{hint}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${t.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone = 'gray' }) {
  const t = KPI_TONES[tone] || KPI_TONES.gray;
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.icon}`}>
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold tabular-nums leading-none text-gray-900">{value}</p>
        <p className="mt-1 truncate text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_PILL[status] || 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-500/10';
  const dot = STATUS_DOT[status] || 'bg-gray-400';
  const label = STATUS_LABEL[status] || (status || 'Sem assinatura');
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = React.useState(null);
  const [tenants, setTenants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, t] = await Promise.all([
          api.get('/admin/summary'),
          api.get('/admin/tenants'),
        ]);
        if (cancelled) return;
        setSummary(s);
        setTenants(Array.isArray(t) ? t : []);
      } catch (e) {
        if (!cancelled) setError('Não foi possível carregar os dados do painel.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const trialsEndingSoon = React.useMemo(
    () =>
      tenants.filter((t) => {
        if (t.subscriptionStatus !== 'TRIALING') return false;
        const d = daysUntil(t.trialEndsAt);
        return d !== null && d >= 0 && d <= 7;
      }),
    [tenants]
  );

  const pastDue = React.useMemo(
    () => tenants.filter((t) => t.subscriptionStatus === 'PAST_DUE'),
    [tenants]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter((t) =>
      [t.name, t.slug, t.ownerName, t.ownerEmail]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [tenants, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-inset ring-red-100">{error}</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Visão geral</h1>
        <p className="mt-1 text-sm text-gray-500">Seus clientes e o estado das assinaturas.</p>
      </div>

      {/* KPIs primários */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={Users} label="Clientes" value={summary?.totalClients ?? 0} tone="neutral" />
        <KpiCard
          icon={Wallet}
          label="MRR estimado"
          value={fmtCurrency(summary?.mrr)}
          hint="Receita recorrente mensal"
          hero
        />
        <KpiCard icon={CheckCircle2} label="Assinaturas ativas" value={summary?.active ?? 0} tone="green" />
      </div>

      {/* KPIs secundários */}
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 sm:grid-cols-4 sm:divide-y-0">
        <MiniStat icon={Clock} label="Em teste" value={summary?.trialing ?? 0} tone="sky" />
        <MiniStat icon={AlertTriangle} label="Inadimplentes" value={summary?.pastDue ?? 0} tone="amber" />
        <MiniStat icon={XCircle} label="Cancelados" value={summary?.canceled ?? 0} tone="gray" />
        <MiniStat icon={HelpCircle} label="Sem assinatura" value={summary?.noSubscription ?? 0} tone="gray" />
      </div>

      {/* Alertas de cobrança */}
      {(trialsEndingSoon.length > 0 || pastDue.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {pastDue.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-amber-50/60 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-amber-900">Inadimplentes</p>
                  <p className="text-xs text-amber-700/80">Cobrança falhou — requer atenção</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">
                  {pastDue.length}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {pastDue.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/admin/clientes/${t.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-gray-700 transition hover:bg-amber-50/40"
                    >
                      <span className="font-medium">{t.name || t.slug}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {trialsEndingSoon.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-sky-50/60 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sky-900">Testes acabando</p>
                  <p className="text-xs text-sky-700/80">Nos próximos 7 dias</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
                  {trialsEndingSoon.length}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {trialsEndingSoon.map((t) => {
                  const d = daysUntil(t.trialEndsAt);
                  return (
                    <li key={t.id}>
                      <Link
                        to={`/admin/clientes/${t.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-gray-700 transition hover:bg-sky-50/40"
                      >
                        <span className="font-medium">{t.name || t.slug}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/10">
                            {d === 0 ? 'hoje' : `${d} dia${d === 1 ? '' : 's'}`}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-300" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Lista de clientes */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Clientes <span className="text-gray-400 font-normal">({filtered.length})</span>
          </h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, slug ou e-mail…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-9 pr-3 text-sm text-gray-800 transition focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 sm:w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-gray-400">
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Plano</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Trial / Renovação</th>
                <th className="px-5 py-3 font-medium">Cadastro</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t) => {
                const trialDays = daysUntil(t.trialEndsAt);
                const initial = (t.name || t.slug || '?').charAt(0).toUpperCase();
                return (
                  <tr key={t.id} className="group transition hover:bg-gray-50/80">
                    <td className="px-5 py-4">
                      <Link to={`/admin/clientes/${t.id}`} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm font-semibold text-[var(--accent)] ring-1 ring-[var(--accent)]/15">
                          {initial}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-gray-900 group-hover:text-[var(--accent)]">
                            {t.name || t.slug}
                          </span>
                          <span className="block truncate text-xs text-gray-400">{t.ownerEmail || t.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{t.planName || t.planCode || '—'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={t.subscriptionStatus} />
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {t.subscriptionStatus === 'TRIALING' && trialDays !== null ? (
                        <span>{trialDays >= 0 ? `${trialDays} dia${trialDays === 1 ? '' : 's'} de teste` : 'teste expirado'}</span>
                      ) : (
                        <span>{fmtDate(t.currentPeriodEnd)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{fmtDate(t.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-80 transition group-hover:opacity-100">
                        {t.slug && (
                          <a
                            href={`/${t.slug}/app`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-gray-400 hover:text-gray-700"
                          >
                            Ver loja
                          </a>
                        )}
                        <Link
                          to={`/admin/clientes/${t.id}`}
                          className="text-xs font-semibold text-[var(--accent)] hover:underline"
                        >
                          Detalhes
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Search className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">Nenhum cliente encontrado</p>
                      <p className="text-xs text-gray-400">Tente buscar por outro nome, slug ou e-mail.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
