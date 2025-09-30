import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Landing Pages
import LandingPage from './apps/landing/src/pages/HomePage';
import AboutPage from './apps/landing/src/pages/sobre-nós';

// Restaurant Dashboard (lazy loading)
const RestaurantDashboard = React.lazy(() => import('./apps/restaurant-dashboard/RestaurantDashboardApp'));

// Customer App (lazy loading)
const CustomerApp = React.lazy(() => import('./apps/customer-app/CustomerApp'));

// Auth Pages
const LoginPage = React.lazy(() => import('./features/auth'));
const MerchantLoginPage = React.lazy(() => import('./features/auth/MerchantLogin'));
const DeliveryLoginPage = React.lazy(() => import('./features/auth/DeliveryLogin'));
const CustomerLoginPage = React.lazy(() => import('./features/auth/CustomerLogin'));
const ForgotPasswordPage = React.lazy(() => import('./features/auth/ForgotPassword'));

function App() {
  return (
    <Router>
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
        <Routes>
          {/* Landing Pages Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/sobre-nos" element={<AboutPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/lojista" element={<MerchantLoginPage />} />
          <Route path="/login/entregador" element={<DeliveryLoginPage />} />
          <Route path="/login/cliente" element={<CustomerLoginPage />} />
          <Route path="/login/esqueci-senha" element={<ForgotPasswordPage />} />
          
          {/* Restaurant Dashboard Routes */}
          <Route path="/dashboard/*" element={<RestaurantDashboard />} />
          
          {/* Customer App Routes */}
          <Route path="/app/*" element={<CustomerApp />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
