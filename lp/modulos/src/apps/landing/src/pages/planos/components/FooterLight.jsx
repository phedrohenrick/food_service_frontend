"use client";

import React from "react";

export function FooterLight() {
  return (
    <footer
      className="px-[5%] py-10"
      style={{ borderTop: "1px solid rgba(13,31,51,0.08)", background: "#FFFFFF" }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <a href="/" className="flex-shrink-0">
          <img
            src="/assets/images/lp/brand-assets/logo.png"
            alt="Priatoo"
            className="h-8 object-contain"
          />
        </a>

        <p className="text-xs" style={{ color: "#8A9AB0" }}>
          Sistema para Restaurantes · priatoo.com.br · © 2026
        </p>

        <div className="flex gap-5">
          {["Privacidade", "Termos", "Contato"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs underline transition-colors"
              style={{ color: "#8A9AB0" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4A6278")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8A9AB0")}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
