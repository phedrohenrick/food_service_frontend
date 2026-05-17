"use client";

import React from "react";

function IconArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function PricingCtaSection() {
  return (
    <section className="px-[5%] pb-24" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-3xl px-10 py-20 text-center"
          style={{
            background: "#0D1F33",
            boxShadow: "0 4px 32px rgba(13,31,51,0.12)",
          }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
            style={{
              width: "600px",
              height: "300px",
              top: "-100px",
              background: "radial-gradient(ellipse, rgba(255,127,39,0.18) 0%, transparent 68%)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0"
            style={{
              width: "320px",
              height: "320px",
              background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
              transform: "translate(30%, 30%)",
            }}
          />

          <div className="relative z-10">
            <h2
              className="mb-4 font-extrabold tracking-tight text-white"
              style={{
                fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
                fontSize: "clamp(26px, 4vw, 48px)",
                letterSpacing: "-0.03em",
              }}
            >
              Pronto para transformar<br />
              seu{" "}
              <span style={{ color: "#FF7F27" }}>restaurante</span>?
            </h2>

            <p
              className="mx-auto mb-10 max-w-md text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Junte-se a mais de 1.200 restaurantes que já digitalizaram sua operação com o priatoo.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-10 py-4 text-base font-bold text-white transition-all duration-150 hover:-translate-y-0.5 sm:w-auto"
                style={{ background: "#DD3F0C" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#C43509"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#DD3F0C"; }}
                onClick={() => { try { window.location.assign("/onboarding/start"); } catch (_) {} }}
              >
                Começar grátis agora
                <IconArrowRight />
              </button>

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-10 py-4 text-base font-semibold transition-all duration-150 hover:-translate-y-0.5 sm:w-auto"
                style={{
                  background: "transparent",
                  color: "rgba(255,255,255,0.80)",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onClick={() => { try { window.location.assign("/contato"); } catch (_) {} }}
              >
                Falar com vendas
              </button>
            </div>

            <p className="mt-6 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Setup em 15 minutos · Suporte em português · Sem taxa por pedido
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
