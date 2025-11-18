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
        message: "Recebemos seu interesse! Nossa equipe vai chamar você para as condições especiais de lançamento.",
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
      className="relative px-[5%] py-20 md:py-28 bg-gradient-to-b from-foreground via-background-primary to-background-primary"
    >
      <div className="container grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-2xl space-y-6 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm font-semibold uppercase tracking-wide">
            <HiOutlineSparkles className="text-lg" /> Pré-cadastro VIP
          </span>
          <h2 className="text-foreground text-5xl font-bold md:text-6xl">
           Recebe os pedidos, facilita para o cliente, conecta com o entregador.<div className="text-shadow-outline text-background-hero"> Agora em Niquelândia</div>
          </h2>
          {/* <div className="rounded-3xl border border-white/10 bg-black/80 p-6 backdrop-blur">
            <p className="text-white text-lg md:text-xl">
              Estamos abrindo uma lista exclusiva para restaurantes visionários e entregadores parceiros que querem sair na frente e testar o Food Service OS com condições comerciais imbatíveis.
            </p>
          </div> */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-foreground/40 bg-foreground/80 p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <BsShieldCheck className="mt-1 text-2xl text-white" />
                <div>
                  <h3 className="font-semibold text-lg">Não existe taxa sobre os pedidos</h3>
                  <p className="text-white/70 text-sm">
                    Valor mensal fixo e justo, repasses rápidos e suporte dedicado para cada operação.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-foreground/100 bg-foreground/80 p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <HiOutlineChatBubbleLeftRight className="mt-1 text-2xl text-white" />
                <div>
                  <h3 className="font-semibold text-lg">Atendimento que converte</h3>
                  <p className="text-white/70 text-sm">
                    Treinamentos, campanhas personalizadas e jornadas pensadas para retenção.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="rounded-3xl border border-white/100 bg-black/80 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-wide text-white/60">Números do beta</p>
            <div className="mt-3 flex flex-wrap gap-6 md:gap-10">
              <div>
                <p className="text-4xl font-bold text-white">+180</p>
                <p className="text-white/60 text-sm">restaurantes na fila de espera</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">9.2</p>
                <p className="text-white/60 text-sm">nota média de atendimento</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">72h</p>
                <p className="text-white/60 text-sm">para ativar sua operação</p>
              </div>
            </div>
          </div> */}
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl md:p-10">
          <div className=" flex items-center justify-between gap-2">
            <h3 className="text-2xl font-bold text-background-hero">
              Quero ser avisado primeiro
            </h3>
            <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
              vagas limitadas
            </span>
          </div>
          <p className="mt-3 text-foreground/70 text-sm">
            Preencha o formulário em 30 segundos e receba o contato do nosso time com as tarifas especiais de lançamento.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-full bg-background-red2/5 p-2">
            {["lojista", "entregador"].map((type) => {
              const isActive = userType === type;
              const labels = {
                lojista: "Sou logista",
                entregador: "Sou entregador",
              };

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`rounded-full py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-background-hero text-white shadow-lg"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                  data-segment={type}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {activeFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-semibold text-foreground">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  required={Boolean(field.required)}
                  placeholder={field.placeholder}
                  value={formData[field.name] ?? ""}
                  onChange={handleFieldChange}
                  className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-base text-foreground outline-none transition focus:border-foreground focus:bg-white"
                  inputMode={field.inputMode}
                />
              </div>
            ))}

            <div className="space-y-3">
              <Button
                type="submit"
                class="bg-background-hero text-white font-semibold w-full rounded-2xl py-3 text-base shadow-lg hover:shadow-xl transition"
                disabled={isSubmitting}
                data-form-type={userType}
              >
                {isSubmitting ? "Enviando..." : "Quero as condições especiais"}
              </Button>
              <p className="text-xs text-foreground/60 text-center">
                Prometemos zero spam. Usaremos seus dados apenas para o contato do pré-lançamento.
              </p>
            </div>
          </form>

          {status.state === "success" && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
              {status.message}
            </div>
          )}
          {status.state === "error" && (
            <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-rose-600">
              {status.message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
