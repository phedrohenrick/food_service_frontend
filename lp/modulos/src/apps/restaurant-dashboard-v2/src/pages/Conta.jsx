import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { useStorefront } from '../../../../shared/generalContext.jsx';
import api from '../../../../shared/services/api';
import { Button } from '../../../../shared/components/ui';

const STATUS_META = {
  ACTIVE: { label: 'Ativa', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' },
  TRIALING: { label: 'Em teste', cls: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20' },
  PAST_DUE: { label: 'Pagamento pendente', cls: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20' },
  CANCELED: { label: 'Cancelada', cls: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20' },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(iso));
  } catch (_) {
    return '—';
  }
};

const daysUntil = (iso) => {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
};

function Field({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-slate-900">{value || '—'}</dd>
    </div>
  );
}

export default function Conta() {
  const navigate = useNavigate();
  const { tenant, user } = useStorefront();
  const [sub, setSub] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [working, setWorking] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setSub(await api.get('/subscriptions/current'));
    } catch (_) {
      setSub(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Ao voltar pra aba (ex.: retorno do portal/checkout do Stripe), re-busca o status.
  React.useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  // Retorno do checkout: o status real chega via webhook alguns segundos depois.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('session_id')) return undefined;
    const t = setTimeout(() => load(), 3500);
    return () => clearTimeout(t);
  }, [load]);

  const status = sub?.status || null;
  const meta = STATUS_META[status] || {
    label: status || 'Sem assinatura',
    cls: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
  };
  const planName = sub?.planName || sub?.effectivePlanName || sub?.planCode || sub?.effectivePlanCode || '—';
  const trialDays = status === 'TRIALING' ? daysUntil(sub?.trialEndsAt) : null;
  const trialExpired = status === 'TRIALING' && trialDays === 0;
  const needsAttention = status === 'PAST_DUE' || status === 'CANCELED' || trialExpired || !status;
  // Quem já paga (tem customer no Stripe) usa o portal; trial/sem assinatura vai pro checkout.
  const hasPaidSubscription = status === 'ACTIVE' || status === 'PAST_DUE';

  const handleManage = async () => {
    if (!hasPaidSubscription) {
      navigate('/planos');
      return;
    }
    setWorking(true);
    try {
      const res = await api.post('/subscriptions/billing-portal');
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      navigate('/planos');
    } catch (_) {
      // billing-portal 400 = ainda sem cliente no Stripe → escolher plano (checkout cria o cartão)
      navigate('/planos');
    } finally {
      setWorking(false);
    }
  };

  const ctaLabel = hasPaidSubscription ? 'Gerenciar assinatura' : 'Adicionar cartão / Escolher plano';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-[var(--accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Minha conta</h1>
        <p className="mt-1 text-sm text-slate-500">Dados da loja e assinatura.</p>
      </div>

      {/* Aviso pós-trial / pagamento pendente */}
      {needsAttention && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {trialExpired || status === 'CANCELED' || !status
                ? 'Seu período de teste terminou'
                : 'Há um problema com o pagamento'}
            </p>
            <p className="mt-0.5 text-sm text-amber-800">
              Adicione um cartão para manter a loja ativa e todos os recursos.
            </p>
          </div>
        </div>
      )}

      {/* Assinatura */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{planName}</h2>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>
                  {meta.label}
                </span>
              </div>
              {status === 'TRIALING' && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {trialDays === 0
                    ? 'Teste encerrado'
                    : `${trialDays} ${trialDays === 1 ? 'dia restante' : 'dias restantes'} de teste`}
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleManage} disabled={working} className="shrink-0">
            {working ? 'Abrindo…' : ctaLabel}
            {hasPaidSubscription && <ExternalLink className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
          <Field label="Status" value={meta.label} />
          {status === 'TRIALING' && <Field label="Teste termina em" value={fmtDate(sub?.trialEndsAt)} />}
          {status === 'ACTIVE' && <Field label="Próxima cobrança" value={fmtDate(sub?.currentPeriodEnd)} />}
          <Field label="Início" value={fmtDate(sub?.startedAt)} />
        </dl>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            Pagamento processado pelo Stripe. Recibos e faturas ficam em “Gerenciar assinatura”.
          </p>
          <button
            type="button"
            onClick={() => navigate('/planos')}
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Ver todos os planos
          </button>
        </div>
      </div>

      {/* Dados da loja */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Dados da loja</h2>
        <dl className="mt-2 divide-y divide-slate-100">
          <Field label="Loja" value={tenant?.name} />
          <Field label="Dono" value={user?.name} />
          <Field label="E-mail" value={user?.email || tenant?.email} />
          <Field label="WhatsApp" value={tenant?.whatsapp_phone} />
        </dl>
      </div>
    </div>
  );
}
