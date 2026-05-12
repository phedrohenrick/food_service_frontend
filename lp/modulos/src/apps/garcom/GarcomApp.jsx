import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import GarcomMesas from './src/pages/GarcomMesas';
import GarcomComanda from './src/pages/GarcomComanda';

const GarcomApp = () => {
  const { slug } = useParams();

  useEffect(() => {
    if (slug) {
      try { localStorage.setItem('tenantSlug', slug); } catch (_) {}
    }
  }, [slug]);

  return (
    <Routes>
      <Route index element={<GarcomMesas slug={slug} />} />
      <Route path="comanda/:tabId" element={<GarcomComanda slug={slug} />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};

export default GarcomApp;
