"use client";

import { Badge, Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Blog38() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="w-full max-w-lg">
            <p className="mb-3 font-semibold md:mb-4">Blog</p>
            <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Histórias em destaque
            </h2>
            <p className="md:text-md">
              Artigos que inspiram e transformam sua relação com a comida
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
          <div className="flex size-full flex-col items-start justify-start text-start">
            <a href="#" className="mb-6 w-full">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                alt="Relume placeholder image"
                className="aspect-[3/2] size-full rounded-image object-cover"
              />
            </a>
            <div className="rb-4 mb-4 flex w-full items-center justify-start">
              <Badge className="mr-4">Viagem</Badge>
              <p className="inline text-sm font-semibold">6 min de leitura</p>
            </div>
            <a className="mb-2 flex justify-start text-start" href="#">
              <h2 className="text-xl font-bold md:text-2xl">
                Sabores de cada canto do Brasil
              </h2>
            </a>
            <p>
              Explore as diversas culinárias regionais que compõem nosso rico
              mosaico gastronômico
            </p>
            <Button
              title="Ler mais"
              variant="link"
              size="link"
              iconRight={<RxChevronRight />}
              className="mt-6 flex items-center justify-center gap-x-2"
            >
              Ler mais
            </Button>
          </div>
          <div className="flex size-full flex-col items-start justify-start text-start">
            <a href="#" className="mb-6 w-full">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                alt="Relume placeholder image"
                className="aspect-[3/2] size-full rounded-image object-cover"
              />
            </a>
            <div className="rb-4 mb-4 flex w-full items-center justify-start">
              <Badge className="mr-4">Sustentabilidade</Badge>
              <p className="inline text-sm font-semibold">5 min de leitura</p>
            </div>
            <a className="mb-2 flex justify-start text-start" href="#">
              <h2 className="text-xl font-bold md:text-2xl">
                Agricultura familiar e consumo consciente
              </h2>
            </a>
            <p>
              Como pequenos produtores estão revolucionando o mercado
              alimentício
            </p>
            <Button
              title="Ler mais"
              variant="link"
              size="link"
              iconRight={<RxChevronRight />}
              className="mt-6 flex items-center justify-center gap-x-2"
            >
              Ler mais
            </Button>
          </div>
          <div className="flex size-full flex-col items-start justify-start text-start">
            <a href="#" className="mb-6 w-full">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                alt="Relume placeholder image"
                className="aspect-[3/2] size-full rounded-image object-cover"
              />
            </a>
            <div className="rb-4 mb-4 flex w-full items-center justify-start">
              <Badge className="mr-4">Cultura</Badge>
              <p className="inline text-sm font-semibold">4 min de leitura</p>
            </div>
            <a className="mb-2 flex justify-start text-start" href="#">
              <h2 className="text-xl font-bold md:text-2xl">
                Comida como identidade
              </h2>
            </a>
            <p>
              As histórias por trás dos pratos que representam nossa herança
              cultural
            </p>
            <Button
              title="Ler mais"
              variant="link"
              size="link"
              iconRight={<RxChevronRight />}
              className="mt-6 flex items-center justify-center gap-x-2"
            >
              Ler mais
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button variant="secondary" className="mt-10 md:mt-14 lg:mt-16">
            Ver todos
          </Button>
        </div>
      </div>
    </section>
  );
}
