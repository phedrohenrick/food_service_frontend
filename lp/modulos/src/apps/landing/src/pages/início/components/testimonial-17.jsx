"use client";

import React from "react";
import { BiSolidStar } from "react-icons/bi";

export function Testimonial17() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-12 w-full max-w-lg text-center md:mb-18 lg:mb-20">
          <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            O que dizem de nós
          </h2>
          <p className="md:text-md">
            Histórias reais de clientes que amam o Pede, uai!
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className=" border border-border-secondary rounded-lg bg-background-primary ...">
            <div className="rb-5 mb-5 md:mb-6">
              <div className="ml-2 mb-5 flex md:mb-6">
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
              </div>
              <blockquote className="ml-2 md:text-md">
                Nunca comi algo tão bom e rápido na minha vida.
              </blockquote>
            </div>
            <div className="mt-5 flex w-full flex-col items-start md:mt-6 md:w-fit md:flex-row md:items-center">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Testimonial avatar"
                className="ml-2 mb-4 size-12 min-h-12 min-w-12 rounded-full object-cover md:mr-4 md:mb-0"
              />
              <div>
                <p className="font-semibold">João Silva</p>
                <p>Estudante, Belo Horizonte</p>
              </div>
            </div>
          </div>
         <div className="border border-border-secondary rounded-lg bg-background-primary ...">
            <div className="rb-5 mb-5 md:mb-6">
              <div className="ml-2 mb-5 flex md:mb-6">
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
              </div>
              <blockquote className="ml-2 md:text-md">
                Meu restaurante triplicou as vendas com essa plataforma.
              </blockquote>
            </div>
            <div className="ml-2 mb-4 mt-5 flex w-full flex-col items-start md:mt-6 md:w-fit md:flex-row md:items-center">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Testimonial avatar"
                className="mb-4 size-12 min-h-12 min-w-12 rounded-full object-cover md:mr-4 md:mb-0"
              />
              <div>
                <p className=" font-semibold">Maria Santos</p>
                <p>Proprietária, Restaurante Sabor Mineiro</p>
              </div>
            </div>
          </div>
          <div className="border border-border-secondary rounded-lg bg-background-primary ...">
            <div className="ml-2 rb-5 mb-5 md:mb-6">
              <div className="mb-5 flex md:mb-6">
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
                <BiSolidStar className="mr-1 size-6" />
              </div>
              <blockquote className="md:text-md">
                Ganho meu dinheiro com flexibilidade e liberdade.
              </blockquote>
            </div>
            <div className="ml-2 mt-5 flex w-full flex-col items-start md:mt-6 md:w-fit md:flex-row md:items-center">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Testimonial avatar"
                className="mb-4 size-12 min-h-12 min-w-12 rounded-full object-cover md:mr-4 md:mb-0"
              />
              <div>
                <p className="font-semibold">Pedro Oliveira</p>
                <p>Entregador, Região Metropolitana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
