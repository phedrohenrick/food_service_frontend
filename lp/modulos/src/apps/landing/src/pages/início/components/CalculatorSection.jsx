"use client";

import React, { useState } from "react";

export function CalculatorSection() {
  const [faturamento, setFaturamento] = useState(30000);
  const [taxa, setTaxa] = useState(18);

  const comissaoMensal = Math.round((faturamento * taxa) / 100);
  const comissaoAnual = comissaoMensal * 12;

  const pct = ((faturamento - 5000) / (100000 - 5000)) * 100;
  const taxaPct = ((taxa - 10) / (27 - 10)) * 100;

  return (
    <section
      id="planos"
      className="px-[5%] py-20 md:py-28"
      style={{
        background: "#0f0705",
        borderTop: "2px solid #FF7F27",
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "#FF7F27" }}
          >
            Calculadora de economia
          </p>
          <h2
            className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl"
            style={{
              fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Quanto você está{" "}
            <span style={{ color: "#EA1D2C" }}>perdendo</span>
            {" "}em comissão?
          </h2>
        </div>

        <div
          className="rounded-2xl p-6 md:p-10 space-y-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Slider 1 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                Faturamento mensal em delivery
              </label>
              <span
                className="text-xl font-extrabold"
                style={{
                  color: "#FFC300",
                  fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
                }}
              >
                R$ {faturamento.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="relative">
              <div
                className="mb-1 h-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-150"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #FF7F27, #FFC300)",
                  }}
                />
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={1000}
                value={faturamento}
                onChange={(e) => setFaturamento(Number(e.target.value))}
                className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
                style={{ margin: 0 }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
              <span>R$ 5.000</span>
              <span>R$ 100.000</span>
            </div>
          </div>

          {/* Slider 2 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                Taxa média da plataforma
              </label>
              <span
                className="text-xl font-extrabold"
                style={{
                  color: "#EA1D2C",
                  fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
                }}
              >
                {taxa}%
              </span>
            </div>
            <div className="relative">
              <div
                className="mb-1 h-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-150"
                  style={{
                    width: `${taxaPct}%`,
                    background: "linear-gradient(90deg, #DD3F0C, #EA1D2C)",
                  }}
                />
              </div>
              <input
                type="range"
                min={10}
                max={27}
                step={1}
                value={taxa}
                onChange={(e) => setTaxa(Number(e.target.value))}
                className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
                style={{ margin: 0 }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
              <span>10%</span>
              <span>27% (iFood)</span>
            </div>
          </div>

          {/* Result */}
          <div
            className="rounded-xl p-6 text-center transition-all duration-300"
            style={{
              background: "rgba(234,29,44,0.1)",
              border: "1px solid rgba(234,29,44,0.25)",
            }}
          >
            <p className="mb-1 text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
              Você pagaria de comissão por mês
            </p>
            <p
              className="text-5xl font-extrabold transition-all duration-300"
              style={{
                color: "#EA1D2C",
                fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              R$ {comissaoMensal.toLocaleString("pt-BR")}
            </p>
            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.42)" }}>
              Ou{" "}
              <span className="font-bold" style={{ color: "rgba(255,255,255,0.72)" }}>
                R$ {comissaoAnual.toLocaleString("pt-BR")}
              </span>{" "}
              por ano
            </p>
          </div>

          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Com o Priatoo você paga mensalidade fixa.{" "}
            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
              Quanto mais vende, mais economiza.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
