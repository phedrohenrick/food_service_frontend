"use client";

import React from "react";

const STEPS = [
  { num: "01", title: "Crie sua conta", time: "2 minutos", highlight: false },
  { num: "02", title: "Escolha suas cores", time: "3 minutos ★", highlight: true },
  { num: "03", title: "Monte o cardápio", time: "10 minutos", highlight: false },
  { num: "04", title: "Compartilhe e receba", time: "Pronto!", highlight: false },
];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="px-[5%] py-20 md:py-28"
      style={{ background: "#fafaf8" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "#A52A2A" }}
          >
            Como funciona
          </p>
          <h2
            className="mt-3 text-3xl font-extrabold text-[#1a0e0d] sm:text-4xl lg:text-5xl"
            style={{
              fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Setup em 15 minutos
          </h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: "#0f1f3f" }}>
            Com teste grátis, sem compromisso, sem adicionar o cartão de crédito.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Dashed connector (desktop only) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute hidden lg:block"
            style={{
              top: 36,
              left: "calc(12.5% + 36px)",
              right: "calc(12.5% + 36px)",
              height: 2,
              background: "repeating-linear-gradient(90deg, rgba(255,127,39,0.35) 0, rgba(255,127,39,0.35) 8px, transparent 8px, transparent 18px)",
            }}
          />

          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <div
                className="relative z-10 mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full text-xl font-extrabold transition-transform duration-300 hover:scale-110"
                style={
                  step.highlight
                    ? {
                        background: "#FF7F27",
                        color: "white",
                        boxShadow: "0 0 0 6px rgba(255,127,39,0.18), 0 8px 24px rgba(255,127,39,0.3)",
                        fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
                      }
                    : {
                        background: "white",
                        color: "#1a0e0d",
                        border: "2px solid rgba(255,127,39,0.3)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                        fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
                      }
                }
              >
                {step.num}
              </div>
              <h3
                className="text-base font-bold"
                style={{
                  color: step.highlight ? "#FF7F27" : "#1a0e0d",
                  fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
                }}
              >
                {step.title}
              </h3>
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: step.highlight ? "#FF7F27" : "#9ca3af" }}
              >
                {step.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
