"use client";

import React from "react";
import { Link } from "react-router-dom";

export function AuthLayout({
  title,
  subtitle,
  accentLabel,
  children,
  footer,
}) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/images/lp/background/login_background.png')"
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-background-hero/80 via-background-orange/70 to-background-red2/60"></div>
      </div>
      
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          {/* Logo */}
          <div className="mb-8 flex justify-center lg:justify-start">
            <img 
              src="/assets/images/lp/pede,uai_lateral.png" 
              alt="Logo" 
              className="h-24 w-auto"
            />
          </div>
          
          {accentLabel && (
            <span className="inline-flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white border border-white/30">
              {accentLabel}
            </span>
          )}
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto max-w-xl text-base text-white/90 md:text-lg lg:mx-0 drop-shadow">
              {subtitle}
            </p>
          )}
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md p-5 shadow-lg">
              <p className="font-semibold text-white">Taxas acessíveis</p>
              <p className="text-white/90">Negocie direto com uma equipe que entende a realidade da sua operação.</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md p-5 shadow-lg">
              <p className="font-semibold text-white">Suporte humano</p>
              <p className="text-white/90">Fale com especialistas que acompanham seu delivery do dia zero.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 w-full max-w-md flex-1 lg:mt-0">
          {/* Glassmorphism Card */}
          <div className="rounded-3xl border border-white/20 bg-white/85 backdrop-blur-md p-8 shadow-2xl">
            {children}
          </div>
          {footer && (
            <div className="mt-6 text-center text-sm text-white/80 drop-shadow">
              {footer}
            </div>
          )}
          <div className="mt-6 text-center text-xs text-white/70 drop-shadow">
            Ao continuar, você concorda com nossos
            <Link to="/termos" className="mx-1 font-semibold text-white hover:text-white/80 transition-colors">
              Termos de uso
            </Link>
            e
            <Link to="/privacidade" className="ml-1 font-semibold text-white hover:text-white/80 transition-colors">
              Política de privacidade.
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

