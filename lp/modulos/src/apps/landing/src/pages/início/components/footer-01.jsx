"use client";

import React from "react";
import {
  BiLogoFacebookCircle,
  BiLogoInstagram,
  BiLogoLinkedinSquare,
} from "react-icons/bi";

export function Footer1() {
  return (
    <footer
      className="px-[5%] pt-16 pb-8"
      style={{
        background: "#0f0705",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="grid gap-10 pb-12 md:grid-cols-[1.2fr_auto_auto_auto] md:gap-x-16"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Brand */}
          <div>
            <a href="#" className="inline-block mb-5">
              <img
                src="assets/images/lp/brand-assets/logo.png"
                alt="Priatoo"
                className="h-11 object-contain"
              />
            </a>
            <p
              className="mb-5 max-w-xs text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.42)" }}
            >
              Sistema de gestão para restaurantes pequenos e médios — sem comissão por pedido.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: BiLogoFacebookCircle, href: "#" },
                { Icon: BiLogoInstagram, href: "#" },
                { Icon: BiLogoLinkedinSquare, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Produto */}
          <div>
            <h3
              className="mb-4 text-sm font-semibold text-white"
            >
              Produto
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Recursos", href: "#funcionalidades" },
                { label: "Como funciona", href: "#como-funciona" },
                { label: "Planos", href: "#planos" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.42)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3
              className="mb-4 text-sm font-semibold text-white"
            >
              Empresa
            </h3>
            <ul className="space-y-2.5">
              {["Sobre nós", "Parceiros", "Contato"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.42)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3
              className="mb-4 text-sm font-semibold text-white"
            >
              Suporte
            </h3>
            <ul className="space-y-2.5">
              {["Central de ajuda", "Comunidade", "Status"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.42)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © 2026 Priatoo. Todos os direitos reservados.
          </p>
          <div className="flex gap-5">
            {["Privacidade", "Termos", "Contato"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs underline transition-colors"
                style={{ color: "rgba(255,255,255,0.28)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
