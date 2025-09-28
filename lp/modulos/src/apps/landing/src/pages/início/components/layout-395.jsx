"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout395() {
  return (
    <section id="relume" className="mt-40 bg-background-primary px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
          <p className="mb-3 font-semibold md:mb-4">Benefícios</p>
          <h1 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Economia, Satisfação, Fidelização
          </h1>
          <p className="md:text-md">
             atendendo melhor, mais rápido e garantindo clientes satisfeitos e fidelizados.
          </p>
        </div>
        <div className="grid auto-cols-fr grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          <div className="border border-border-secondary rounded-lg bg-background-primary">
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="assets/images/lp/fastfood.jpeg"
                alt="Relume placeholder image 1"
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold">Clientes</p>
                <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Comida fresca e saborosa em minutos
                </h2>
                <p>
                  Cardápios diversos e pagamento fácil em um único aplicativo.
                </p>
              </div>
              <div className="mt-5 md:mt-6">
                <Button
                  title="Saiba mais"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Saiba mais
                </Button>
              </div>
            </div>
          </div>
          <div className="border border-border-secondary rounded-lg bg-background-primary ...">
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="assets/images/lp/logista.jpeg"
                alt="Relume placeholder image 1"
                className="t-rounded-xl"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold">Restaurantes</p>
                <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Aumente suas vendas e alcance
                </h2>
                <p>
                  Plataforma simples para gerenciar pedidos e expandir seu
                  negócio.
                </p>
              </div>
              <div className="mt-5 md:mt-6">
                <Button
                  title="Cadastrar"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Cadastrar
                </Button>
              </div>
            </div>
          </div>
          <div className="border border-border-secondary rounded-xl bg-background-primary ...">
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="assets/images/lp/entregador.jpg"
                alt="Relume placeholder image 1"
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold">Entregadores</p>
                <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Ganhe dinheiro no seu tempo livre
                </h2>
                <p>
                  Trabalhe por conta própria com flexibilidade e ganhos rápidos.
                </p>
              </div>
              <div className="mt-5 md:mt-6">
                <Button
                  title="Inscrever-se"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Inscrever-se
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
