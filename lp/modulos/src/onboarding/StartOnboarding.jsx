import React, { useEffect, useRef, useState } from 'react';
import { initKeycloak, getKeycloak } from '../shared/auth/keycloak';
import api from '../shared/services/api';

const genSlugCandidate = () => {
  const rand = Math.random().toString(36).slice(2, 8);
  return `minha-loja-${rand}`;
};

export default function StartOnboarding() {
  const [state, setState] = useState({ status: 'init', message: '' });
  const guard = useRef(false);
  useEffect(() => {
    (async () => {
      if (guard.current) return;
      guard.current = true;
      setState({ status: 'auth', message: 'Redirecionando para login...' });
      await initKeycloak(() => {});
      const kc = getKeycloak();
      if (!kc.authenticated) {
        return;
      }
      try {
        await api.get('/users/me');
      } catch (_) {}
      try {
        const existing = await api.get('/onboarding/my-tenant');
        if (existing && existing.slug) {
          const tenantId = existing.id;
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
          try { localStorage.setItem('tenantSlug', existing.slug); } catch (_) {}
          window.location.assign(`/${existing.slug}/dashboard`);
          return;
        }
      } catch (_) {}
      setState({ status: 'creating', message: 'Criando sua loja...' });
      let slug = genSlugCandidate();
      try {
        for (let i = 0; i < 5; i++) {
          const res = await api.get(`/onboarding/slug-available?slug=${slug}`);
          const available = res?.available ?? true;
          if (available) break;
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
        const tenantId = dto?.id;
        if (tenantId) {
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
        try { localStorage.setItem('tenantSlug', createdSlug); } catch (_) {}
        window.location.assign(`/${createdSlug}/dashboard`);
      } catch (e) {
        setState({ status: 'error', message: 'Não foi possível criar sua loja automaticamente. Tente novamente.' });
      }
    })();
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-2xl bg-white p-6 shadow text-center space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Iniciando onboarding</h2>
        <p className="text-sm text-gray-600">{state.message}</p>
        {state.status === 'error' && (
          <button
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            onClick={() => window.location.reload()}
          >Tentar novamente</button>
        )}
      </div>
    </div>
  );
}
