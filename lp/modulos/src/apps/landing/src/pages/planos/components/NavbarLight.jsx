"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Recursos", href: "/#funcionalidades" },
  { label: "Planos", href: "/planos" },
  { label: "Como funciona", href: "/#como-funciona" },
];

export function NavbarLight() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-[999] transition-all duration-300"
      style={{
        background: "#095985",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        boxShadow: scrolled ? "0 6px 24px rgba(13,31,51,0.18)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="/" className="flex-shrink-0">
          <img
            src="/assets/images/lp/brand-assets/logo.png"
            alt="Priatoo"
            className="h-10 object-contain"
          />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => {
            const active = l.href === "/planos";
            return (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-semibold transition-colors duration-150"
                style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.82)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = active ? "#FFFFFF" : "rgba(255,255,255,0.82)")}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/login"
            className="rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-150"
            style={{ borderColor: "rgba(255,255,255,0.5)", color: "#FFFFFF" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
          >
            Entrar
          </a>
          <a
            href="/onboarding/start"
            className="rounded-full px-5 py-2 text-sm font-bold text-white transition-all duration-150 hover:opacity-90"
            style={{ background: "#DD3F0C", boxShadow: "0 4px 14px rgba(221,63,12,0.35)" }}
          >
            Testar grátis
          </a>
        </div>

        <button
          className="p-1 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {mobileOpen
            ? <X className="h-5 w-5" style={{ color: "#FFFFFF" }} />
            : <Menu className="h-5 w-5" style={{ color: "#FFFFFF" }} />
          }
        </button>
      </div>

      {mobileOpen && (
        <div
          className="border-t lg:hidden"
          style={{ background: "#074a6f", borderColor: "rgba(255,255,255,0.15)" }}
        >
          <div className="flex flex-col px-5 pb-6 pt-2">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="border-b py-4 text-base font-medium"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#FFFFFF" }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-5 flex flex-col gap-3">
              <a
                href="/login"
                className="w-full rounded-xl border py-3 text-center text-sm font-semibold"
                style={{ borderColor: "rgba(255,255,255,0.5)", color: "#FFFFFF" }}
              >
                Entrar
              </a>
              <a
                href="/onboarding/start"
                className="w-full rounded-xl py-3 text-center text-sm font-bold text-white"
                style={{ background: "#DD3F0C" }}
              >
                Testar grátis
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
