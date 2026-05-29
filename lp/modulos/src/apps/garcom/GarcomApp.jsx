import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import GarcomMesas from './src/pages/GarcomMesas';
import GarcomMesaTabs from './src/pages/GarcomMesaTabs';
import GarcomComanda from './src/pages/GarcomComanda';
import { useStorefront } from '../../shared/generalContext.jsx';
import { accentCssVars } from '../../shared/utils/accentColor';

const GarcomApp = () => {
  const { slug } = useParams();
  const { tenant, dataLoaded } = useStorefront();

  useEffect(() => {
    if (slug) {
      try { localStorage.setItem('tenantSlug', slug); } catch (_) {}
    }
  }, [slug]);

  const accentVars = useMemo(
    () => accentCssVars(tenant?.main_color),
    [tenant?.main_color]
  );

  if (!dataLoaded) {
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
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="max-w-md rounded-2xl bg-white/90 p-6 shadow text-center space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Priatoo</h2>
            <p className="text-sm text-gray-600">Carregando a operação…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={accentVars}>
      <Routes>
        <Route index element={<GarcomMesas slug={slug} />} />
        <Route path="mesa/:tableId" element={<GarcomMesaTabs slug={slug} />} />
        <Route path="comanda/:tabId" element={<GarcomComanda slug={slug} />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
};

export default GarcomApp;
