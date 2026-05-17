"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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
        background: scrolled ? "rgba(255,255,255,0.95)" : "#FFFFFF",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: "1px solid rgba(13,31,51,0.08)",
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
          {[
            { label: "Recursos", href: "/#funcionalidades" },
            { label: "Planos", href: "/planos" },
            { label: "Como funciona", href: "/#como-funciona" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: l.href === "/planos" ? "#DD3F0C" : "#4A6278" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0D1F33")}
              onMouseLeave={(e) => (e.currentTarget.style.color = l.href === "/planos" ? "#DD3F0C" : "#4A6278")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/login"
            className="rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-150"
            style={{ borderColor: "rgba(13,31,51,0.18)", color: "#4A6278" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(13,31,51,0.4)"; e.currentTarget.style.color = "#0D1F33"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(13,31,51,0.18)"; e.currentTarget.style.color = "#4A6278"; }}
          >
            Entrar
          </a>
          <a
            href="/onboarding/start"
            className="rounded-full px-5 py-2 text-sm font-bold text-white transition-all duration-150 hover:opacity-90"
            style={{ background: "#DD3F0C", boxShadow: "0 4px 14px rgba(221,63,12,0.3)" }}
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
            ? <X className="h-5 w-5" style={{ color: "#0D1F33" }} />
            : <Menu className="h-5 w-5" style={{ color: "#0D1F33" }} />
          }
        </button>
      </div>

      {mobileOpen && (
        <div
          className="border-t lg:hidden"
          style={{ background: "#FFFFFF", borderColor: "rgba(13,31,51,0.08)" }}
        >
          <div className="flex flex-col px-5 pb-6 pt-2">
            {[
              { label: "Recursos", href: "/#funcionalidades" },
              { label: "Planos", href: "/planos" },
              { label: "Como funciona", href: "/#como-funciona" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="border-b py-4 text-base font-medium transition-colors"
                style={{ borderColor: "rgba(13,31,51,0.06)", color: "#4A6278" }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-5 flex flex-col gap-3">
              <a
                href="/login"
                className="w-full rounded-xl border py-3 text-center text-sm font-semibold"
                style={{ borderColor: "rgba(13,31,51,0.18)", color: "#4A6278" }}
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
