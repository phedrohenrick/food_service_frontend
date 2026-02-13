import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './components/layout/CustomerLayout.jsx';
import { Home, Product, Bag, Addresses, AddressForm, Orders, OrderDetails } from './pages';

function CustomerApp() {
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