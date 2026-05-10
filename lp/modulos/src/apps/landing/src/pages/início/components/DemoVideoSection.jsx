"use client";

import React, { useState } from "react";
import { LeadPopup } from "./LeadPopup";

export function DemoVideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="demo" className="px-[5%] py-20 md:py-28" style={{ background: "#1a0e0d" }}>
      <div className="mx-auto max-w-5xl text-center">
        <p
          className="text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: "#FF7F27" }}
        >
          Demo do produto
        </p>
        <h2
          className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl"
          style={{
            fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          Veja o Priatoo em 60 segundos
        </h2>
        <p className="mt-4 text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.55)" }}>
          Do cadastro ao primeiro pedido — sem complicação.
        </p>

        {/* Video player */}
        <div
          className="relative mt-10 overflow-hidden rounded-2xl"
          style={{
            boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {!playing ? (
            <div
              className="relative cursor-pointer"
              style={{ paddingBottom: "56.25%", height: 0 }}
              onClick={() => setPlaying(true)}
            >
              <img
                src="assets/images/lp/priatoo_restaurantes.png"
                alt="Clique para assistir o demo do Priatoo"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {/* Dark overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "rgba(10,4,3,0.6)" }}
              />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
                  style={{
                    background: "#FF7F27",
                    boxShadow: "0 0 0 16px rgba(255,127,39,0.15), 0 0 0 32px rgba(255,127,39,0.08)",
                  }}
                >
                  <span
                    className="ml-1 text-white text-2xl"
                    style={{ textShadow: "none" }}
                  >
                    ▶
                  </span>
                </div>
              </div>
              {/* Label */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <span
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
                >
                  Assistir demo · ~60 segundos
                </span>
              </div>
            </div>
          ) : (
            <div style={{ paddingBottom: "56.25%", height: 0, position: "relative" }}>
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                controls
                src="assets/images/lp/loading.mp4"
              />
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => { try { window.location.assign("/onboarding/start"); } catch (_) {} }}
            data-cta="demo-cta"
            className="rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
            style={{
              background: "#FF7F27",
              boxShadow: "0 12px 32px rgba(255,127,39,0.35)",
            }}
          >
            Começar grátis agora
          </button>
        </div>
      </div>

      <LeadPopup />
    </section>
  );
}
