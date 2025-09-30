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
    <section
      id="relume"
      className="relative px-[5%] pb-28 md:pb-40 lg:pb-48 overflow-hidden"
    >
      {/* Background com imagem de restaurante */}
      <div className="absolute inset-0 z-0">
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
        {/* Gradient overlay usando as cores do projeto */}
        <div className="absolute inset-0 bg-gradient-to-br from-background-orange/90 via-background-hero/90 to-foreground/85" />
      </div>

      <div className="relative z-10 container">
        <div className="flex max-h-[60rem] min-h-svh items-center justify-center py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full max-w-7xl">
            
            {/* Coluna esquerda - Conteúdo principal */}
            <div className="text-center lg:text-left space-y-6 lg:space-y-8 animate-fade-in-up">
              <div className="space-y-4 lg:space-y-6">
                <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 animate-slide-in-left">
                  <span className="text-white text-xs sm:text-sm font-semibold">🚀 Plataforma em Beta</span>
                </div>
                
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-in-left delay-200">
                  Transforme seu
                  <span className="block text-background-secondary animate-pulse-slow"> restaurante </span>
                  em uma máquina de vendas
                </h1>
                
                <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 animate-fade-in delay-400">
                  Dashboard completo, taxas competitivas e suporte dedicado. 
                  Gerencie pedidos, acompanhe métricas e aumente suas vendas com nossa plataforma.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in delay-600">
                <Button
                  className="bg-white text-background-hero font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform animate-bounce-subtle"
                  onClick={() => scrollToForm("lojista")}
                  data-cta="hero-lojista"
                >
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                     Sou Lojista
                  </span>
                </Button>
                <Button
                  className="bg-transparent text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 hover:shadow-lg"
                  onClick={() => scrollToForm("entregador")}
                  data-cta="hero-entregador"
                >
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                     Sou Entregador
                  </span>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 lg:pt-8 border-t border-white/20 animate-fade-in delay-800">
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white animate-count-up">500+</div>
                  <div className="text-white/70 text-xs sm:text-sm">Restaurantes</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white animate-count-up delay-100">15k+</div>
                  <div className="text-white/70 text-xs sm:text-sm">Pedidos/mês</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white animate-count-up delay-200">98%</div>
                  <div className="text-white/70 text-xs sm:text-sm">Satisfação</div>
                </div>
              </div>
            </div>

            {/* Coluna direita - Card do Dashboard */}
            <div className="relative animate-slide-in-right">
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 sm:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-3xl animate-float">
                {/* Header do card */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-white font-semibold text-base sm:text-lg">Dashboard do Restaurante</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>

                {/* Mockup do Dashboard */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Métricas principais */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white/20 rounded-lg p-3 sm:p-4 transform hover:scale-105 transition-transform duration-300 animate-slide-in-left delay-300">
                      <div className="text-background-secondary text-lg sm:text-2xl font-bold animate-count-up">R$ 2.847</div>
                      <div className="text-white text-xs sm:text-sm">Vendas hoje</div>
                      <div className="text-white text-xs">+12% ↗</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 sm:p-4 transform hover:scale-105 transition-transform duration-300 animate-slide-in-right delay-400">
                      <div className="text-background-secondary text-lg sm:text-2xl font-bold animate-count-up delay-100">23</div>
                      <div className="text-white/70 text-xs sm:text-sm">Pedidos ativos</div>
                      <div className="text-background-primary text-xs">Em tempo real</div>
                    </div>
                  </div>

                  {/* Lista de pedidos */}
                  <div className="bg-white/20 rounded-lg p-3 sm:p-4 animate-fade-in delay-500">
                    <div className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Pedidos Recentes</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1 sm:py-2 border-b border-white/10 hover:translate-x-2 transition-transform duration-300">
                        <div>
                          <div className="text-white text-xs sm:text-sm">#1247 - João Silva</div>
                          <div className="text-white/60 text-xs">2x Hambúrguer + Batata</div>
                        </div>
                        <div className="text-background-secondary font-bold text-xs sm:text-sm">R$ 45,90</div>
                      </div>
                      <div className="flex justify-between items-center py-1 sm:py-2 border-b border-white/10 hover:translate-x-2 transition-transform duration-300 delay-100">
                        <div>
                          <div className="text-white text-xs sm:text-sm">#1246 - Maria Costa</div>
                          <div className="text-white/60 text-xs">1x Pizza Margherita</div>
                        </div>
                        <div className="text-background-secondary font-bold text-xs sm:text-sm">R$ 32,50</div>
                      </div>
                      <div className="flex justify-between items-center py-1 sm:py-2 hover:translate-x-2 transition-transform duration-300 delay-200">
                        <div>
                          <div className="text-white text-xs sm:text-sm">#1245 - Pedro Santos</div>
                          <div className="text-white/60 text-xs">3x Açaí + Granola</div>
                        </div>
                        <div className="text-background-secondary font-bold text-xs sm:text-sm">R$ 28,90</div>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico simulado */}
                  <div className="bg-white/20 rounded-lg p-3 sm:p-4 animate-fade-in delay-700">
                    <div className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Vendas da Semana</div>
                    <div className="flex items-end justify-between h-16 sm:h-20 gap-1 sm:gap-2">
                      <div className="bg-background-secondary w-full h-8 sm:h-12 rounded-t transform hover:scale-110 transition-transform duration-300 animate-grow-bar"></div>
                      <div className="bg-background-secondary w-full h-10 sm:h-16 rounded-t transform hover:scale-110 transition-transform duration-300 animate-grow-bar delay-100"></div>
                      <div className="bg-background-secondary w-full h-6 sm:h-10 rounded-t transform hover:scale-110 transition-transform duration-300 animate-grow-bar delay-200"></div>
                      <div className="bg-background-secondary w-full h-14 sm:h-20 rounded-t transform hover:scale-110 transition-transform duration-300 animate-grow-bar delay-300"></div>
                      <div className="bg-background-secondary w-full h-9 sm:h-14 rounded-t transform hover:scale-110 transition-transform duration-300 animate-grow-bar delay-400"></div>
                      <div className="bg-background-secondary w-full h-12 sm:h-18 rounded-t transform hover:scale-110 transition-transform duration-300 animate-grow-bar delay-500"></div>
                      <div className="bg-background-secondary w-full h-5 sm:h-8 rounded-t transform hover:scale-110 transition-transform duration-300 animate-grow-bar delay-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos decorativos animados */}
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-16 sm:w-24 h-16 sm:h-24 bg-background-secondary/20 rounded-full blur-xl animate-float-slow"></div>
              <div className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 w-20 sm:w-32 h-20 sm:h-32 bg-background-orange/20 rounded-full blur-xl animate-float-reverse"></div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
