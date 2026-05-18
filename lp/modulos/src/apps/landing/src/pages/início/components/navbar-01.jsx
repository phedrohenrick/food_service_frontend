"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar1() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const links = [
    { label: "Recursos", target: "funcionalidades" },
    { label: "Como funciona", target: "como-funciona" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[999] transition-all duration-300"
      style={
        scrolled
          ? { background: "rgba(26,14,13,0.92)", backdropFilter: "blur(12px)", boxShadow: "0 1px 0 rgba(255,255,255,0.06)" }
          : { background: "transparent" }
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a
          href="#inicio"
          onClick={(e) => { e.preventDefault(); scrollTo("inicio"); }}
          className="flex-shrink-0"
        >
          <img
            src="assets/images/lp/brand-assets/logo.png"
            alt="Priatoo"
            className="h-11 object-contain"
          />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.target)}
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              {l.label}
            </button>
          ))}
          <a
            href="/planos"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Planos
          </a>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => { try { window.location.assign("/login"); } catch (_) {} }}
            className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white hover:bg-white/8"
          >
            Entrar
          </button>
          <button
            onClick={() => { try { window.location.assign("/onboarding/start"); } catch (_) {} }}
            className="rounded-full px-5 py-2 text-sm font-bold text-white transition hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "#FF7F27", boxShadow: "0 4px 16px rgba(255,127,39,0.35)" }}
          >
            Testar grátis
          </button>
        </div>

        <button
          className="flex flex-col gap-1.5 p-1 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <motion.span
            className="block h-0.5 w-6 bg-white origin-center rounded-full"
            animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-0.5 w-6 bg-white rounded-full"
            animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.span
            className="block h-0.5 w-6 bg-white origin-center rounded-full"
            animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden lg:hidden"
            style={{ background: "rgba(15,7,5,0.97)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex flex-col gap-0 px-5 pb-6 pt-2">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.target)}
                  className="py-4 text-left text-base font-medium text-white/75 border-b border-white/8 hover:text-white transition"
                >
                  {l.label}
                </button>
              ))}
              <a
                href="/planos"
                className="py-4 text-left text-base font-medium text-white/75 border-b border-white/8 hover:text-white transition"
              >
                Planos
              </a>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={() => { try { window.location.assign("/login"); } catch (_) {} }}
                  className="w-full rounded-xl border border-white/30 py-3 text-sm font-semibold text-white/80"
                >
                  Entrar
                </button>
                <button
                  onClick={() => { try { window.location.assign("/onboarding/start"); } catch (_) {} }}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white"
                  style={{ background: "#FF7F27" }}
                >
                  Testar grátis
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
