import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  HomePage,
  ServicesPage,
  AboutPage,
  ContactPage,
  BlogPage,
  BlogPostPage,
  DeliverySignupPage,
  RestaurantSignupPage,
  FoodDeliveryPage
} from '../pages';

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