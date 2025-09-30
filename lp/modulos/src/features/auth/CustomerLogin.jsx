"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";

export default function CustomerLogin() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    setIsSubmitting(true);
    // Simular chamada da API
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 2000);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setIsSubmitting(true);
    // Simular verificação do código
    setTimeout(() => {
      setIsSubmitting(false);
      // Redirecionar para dashboard ou próxima tela
      console.log("Login realizado com sucesso!");
    }, 1500);
  };

  const formatPhone = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
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
      accentLabel="CLIENTE"
      title="Peça de onde estiver"
      subtitle="Acesse o app do cliente para descobrir restaurantes próximos, acompanhar entregas e conversar com nosso time pelo chat."
      footer={
        <p>
          Quer virar fã número um? <Link to="/" className="font-semibold text-background-hero">Explore a landing e veja nossos diferenciais.</Link>
        </p>
      }
    >
      <div className="space-y-6">
        {step === 1 ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                WhatsApp cadastrado
              </h2>
              <p className="text-gray-600 text-sm">
                Digite seu número para receber o código de acesso
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(62) 99999-0000"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
                  maxLength={15}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !phone.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg hover:from-red-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Usamos login sem senha para garantir segurança na sua conta.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                PIN de acesso
              </h2>
              <p className="text-gray-600 text-sm">
                Digite o código de 4 dígitos enviado para{" "}
                <span className="font-semibold text-gray-900">{phone}</span>
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl font-bold text-gray-900 placeholder-gray-400 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all tracking-widest"
                  maxLength={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || code.length !== 4}
                className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg hover:from-red-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Voltar para alterar número
              </button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
