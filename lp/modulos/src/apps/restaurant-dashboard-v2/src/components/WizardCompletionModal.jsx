import React, { useMemo, useState } from 'react';
import api from '../../../../shared/services/api';

const FALLBACK_SUB_VERSION = '2026-07-01';

const CONFETTI_COLORS = ['var(--accent)', '#f59e0b', '#ec4899', '#22c55e', '#38bdf8', '#a855f7', '#ffffff'];

const rand = (min, max) => min + Math.random() * (max - min);

// Chuva de confetes na chegada ("aha moment"). Puro CSS/React, sem lib externa.
// pointer-events-none para não bloquear os botões; as peças são geradas uma única vez
// (useMemo sem deps) para não recriarem a cada re-render (ex.: toggle de "subscribing").
const Confetti = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        left: rand(0, 100),
        size: rand(6, 12),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: rand(2.6, 4.8),
        delay: rand(0, 1.2),
        xEnd: `${rand(-90, 90)}px`,
        rot: `${rand(360, 1080)}deg`,
        round: Math.random() > 0.6,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes priatoo-confetti-fall {
          0% { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--x-end), 112vh, 0) rotate(var(--rot)); opacity: 0.85; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: p.round ? '9999px' : '2px',
            '--x-end': p.xEnd,
            '--rot': p.rot,
            animation: `priatoo-confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
};

// Tela central de conclusão do tour ("aha moment"): a loja já foi configurada e testada,
// agora oferecemos finalizar a assinatura (checkout). O lojista pode explorar antes —
// o período de teste segue valendo; a cobrança só acontece quando ele conclui o checkout.
const WizardCompletionModal = ({ tenant, onClose }) => {
  const [subscribing, setSubscribing] = useState(false);
  const storefrontUrl = tenant?.slug ? `/${tenant.slug}/app` : null;
  const storeName = tenant?.name && tenant.name !== 'Minha Loja' ? tenant.name : null;

  const handleSubscribe = async () => {
    setSubscribing(true);
    let priceId = null;
    try { priceId = localStorage.getItem('pendingPriceId'); } catch (_) {}

    if (priceId) {
      try {
        // Aceite do Contrato de Assinatura (clickwrap) antes do pagamento.
        let subVersion = FALLBACK_SUB_VERSION;
        try {
          const docs = await api.get('/consents/documents');
          const sub = Array.isArray(docs) ? docs.find((d) => d.type === 'SUBSCRIPTION') : null;
          if (sub?.version) subVersion = sub.version;
        } catch (_) {}
        api.post('/consents', {
          documentType: 'SUBSCRIPTION',
          documentVersion: subVersion,
          accepted: true,
          subjectType: 'LOJISTA',
        }).catch(() => {});

        const res = await api.post('/subscriptions/checkout', { priceId });
        if (res?.url) { window.location.href = res.url; return; }
      } catch (_) {}
    }
    // Sem plano escolhido ou falha no checkout: leva pra tela de conta escolher e pagar.
    if (tenant?.slug) { window.location.href = `/${tenant.slug}/dashboard/conta`; return; }
    setSubscribing(false);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      <Confetti />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="h-1.5 w-full bg-[var(--accent)]" />

        <div className="p-9 space-y-7">
          <div className="flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border"
              style={{
                background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent) 35%, transparent)',
              }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: 'var(--accent)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.4}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <h2 className="text-[26px] font-bold leading-tight tracking-tight text-white">
              {storeName ? `${storeName} está quase pronta pra vender!` : 'Sua loja está quase pronta pra vender!'}
            </h2>
            <p className="text-[15px] leading-relaxed text-white/60">
              Você já configurou tudo no tour. Finalize a assinatura para destravar o plano completo
              e começar a receber pedidos de verdade.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={subscribing}
              className="rounded-2xl px-5 py-4 text-sm font-bold shadow-[0_18px_45px_-22px_rgba(15,23,42,0.55)] transition hover:brightness-110 disabled:opacity-70"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
              }}
            >
              {subscribing ? 'Redirecionando...' : 'Finalizar assinatura'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={subscribing}
              className="rounded-2xl border border-white/15 px-5 py-3.5 text-sm font-medium text-white/65 transition hover:border-white/30 hover:bg-white/5 disabled:opacity-60"
            >
              Explorar o painel primeiro
            </button>

            {storefrontUrl && (
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 pt-1 text-sm font-medium text-white/50 transition hover:text-white/80"
              >
                Ver minha loja
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          <p className="text-center text-xs leading-relaxed text-white/35">
            Você está no período de teste — pode assinar quando quiser. Sem assinatura, o acesso
            é bloqueado ao fim do teste.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WizardCompletionModal;
