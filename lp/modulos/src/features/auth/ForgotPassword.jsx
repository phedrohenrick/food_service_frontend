"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";

const roleConfigs = {
  lojista: {
    label: "LOJISTA",
    title: "Recuperar acesso do restaurante",
    help: "Informe o e-mail comercial para receber as instruções de redefinição.",
    placeholder: "contato@seudelivery.com",
    field: "email",
    icon: "🏪",
  },
  entregador: {
    label: "ENTREGADOR",
    title: "Redefinir PIN do entregador",
    help: "Digite o WhatsApp cadastrado para receber um novo PIN.",
    placeholder: "(62) 99999-0000",
    field: "tel",
    icon: "🛵",
  },
  cliente: {
    label: "CLIENTE",
    title: "Recuperar acesso do cliente",
    help: "Informe o WhatsApp utilizado nas últimas compras.",
    placeholder: "(62) 98888-1212",
    field: "tel",
    icon: "👤",
  },
};

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("tipo")?.toLowerCase();
  const [isSubmitting, setSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [details, setDetails] = useState("");

  const currentConfig = useMemo(() => {
    if (role && roleConfigs[role]) return roleConfigs[role];
    return roleConfigs.lojista;
  }, [role]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      console.log("Solicitação de recuperação enviada!");
    }, 1200);
  };

  return (
    <AuthLayout
      accentLabel={`RECUPERAÇÃO • ${currentConfig.label}`}
      title={currentConfig.title}
      subtitle="Cuidamos da sua conta para garantir um atendimento sempre próximo. Informe seus dados e entraremos em contato rapidamente."
      footer={
        <p className="text-white/80">
          Lembrou a senha?{" "}
          <Link to="/login" className="font-semibold text-white hover:text-white/80 transition-colors">
            Voltar para a seleção de login.
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-4">
            {currentConfig.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Recuperação de Acesso
          </h2>
          <p className="text-gray-600 text-sm">
            {currentConfig.help}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recover" className="block text-sm font-semibold text-gray-700 mb-2">
              {currentConfig.field === "email" ? "E-mail comercial" : "WhatsApp"}
            </label>
            <input
              id="recover"
              name="recover"
              type={currentConfig.field === "email" ? "email" : "tel"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentConfig.placeholder}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="details" className="block text-sm font-semibold text-gray-700 mb-2">
              Informações adicionais (opcional)
            </label>
            <textarea
              id="details"
              name="details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Conte para a gente se houve alguma alteração recente na equipe ou no dispositivo."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !inputValue.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg hover:from-red-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processando...</span>
              </div>
            ) : (
              "Enviar Solicitação"
            )}
          </button>
        </form>

        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-blue-500">⏱️</span>
              <span className="text-sm font-semibold text-blue-700">Tempo de resposta</span>
            </div>
            <p className="text-xs text-blue-600">
              Nossa equipe responde em até 30 minutos no horário comercial.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

