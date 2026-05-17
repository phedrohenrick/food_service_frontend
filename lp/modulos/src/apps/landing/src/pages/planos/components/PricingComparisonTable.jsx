"use client";

import React from "react";

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DD3F0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A9AB0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
    </svg>
  );
}

function IconUtensils() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconHeadphones() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

const CATEGORY_ICONS = {
  "Cardápio Digital": <IconUtensils />,
  "Gestão de Mesas": <IconGrid />,
  "Métricas & Relatórios": <IconBarChart />,
  "Integrações": <IconLink />,
  "Suporte": <IconHeadphones />,
};

const ROWS = [
  { category: "Cardápio Digital" },
  { feature: "Itens no cardápio", free: "Até 30", pro: "Ilimitado", ent: "Ilimitado" },
  { feature: "QR Code do cardápio", free: true, pro: true, ent: true },
  { feature: "Pedidos online", free: false, pro: true, ent: true },

  { category: "Gestão de Mesas" },
  { feature: "Mesas cadastradas", free: "1 mesa", pro: "Até 20", ent: "Ilimitadas" },
  { feature: "Controle de garçons", free: false, pro: true, ent: true },

  { category: "Métricas & Relatórios" },
  { feature: "Painel de métricas", free: false, pro: "Básico", ent: "Avançado" },
  { feature: "Relatórios personalizados", free: false, pro: false, ent: true },

  { category: "Integrações" },
  { feature: "Integração WhatsApp", free: false, pro: "Básica", ent: "Completa" },
  { feature: "API de integração", free: false, pro: false, ent: true },
  { feature: "Multi-unidades", free: false, pro: false, ent: "Até 5 restaurantes" },

  { category: "Suporte" },
  { feature: "Canal de atendimento", free: "E-mail", pro: "Chat prioritário", ent: "24/7 dedicado" },
  { feature: "Gerente de conta", free: false, pro: false, ent: true },
];

export function PricingComparisonTable() {
  return (
    <section className="px-[5%] pb-24" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{ color: "#DD3F0C" }}
          >
            Compare os planos
          </p>
          <h2
            className="mb-4 font-extrabold tracking-tight"
            style={{
              fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
              fontSize: "clamp(26px, 3.5vw, 40px)",
              letterSpacing: "-0.025em",
              color: "#0D1F33",
            }}
          >
            Veja tudo o que está incluso
          </h2>
          <p className="mx-auto max-w-md text-base leading-relaxed" style={{ color: "#4A6278" }}>
            Analise os recursos de cada plano e encontre o que faz mais sentido para o seu restaurante.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[600px] text-sm"
            style={{
              border: "1.5px solid rgba(13,31,51,0.1)",
              borderRadius: "16px",
              borderCollapse: "separate",
              borderSpacing: 0,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr>
                <th
                  className="py-5 pl-7 pr-5 text-left text-xs font-bold"
                  style={{
                    background: "rgba(13,31,51,0.03)",
                    color: "#8A9AB0",
                    width: "42%",
                    borderBottom: "1.5px solid rgba(13,31,51,0.08)",
                  }}
                >
                  Recursos
                </th>
                {(["Grátis", "Pro", "Empresarial"]).map((label) => (
                  <th
                    key={label}
                    className="px-5 py-5 text-center text-xs font-bold"
                    style={{
                      background: label === "Pro" ? "rgba(255,127,39,0.05)" : "rgba(13,31,51,0.03)",
                      color: label === "Pro" ? "#DD3F0C" : "#8A9AB0",
                      borderBottom: "1.5px solid rgba(13,31,51,0.08)",
                      borderLeft: label === "Pro" ? "1.5px solid rgba(255,127,39,0.2)" : undefined,
                      borderRight: label === "Pro" ? "1.5px solid rgba(255,127,39,0.2)" : undefined,
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => {
                if (row.category) {
                  return (
                    <tr key={`cat-${i}`}>
                      <td
                        colSpan={4}
                        className="pl-7 py-3"
                        style={{
                          background: "rgba(13,31,51,0.025)",
                          borderBottom: "1px solid rgba(13,31,51,0.06)",
                        }}
                      >
                        <span
                          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em]"
                          style={{ color: "#8A9AB0" }}
                        >
                          <span style={{ color: "#4A6278" }}>
                            {CATEGORY_ICONS[row.category]}
                          </span>
                          {row.category}
                        </span>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={row.feature}
                    style={{ borderBottom: "1px solid rgba(13,31,51,0.06)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(13,31,51,0.02)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <td className="pl-7 pr-5 py-4 text-left" style={{ color: "#4A6278" }}>
                      {row.feature}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <CellValue value={row.free} />
                    </td>
                    <td
                      className="px-5 py-4 text-center"
                      style={{
                        borderLeft: "1.5px solid rgba(255,127,39,0.15)",
                        borderRight: "1.5px solid rgba(255,127,39,0.15)",
                        background: "rgba(255,127,39,0.02)",
                      }}
                    >
                      <CellValue value={row.pro} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <CellValue value={row.ent} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CellValue({ value }) {
  if (value === true) return <span className="flex justify-center"><IconCheck /></span>;
  if (value === false) return <span className="flex justify-center"><IconMinus /></span>;
  return <span style={{ color: "#0D1F33", fontWeight: 500 }}>{value}</span>;
}
