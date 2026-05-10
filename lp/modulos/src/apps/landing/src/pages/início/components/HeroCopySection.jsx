"use client";

import React from "react";
import { Bell } from "lucide-react";

export function HeroCopySection() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-hidden px-[5%] pt-28 pb-24 md:pt-36 md:pb-32"
      style={{ background: "linear-gradient(135deg, #1a0e0d 0%, #2d1210 50%, #1a0e0d 100%)" }}
    >
      {/* Ambient background image */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src="assets/images/lp/priatoo_restaurantes.png"
          alt=""
          className="h-full w-full object-cover object-center"
          style={{ opacity: 0.08, mixBlendMode: "luminosity" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(165,42,42,0.18) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(255,127,39,0.07) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* Noise grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT — copy */}
        <div className="space-y-7">
          <div
            className="inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
            style={{
              borderColor: "rgba(255,127,39,0.35)",
              background: "rgba(255,127,39,0.08)",
              color: "rgba(255,200,150,0.9)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full"
                style={{ background: "#FF7F27", opacity: 0.7 }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: "#FF7F27" }}
              />
            </span>
            Sistema para restaurantes
          </div>

          <h1
            className="text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
            style={{ fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif" }}
          >
            Seu restaurante.<br />
            Com a sua cara.<br />
            Sem pagar{" "}
            <em
              className="not-italic"
              style={{
                color: "#FF7F27",
                textShadow: "0 0 40px rgba(255,127,39,0.4)",
              }}
            >
              comissão.
            </em>
          </h1>

          <p className="max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: "rgba(255,255,255,0.68)" }}>
            Cardápio digital com a identidade do seu negócio, pedidos direto na cozinha e dados estratégicos para aumentar o lucro.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => { try { window.location.assign("/onboarding/start"); } catch (_) {} }}
              data-cta="hero-lojista"
              className="rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: "#FF7F27",
                boxShadow: "0 12px 32px rgba(255,127,39,0.38), 0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              Começar grátis por 30 dias
            </button>
            <button
              onClick={() => scrollTo("demo")}
              data-cta="hero-demo"
              className="flex items-center gap-3 rounded-xl border px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/8"
              style={{ borderColor: "rgba(255,255,255,0.25)" }}
            >
              <span
                className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                ▶
              </span>
              Ver demo em vídeo
            </button>
          </div>

          <p className="text-xs tracking-wide" style={{ color: "rgba(255,255,255,0.38)" }}>
            Sem cartão de crédito · Setup em 15 minutos · Cancele quando quiser
          </p>
        </div>

        {/* RIGHT — product screenshot */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-full">
          {/* Glow behind */}
          <div
            className="pointer-events-none absolute -inset-10 -z-10 rounded-full blur-3xl"
            style={{ background: "rgba(165,42,42,0.28)" }}
          />

          <img
            src="assets/images/lp/dashboard-simples.png"
            alt="Priatoo — painel de gestão e cardápio digital"
            className="w-full"
            style={{
              display: "block",
              filter: "drop-shadow(0 32px 60px rgba(0,0,0,0.55)) drop-shadow(0 8px 20px rgba(0,0,0,0.4))",
            }}
          />

          {/* Floating notification card */}
          <div
            className="absolute -bottom-4 -left-4 sm:-left-6 flex items-center gap-3 rounded-2xl px-4 py-3 sm:px-5"
            style={{
              background: "#ffffff",
              boxShadow: "0 16px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: "#FF7F27" }}
            >
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Novo pedido recebido</p>
              <p className="text-xs text-gray-500">Mesa 3 · R$ 52,00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
