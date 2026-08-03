import React, { useEffect, useRef, useState } from 'react';
import { initKeycloak, getKeycloak } from '../shared/auth/keycloak';
import api from '../shared/services/api';

const genSlugCandidate = () => {
  const rand = Math.random().toString(36).slice(2, 8);
  return `minha-loja-${rand}`;
};

// Documentos cujo aceite é obrigatório para criar a loja (LGPD — ver backend docs/LGPD.md).
const REQUIRED_TYPES = ['TERMS', 'PRIVACY', 'DPA'];
const DOC_LABELS = {
  TERMS: 'os Termos de Uso',
  PRIVACY: 'a Política de Privacidade',
  DPA: 'o Contrato de Tratamento de Dados (Operador)',
  SUBSCRIPTION: 'o Contrato de Assinatura',
  COOKIES: 'a Política de Cookies',
  MARKETING: 'receber novidades e comunicações por e-mail',
};
// Versão usada como fallback caso o backend não responda os documentos vigentes.
const FALLBACK_VERSION = '2026-07-01';

// Conclui o onboarding. Opção A (trial sem cartão): o lojista vai direto pro dashboard.
async function finishOnboarding(slug) {
  try { localStorage.setItem('tenantSlug', slug); } catch (_) {}
  window.location.assign(`/${slug}/dashboard`);
}

async function ensureBanner(tenantId) {
  if (!tenantId) return;
  try {
    const currentBanners = await api.get(`/banners?tenantId=${tenantId}`);
    if (!Array.isArray(currentBanners) || currentBanners.length === 0) {
      await api.post('/banners', {
        tenantId: { id: tenantId },
        bannerImage: 'https://i.postimg.cc/G3K17Cc1/task-01khrzasy4eezs1xnxzx4wdgsm-1771438478-img-0.webp',
        productLink: 'item-combo-aurora',
      });
    }
  } catch (_) {}
}

export default function StartOnboarding() {
  const [state, setState] = useState({ status: 'init', message: '' });
  const [docs, setDocs] = useState([]);          // documentos vigentes (do backend)
  const [accepted, setAccepted] = useState({});  // { TERMS: true, ... }
  const guard = useRef(false);

  useEffect(() => {
    (async () => {
      if (guard.current) return;
      guard.current = true;
      setState({ status: 'auth', message: 'Redirecionando para login...' });
      await initKeycloak(() => {});
      const kc = getKeycloak();
      if (!kc.authenticated) return;
      try { await api.get('/users/me'); } catch (_) {}

      // Já tem loja? Vai direto pro dashboard (não repete o aceite).
      try {
        const existing = await api.get('/onboarding/my-tenant');
        if (existing && existing.slug) {
          await ensureBanner(existing.id);
          await finishOnboarding(existing.slug);
          return;
        }
      } catch (_) {}

      // Novo lojista: carrega os documentos vigentes e pede o aceite antes de criar a loja.
      try {
        const list = await api.get('/consents/documents');
        setDocs(Array.isArray(list) ? list : []);
      } catch (_) {
        setDocs([]);
      }
      setState({ status: 'consent', message: '' });
    })();
  }, []);

  // Documentos obrigatórios a exibir (com fallback se o backend não respondeu).
  const requiredDocs = REQUIRED_TYPES.map((type) => {
    const found = docs.find((d) => d.type === type);
    return found || { type, version: FALLBACK_VERSION, url: null };
  });
  const marketingDoc = docs.find((d) => d.type === 'MARKETING') || { type: 'MARKETING', version: FALLBACK_VERSION, url: null };

  const allRequiredAccepted = requiredDocs.every((d) => accepted[d.type]);

  const toggle = (type) => setAccepted((prev) => ({ ...prev, [type]: !prev[type] }));

  async function handleAcceptAndCreate() {
    if (!allRequiredAccepted) return;
    setState({ status: 'creating', message: 'Criando sua loja...' });

    // Registra os consentimentos (obrigatórios + marketing se marcado). Não bloqueia a
    // criação da loja se um POST falhar, mas tenta todos.
    const toRecord = requiredDocs.map((d) => ({ ...d, accepted: true }));
    toRecord.push({ ...marketingDoc, accepted: !!accepted.MARKETING });
    await Promise.all(
      toRecord.map((d) =>
        api.post('/consents', {
          documentType: d.type,
          documentVersion: d.version || FALLBACK_VERSION,
          accepted: d.accepted,
          subjectType: 'LOJISTA',
        }).catch(() => {})
      )
    );

    // Cria a loja (lógica original).
    let slug = genSlugCandidate();
    try {
      for (let i = 0; i < 5; i++) {
        const res = await api.get(`/onboarding/slug-available?slug=${slug}`);
        if (res?.available ?? true) break;
        slug = genSlugCandidate();
      }
    } catch (_) {}
    try {
      const dto = await api.post('/onboarding/tenant', {
        name: 'Minha Loja',
        slug,
        mainColor: '#920a00ff',
        photoUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000&auto=format&fit=crop',
      });
      const createdSlug = dto?.slug || slug;
      await ensureBanner(dto?.id);
      await finishOnboarding(createdSlug);
    } catch (e) {
      setState({ status: 'error', message: 'Não foi possível criar sua loja automaticamente. Tente novamente.' });
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="/assets/images/lp/loading.mp4"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        {state.status === 'consent' ? (
          <div className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Antes de criar sua loja</h2>
            <p className="mt-1 text-sm text-gray-600">
              Para continuar, leia e aceite os documentos abaixo. Guardamos seu aceite com data e versão.
            </p>

            <div className="mt-4 space-y-3">
              {requiredDocs.map((d) => (
                <label key={d.type} className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!accepted[d.type]}
                    onChange={() => toggle(d.type)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
                    style={{ accentColor: '#EA1D2C' }}
                  />
                  <span>
                    Li e aceito{' '}
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer" className="font-semibold text-[#EA1D2C] underline">
                        {DOC_LABELS[d.type]}
                      </a>
                    ) : (
                      <span className="font-semibold">{DOC_LABELS[d.type]}</span>
                    )}
                    .
                  </span>
                </label>
              ))}

              {/* Opt-in opcional de marketing (não bloqueia). */}
              <label className="flex cursor-pointer items-start gap-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={!!accepted.MARKETING}
                  onChange={() => toggle('MARKETING')}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
                  style={{ accentColor: '#EA1D2C' }}
                />
                <span>Quero {DOC_LABELS.MARKETING} (opcional).</span>
              </label>
            </div>

            <button
              onClick={handleAcceptAndCreate}
              disabled={!allRequiredAccepted}
              className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #FF7F27, #EA1D2C)' }}
            >
              Aceitar e criar minha loja
            </button>
            <p className="mt-3 text-center text-[11px] text-gray-400">
              Você pode revisar esses documentos a qualquer momento no rodapé do site.
            </p>
          </div>
        ) : (
          <div className="max-w-md space-y-3 rounded-2xl bg-white/90 p-6 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-900">Iniciando onboarding</h2>
            <p className="text-sm text-gray-600">{state.message}</p>
            {state.status === 'error' && (
              <button
                className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                onClick={() => window.location.reload()}
              >Tentar novamente</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
