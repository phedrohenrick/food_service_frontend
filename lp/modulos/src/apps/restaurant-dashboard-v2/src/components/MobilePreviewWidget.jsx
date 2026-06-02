import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Smartphone, X, RotateCw } from 'lucide-react';

const PHONE_W = 454;
const PHONE_H = 956;
const SCREEN_W = 430;
const SCREEN_H = 932;
const MAX_SCALE = 0.75;
const MIN_SCALE = 0.4;
const CHROME_VERTICAL = 130;
const VIEWPORT_VERTICAL_MARGIN = 30;
const VIEWPORT_HORIZONTAL_MARGIN = 60;

const computeAdaptiveScale = () => {
  if (typeof window === 'undefined') return MAX_SCALE;
  const verticalBudget = window.innerHeight - CHROME_VERTICAL - VIEWPORT_VERTICAL_MARGIN;
  const horizontalBudget = window.innerWidth - VIEWPORT_HORIZONTAL_MARGIN;
  const verticalScale = verticalBudget / PHONE_H;
  const horizontalScale = horizontalBudget / PHONE_W;
  const fitted = Math.min(verticalScale, horizontalScale);
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, fitted));
};

const MobilePreviewWidget = ({ open, onClose, tenantSlug }) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [phoneScale, setPhoneScale] = useState(MAX_SCALE);
  const containerRef = useRef(null);

  const iframeSrc = useMemo(() => {
    if (!tenantSlug) return '';
    return `/${tenantSlug}/app?preview=1`;
  }, [tenantSlug]);

  useEffect(() => {
    if (!open) return undefined;
    const update = () => setPhoneScale(computeAdaptiveScale());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      const root = containerRef.current;
      if (!root) return;
      if (root.contains(event.target)) return;
      onClose?.();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-50 select-none font-sans"
      style={{ width: `${PHONE_W * phoneScale + 28}px` }}
    >
      <div
        className="rounded-3xl bg-white overflow-hidden border border-gray-200/60"
        style={{
          boxShadow:
            '0 24px 56px -12px rgba(0,0,0,0.45), 0 12px 24px -6px rgba(0,0,0,0.28), 0 4px 10px -2px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="relative px-4 pt-3 pb-3 text-white"
          style={{
            background:
              'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 shadow-inner shrink-0">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80 leading-tight">
                  Pré-visualização
                </p>
                <p className="text-xs font-bold leading-tight truncate">
                  Como o cliente vê
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Recarregar"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Phone stage */}
        <div
          className="flex justify-center"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, #f1f5f9 0%, #e2e8f0 60%, #cbd5e1 100%)',
            padding: '14px 0',
          }}
        >
          <div
            style={{
              width: `${PHONE_W * phoneScale}px`,
              height: `${PHONE_H * phoneScale}px`,
              position: 'relative',
            }}
          >
            <div
              style={{
                transform: `scale(${phoneScale})`,
                transformOrigin: 'top left',
                width: `${PHONE_W}px`,
                height: `${PHONE_H}px`,
              }}
            >
              {/* Titanium frame */}
              <div
                style={{
                  width: `${PHONE_W}px`,
                  height: `${PHONE_H}px`,
                  background:
                    'linear-gradient(135deg, #2a2a2d 0%, #4a4a4e 18%, #2a2a2d 38%, #4a4a4e 58%, #2a2a2d 78%, #4a4a4e 100%)',
                  borderRadius: '62px',
                  padding: '12px',
                  position: 'relative',
                  boxShadow:
                    '0 0 0 2px #1a1a1c inset, 0 30px 60px -20px rgba(0,0,0,0.7)',
                }}
              >
                {/* Inner bezel */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#000',
                    borderRadius: '50px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 0 0 1px #2a2a2c inset',
                  }}
                >
                  {/* Screen */}
                  <iframe
                    key={reloadKey}
                    src={iframeSrc}
                    title="Pré-visualização do cliente"
                    style={{
                      width: `${SCREEN_W}px`,
                      height: `${SCREEN_H}px`,
                      border: 0,
                      display: 'block',
                      borderRadius: '49px',
                      background: '#fff',
                    }}
                  />

                  {/* Dynamic Island */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '125px',
                      height: '37px',
                      background: '#000',
                      borderRadius: '20px',
                      zIndex: 5,
                      boxShadow:
                        '0 0 8px rgba(0,0,0,0.6), 0 0 0 1px #1a1a1c inset',
                    }}
                  />
                </div>

                {/* Left side buttons */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-3px',
                    top: '140px',
                    width: '4px',
                    height: '34px',
                    background:
                      'linear-gradient(90deg, #1a1a1c 0%, #3a3a3c 100%)',
                    borderRadius: '2px 0 0 2px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '-3px',
                    top: '195px',
                    width: '4px',
                    height: '70px',
                    background:
                      'linear-gradient(90deg, #1a1a1c 0%, #3a3a3c 100%)',
                    borderRadius: '2px 0 0 2px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '-3px',
                    top: '280px',
                    width: '4px',
                    height: '70px',
                    background:
                      'linear-gradient(90deg, #1a1a1c 0%, #3a3a3c 100%)',
                    borderRadius: '2px 0 0 2px',
                  }}
                />
                {/* Right power button */}
                <div
                  style={{
                    position: 'absolute',
                    right: '-3px',
                    top: '220px',
                    width: '4px',
                    height: '110px',
                    background:
                      'linear-gradient(270deg, #1a1a1c 0%, #3a3a3c 100%)',
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 text-center bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 leading-tight">
            iPhone 14 Pro Max ·{' '}
            <span className="font-medium text-gray-600">
              pedidos desabilitados
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobilePreviewWidget;
