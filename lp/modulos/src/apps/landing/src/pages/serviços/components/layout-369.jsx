"use client";

import { Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Layout369() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="rb-12 mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto max-w-lg text-center">
            <p className="mb-3 font-semibold md:mb-4">Vantagens</p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Benefícios para todos
            </h2>
            <p className="md:text-md">
              Cada perfil tem sua estratégia única de sucesso
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 grid grid-cols-1 sm:col-span-2 sm:row-span-1 sm:grid-cols-2">
              <div className="flex flex-1 flex-col justify-center p-6">
                <div>
                  <p className="mb-2 text-sm font-semibold">Clientes</p>
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">
                    Praticidade sem limites
                  </h3>
                  <p>Comida quente e rápida em qualquer lugar</p>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-4 md:mt-6">
                  <Button
                    title="Explorar"
                    variant="link"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    Explorar
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-portrait.svg"
                  alt="Relume placeholder image 3"
                  className="size-full object-cover"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
              <div className="flex flex-col justify-center p-6">
                <div>
                  <p className="mb-2 text-sm font-semibold">Restaurantes</p>
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">
                    Crescimento digital
                  </h3>
                  <p>Mais visibilidade e vendas garantidas</p>
                </div>
                <div className="mt-5 flex items-center gap-4 md:mt-6">
                  <Button
                    title="Expandir"
                    variant="link"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    Expandir
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image 1"
                  className="w-full object-cover"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
              <div className="flex flex-col justify-center p-6">
                <div>
                  <p className="mb-2 text-sm font-semibold">Restaurantes</p>
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">
                    Crescimento digital
                  </h3>
                  <p>Mais visibilidade e vendas garantidas</p>
                </div>
                <div className="mt-5 flex items-center gap-4 md:mt-6">
                  <Button
                    title="Expandir"
                    variant="link"
                    size="link"
                    iconRight={<RxChevronRight />}
                  >
                    Expandir
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image 2"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
