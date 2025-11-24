"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";

const roleConfigs = {
  lojista: {
    label: "logista",
    title: "Recuperar acesso do restaurante",
    help: "Informe o e-mail comercial para receber as instruções de redefinição.",
    placeholder: "contato@seudelivery.com",
    field: "email",
  },
  entregador: {
    label: "entregador",
    title: "Redefinir PIN do entregador",
    help: "Digite o WhatsApp cadastrado para receber um novo PIN.",
    placeholder: "(62) 99999-0000",
    field: "tel",
  },
  cliente: {
    label: "cliente",
    title: "Recuperar acesso do cliente",
    help: "Informe o WhatsApp utilizado nas últimas compras.",
    placeholder: "(62) 98888-1212",
    field: "tel",
  },
};

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("tipo")?.toLowerCase();
  const [isSubmitting, setSubmitting] = useState(false);

  const currentConfig = useMemo(() => {
    if (role && roleConfigs[role]) return roleConfigs[role];
    return roleConfigs.lojista;
  }, [role]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 1200);
  };

  return (
    <AuthLayout
      accentLabel={`recuperação • ${currentConfig.label}`}
      title={currentConfig.title}
      subtitle="Cuidamos da sua conta para garantir um atendimento sempre próximo. Informe seus dados e entraremos em contato rapidamente."
      footer={
        <p>
          Lembrou a senha? <Link to="/login" className="font-semibold text-background-hero">Voltar para a seleção de login.</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="recover" className="text-sm font-semibold text-foreground">
            {currentConfig.help}
          </label>
          <input
            id="recover"
            name="recover"
            type={currentConfig.field === "email" ? "email" : "tel"}
            required
            placeholder={currentConfig.placeholder}
            className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-base text-foreground outline-none transition focus:border-background-hero focus:bg-white"
          />
        </div>

        <textarea
          name="details"
          rows={3}
          placeholder="Conte para a gente se houve alguma alteração recente na equipe ou no dispositivo."
          className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-background-hero focus:bg-white"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-background-hero py-3 text-base font-semibold text-white shadow-lg transition hover:bg-background-orange/90 disabled:opacity-60"
        >
          {isSubmitting ? "Processando..." : "Enviar solicitação"}
        </button>

        <div className="text-xs text-center text-foreground/60">
          Nossa equipe responde em até 30 minutos no horário comercial.
        </div>
      </form>
    </AuthLayout>
  );
}

