"use client";

import React, { useState } from "react";
import { Palette, Wifi, BatteryMedium, UtensilsCrossed, Check, Plus } from "lucide-react";

const COLORS = [
  { name: "Vermelho Clássico", primary: "#EA1D2C", accent: "#FFC300", img: "rgb(234, 29, 44).png" },
  { name: "Laranja Vibrante",  primary: "#FF7F27", accent: "#FFC300", img: "rgb(255, 127, 39).png" },
  { name: "Azul Oceano",       primary: "#1D6AEA", accent: "#38BDF8", img: "rgb(29, 106, 234).png" },
  { name: "Verde Natural",     primary: "#16A34A", accent: "#86EFAC", img: "rgb(22, 163, 74).png" },
  { name: "Roxo Premium",      primary: "#7C3AED", accent: "#C4B5FD", img: "rgb(124, 58, 237).png" },
];

const CATEGORIES = ["Pizzas", "Massas", "Bebidas", "Sobremesas"];

const MENU_ITEMS = [
  { name: "Pizza Margherita",    desc: "Molho, mussarela, manjericão", price: "R$ 42,00" },
  { name: "Pizza Pepperoni",     desc: "Molho, mussarela, pepperoni",  price: "R$ 48,00" },
  { name: "Pizza Quatro Queijos",desc: "Molho, quatro tipos de queijo", price: "R$ 52,00" },
];

const RAINBOW_INDEX = COLORS.length;

export function AhaMomentSection() {
  const [selected, setSelected] = useState(0);
  const isRainbow = selected === RAINBOW_INDEX;
  const color = isRainbow ? COLORS[0] : COLORS[selected];
  const imgSrc = `assets/images/lp/${encodeURIComponent(color.img)}`;

  return (
    <section
      id="personalizacao"
      className="relative overflow-hidden px-[5%] py-20 md:py-28"
      style={{
        background: "linear-gradient(150deg, #ffffff 0%, #f5d7b6 45%, #ffffff 100%)",
      }}
    >
      {/* Warm ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 15% 30%, rgba(217,95,42,0.12) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 85% 70%, rgba(255,127,39,0.08) 0%, transparent 55%)",
        }}
      />
      {/* Top divider */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 z-10"
        style={{ height: 3, background: "linear-gradient(90deg, transparent 0%, #FF7F27 25%, #D95F2A 50%, #FF7F27 75%, transparent 100%)" }}
      />
      {/* Bottom divider */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10"
        style={{ height: 3, background: "linear-gradient(90deg, transparent 0%, #FF7F27 25%, #D95F2A 50%, #FF7F27 75%, transparent 100%)" }}
      />

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em]"
            style={{
              borderColor: "rgba(200,80,30,0.3)",
              background: "rgba(217,95,42,0.10)",
              color: "#C04A18",
            }}
          >
            ★ Exclusivo Priatoo
          </span>
          <h2
            className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif", letterSpacing: "-0.02em", color: "#1A0B05" }}
          >
            O cardápio com a cara do{" "}
            <span style={{ color: "#D95F2A" }}>seu restaurante</span>
            {" "}
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-base sm:text-lg" style={{ color: "#6B3A20" }}>
            Escolha as cores da sua marca. Seu cliente vai pensar que o sistema foi feito exclusivamente para você.
          </p>
        </div>

        {/* Split layout */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left: controls */}
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6 lg:p-8"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(210,120,60,0.2)",
              }}
            >
              <p
                className="mb-4 text-xs font-bold uppercase tracking-[0.15em]"
                style={{ color: "#8B4520" }}
              >
                Escolha as cores da sua marca
              </p>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map((opt, i) => (
                  <button
                    key={opt.name}
                    onClick={() => setSelected(i)}
                    title={opt.name}
                    className="relative transition-all duration-200"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: opt.primary,
                      transform: selected === i ? "scale(1.18)" : "scale(1)",
                      outline: selected === i ? `3px solid ${opt.primary}` : "none",
                      outlineOffset: 3,
                    }}
                  >
                    {selected === i && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                    )}
                  </button>
                ))}

                {/* Rainbow swatch */}
                <button
                  onClick={() => setSelected(RAINBOW_INDEX)}
                  title="Cor personalizada"
                  className="relative transition-all duration-200"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "conic-gradient(from 0deg, #EA1D2C, #FF7F27, #FFC300, #16A34A, #1D6AEA, #7C3AED, #EA1D2C)",
                    transform: isRainbow ? "scale(1.18)" : "scale(1)",
                    outline: isRainbow ? "3px solid #FF7F27" : "none",
                    outlineOffset: 3,
                  }}
                >
                  {isRainbow && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                  )}
                </button>
              </div>

              {isRainbow ? (
                <div
                  className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,127,39,0.12), rgba(124,58,237,0.08))",
                    border: "1px solid rgba(255,127,39,0.25)",
                  }}
                >
                  <Palette className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#C04A18" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "#5A3018" }}>
                    <span className="font-bold" style={{ color: "#C04A18" }}>Com o Priatoo você deixa seu sistema com a sua cara.</span>
                    {" "}Escolha qualquer cor e pronto, seu cliente só vê você.
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm" style={{ color: "#6B3A20" }}>
                  Selecionado:{" "}
                  <span className="font-semibold" style={{ color: "#1A0B05" }}>{color.name}</span>
                </p>
              )}
            </div>

            <div
              className="rounded-2xl p-6 lg:p-8 space-y-3"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(210,120,60,0.2)",
              }}
            >
              <p className="text-sm font-semibold" style={{ color: "#1A0B05" }}>Com o Priatoo você controla:</p>
              {[
                "Cores e identidade visual em tempo real",
                "Logo e nome do restaurante",
                "Banners e promoções vinculados a produtos",
                "Itens ativos e inativos no cardápio",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "#5A3018" }}>
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#D95F2A" }} />
                  {item}
                </div>
              ))}
              <p
                className="pt-2 text-xs italic"
                style={{ color: "#8B5030", borderTop: "1px solid rgba(180,100,50,0.15)" }}
              >
                "Você não precisa dizer que usa o Priatoo. Ele trabalha nos bastidores."
              </p>
            </div>
          </div>

          {/* Right: dual device mockup */}
          <div>
            {/* Message card — slides in above the devices when rainbow is selected */}
            <div
              className="overflow-hidden transition-all duration-500"
              style={{
                maxHeight: isRainbow ? "90px" : "0px",
                opacity: isRainbow ? 1 : 0,
                marginBottom: isRainbow ? "1.25rem" : "0",
              }}
            >
              <div
                className="flex items-center gap-3 rounded-2xl px-5 py-4"
                style={{
                  background: "rgba(255,255,255,0.88)",
                  border: "1px solid rgba(217,95,42,0.22)",
                  boxShadow: "0 2px 20px rgba(80,30,10,0.09)",
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(217,95,42,0.09)" }}
                >
                  <Palette className="h-5 w-5" style={{ color: "#D95F2A" }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1A0B05" }}>
                    Com o Priatoo você deixa seu sistema com a sua cara.
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#6B3A20" }}>
                    Escolha qualquer cor e pronto — seu cliente só vê você.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[540px] lg:max-w-[680px]">

            {/* ── Desktop browser frame wrapper (needed for QR overlay outside overflow-hidden) ── */}
            <div className="relative" style={{ width: "72%" }}>
              <div
                className="overflow-hidden rounded-xl transition-all duration-500"
                style={{
                  position: "relative",
                  zIndex: 5,
                  background: "#f5ede4",
                  border: "1px solid rgba(180,110,60,0.25)",
                  boxShadow: "0 24px 60px rgba(80,30,10,0.18), 0 4px 12px rgba(80,30,10,0.12)",
                }}
              >
                {/* Browser chrome */}
                <div
                  className="flex items-center gap-1.5 px-3 py-2"
                  style={{ background: "#e8ddd0" }}
                >
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,90,85,0.8)" }} />
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,189,68,0.8)" }} />
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(78,200,88,0.8)" }} />
                  <div
                    className="ml-2 flex-1 rounded px-2 py-0.5 text-center text-xs"
                    style={{ background: "rgba(160,100,60,0.12)", color: "rgba(100,60,30,0.5)" }}
                  >
                    priatoo.app/cardapio
                  </div>
                </div>
                {/* System screenshot that changes with color */}
                <img
                  key={imgSrc}
                  src={imgSrc}
                  alt={`Cardápio com cores ${color.name}`}
                  className="w-full"
                  style={{ display: "block", transition: "opacity 0.4s ease" }}
                  loading="lazy"
                />
              </div>

              {/* QR code — bottom-left of the desktop frame */}
              <img
                src="assets/images/lp/qr_code.png"
                alt="QR Code"
                className="absolute z-20 w-[110px] -bottom-[45px] -left-[16px] lg:w-[270px] lg:-bottom-[110px] lg:-left-[110px]"
                style={{
                  display: "block",
                  filter: "drop-shadow(0 4px 12px rgba(80,30,10,0.25))",
                }}
              />
            </div>

            {/* ── Phone frame (foreground, right, overlaps desktop) ── */}
            <div
              className="absolute overflow-hidden transition-all duration-300"
              style={{
                right: 0,
                top: "15%",
                width: "42%",
                zIndex: 10,
                borderRadius: "2rem",
                border: "4px solid rgba(210,140,80,0.4)",
                background: "#111",
                boxShadow: "0 32px 64px rgba(80,30,10,0.28), 0 8px 20px rgba(80,30,10,0.18)",
              }}
            >
              {/* Status bar */}
              <div
                className="flex items-center justify-between px-4 py-1.5 text-xs"
                style={{ background: "#111", color: "rgba(255,255,255,0.5)" }}
              >
                <span>9:41</span>
                <span className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <BatteryMedium className="h-3 w-3" />
                </span>
              </div>

              {/* App header */}
              <div
                className="transition-colors duration-500"
                style={{ background: color.primary }}
              >
                <div className="flex items-center justify-between px-3 py-3">
                  <div>
                    <p className="text-xs text-white/70">Pizzaria do</p>
                    <p className="text-base font-extrabold text-white leading-none">Marcos</p>
                  </div>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <UtensilsCrossed className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-none">
                  {CATEGORIES.map((cat, i) => (
                    <span
                      key={cat}
                      className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={
                        i === 0
                          ? { background: "rgba(255,255,255,0.95)", color: "#111" }
                          : { background: "rgba(255,255,255,0.18)", color: "white" }
                      }
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Menu items */}
              <div className="bg-white p-2 space-y-1.5">
                {MENU_ITEMS.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900">{item.name}</p>
                      <p className="truncate text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <p
                        className="text-xs font-bold transition-colors duration-500"
                        style={{ color: color.primary }}
                      >
                        {item.price}
                      </p>
                      <button
                        className="flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white transition-colors duration-500"
                        style={{ background: color.primary }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <p className="pt-0.5 text-center text-xs text-gray-300">
                  Powered by <span className="font-semibold text-gray-400">Priatoo</span>
                </p>
              </div>
            </div>

            {/* Ambient glow behind both devices */}
            <div
              className="pointer-events-none absolute -inset-8 -z-10 rounded-full blur-3xl opacity-25 transition-colors duration-700"
              style={{ background: color.primary }}
            />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
