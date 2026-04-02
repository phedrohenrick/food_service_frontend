"use client";

import React from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { loginWithRedirect } from "../../shared/auth/keycloak";

const loginOptions = [
  {
    to: "/login/lojista",
    kind: "lojista",
    title: "Sou lojista",
    description: "Acompanhe pedidos, taxas e marketing do seu restaurante em um painel único.",
    highlight: "Dashboard completo",
    icon: "🏪",
  },
  {
    to: "/login/entregador",
    kind: "entregador",
    title: "Sou entregador",
    description: "Controle ganhos, horários e rotas com liberdade total de agenda.",
    highlight: "Ganhos rápidos",
    icon: "🛵",
  },
  {
    to: "/login/cliente",
    kind: "cliente",
    title: "Sou cliente",
    description: "Faça pedidos em segundos e acompanhe entregas com atendimento humanizado.",
    highlight: "Experiência premium",
    icon: "👤",
  },
];

export default function LoginLanding() {
  const handleMerchantLogin = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUri = `${origin}/onboarding/start`;
    await loginWithRedirect(redirectUri);
  };

  const handleCustomerLogin = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    let slug = null;
    try {
      slug =
        localStorage.getItem("authTenantSlug") ||
        localStorage.getItem("tenantSlug") ||
        null;
    } catch (_) {}
    const path = slug ? `/${slug}/app/sacola` : `/app`;
    const redirectUri = `${origin}${path}`;
    await loginWithRedirect(redirectUri);
  };

  return (
    <AuthLayout
      accentLabel="ACESSO SEGURO"
      title="Escolha como quer entrar no Food Service OS"
      subtitle="Conectamos restaurantes, entregadores e clientes em uma jornada com baixas taxas e atendimento próximo."
      footer={
        <p className="text-white/80">
          Ainda não tem acesso?{" "}
          <Link to="/#pre-cadastro" className="font-semibold text-white hover:text-white/80 transition-colors">
            Entre na lista de pré-lançamento.
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Como você quer acessar?
          </h2>
          <p className="text-gray-600 text-sm">
            Selecione o painel ideal e faça login com suas credenciais cadastradas.
          </p>
        </div>

        <div className="space-y-3">
          {loginOptions.map((option) => (
            <div
              key={option.to}
              className={`group flex items-center gap-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm px-5 py-4 transition-all ${
                option.kind === "entregador"
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-white/80 hover:border-red-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              }`}
              aria-disabled={option.kind === "entregador" ? "true" : "false"}
              onClick={() => {
                if (option.kind === "entregador") return;
                if (option.kind === "lojista") {
                  handleMerchantLogin();
                } else if (option.kind === "cliente") {
                  handleCustomerLogin();
                } else {
                  window.location.assign(option.to);
                }
              }}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-400 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                {option.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    {option.highlight}
                  </span>
                  {option.kind === "entregador" && (
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      Em breve
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {option.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
              
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <span className="text-gray-600 group-hover:text-red-500 transition-colors">→</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Seus dados estão protegidos com criptografia de ponta a ponta.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
