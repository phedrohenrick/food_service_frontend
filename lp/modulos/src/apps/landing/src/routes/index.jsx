import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importar as páginas do módulo landing
import HomePage from '../pages/HomePage';
import ServicesPage from '../pages/ServicesPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import BlogPage from '../pages/BlogPage';
import BlogPostPage from '../pages/BlogPostPage';
import DeliverySignupPage from '../pages/DeliverySignupPage';
import RestaurantSignupPage from '../pages/RestaurantSignupPage';
import FoodDeliveryPage from '../pages/FoodDeliveryPage';

const LandingRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/servicos" element={<ServicesPage />} />
      <Route path="/sobre-nos" element={<AboutPage />} />
      <Route path="/contato" element={<ContactPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/cadastro-entregadores" element={<DeliverySignupPage />} />
      <Route path="/cadastro-restaurantes" element={<RestaurantSignupPage />} />
      <Route path="/entrega-de-comida" element={<FoodDeliveryPage />} />
    </Routes>
  );
};

export default LandingRoutes;