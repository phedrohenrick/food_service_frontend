import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

const PHONE_W = 454;
const PHONE_H = 956;
const SCREEN_W = 430;
const SCREEN_H = 932;
const MIN_SCALE = 0.42;
const MAX_SCALE = 0.62;
const HORIZONTAL_PADDING = 28;

const computeScale = (containerWidth) => {
  if (!containerWidth) return MIN_SCALE;
  const target = containerWidth - HORIZONTAL_PADDING;
  const scale = target / PHONE_W;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
};

const BrandPreviewPhone = ({ tenantSlug, mainColor }) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [scale, setScale] = useState(MIN_SCALE);
  const [reloadKey, setReloadKey] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);

  const iframeSrc = useMemo(() => {
    if (!tenantSlug) return '';
    return `/${tenantSlug}/app?preview=1`;
  }, [tenantSlug]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => setScale(computeScale(node.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const mainColorRef = useRef(mainColor);
  useEffect(() => {
    mainColorRef.current = mainColor;
  }, [mainColor]);

  const postAccent = (color) => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !color) return;
    try {
      win.postMessage({ type: 'priatoo-preview-accent', mainColor: color }, '*');
    } catch (_) {}
  };

  useEffect(() => {
    if (!iframeReady) return;
    const handle = window.setTimeout(() => postAccent(mainColor), 90);
    return () => window.clearTimeout(handle);
  }, [mainColor, iframeReady]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event?.data?.type === 'priatoo-preview-ready') {
        setIframeReady(true);
        postAccent(mainColorRef.current);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (iframeReady) return undefined;
    const fallback = window.setTimeout(() => setIframeReady(true), 3500);
    return () => window.clearTimeout(fallback);
  }, [iframeReady, reloadKey]);

  const handleReload = () => {
    setIframeReady(false);
    setReloadKey((k) => k + 1);
  };

  const stagedHeight = PHONE_H * scale;
  const stagedWidth = PHONE_W * scale;

  return (
    <div
      ref={containerRef}
      className="sticky top-6 rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_rgba(15,23,42,0.08)] overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white shrink-0"
            style={{
              background:
                'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))',
            }}
          >
            <Smartphone className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 leading-tight">
              Pré-visualização ao vivo
            </p>
            <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
              Visão do cliente
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReload}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Recarregar"
          aria-label="Recarregar pré-visualização"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
          <span
            className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/10 shrink-0"
            style={{ backgroundColor: mainColor || '#EA1D2C' }}
          />
          <span className="text-[11px] font-medium text-slate-500 truncate">
            Cor aplicada · <span className="text-slate-800">{(mainColor || '').toUpperCase() || '#EA1D2C'}</span>
          </span>
        </div>
      </div>

      <div
        className="flex justify-center"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, #f1f5f9 0%, #e2e8f0 60%, #cbd5e1 100%)',
          padding: '18px 0 22px',
        }}
      >
        <div
          style={{
            width: `${stagedWidth}px`,
            height: `${stagedHeight}px`,
            position: 'relative',
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${PHONE_W}px`,
              height: `${PHONE_H}px`,
            }}
          >
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
                <iframe
                  ref={iframeRef}
                  key={reloadKey}
                  src={iframeSrc}
                  title="Pré-visualização da loja para o cliente"
                  style={{
                    width: `${SCREEN_W}px`,
                    height: `${SCREEN_H}px`,
                    border: 0,
                    display: 'block',
                    borderRadius: '49px',
                    background: '#fff',
                    opacity: iframeReady ? 1 : 0,
                    transition: 'opacity 220ms ease',
                  }}
                />

                {!iframeReady && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(180deg, #fafafa 0%, #f1f5f9 100%)',
                      borderRadius: '49px',
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="inline-block h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
                      <span className="text-[11px] font-medium text-slate-400">
                        Carregando vitrine…
                      </span>
                    </div>
                  </div>
                )}

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

      <div className="px-5 py-2.5 text-center bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-500 leading-tight">
          iPhone 14 Pro Max ·{' '}
          <span className="font-medium text-slate-600">
            atualiza em tempo real
          </span>
        </p>
      </div>
    </div>
  );
};

export default BrandPreviewPhone;
