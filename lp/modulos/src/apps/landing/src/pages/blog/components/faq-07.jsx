"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";

export function Faq7() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container w-full max-w-lg">
        <div className="rb-12 mb-12 text-center md:mb-18 lg:mb-20">
          <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Perguntas
          </h2>
          <p className="md:text-md">
            Tire suas dúvidas sobre nosso blog e nossa abordagem gastronômica
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:gap-y-12">
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Como funciona o blog?
            </h2>
            <p>
              Nosso blog é uma plataforma independente que explora a diversidade
              culinária brasileira. Publicamos artigos originais escritos por
              especialistas e entusiastas da gastronomia.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Posso enviar uma história?
            </h2>
            <p>
              Sim! Adoramos histórias originais e autênticas. Entre em contato
              com nossa equipe editorial através do formulário de contato.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Os artigos são gratuitos?
            </h2>
            <p>
              Todos os nossos artigos são completamente gratuitos. Nosso
              objetivo é democratizar o conhecimento gastronômico.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Como posso me atualizar?
            </h2>
            <p>
              Assine nossa newsletter semanal ou siga nossas redes sociais para
              receber as últimas publicações.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Aceitam colaborações?
            </h2>
            <p>
              Sempre estamos abertos a colaborações de chefs, pesquisadores e
              entusiastas da culinária que queiram compartilhar conhecimento.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-md text-center md:mt-18 lg:mt-20">
          <h4 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
            Ainda tem dúvidas?
          </h4>
          <p className="md:text-md">
            Entre em contato e teremos prazer em ajudar
          </p>
          <div className="mt-6 md:mt-8">
            <Button title="Contato" variant="secondary">
              Contato
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
