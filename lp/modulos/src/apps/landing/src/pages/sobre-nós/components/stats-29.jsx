"use client";

import { Button } from "@relume_io/relume-ui";
import React, { Fragment } from "react";
import { RxChevronRight } from "react-icons/rx";

export function Stats29() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mb-12 grid grid-cols-1 gap-y-5 md:mb-18 md:grid-cols-2 md:gap-x-12 lg:mb-20 lg:gap-x-20">
          <div>
            <p className="mb-3 font-semibold md:mb-4">Números</p>
            <h2 className="text-5xl font-bold md:text-7xl lg:text-8xl">
              Crescendo juntos em Minas Gerais
            </h2>
          </div>
          <div>
            <p className="md:text-md">
              Nosso compromisso é conectar pessoas, restaurantes e entregadores.
              Cada número representa uma história de sabor e satisfação.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <Button title="Detalhes" variant="secondary">
                Detalhes
              </Button>
              <Button
                title="Relatório"
                variant="link"
                size="link"
                iconRight={<RxChevronRight />}
              >
                Relatório
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Fragment>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 first:flex first:flex-col first:md:col-span-2 first:md:row-span-1 first:lg:col-span-1 first:lg:row-span-2">
              <p className="mb-8 text-10xl leading-[1.3] font-bold md:mb-10 md:text-[4rem] lg:mb-12 lg:text-[5rem]">
                50k
              </p>
              <h3 className="text-md leading-[1.4] font-bold md:text-xl mt-auto">
                Pedidos por mês
              </h3>
              <p className="mt-2">
                Entregamos refeições quentes e deliciosas em todo estado
              </p>
            </div>
          </Fragment>
          <Fragment>
            <div>
              <img
                className="aspect-[3/2] size-full rounded-image object-cover"
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image"
              />
            </div>
          </Fragment>
          <Fragment>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <p className="mb-8 text-10xl leading-[1.3] font-bold md:mb-10 md:text-[4rem] lg:mb-12 lg:text-[5rem]">
                50k
              </p>
              <h3 className="text-md leading-[1.4] font-bold md:text-xl">
                Pedidos por mês
              </h3>
              <p className="mt-2">
                Entregamos refeições quentes e deliciosas em todo estado
              </p>
            </div>
          </Fragment>
          <Fragment>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 [&:nth-last-child(2)]:order-last [&:nth-last-child(2)]:md:order-none">
              <p className="mb-8 text-10xl leading-[1.3] font-bold md:mb-10 md:text-[4rem] lg:mb-12 lg:text-[5rem]">
                50k
              </p>
              <h3 className="text-md leading-[1.4] font-bold md:text-xl">
                Pedidos por mês
              </h3>
              <p className="mt-2">
                Entregamos refeições quentes e deliciosas em todo estado
              </p>
            </div>
          </Fragment>
          <Fragment>
            <div>
              <img
                className="aspect-[3/2] size-full rounded-image object-cover"
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Relume placeholder image"
              />
            </div>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
