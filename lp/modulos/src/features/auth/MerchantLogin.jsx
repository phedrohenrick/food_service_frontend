"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";

export default function MerchantLogin() {
  const [isSubmitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      console.log("Login realizado com sucesso!");
    }, 1200);
  };

  return (
    <AuthLayout
      accentLabel="LOJISTA"
      title="Acesse seu painel de restaurante"
      subtitle="Controle pedidos, taxas e relacionamento com clientes em tempo real. Estamos ao seu lado para entregar um atendimento impecável."
      footer={
        <p className="text-white/80">
          Precisa cadastrar seu restaurante?{" "}
          <Link to="/#pre-cadastro" className="font-semibold text-white hover:text-white/80 transition-colors">
            Solicite acesso antecipado.
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Painel do Restaurante
          </h2>
          <p className="text-gray-600 text-sm">
            Faça login para gerenciar seu estabelecimento
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              E-mail comercial
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@seudelivery.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Senha
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-400 focus:ring-2"
              />
              <span className="text-gray-600">Manter-me conectado</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || !password.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg hover:from-red-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </div>
            ) : (
              "Acessar Painel"
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Seus dados estão protegidos com criptografia de ponta a ponta.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

