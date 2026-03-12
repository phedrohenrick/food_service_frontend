import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './components/layout/CustomerLayout.jsx';
import { Home, Product, Bag, Addresses, AddressForm, Orders, OrderDetails } from './pages';
import { useEffect } from 'react';
import { ensureSso } from '../../../shared/auth/keycloak';
import { useStorefront } from '../../../shared/generalContext.jsx';

function CustomerApp() {
  const { reloadOrders } = useStorefront();
  useEffect(() => {
    (async () => {
      const ok = await ensureSso();
      if (ok) reloadOrders();
    })();
  }, [reloadOrders]);
  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:itemId" element={<Product />} />
        <Route path="/sacola" element={<Bag />} />
        <Route path="/enderecos" element={<Addresses />} />
        <Route path="/enderecos/:addressId" element={<AddressForm />} />
        <Route path="/pedidos" element={<Orders />} />
        <Route path="/pedidos/:orderId" element={<OrderDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomerLayout>
  );
}

export default CustomerApp;
