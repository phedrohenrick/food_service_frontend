import React from 'react';
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
import { StorefrontProvider } from './src/context/StorefrontContext';

const CustomerApp = () => (
  <StorefrontProvider>
    <CustomerLayout>
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
  </StorefrontProvider>
);

export default CustomerApp;
