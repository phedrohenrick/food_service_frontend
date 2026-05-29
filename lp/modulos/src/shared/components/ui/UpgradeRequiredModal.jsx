import React from 'react';
import { Crown, X } from 'lucide-react';

const UpgradeRequiredModal = ({
  open,
  onClose,
  onUpgrade,
  title = 'Limite do plano atingido',
  message,
  currentUsage,
  limit,
  currentPlan,
  suggestedPlan,
  featureLabel,
}) => {
  if (!open) return null;

  const planName = (code) => {
    if (!code) return null;
    const normalized = String(code).toUpperCase();
    if (normalized === 'PRO_TRIAL') return 'PRO (trial)';
    return normalized;
  };

  const defaultMessage = (() => {
    const usage = (currentUsage != null && limit != null && featureLabel)
      ? `Você está usando ${currentUsage} de ${limit} ${featureLabel} disponíveis no plano ${planName(currentPlan) || 'atual'}.`
      : null;
    const upgrade = suggestedPlan
      ? `Faça upgrade para o plano ${planName(suggestedPlan)} e desbloqueie mais.`
      : 'Faça upgrade para desbloquear mais.';
    return [usage, upgrade].filter(Boolean).join(' ');
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative px-6 pt-6 pb-5 text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-inner">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Upgrade necessário</p>
              <h2 className="text-lg font-bold leading-tight">{title}</h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">{message || defaultMessage}</p>

          {currentUsage != null && limit != null && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {featureLabel || 'Uso'}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {currentUsage} <span className="text-gray-400 font-normal">de {limit}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: '100%',
                    background: 'var(--accent)',
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={onUpgrade}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-semibold shadow-md transition-all hover:opacity-90"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
                boxShadow: '0 4px 12px -2px color-mix(in srgb, var(--accent) 40%, transparent)',
              }}
            >
              <Crown className="h-3.5 w-3.5" />
              Fazer upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeRequiredModal;
