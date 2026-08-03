import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

/**
 * Tela que bloqueia um recurso fora do plano (trial expirado, assinatura inativa ou
 * plano que não inclui a feature). O card de venda aparece toda vez que se entra na tela
 * e pode ser fechado no X — mas o recurso continua limitado: ao fechar, fica um selo de
 * cadeado (que reabre o card). O conteúdo por trás fica desfocado quando `blur` (Mesas) ou
 * visível quando `blur=false` (Métricas mostra só os títulos pra "vender o que falta").
 *
 * Estética guiada pelo guia de frontend da Anthropic: cor dominante + acento marcante,
 * fundo com atmosfera (gradientes em camadas) e entrada orquestrada (stagger).
 */
export default function FeatureLock({
  locked,
  blur = true,
  title,
  benefit,
  message,
  ctaLabel = 'Ver planos',
  ctaHref = '/planos',
  badgeLabel = 'Período grátis expirado',
  icon = <Lock className="h-7 w-7 text-white" strokeWidth={2.25} />,
  children,
}) {
  const [dismissed, setDismissed] = useState(false);
  if (!locked) return children;

  return (
    <div className="relative">
      <style>{`
        @keyframes flkIn { from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: none; } }
        @keyframes flkGlow { 0%, 100% { opacity: .45; } 50% { opacity: .85; } }
        @keyframes flkRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .flk-card { animation: flkIn .55s cubic-bezier(.2,.75,.2,1) both; }
        .flk-glow { animation: flkGlow 4.5s ease-in-out infinite; }
        .flk-stagger > * { animation: flkRise .5s ease-out both; }
        .flk-stagger > *:nth-child(1) { animation-delay: .10s; }
        .flk-stagger > *:nth-child(2) { animation-delay: .17s; }
        .flk-stagger > *:nth-child(3) { animation-delay: .24s; }
        .flk-stagger > *:nth-child(4) { animation-delay: .31s; }
        .flk-stagger > *:nth-child(5) { animation-delay: .38s; }
        @media (prefers-reduced-motion: reduce) {
          .flk-card, .flk-glow, .flk-stagger > * { animation: none !important; }
        }
      `}</style>

      {/* Conteúdo real — recurso continua limitado (não interativo). Desfocado de leve quando blur. */}
      <div className={`pointer-events-none select-none ${blur ? 'blur-[3px]' : ''}`} aria-hidden="true">
        {children}
      </div>

      {dismissed ? (
        // Selo de cadeado: o recurso segue bloqueado; clicar reabre o card.
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-0.5"
          style={{ color: '#EA1D2C', border: '1px solid rgba(255,127,39,0.30)' }}
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
          {badgeLabel}
        </button>
      ) : (
        <div
          className="absolute inset-0 z-10 flex items-start justify-center px-4 pt-14"
          style={{
            background:
              'radial-gradient(70% 55% at 50% 30%, rgba(255,127,39,0.12), transparent 70%),' +
              'linear-gradient(to bottom, rgba(255,248,243,0.45), rgba(255,248,243,0.66))',
          }}
        >
          <div
            className="flk-card relative w-full max-w-md overflow-hidden rounded-[28px] bg-white p-8 pt-10 text-center"
            style={{
              border: '1px solid rgba(255,127,39,0.16)',
              boxShadow: '0 32px 72px -26px rgba(234,29,44,0.40), 0 8px 22px rgba(13,31,51,0.07)',
            }}
          >
            {/* Filete de marca */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #FF7F27, #EA1D2C)' }} />

            {/* Fechar */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Fechar"
              className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>

            {/* Glow quente pulsante atrás do ícone */}
            <div
              aria-hidden="true"
              className="flk-glow pointer-events-none absolute left-1/2 top-3 h-36 w-36 -translate-x-1/2 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,127,39,0.45), transparent 70%)', filter: 'blur(6px)' }}
            />

            <div className="flk-stagger relative">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #FF7F27, #EA1D2C)', boxShadow: '0 12px 30px -6px rgba(234,29,44,0.55)' }}
              >
                {icon}
              </div>

              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.28em]" style={{ color: '#FF7F27' }}>
                Priatoo
              </p>

              <h2 className="mt-1 text-[26px] font-black leading-tight" style={{ color: '#1a0e0d', letterSpacing: '-0.03em' }}>
                {title}
              </h2>

              <div>
                {benefit && (
                  <p className="mx-auto mt-3 max-w-sm text-[15px] font-semibold leading-snug" style={{ color: '#2b1411' }}>
                    {benefit}
                  </p>
                )}
                {message && (
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{message}</p>
                )}
              </div>

              <div>
                <a
                  href={ctaHref}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #FF7F27, #EA1D2C)', boxShadow: '0 16px 38px -10px rgba(234,29,44,0.60)' }}
                >
                  {ctaLabel}
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </a>
                <p className="mt-3 text-[11px] font-medium text-slate-400">
                  Ativação na hora · Sem fidelidade · Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
