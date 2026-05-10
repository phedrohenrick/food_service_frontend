"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@relume_io/relume-ui";
import { HiOutlineSparkles, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { BsShieldCheck } from "react-icons/bs";

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
    {
      name: "faturamento",
      label: "Faturamento mensal médio (opcional)",
      placeholder: "Ex: R$ 80.000",
    },
  ],
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

export const getInitialFormState = (type) => {
  return leadFields[type].reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: "",
    }),
    {}
  );
};

export function PreCadastroSection() {
  const [userType, setUserType] = useState("lojista");
  const [formData, setFormData] = useState(() => getInitialFormState("lojista"));
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [isSubmitting, setSubmitting] = useState(false);

  const endpoint = process.env.REACT_APP_LEAD_ENDPOINT;
  const googleFormAction = process.env.REACT_APP_GOOGLE_FORM_ACTION;

  useEffect(() => {
    const handleLeadType = (event) => {
      if (!event.detail?.type) return;
      const nextType = event.detail.type;
      setUserType(nextType);
    };

    document.addEventListener("lead:type", handleLeadType);
    return () => document.removeEventListener("lead:type", handleLeadType);
  }, []);

  useEffect(() => {
    setFormData(getInitialFormState(userType));
    setStatus({ state: "idle", message: "" });
  }, [userType]);

  const activeFields = useMemo(() => leadFields[userType], [userType]);

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
        tipo: userType,
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
        const googleBody = mapToGooglePayload(userType, formData);

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

      setStatus({
        state: "success",
        message:
          "Recebemos seu interesse! Nossa equipe vai chamar você para as condições especiais de lançamento.",
      });
      setFormData(getInitialFormState(userType));
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error.message ||
          "Opa, tivemos um pico de acessos. Tente novamente em instantes ou fale com a gente via WhatsApp.",
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
            Fale com a gente antes de começar
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
                  className="flex items-start gap-4 rounded-2xl p-5"
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

            {/* WhatsApp alternative */}
            <div
              className="flex items-center gap-4 rounded-2xl p-5"
              style={{
                background: "rgba(37,211,102,0.06)",
                border: "1px solid rgba(37,211,102,0.2)",
              }}
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(37,211,102,0.12)" }}
              >
                <HiOutlineChatBubbleLeftRight className="h-5 w-5" style={{ color: "#16a34a" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1a0e0d]">
                  Prefere pelo WhatsApp?
                </p>
                <a
                  href="https://wa.me/5500000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition hover:underline"
                  style={{ color: "#16a34a" }}
                >
                  Chamar no WhatsApp →
                </a>
              </div>
            </div>

            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Respondemos em até 2 horas nos dias úteis. Zero spam.
            </p>
          </div>

          {/* Right: form */}
          <div
            className="rounded-3xl p-8 shadow-sm md:p-10"
            style={{ background: "white", border: "1px solid #f0ece8" }}
          >
            <h3 className="text-xl font-bold text-[#1a0e0d]">
              Quero saber mais
            </h3>
            <p className="mt-1 text-sm" style={{ color: "#9ca3af" }}>
              Preencha em 30 segundos e nosso time entra em contato.
            </p>

            {/* Segment toggle */}
            <div
              className="mt-6 grid grid-cols-2 gap-2 rounded-full p-1.5"
              style={{ background: "#f5f0ee" }}
            >
              {["lojista", "entregador"].map((type) => {
                const isActive = userType === type;
                const labels = {
                  lojista: "Sou lojista",
                  entregador: "Sou entregador",
                };
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    data-segment={type}
                    className="rounded-full py-2 text-sm font-semibold transition-all duration-200"
                    style={
                      isActive
                        ? { background: "#EA1D2C", color: "white", boxShadow: "0 2px 8px rgba(234,29,44,0.3)" }
                        : { color: "#6b7280" }
                    }
                  >
                    {labels[type]}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {activeFields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold"
                    style={{ color: "#374151" }}
                  >
                    {field.label}
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
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e0dc";
                      e.target.style.background = "#fafaf8";
                    }}
                  />
                </div>
              ))}

              <div className="space-y-3 pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-form-type={userType}
                  className="w-full rounded-xl py-3.5 text-base font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#EA1D2C", boxShadow: "0 4px 16px rgba(234,29,44,0.28)" }}
                >
                  {isSubmitting ? "Enviando..." : "Quero saber mais"}
                </Button>
                <p className="text-center text-xs" style={{ color: "#9ca3af" }}>
                  Prometemos zero spam. Usaremos seus dados apenas para contato.
                </p>
              </div>
            </form>

            {status.state === "success" && (
              <div
                className="mt-4 rounded-xl p-4 text-sm font-medium"
                style={{ background: "#f0fdf4", color: "#15803d" }}
              >
                {status.message}
              </div>
            )}
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
    </section>
  );
}
