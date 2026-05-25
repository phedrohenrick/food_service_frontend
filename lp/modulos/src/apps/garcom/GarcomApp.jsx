import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import GarcomMesas from './src/pages/GarcomMesas';
import GarcomMesaTabs from './src/pages/GarcomMesaTabs';
import GarcomComanda from './src/pages/GarcomComanda';
import { useStorefront } from '../../shared/generalContext.jsx';
import { accentCssVars } from '../../shared/utils/accentColor';

const GarcomApp = () => {
  const { slug } = useParams();
  const { tenant } = useStorefront();

  useEffect(() => {
    if (slug) {
      try { localStorage.setItem('tenantSlug', slug); } catch (_) {}
    }
  }, [slug]);

  const accentVars = useMemo(
    () => accentCssVars(tenant?.main_color),
    [tenant?.main_color]
  );

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
