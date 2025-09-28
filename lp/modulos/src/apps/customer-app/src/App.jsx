import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Placeholder components for customer app
const HomePage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">App do Cliente</h1>
    <p>Bem-vindo ao app de delivery!</p>
  </div>
);

const RestaurantList = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Restaurantes</h1>
    <p>Lista de restaurantes disponíveis.</p>
  </div>
);

const Cart = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Carrinho</h1>
    <p>Seus itens selecionados.</p>
  </div>
);

const Profile = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Perfil</h1>
    <p>Gerencie seu perfil aqui.</p>
  </div>
);

function CustomerApp() {
  return (
    <div className="customer-app">
      <nav className="bg-green-600 text-white p-4">
        <h1 className="text-xl font-bold">App Cliente</h1>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurantes" element={<RestaurantList />} />
        <Route path="/carrinho" element={<Cart />} />
        <Route path="/perfil" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default CustomerApp;