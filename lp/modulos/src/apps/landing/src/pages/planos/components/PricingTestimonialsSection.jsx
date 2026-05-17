"use client";

import React from "react";

function IconStar({ filled }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#FF7F27" : "none"}
      stroke="#FF7F27"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const TESTIMONIALS = [
  {
    quote: "Antes do priatoo, perdia pedidos e tinha fila na porta. O cardápio com QR Code virou o diferencial do nosso atendimento. Os clientes adoraram.",
    name: "Carlos Menezes",
    role: "Restaurante Sabor do Nordeste — Recife, PE",
    initials: "CM",
    avatarBg: "rgba(221,63,12,0.10)",
    avatarColor: "#DD3F0C",
  },
  {
    quote: "O controle de mesas e garçons revolucionou nossa operação. Reduzimos erros em 80% e o tempo de atendimento caiu pela metade desde que migramos pro plano Pro.",
    name: "Ana Figueiredo",
    role: "Bistrô Jardins — São Paulo, SP",
    initials: "AF",
    avatarBg: "rgba(14,165,233,0.10)",
    avatarColor: "#0EA5E9",
  },
  {
    quote: "Com o plano Empresarial gerencio 3 unidades de um único painel. Os relatórios personalizados me ajudam a tomar decisões muito mais rápidas e com mais segurança.",
    name: "Roberto Zanetti",
    role: "Rede Zanetti Pizzaria — Curitiba, PR",
    initials: "RZ",
    avatarBg: "rgba(255,127,39,0.10)",
    avatarColor: "#FF7F27",
  },
];

export function PricingTestimonialsSection() {
  return (
    <section className="px-[5%] pb-24" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{ color: "#DD3F0C" }}
          >
            Depoimentos
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
            Usado por restaurantes<br />em todo o Brasil
          </h2>
          <p className="mx-auto max-w-md text-base leading-relaxed" style={{ color: "#4A6278" }}>
            Mais de 1.200 restaurantes já transformaram sua operação com o priatoo.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="flex flex-col rounded-2xl bg-white p-7 transition-all duration-200"
              style={{
                border: "1.5px solid rgba(13,31,51,0.08)",
                boxShadow: "0 1px 4px rgba(13,31,51,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,127,39,0.3)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(13,31,51,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(13,31,51,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(13,31,51,0.05)";
              }}
            >
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, i) => <IconStar key={i} filled />)}
              </div>

              <blockquote
                className="mb-6 flex-1 text-[13.5px] italic leading-relaxed"
                style={{ color: "#4A6278" }}
              >
                "{t.quote}"
              </blockquote>

              <footer className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: t.avatarBg, color: t.avatarColor }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[13.5px] font-bold" style={{ color: "#0D1F33" }}>{t.name}</p>
                  <p className="text-[11.5px]" style={{ color: "#8A9AB0" }}>{t.role}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
