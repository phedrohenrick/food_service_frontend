import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Placeholder components for restaurant dashboard
const DashboardHome = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Dashboard do Restaurante</h1>
    <p>Bem-vindo ao painel de controle do seu restaurante.</p>
  </div>
);

const Orders = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Pedidos</h1>
    <p>Gerencie os pedidos do seu restaurante aqui.</p>
  </div>
);

const Menu = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Cardápio</h1>
    <p>Gerencie o cardápio do seu restaurante aqui.</p>
  </div>
);

const Analytics = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Relatórios</h1>
    <p>Visualize as estatísticas do seu restaurante aqui.</p>
  </div>
);

function RestaurantDashboard() {
  return (
    <div className="restaurant-dashboard">
      <nav className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Dashboard Restaurante</h1>
      </nav>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/pedidos" element={<Orders />} />
        <Route path="/cardapio" element={<Menu />} />
        <Route path="/relatorios" element={<Analytics />} />
      </Routes>
    </div>
  );
}

export default RestaurantDashboard;