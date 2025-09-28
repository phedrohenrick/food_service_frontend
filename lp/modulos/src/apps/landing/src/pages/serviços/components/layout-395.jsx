"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout395() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
          <p className="mb-3 font-semibold md:mb-4">Conectando</p>
          <h1 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Nossos serviços para cada perfil
          </h1>
          <p className="md:text-md">
            Soluções personalizadas para clientes, restaurantes e entregadores
          </p>
        </div>
        <div className="grid auto-cols-fr grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image 1"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold">Clientes</p>
                <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Peça sua comida com um toque
                </h2>
                <p>Cardápios variados e entrega rápida em todo lugar</p>
              </div>
              <div className="mt-5 md:mt-6">
                <Button
                  title="Pedir"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                >
                  Pedir
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image 1"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold">Restaurantes</p>
                <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Amplie seu alcance digital
                </h2>
                <p>Gestão simples e aumento de vendas garantido</p>
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
          <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image 1"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold">Entregadores</p>
                <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Trabalhe com flexibilidade
                </h2>
                <p>Ganhe dinheiro no seu próprio ritmo</p>
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
        </div>
      </div>
    </section>
  );
}
