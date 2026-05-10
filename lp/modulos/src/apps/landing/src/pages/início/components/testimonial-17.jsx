"use client";

import React from "react";

const TESTIMONIALS = [
  {
    quote:
      "Meus clientes perguntam se eu contratei um designer. O cardápio ficou com a minha cara mesmo.",
    name: "Marcos",
    role: "Pizzaria do Marcos",
    avatar: "assets/images/lp/avatar/avatar1.jpg",
  },
  {
    quote:
      "Zerou o retrabalho. O pedido vai direto para a cozinha, sem eu precisar gritar nada.",
    name: "Roberta",
    role: "Sabor da Casa",
    avatar: "assets/images/lp/avatar/avatar 2.jpg",
  },
  {
    quote:
      "Agora sei exatamente quem são meus melhores clientes. Isso mudou como eu trabalho.",
    name: "João",
    role: "Lanchonete do Bairro",
    avatar: "assets/images/lp/avatar/avatar3.jpg",
  },
];

export function Testimonial17() {
  return (
    <section className="bg-white px-[5%] py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "#A52A2A" }}
          >
            Depoimentos
          </p>
          <h2
            className="mt-3 text-3xl font-extrabold text-[#1a0e0d] sm:text-4xl lg:text-5xl"
            style={{
              fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Restaurantes que já usam
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl p-6 transition-shadow duration-300 hover:shadow-lg"
              style={{
                background: "#fafaf8",
                border: "1px solid #f0ece8",
              }}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-lg" style={{ color: "#FFC300" }}>
                    ★
                  </span>
                ))}
              </div>

              {/* Quote */}
              <blockquote
                className="flex-1 text-sm leading-relaxed"
                style={{ color: "#374151" }}
              >
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "#1a0e0d" }}
                  >
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
