import React, { useCallback, useEffect, useMemo, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const SpinnerIcon = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const FirstAccessWizard = ({
  active,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onFinish,
  onSkip,
  skipDisabledHint,
}) => {
  const [targetRect, setTargetRect] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [canAdvance, setCanAdvance] = useState(true);

  useEffect(() => {
    if (!active || !step?.targetSelector) {
      setTargetRect(null);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    setTargetRect(null);
    let timeoutId = null;
    let attempts = 0;

    const updateRect = () => {
      const element = document.querySelector(step.targetSelector);
      if (!element) {
        if (attempts < 20) {
          attempts += 1;
          timeoutId = window.setTimeout(updateRect, 150);
        } else {
          setIsSearching(false);
        }
        return;
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      setTargetRect(element.getBoundingClientRect());
      setIsSearching(false);
    };

    updateRect();

    const handleViewportUpdate = () => {
      const element = document.querySelector(step.targetSelector);
      if (!element) return;
      setTargetRect(element.getBoundingClientRect());
    };

    window.addEventListener('resize', handleViewportUpdate);
    window.addEventListener('scroll', handleViewportUpdate, true);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.removeEventListener('resize', handleViewportUpdate);
      window.removeEventListener('scroll', handleViewportUpdate, true);
    };
  }, [active, step?.targetSelector]);

  useEffect(() => {
    if (!active || !step?.validate) {
      setCanAdvance(true);
      return;
    }
    setCanAdvance(step.validate());
    const recheck = () => setCanAdvance(step.validate());
    document.addEventListener('input', recheck);
    document.addEventListener('change', recheck);
    return () => {
      document.removeEventListener('input', recheck);
      document.removeEventListener('change', recheck);
    };
  }, [active, step]);

  useEffect(() => {
    if (!active || !onSkip) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onSkip();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, onSkip]);

  const panelStyle = useMemo(() => {
    if (typeof window === 'undefined' || !targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    if (step?.placement === 'anchor-right') {
      const gap = 16;
      const horizontalBudget = window.innerWidth - targetRect.right - gap - 16;
      if (horizontalBudget >= 240) {
        const panelWidth = Math.min(360, horizontalBudget);
        const top = clamp(targetRect.top, 80, Math.max(80, window.innerHeight - 460));
        return {
          top,
          left: targetRect.right + gap,
          width: panelWidth,
          maxHeight: window.innerHeight - 96,
          overflowY: 'auto',
        };
      }
    }

    if (step?.placement === 'side' || step?.placement === 'anchor-right') {
      const sideWidth = Math.min(360, window.innerWidth - 32);
      const left = Math.max(16, window.innerWidth - sideWidth - 24);
      const top = clamp(targetRect.top, 80, Math.max(80, window.innerHeight - 460));
      return {
        top,
        left,
        width: sideWidth,
        maxHeight: window.innerHeight - 96,
        overflowY: 'auto',
      };
    }

    const panelWidth = Math.min(420, window.innerWidth - 32);
    const preferredLeft = clamp(targetRect.left, 16, window.innerWidth - panelWidth - 16);
    const fitsBelow = targetRect.bottom + 24 + 280 < window.innerHeight;
    const top = fitsBelow ? targetRect.bottom + 20 : Math.max(24, targetRect.top - 300);

    return { top, left: preferredLeft, width: panelWidth };
  }, [targetRect, step?.placement]);

  if (!active || !step) return null;

  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" role="presentation">
      {targetRect && typeof window !== 'undefined' ? (
        <>
          <div
            className="absolute left-0 right-0 top-0 bg-slate-950/55 backdrop-blur-[2px]"
            style={{ height: Math.max(targetRect.top - 10, 0) }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-slate-950/55 backdrop-blur-[2px]"
            style={{ top: Math.min(targetRect.bottom + 10, window.innerHeight) }}
          />
          <div
            className="absolute bg-slate-950/55 backdrop-blur-[2px]"
            style={{
              top: Math.max(targetRect.top - 10, 0),
              left: 0,
              width: Math.max(targetRect.left - 10, 0),
              height: targetRect.height + 20,
            }}
          />
          <div
            className="absolute bg-slate-950/55 backdrop-blur-[2px]"
            style={{
              top: Math.max(targetRect.top - 10, 0),
              left: Math.min(targetRect.right + 10, window.innerWidth),
              right: 0,
              height: targetRect.height + 20,
            }}
          />
          <div
            className="absolute rounded-[28px] border-2 border-[var(--accent)] transition-all duration-300"
            style={{
              top: Math.max(targetRect.top - 10, 8),
              left: Math.max(targetRect.left - 10, 8),
              width: Math.min(targetRect.width + 20, window.innerWidth - 16),
              height: targetRect.height + 20,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        className="pointer-events-auto fixed rounded-[30px] border border-white/15 bg-slate-950/90 p-6 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.85)]"
        style={panelStyle}
      >
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Primeiros passos
              </span>
              {!isSearching && (
                <span className="text-sm text-white/60">
                  {stepIndex + 1} de {totalSteps}
                </span>
              )}
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>

            {isSearching ? (
              <div className="flex items-center gap-3 py-3 text-white/45">
                <SpinnerIcon />
                <p className="text-sm">Carregando próxima seção...</p>
              </div>
            ) : (
              <div>
                <h3 id="wizard-title" className="text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/72">{step.description}</p>
              </div>
            )}
          </div>

          {!isSearching && step.note && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/70">
              {step.note}
            </div>
          )}

          {!isSearching && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={stepIndex === 0}
                  className="inline-flex min-w-[112px] items-center justify-center rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={isLastStep ? onFinish : onNext}
                  disabled={!canAdvance}
                  className="inline-flex min-w-[148px] items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)] shadow-[0_18px_45px_-22px_rgba(15,23,42,0.55)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {isLastStep ? 'Concluir tour' : 'Próximo'}
                </button>
              </div>

              {!canAdvance && step.validateHint && (
                <p className="text-center text-xs text-amber-400/75">
                  {step.validateHint}
                </p>
              )}

              {onSkip ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={onSkip}
                    className="text-xs text-white/28 transition hover:text-white/50"
                  >
                    Pular tour
                  </button>
                </div>
              ) : skipDisabledHint ? (
                <p className="text-center text-[11px] leading-snug text-white/35">
                  {skipDisabledHint}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstAccessWizard;
