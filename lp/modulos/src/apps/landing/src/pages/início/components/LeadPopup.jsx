"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@relume_io/relume-ui";
import { leadFields, googleFields, getInitialFormState } from "./PreCadastroSection";

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

export function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBannerVisible, setBannerVisible] = useState(true);
  const [allowedByScroll, setAllowedByScroll] = useState(false);
  const [userType, setUserType] = useState("lojista");
  const [formData, setFormData] = useState(() => getInitialFormState("lojista"));
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [isSubmitting, setSubmitting] = useState(false);
  const [canRender, setCanRender] = useState(false);

  const endpoint = process.env.REACT_APP_LEAD_ENDPOINT;
  const googleFormAction = process.env.REACT_APP_GOOGLE_FORM_ACTION;

  useEffect(() => {
    if (!isOpen) return;
    setFormData(getInitialFormState(userType));
    setStatus({ state: "idle", message: "" });
  }, [userType, isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setCanRender(true);
      return;
    }

    if (window.__leadPopupMounted) {
      return;
    }

    window.__leadPopupMounted = true;
    setCanRender(true);

    return () => {
      delete window.__leadPopupMounted;
    };
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = document.querySelector('[data-section-id="layout-237"]') || document.getElementById('layout-237');
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setAllowedByScroll(true);
            observer.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: '0px 0px -20% 0px', threshold: 0.15 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const activeFields = useMemo(() => leadFields[userType], [userType]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpen = () => {
    setFormData(getInitialFormState(userType));
    setStatus({ state: "idle", message: "" });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStatus({ state: "idle", message: "" });
    setFormData(getInitialFormState(userType));
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
          throw new Error("Nao foi possivel enviar seus dados agora.");
        }
      } else if (googleFormAction) {
        const googleBody = mapToGooglePayload(userType, formData);

        if (!googleBody) {
          throw new Error("Configuracao do formulario temporario invalida.");
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
        message: "Recebemos seu interesse! Nossa equipe vai chamar voce para as condicoes especiais de lancamento.",
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

  if (!canRender || !isBannerVisible || !allowedByScroll) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-3 sm:bottom-5 z-40 flex justify-center px-3 sm:px-4">
        <div className="pointer-events-auto w-full max-w-sm sm:max-w-xl lg:max-w-3xl rounded-3xl border border-white/20 bg-background-hero/95 p-5 sm:p-6 text-white shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Ainda com duvidas?
              </p>
              <p className="text-base sm:text-lg font-semibold leading-snug">
                Ainda com duvidas sobre nossos servicos? Entre em contato com nosso time!
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <Button
                class="w-full sm:w-auto bg-white text-background-hero font-semibold rounded-2xl px-5 py-3 text-sm sm:text-base shadow-lg hover:shadow-xl transition"
                onClick={handleOpen}
              >
                Falar com especialista
              </Button>
              <button
                type="button"
                onClick={() => setBannerVisible(false)}
                className="w-full sm:w-auto rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/20"
              >
                Agora nao
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-3 sm:px-4 pb-3 sm:pb-6">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg sm:max-w-2xl overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-foreground/10 px-5 sm:px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Atendimento especializado
                </p>
                <h3 className="text-xl font-bold text-background-hero">
                  Fale com nosso time
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-sm font-semibold text-foreground/60 transition hover:text-foreground"
              >
                Fechar
              </button>
            </div>

            <div className="max-h-[85vh] overflow-y-auto px-5 sm:px-6 py-6">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-full bg-background-red2/5 p-1.5 sm:p-2">
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
                      className={`rounded-full py-2 text-xs sm:text-sm font-semibold transition ${
                        isActive
                          ? "bg-background-hero text-white shadow-lg"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                      data-segment={`${type}-popup`}
                    >
                      {labels[type]}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {activeFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label htmlFor={`popup-${field.name}`} className="text-sm font-semibold text-foreground">
                      {field.label}
                    </label>
                    <input
                      id={`popup-${field.name}`}
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
                    data-form-type={`${userType}-popup`}
                  >
                    {isSubmitting ? "Enviando..." : "Quero as condicoes especiais"}
                  </Button>
                  <p className="text-xs text-foreground/60 text-center">
                    Prometemos zero spam. Usaremos seus dados apenas para o contato do pre-lancamento.
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
        </div>
      )}
    </>
  );
}

