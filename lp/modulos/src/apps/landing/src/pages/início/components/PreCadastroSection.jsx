"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@relume_io/relume-ui";
import { HiOutlineSparkles, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { BsShieldCheck, BsCheckCircleFill } from "react-icons/bs";

export const leadFields = {
  lojista: [
    {
      name: "responsavelNome",
      label: "Nome do responsável",
      placeholder: "Maria Silva",
      required: true,
    },
    {
      name: "restauranteNome",
      label: "Nome do restaurante",
      placeholder: "Restaurante Sabor & Arte",
      required: true,
    },
    {
      name: "whatsapp",
      label: "WhatsApp para contato",
      placeholder: "(11) 99999-9999",
      required: true,
      inputMode: "tel",
    },
    {
      name: "cidade",
      label: "Cidade / Estado",
      placeholder: "São Paulo / SP",
      required: true,
    },
  ],
  // Mantido para o LeadPopup (o formulário desta seção usa apenas "lojista").
  entregador: [
    {
      name: "nomeCompleto",
      label: "Nome completo",
      placeholder: "João Oliveira",
      required: true,
    },
    {
      name: "whatsapp",
      label: "WhatsApp para contato",
      placeholder: "(11) 98888-0000",
      required: true,
      inputMode: "tel",
    },
    {
      name: "cidade",
      label: "Cidade / Estado",
      placeholder: "Campinas / SP",
      required: true,
    },
    {
      name: "veiculo",
      label: "Tipo de veículo",
      placeholder: "Moto, bike, carro...",
      required: true,
    },
  ],
};

export const googleFields = {
  lojista: {
    responsavelNome: "entry.334939554",
    restauranteNome: "entry.809978231",
    whatsapp: "entry.1735168159",
    cidade: "entry.374097029",
    faturamento: "entry.236284459",
    tipo: "entry.2139033098",
  },
  entregador: {
    nomeCompleto: "entry.334939554",
    whatsapp: "entry.1735168159",
    cidade: "entry.374097029",
    veiculo: "entry.1138865427",
    tipo: "entry.2139033098",
  },
};

export const getInitialFormState = (type = "lojista") => {
  return leadFields[type].reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: "",
    }),
    {}
  );
};

const USER_TYPE = "lojista";

export function PreCadastroSection() {
  const [formData, setFormData] = useState(() => getInitialFormState(USER_TYPE));
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [isSubmitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("hidden"); // "hidden" | "in" | "out"

  // Toast de sucesso: aparece, some sozinho após ~4,5s (faz a saída antes de desmontar).
  useEffect(() => {
    if (toast !== "in") return;
    const leave = setTimeout(() => setToast("out"), 4500);
    const done = setTimeout(() => setToast("hidden"), 5000);
    return () => { clearTimeout(leave); clearTimeout(done); };
  }, [toast]);

  const endpoint = process.env.REACT_APP_LEAD_ENDPOINT;
  const googleFormAction = process.env.REACT_APP_GOOGLE_FORM_ACTION;

  const activeFields = leadFields[USER_TYPE];

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mapToGooglePayload = (type, data) => {
    const mapping = googleFields[type];
    if (!mapping) return null;

    const pairs = Object.entries(data)
      .filter(([key]) => Boolean(mapping[key]))
      .map(([key, value]) => [mapping[key], value]);

    if (mapping.tipo) {
      pairs.push([mapping.tipo, type]);
    }

    if (!pairs.length) return null;

    return new URLSearchParams(pairs).toString();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ state: "loading", message: "" });

    try {
      const payload = {
        ...formData,
        tipo: USER_TYPE,
        submittedAt: new Date().toISOString(),
      };

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Não foi possível enviar seus dados agora.");
        }
      } else if (googleFormAction) {
        const googleBody = mapToGooglePayload(USER_TYPE, formData);

        if (!googleBody) {
          throw new Error("Configuração do formulário temporário inválida.");
        }

        await fetch(googleFormAction, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: googleBody,
          mode: "no-cors",
        });
      } else if (typeof window !== "undefined") {
        const existing = window.localStorage.getItem("fs-pre-cadastros");
        const leads = existing ? JSON.parse(existing) : [];
        leads.push(payload);
        window.localStorage.setItem("fs-pre-cadastros", JSON.stringify(leads));
      }

      setStatus({ state: "idle", message: "" });
      setToast("in");
      setFormData(getInitialFormState(USER_TYPE));
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error.message ||
          "Opa, tivemos um pico de acessos. Tente novamente em instantes.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="pre-cadastro"
      className="px-[5%] py-20 md:py-28"
      style={{ background: "#fafaf8" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "#A52A2A" }}
          >
            Contato
          </p>
          <h2
            className="mt-3 text-3xl font-extrabold text-[#1a0e0d] sm:text-4xl lg:text-5xl"
            style={{
              fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Quer falar com a gente antes de começar?
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          {/* Left: arguments */}
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  icon: <BsShieldCheck className="text-xl" style={{ color: "#FF7F27" }} />,
                  title: "Sem contrato de fidelidade",
                  desc: "Cancele quando quiser, sem multa e sem burocracia.",
                },
                {
                  icon: <HiOutlineChatBubbleLeftRight className="text-xl" style={{ color: "#FF7F27" }} />,
                  title: "Suporte em português",
                  desc: "Time brasileiro disponível por WhatsApp e chat. Sem chatbot.",
                },
                {
                  icon: <HiOutlineSparkles className="text-xl" style={{ color: "#FF7F27" }} />,
                  title: "Onboarding incluído",
                  desc: "Configuramos tudo com você no primeiro acesso. Sem custo extra.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "white",
                    border: "1px solid #f0ece8",
                  }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(255,127,39,0.08)" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a0e0d]" style={{ fontSize: 15 }}>
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-sm" style={{ color: "#6b7280" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Respondemos em até 2 horas nos dias úteis. Zero spam.
            </p>
          </div>

          {/* Right: form */}
          <style>{`
            @keyframes leadFormPulse {
              0%   { box-shadow: 0 0 0 0 rgba(234,29,44,0.55); }
              70%  { box-shadow: 0 0 0 16px rgba(234,29,44,0); }
              100% { box-shadow: 0 0 0 0 rgba(234,29,44,0); }
            }
            #lead-form.lead-form-highlight {
              outline: 3px solid #EA1D2C;
              outline-offset: 4px;
              animation: leadFormPulse 1.3s ease-out 2;
            }
          `}</style>
          <div
            id="lead-form"
            className="relative overflow-hidden rounded-3xl shadow-[0_24px_60px_-30px_rgba(26,14,13,0.35)]"
            style={{ background: "white", border: "1px solid #f0ece8" }}
          >
            {/* Filete de atenção (sólido, sem degradê) */}
            <div aria-hidden="true" style={{ height: 5, background: "#EA1D2C" }} />

            <div className="p-8 md:p-10">

              <h3 className="mt-4 text-2xl font-extrabold text-[#1a0e0d]" style={{ letterSpacing: "-0.01em" }}>
                Fale com a gente
              </h3>
              <p className="mt-1.5 text-sm" style={{ color: "#6b7280" }}>
                Preencha em 30 segundos. Sem cartão, sem compromisso — nosso time entra em contato.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                {activeFields.map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label
                      htmlFor={field.name}
                      className="flex items-center gap-1 text-sm font-semibold"
                      style={{ color: "#374151" }}
                    >
                      {field.label}
                      {field.required && <span style={{ color: "#EA1D2C" }}>*</span>}
                      {field.optional && (
                        <span className="text-xs font-normal" style={{ color: "#9ca3af" }}>
                          (opcional)
                        </span>
                      )}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      required={Boolean(field.required)}
                      placeholder={field.placeholder}
                      value={formData[field.name] ?? ""}
                      onChange={handleFieldChange}
                      inputMode={field.inputMode}
                      className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all"
                      style={{
                        border: "1.5px solid #e5e0dc",
                        color: "#1a0e0d",
                        background: "#fafaf8",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#EA1D2C";
                        e.target.style.background = "white";
                        e.target.style.boxShadow = "0 0 0 4px rgba(234,29,44,0.10)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e0dc";
                        e.target.style.background = "#fafaf8";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                ))}

                <div className="space-y-3 pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    data-form-type={USER_TYPE}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white transition-all hover:opacity-95 disabled:opacity-60"
                    style={{ background: "#EA1D2C", boxShadow: "0 8px 20px -6px rgba(234,29,44,0.45)" }}
                  >
                    {isSubmitting ? "Enviando..." : "Quero saber mais"}
                    {!isSubmitting && <span aria-hidden="true">→</span>}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-center text-xs" style={{ color: "#9ca3af" }}>
                    <BsShieldCheck style={{ color: "#16a34a" }} />
                    Seus dados são usados apenas para contato. Zero spam.
                  </p>
                </div>
              </form>

              {status.state === "error" && (
                <div
                  className="mt-4 rounded-xl p-4 text-sm font-medium"
                  style={{ background: "#fff1f2", color: "#be123c" }}
                >
                  {status.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast de sucesso — sobe de baixo pra cima */}
      {toast !== "hidden" && (
        <>
          <style>{`
            @keyframes preToastUp { from { opacity: 0; transform: translateY(140%); } to { opacity: 1; transform: translateY(0); } }
            @keyframes preToastDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(140%); } }
            .pre-toast-in { animation: preToastUp .5s cubic-bezier(.2,.9,.25,1) both; }
            .pre-toast-out { animation: preToastDown .4s ease-in both; }
            @media (prefers-reduced-motion: reduce) {
              .pre-toast-in, .pre-toast-out { animation: none !important; }
            }
          `}</style>
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[9999] flex justify-center px-4">
            <div
              role="status"
              aria-live="polite"
              className={`pointer-events-auto flex items-center gap-3 rounded-full py-3.5 pl-4 pr-5 ${toast === "out" ? "pre-toast-out" : "pre-toast-in"}`}
              style={{ background: "#16a34a", color: "white", boxShadow: "0 16px 40px -12px rgba(22,163,74,0.55)" }}
            >
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <BsCheckCircleFill className="h-4.5 w-4.5" style={{ fontSize: 18 }} />
              </span>
              <p className="max-w-xs text-sm font-semibold leading-snug">
                Recebemos seu interesse — em breve entramos em contato.
              </p>
              <button
                type="button"
                onClick={() => setToast("out")}
                aria-label="Fechar"
                className="ml-1 flex-shrink-0 text-white/70 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
