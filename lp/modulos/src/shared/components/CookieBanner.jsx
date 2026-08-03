import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Consentimento de cookies (LGPD / Guia ANPD): banner com escolha granular, "Rejeitar" com
// o mesmo destaque de "Aceitar" (sem dark patterns), e revogação posterior. A preferência
// vive no localStorage; para usuários logados também registramos no backend (best-effort).
const CONSENT_KEY = 'priatoo.cookieConsent';
const CONSENT_VERSION = '2026-07-01';
const POLICY_URL = '/cookies';

function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.version === CONSENT_VERSION ? parsed : null;
  } catch (_) {
    return null;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
  }, []);

  const persist = (prefs) => {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ ...prefs, necessary: true, version: CONSENT_VERSION, ts: new Date().toISOString() })
      );
    } catch (_) {}
    // Registro no backend (só funciona se o usuário estiver autenticado; ignora erro).
    api
      .post('/consents', {
        documentType: 'COOKIES',
        documentVersion: CONSENT_VERSION,
        accepted: !!(prefs.analytics || prefs.marketing),
      })
      .catch(() => {});
    setVisible(false);
  };

  const acceptAll = () => persist({ analytics: true, marketing: true });
  const rejectNonEssential = () => persist({ analytics: false, marketing: false });
  const savePrefs = () => persist({ analytics, marketing });

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.4)]">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-900">Sua privacidade</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Usamos cookies necessários para o site funcionar e, com o seu consentimento, cookies de
              análise e marketing. Você pode aceitar, rejeitar os não essenciais ou escolher por categoria.{' '}
              <a href={POLICY_URL} target="_blank" rel="noreferrer" className="font-semibold text-[#EA1D2C] underline">
                Política de Cookies
              </a>
              .
            </p>

            {showPrefs && (
              <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <label className="flex items-center justify-between text-xs text-slate-500">
                  <span>Necessários <span className="text-slate-400">(sempre ativos)</span></span>
                  <input type="checkbox" checked disabled className="h-4 w-4" />
                </label>
                <label className="flex cursor-pointer items-center justify-between text-xs text-slate-700">
                  <span>Análise / desempenho</span>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="h-4 w-4"
                    style={{ accentColor: '#EA1D2C' }}
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between text-xs text-slate-700">
                  <span>Marketing</span>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="h-4 w-4"
                    style={{ accentColor: '#EA1D2C' }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {showPrefs ? (
            <button
              onClick={savePrefs}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF7F27, #EA1D2C)' }}
            >
              Salvar preferências
            </button>
          ) : (
            <>
              <button
                onClick={acceptAll}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #FF7F27, #EA1D2C)' }}
              >
                Aceitar todos
              </button>
              <button
                onClick={rejectNonEssential}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Rejeitar não essenciais
              </button>
            </>
          )}
          <button
            onClick={() => setShowPrefs((v) => !v)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {showPrefs ? 'Voltar' : 'Personalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
