"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";

export default function DeliveryLogin() {
  const [isSubmitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!phone.trim() || !pin.trim()) return;
    
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      console.log("Login realizado com sucesso!");
    }, 1200);
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <AuthLayout
      accentLabel="ENTREGADOR"
      title="Comece suas entregas com ganhos maiores"
      subtitle="Controle corridas, rastreie repasses e fale com nosso time sempre que precisar. Taxas honestas para quem está na rua com a gente."
      footer={
        <p className="text-white/80">
          Ainda não faz parte do time?{" "}
          <Link to="/#pre-cadastro" className="font-semibold text-white hover:text-white/80 transition-colors">
            Entre para a lista de novos entregadores.
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso do Entregador
          </h2>
          <p className="text-gray-600 text-sm">
            Digite suas credenciais para acessar o painel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              WhatsApp cadastrado
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(62) 99999-0000"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
              maxLength={15}
              required
            />
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-semibold text-gray-700 mb-2">
              PIN de acesso
            </label>
            <input
              id="pin"
              name="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl font-bold text-gray-900 placeholder-gray-400 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all tracking-widest"
              maxLength={4}
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-400 focus:ring-2"
              />
              <span className="text-gray-600">Lembrar de mim</span>
            </label>
            <button
              type="button"
              className="font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Esqueci meu PIN
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !phone.trim() || !pin.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg hover:from-red-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </div>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Usamos login seguro para proteger sua conta e dados pessoais.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

