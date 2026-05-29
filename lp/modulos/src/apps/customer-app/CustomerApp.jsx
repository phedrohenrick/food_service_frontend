import React, { useEffect, useMemo } from 'react';
import { Eye } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from './src/components/layout/CustomerLayout';
import {
  Home,
  Product,
  Bag,
  Addresses,
  AddressForm,
  Orders,
  OrderDetails,
} from './src/pages';
import { useStorefront } from '../../shared/generalContext.jsx';
import { ensureSso } from '../../shared/auth/keycloak';

const CustomerApp = () => {
  const { reloadOrders, dataLoaded } = useStorefront();
  const reloadOrdersRef = React.useRef(reloadOrders);

  const isPreview = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const fromUrl = new URLSearchParams(window.location.search).get('preview') === '1';
    if (fromUrl) {
      try { sessionStorage.setItem('priatoo_preview_mode', '1'); } catch (_) {}
      return true;
    }
    try { return sessionStorage.getItem('priatoo_preview_mode') === '1'; } catch (_) {
      return false;
    }
  }, []);
  useEffect(() => {
    reloadOrdersRef.current = reloadOrders;
  }, [reloadOrders]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await ensureSso();
      if (!cancelled && ok) reloadOrdersRef.current?.();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <p className="text-sm text-gray-600">Carregando o cardápio…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CustomerLayout>
      {isPreview && (
        <>
          <style>{`
            html, body { scrollbar-width: none; -ms-overflow-style: none; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0; height: 0; display: none; }
            *::-webkit-scrollbar { width: 0; height: 0; display: none; }
            * { scrollbar-width: none; -ms-overflow-style: none; }
          `}</style>
          <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-[11px] font-medium text-amber-800">
            <Eye className="h-3 w-3" />
            <span>Modo pré-visualização — pedidos desabilitados</span>
          </div>
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:productSlug" element={<Product />} />
        <Route path="/sacola" element={<Bag />} />
        <Route path="/enderecos" element={<Addresses />} />
        <Route path="/enderecos/novo" element={<AddressForm />} />
        <Route path="/enderecos/:addressId" element={<AddressForm />} />
        <Route path="/pedidos" element={<Orders />} />
        <Route path="/pedidos/:orderId" element={<OrderDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomerLayout>
  );
};

export default CustomerApp;
