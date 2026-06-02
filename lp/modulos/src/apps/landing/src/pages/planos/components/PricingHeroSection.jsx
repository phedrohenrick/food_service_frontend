"use client";

import React from "react";

export function PricingHeroSection({ annual, onToggle }) {
  return (
    <section
      className="relative overflow-hidden px-[5%] pb-20 pt-36 text-center"
      style={{ background: "#FFFFFF" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(13,31,51,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">

        <h1
          className="mb-5 font-extrabold leading-[1.06] tracking-tight"
          style={{
            fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            letterSpacing: "-0.03em",
            color: "#0D1F33",
          }}
        >
          Mensalidade fixa.<br />
          <span style={{ color: "#DD3F0C" }}>Zero comissão</span> por pedido.
        </h1>

        <p
          className="mx-auto mb-12 max-w-lg text-lg leading-relaxed"
          style={{ color: "#4A6278" }}
        >
          Sem surpresas no boleto. Quanto mais você vende, mais você economiza.
        </p>

        <BillingToggle annual={annual} onToggle={onToggle} />
      </div>
    </section>
  );
}

function BillingToggle({ annual, onToggle }) {
  return (
    <div
      className="inline-flex items-center gap-4 rounded-full border px-6 py-2.5"
      style={{ background: "#FFFFFF", borderColor: "rgba(13,31,51,0.12)", boxShadow: "0 1px 4px rgba(13,31,51,0.06)" }}
    >
      <button
        onClick={!annual ? undefined : onToggle}
        className="text-sm font-semibold transition-colors duration-150"
        style={{ color: annual ? "#8A9AB0" : "#0D1F33" }}
      >
        Mensal
      </button>

      <button
        onClick={onToggle}
        className="relative h-7 w-12 flex-shrink-0 rounded-full transition-all duration-300"
        style={{
          background: annual ? "#DD3F0C" : "rgba(13,31,51,0.1)",
        }}
        aria-label="Alternar cobrança"
      >
        <span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-300"
          style={{
            left: "2px",
            transform: annual ? "translateX(20px)" : "translateX(0)",
            boxShadow: "0 1px 4px rgba(13,31,51,0.2)",
          }}
        />
      </button>

      <button
        onClick={annual ? undefined : onToggle}
        className="text-sm font-semibold transition-colors duration-150"
        style={{ color: annual ? "#0D1F33" : "#8A9AB0" }}
      >
        Anual
      </button>

      <span
        className="rounded-full px-3 py-1 text-xs font-bold text-white"
        style={{ background: "#DD3F0C", whiteSpace: "nowrap" }}
      >
        2 meses grátis
      </span>
    </div>
  );
}
