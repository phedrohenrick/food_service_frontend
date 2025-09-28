"use client";

import { Badge, Button } from "@relume_io/relume-ui";
import React from "react";
import { RxChevronRight } from "react-icons/rx";

export function Blog44() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="rb-12 mb-12 grid grid-cols-1 items-start justify-start gap-y-8 md:mb-18 md:grid-cols-[1fr_max-content] md:items-end md:justify-between md:gap-x-12 md:gap-y-4 lg:mb-20 lg:gap-x-20">
          <div className="w-full max-w-lg">
            <p className="mb-3 font-semibold md:mb-4">Blog</p>
            <h1 className="mb-3 text-5xl font-bold md:mb-4 md:text-7xl lg:text-8xl">
              Últimas histórias do nosso mundo
            </h1>
            <p className="md:text-md">
              Mergulhe em narrativas frescas e inspiradoras sobre gastronomia
            </p>
          </div>
          <div className="hidden flex-wrap items-center justify-end md:block">
            <Button title="Ver todos" variant="secondary">
              Ver todos
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
          <div className="border border-border-primary rounded-lg overflow-hidden bg-background-primary">
            <div className="flex size-full flex-col items-center justify-start">
              <div className="relative w-full overflow-hidden pt-[66%]">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image 1"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <div className="px-5 py-6 md:p-6">
                <div className="rb-4 mb-4 flex w-full items-center justify-start">
                  <Badge className="mr-4">Culinária</Badge>
                  <p className="inline text-sm font-semibold">
                    5 min de leitura
                  </p>
                </div>
                <a className="mb-2" href="#">
                  <h2 className="mb-2 text-xl font-bold md:text-2xl">
                    Sabores da terra brasileira
                  </h2>
                </a>
                <p>
                  Descubra os ingredientes únicos que contam a história de cada
                  região do Brasil
                </p>
                <Button
                  title="Ler mais"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                  className="mt-6 flex items-center gap-x-1"
                >
                  Ler mais
                </Button>
              </div>
            </div>
          </div>
          <div className="border border-border-primary rounded-lg overflow-hidden bg-background-primary">
            <div className="flex size-full flex-col items-center justify-start">
              <div className="relative w-full overflow-hidden pt-[66%]">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image 1"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <div className="px-5 py-6 md:p-6">
                <div className="rb-4 mb-4 flex w-full items-center justify-start">
                  <Badge className="mr-4">Receitas</Badge>
                  <p className="inline text-sm font-semibold">
                    7 min de leitura
                  </p>
                </div>
                <a className="mb-2" href="#">
                  <h2 className="mb-2 text-xl font-bold md:text-2xl">
                    Cozinha tradicional mineira
                  </h2>
                </a>
                <p>
                  Segredos e técnicas ancestrais que transformam ingredientes
                  simples em pratos memoráveis
                </p>
                <Button
                  title="Ler mais"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                  className="mt-6 flex items-center gap-x-1"
                >
                  Ler mais
                </Button>
              </div>
            </div>
          </div>
          <div className="border border-border-primary rounded-lg overflow-hidden bg-background-primary">
            <div className="flex size-full flex-col items-center justify-start">
              <div className="relative w-full overflow-hidden pt-[66%]">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
                  alt="Relume placeholder image 1"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <div className="px-5 py-6 md:p-6">
                <div className="rb-4 mb-4 flex w-full items-center justify-start">
                  <Badge className="mr-4">Chefs</Badge>
                  <p className="inline text-sm font-semibold">
                    4 min de leitura
                  </p>
                </div>
                <a className="mb-2" href="#">
                  <h2 className="mb-2 text-xl font-bold md:text-2xl">
                    Inovação na gastronomia brasileira
                  </h2>
                </a>
                <p>
                  Conheça os chefs que estão reinventando a culinária nacional
                  com criatividade e respeito às tradições
                </p>
                <Button
                  title="Ler mais"
                  variant="link"
                  size="link"
                  iconRight={<RxChevronRight />}
                  className="mt-6 flex items-center gap-x-1"
                >
                  Ler mais
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Button
          title="Ver todos"
          variant="secondary"
          className="mt-12 md:hidden"
        >
          Ver todos
        </Button>
      </div>
    </section>
  );
}
