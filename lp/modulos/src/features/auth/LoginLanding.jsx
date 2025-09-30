"use client";

import React from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";

const loginOptions = [
  {
    to: "/login/lojista",
    title: "Sou lojista",
    description: "Acompanhe pedidos, taxas e marketing do seu restaurante em um painel único.",
    highlight: "Dashboard completo",
    icon: "🏪",
  },
  {
    to: "/login/entregador",
    title: "Sou entregador",
    description: "Controle ganhos, horários e rotas com liberdade total de agenda.",
    highlight: "Ganhos rápidos",
    icon: "🛵",
  },
  {
    to: "/login/cliente",
    title: "Sou cliente",
    description: "Faça pedidos em segundos e acompanhe entregas com atendimento humanizado.",
    highlight: "Experiência premium",
    icon: "👤",
  },
];

export default function LoginLanding() {
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
            <Link
              key={option.to}
              to={option.to}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm px-5 py-4 transition-all hover:bg-white/80 hover:border-red-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-400 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                {option.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    {option.highlight}
                  </span>
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
            </Link>
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
