"use client";

import React from "react";

const STATS = [
  { value: "15 min", label: "Para estar online" },
  { value: "0%", label: "Comissão por pedido" },
  { value: "30 dias", label: "Trial grátis sem cartão" },
  { value: "100%", label: "Identidade visual sua" },
];

export function StatsBarSection() {
  return (
    <section
      style={{
        background: "#0f0705",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
      className="px-[5%] py-10"
    >
      <div className="mx-auto max-w-7xl grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-white/10">
        {STATS.map((stat) => (
          <div key={stat.value} className="flex flex-col items-center gap-1 text-center sm:px-6">
            <span
              className="text-3xl font-extrabold sm:text-4xl"
              style={{
                color: "#FF7F27",
                fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {stat.value}
            </span>
            <span className="text-xs font-medium sm:text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
