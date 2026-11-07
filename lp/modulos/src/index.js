import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Captura o session_id do retorno do Stripe ANTES de qualquer init. O Keycloak
// (onLoad: 'login-required') faz um redirect de auth no load da página e descarta
// a querystring; guardando aqui, o dashboard ainda consegue confirmar a assinatura.
try {
  const stripeSessionId = new URLSearchParams(window.location.search).get('session_id');
  if (stripeSessionId) {
    window.sessionStorage.setItem('pendingCheckoutSessionId', stripeSessionId);
  }
} catch (_) { /* sessionStorage indisponível: segue sem capturar */ }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
