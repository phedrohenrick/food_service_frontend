"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";

export function Faq7() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container w-full max-w-lg">
        <div className="rb-12 mb-12 text-center md:mb-18 lg:mb-20">
          <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Dúvidas
          </h2>
          <p className="md:text-md">
            Respondemos as perguntas mais frequentes para ajudar você a entender
            melhor nosso serviço
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:gap-y-12">
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Como funciona o pedido?
            </h2>
            <p>
              Você escolhe o restaurante, seleciona os pratos, confirma o
              pagamento e acompanha a entrega em tempo real.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Quais são as formas de pagamento?
            </h2>
            <p>
              Aceitamos cartões de crédito, débito, PIX e pagamento na entrega.
              Todas as transações são seguras e criptografadas.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Posso cancelar meu pedido?
            </h2>
            <p>
              Sim, você pode cancelar até o restaurante começar a preparar. Após
              esse momento, não será possível cancelar.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Quanto custa a entrega?
            </h2>
            <p>
              O valor varia de acordo com a distância e o restaurante. Sempre
              mostramos o custo antes da confirmação.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold md:mb-4 md:text-md">
              Os restaurantes são confiáveis?
            </h2>
            <p>
              Todos os restaurantes passam por uma rigorosa seleção e são
              avaliados constantemente por nossos usuários.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-md text-center md:mt-18 lg:mt-20">
          <h4 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
            Ainda tem dúvidas?
          </h4>
          <p className="md:text-md">
            Nossa equipe está pronta para ajudar em qualquer momento
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
