"use client";

import React from "react";

export function FinalCTASection() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      className="px-[5%] py-20 md:py-28"
      style={{
        background: "#1a0e0d",
        borderTop: "2px solid #FF7F27",
      }}
    >
      <div className="mx-auto max-w-2xl text-center space-y-6">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em]"
          style={{
            borderColor: "rgba(255,127,39,0.35)",
            background: "rgba(255,127,39,0.08)",
            color: "#FF7F27",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: "#FF7F27" }}
          />
          Comece hoje
        </div>

        <h2
          className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl"
          style={{
            fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
            letterSpacing: "-0.025em",
            lineHeight: 1.08,
          }}
        >
          Seu restaurante merece um sistema{" "}
          <em
            className="not-italic"
            style={{ color: "#FF7F27", textShadow: "0 0 40px rgba(255,127,39,0.4)" }}
          >
            feito para você.
          </em>
        </h2>

        <p className="text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
          30 dias grátis. Sem cartão. Sem comissão. Cancele quando quiser.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => { try { window.location.assign("/onboarding/start"); } catch (_) {} }}
            data-cta="final-cta-primary"
            className="w-full rounded-xl px-10 py-4 text-base font-bold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02] sm:w-auto"
            style={{
              background: "#FF7F27",
              boxShadow: "0 12px 32px rgba(255,127,39,0.38)",
            }}
          >
            Criar minha conta grátis
          </button>
          <button
            onClick={() => scrollTo("demo")}
            data-cta="final-cta-secondary"
            className="w-full rounded-xl border px-10 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/8 sm:w-auto"
            style={{ borderColor: "rgba(255,255,255,0.28)" }}
          >
            Ver como funciona
          </button>
        </div>

        <p
          className="text-xs tracking-wide"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Setup em 15 minutos · Suporte em português · Sem taxa por pedido
        </p>
      </div>
    </section>
  );
}
