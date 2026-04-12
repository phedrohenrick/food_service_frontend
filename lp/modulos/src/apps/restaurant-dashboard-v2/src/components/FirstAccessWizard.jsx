import React, { useEffect, useMemo, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const FirstAccessWizard = ({
  active,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onFinish,
}) => {
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (!active || !step?.targetSelector) {
      setTargetRect(null);
      return undefined;
    }

    let timeoutId = null;
    let attempts = 0;

    const updateRect = () => {
      const element = document.querySelector(step.targetSelector);
      if (!element) {
        if (attempts < 20) {
          attempts += 1;
          timeoutId = window.setTimeout(updateRect, 150);
        }
        return;
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      setTargetRect(element.getBoundingClientRect());
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
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleViewportUpdate);
      window.removeEventListener('scroll', handleViewportUpdate, true);
    };
  }, [active, step]);

  const panelStyle = useMemo(() => {
    if (typeof window === 'undefined' || !targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const panelWidth = Math.min(420, window.innerWidth - 32);
    const preferredLeft = clamp(targetRect.left, 16, window.innerWidth - panelWidth - 16);
    const fitsBelow = targetRect.bottom + 24 + 280 < window.innerHeight;
    const top = fitsBelow ? targetRect.bottom + 20 : Math.max(24, targetRect.top - 300);

    return {
      top,
      left: preferredLeft,
      width: panelWidth,
    };
  }, [targetRect]);

  if (!active || !step) {
    return null;
  }

  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
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
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      )}

      <div
        className="pointer-events-auto fixed rounded-[30px] border border-white/15 bg-slate-950/90 p-6 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.85)]"
        style={panelStyle}
      >
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Primeiros passos
              </span>
              <span className="text-sm text-white/60">
                {stepIndex + 1} de {totalSteps}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">{step.description}</p>
            </div>
          </div>

          {step.note ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/70">
              {step.note}
            </div>
          ) : null}

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
              className="inline-flex min-w-[148px] items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)] shadow-[0_18px_45px_-22px_rgba(15,23,42,0.55)] transition hover:brightness-105"
            >
              {isLastStep ? 'Concluir tour' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstAccessWizard;
