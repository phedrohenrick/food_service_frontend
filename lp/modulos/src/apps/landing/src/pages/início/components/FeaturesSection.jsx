"use client";

import React, { useState } from "react";
import {
  Palette,
  Smartphone,
  LayoutList,
  TrendingUp,
  Megaphone,
  Zap,
  MapPin,
  CreditCard,
  BellRing,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Palette,
    title: "Cardápio com a sua identidade",
    desc: "Cores, logo e marca do seu negócio em todo o sistema. Seu cliente vê só você — nunca o Priatoo.",
    badge: "Exclusivo",
  },
  {
    Icon: Smartphone,
    title: "Pedido direto na cozinha",
    desc: "Cliente faz o pedido pelo celular e a cozinha recebe na hora. Zero erro de anotação, zero retrabalho.",
  },
  {
    Icon: LayoutList,
    title: "Painel kanban de pedidos",
    desc: "Visualize cada pedido: Novo → Preparando → Pronto → Entregue. Tudo em uma tela, em tempo real.",
  },
  {
    Icon: TrendingUp,
    title: "Dashboard de resultados",
    desc: "Faturamento do dia, ticket médio, top 3 produtos e horários de pico. Dados para decidir, não para adivinhar.",
  },
  {
    Icon: Megaphone,
    title: "Banners e promoções no cardápio",
    desc: "Crie ofertas vinculadas a produtos direto no menu. Marketing dentro do cardápio, sem custo extra.",
  },
  {
    Icon: Zap,
    title: "Setup guiado em 15 minutos",
    desc: "Assistente passo a passo leva sua conta do zero ao cardápio publicado. Sem suporte, sem espera.",
  },
  {
    Icon: MapPin,
    title: "Entrega por bairro configurável",
    desc: "Defina as áreas que você atende e a taxa de cada bairro. Controle total sem precisar de intermediário.",
  },
  {
    Icon: CreditCard,
    title: "Pix, cartão e dinheiro",
    desc: "Aceite todas as formas de pagamento. O cliente escolhe na hora do pedido, você recebe direto.",
  },
];

const TABS = ["Dashboard", "Cardápio", "Pedidos"];
const TAB_IMGS = [
  "assets/images/lp/dashboard-simples.png",
  "assets/images/lp/rgb(255, 127, 39).png",
  "assets/images/lp/priatoo_restaurantes.png",
];

export function FeaturesSection() {
  const [tab, setTab] = useState(0);

  return (
    <section
      id="funcionalidades"
      className="relative overflow-hidden px-[5%] py-20 md:py-28"
      style={{ background: "#fafaf9" }}
    >
      {/* Subtle warm tint */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,127,39,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 mx-auto max-w-2xl text-center">
          <h2
            className="mt-4 text-3xl font-extrabold leading-tight text-[#1a0e0d] sm:text-4xl lg:text-[2.8rem]"
            style={{
              fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1.08,
            }}
          >
            Diferenciais que{" "}
            <span
              style={{
                color: "#FF7F27",
                textDecoration: "underline",
                textDecorationColor: "rgba(255,127,39,0.35)",
                textUnderlineOffset: 6,
              }}
            >
              nenhum outro
            </span>{" "}
            sistema oferece
          </h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: "#6b7280" }}>
            Cada funcionalidade foi construída pensando no dono do restaurante.
          </p>
        </div>

        {/* Split layout */}
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">

          {/* LEFT — product screenshot with tabs */}
          <div className="relative">
            {/* Tab switcher */}
            <div
              className="mb-4 inline-flex gap-1 rounded-xl p-1"
              style={{ background: "rgba(0,0,0,0.06)" }}
            >
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200"
                  style={
                    tab === i
                      ? { background: "white", color: "#1a0e0d", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }
                      : { color: "#6b7280" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Browser frame */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
                background: "#fff",
              }}
            >
              {/* Chrome bar */}
              <div
                className="flex items-center gap-1.5 px-4 py-2.5"
                style={{ background: "#f5f5f4", borderBottom: "1px solid rgba(0,0,0,0.07)" }}
              >
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,90,85,0.75)" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,189,68,0.75)" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(78,200,88,0.75)" }} />
                <div
                  className="ml-2 flex-1 rounded px-2 py-0.5 text-center text-xs"
                  style={{ background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.35)", maxWidth: 200 }}
                >
                  app.priatoo.com.br
                </div>
              </div>
              <img
                key={TAB_IMGS[tab]}
                src={TAB_IMGS[tab]}
                alt={TABS[tab]}
                className="w-full"
                style={{
                  display: "block",
                  transition: "opacity 0.3s ease",
                  maxHeight: 380,
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-4 right-4 flex items-center gap-2.5 rounded-2xl px-4 py-3"
              style={{
                background: "white",
                boxShadow: "0 12px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: "#FF7F27" }}
              >
                <BellRing className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Novo pedido — Mesa 4</p>
                <p className="text-xs text-gray-400">R$ 87,00 · Pix confirmado</p>
              </div>
            </div>
          </div>

          {/* RIGHT — feature list */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="group flex items-start gap-4 rounded-2xl p-4 transition-all duration-200 hover:bg-white"
                style={{ boxShadow: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(255,127,39,0.1)" }}
                >
                  <feat.Icon className="h-5 w-5" style={{ color: "#FF7F27" }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: "#1a0e0d" }}>
                      {feat.title}
                    </p>
                    {feat.badge && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                        style={{ background: "#EA1D2C" }}
                      >
                        {feat.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
