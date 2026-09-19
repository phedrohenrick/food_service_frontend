import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initKeycloak, getKeycloak, loginWithRedirect } from '../../shared/auth/keycloak';
import { Button } from '../../shared/components/ui';
import AdminLayout from './src/components/layout/AdminLayout';
import AdminDashboard from './src/pages/AdminDashboard';
import AdminTenantDetail from './src/pages/AdminTenantDetail';

/**
 * App do painel de plataforma (admin), montado em /admin/*.
 * Padrão: init do Keycloak (login-required) -> checa role ADMIN no token
 * -> renderiza o layout + rotas internas relativas.
 */
export default function AdminApp() {
  const [ready, setReady] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    initKeycloak(() => {
      const kc = getKeycloak();
      const roles = kc?.tokenParsed?.realm_access?.roles || [];
      setIsAdmin(roles.includes('ADMIN'));
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-[#FF7F27] animate-spin mb-4" />
        <p className="text-sm">Carregando painel…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full rounded-3xl bg-white p-10 text-center shadow border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Acesso restrito</h1>
          <p className="text-gray-600 mb-6">
            Esta área é exclusiva da administração da plataforma. Sua conta não tem o
            papel <span className="font-semibold">ADMIN</span>.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => loginWithRedirect(window.location.href, { forcePrompt: true })}>
              Entrar com outra conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="clientes/:id" element={<AdminTenantDetail />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AdminLayout>
  );
}
