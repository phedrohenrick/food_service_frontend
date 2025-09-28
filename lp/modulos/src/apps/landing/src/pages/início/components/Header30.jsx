"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";

export function Header30() {
  const scrollToForm = (type) => {
    const target = document.getElementById("pre-cadastro");

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (type) {
        target.dispatchEvent(
          new CustomEvent("lead:type", { detail: { type }, bubbles: true })
        );
      }
    }
  };

  return (
    <section id="relume" className="relative px-[5%]">
      <div className="relative z-10 container">
        <div className="flex max-h-[60rem] min-h-svh items-center justify-center py-16 text-center md:py-24 lg:py-28">
          <div className="absolute left-1/2 top-[80%] z-20 -translate-x-1/2 transform w-[90%] max-w-[1200px]">
            <div className="rounded-3xl bg-foreground flex flex-col justify-center p-8 md:p-12 shadow-2xl">
              <h1 className="text-white mb-5 text-6xl font-bold md:mb-6 md:text-9xl lg:text-10xl">
                Mais clientes, mais vendas, menos custos
              </h1>
              <p className="text-white md:text-md">
                Próximo nível de relacionamento com seus clientes: taxas competitivas, atendimento humanizado e suporte dedicado para o seu delivery vender sem dor de cabeça.
              </p>
              <p className="text-white/70 mt-4 text-sm md:text-base">
                Garanta sua vaga no lançamento beta e receba nossas condições especiais antes de todo mundo.
              </p>
              </div>
              <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
                <Button
                  class="bg-white text-foreground font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition"
                  title="Cadastrar"
                  variant="secondary"
                  onClick={() => scrollToForm("lojista")}
                  data-cta="hero-lojista"
                >
                  Sou logista
                </Button>
                <Button
                  class="bg-transparent text-white font-bold py-3 px-6 rounded-full border border-white/50 hover:bg-white/10 transition"
                  title="Cadastrar"
                  variant="secondary"
                  onClick={() => scrollToForm("entregador")}
                  data-cta="hero-entregador"
                >
                  Sou entregador
                </Button>
              </div>
            
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <picture className="block h-full w-full">
          <source
            media="(max-width: 640px)"
            srcSet="assets/images/lp/restaurante.png"
          />
          <img
            src="assets/images/lp/1.png"
            className="h-full w-full object-cover object-center"
            srcSet="assets/images/lp/1.png 300w,
                    assets/images/lp/1.png 600w,
                    assets/images/lp/1.png 900w"
            sizes="(max-width: 640px) 100vw,
                   (max-width: 1024px) 80vw,
                   1200px"
            loading="eager"
            alt="Restaurant management platform background"
          />
        </picture>
        <div className="absolute inset-0 bg-black/50" />
      </div>
    </section>
  );
}
