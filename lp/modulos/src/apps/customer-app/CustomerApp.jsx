import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './src/components/layout/CustomerLayout';
import { Home, Restaurants, Orders, Profile } from './src/pages';

const CustomerApp = () => {
  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/restaurant/:id" element={<div>Restaurant Details Page</div>} />
      </Routes>
    </CustomerLayout>
  );
};

export default CustomerApp;