import React from 'react';

const WizardCompletionModal = ({ tenant, onClose }) => {
  const storefrontUrl = tenant?.slug ? `/${tenant.slug}/app` : null;
  const storeName = tenant?.name && tenant.name !== 'Minha Loja' ? tenant.name : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="h-1 w-full bg-[var(--accent)]" />

        <div className="p-8 space-y-7">
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
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {storeName ? `${storeName} está pronta!` : 'Sua loja está pronta!'}
            </h2>
            <p className="text-m leading-relaxed text-white/55">
              Sua loja já pode receber pedidos.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-[0_18px_45px_-22px_rgba(15,23,42,0.55)] transition hover:brightness-110"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
              }}
            >
              Ir para o dashboard
            </button>
            {storefrontUrl && (
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3.5 text-sm font-medium text-white/65 transition hover:border-white/30 hover:bg-white/5"
              >
                Ver minha loja
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardCompletionModal;
