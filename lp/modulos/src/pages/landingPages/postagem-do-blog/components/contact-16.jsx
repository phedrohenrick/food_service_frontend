"use client";

import React from "react";
import { BiEnvelope, BiMap, BiPhone } from "react-icons/bi";

export function Contact16() {
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div>
          <div className="mb-12 grid auto-cols-fr grid-cols-1 gap-x-12 gap-y-12 md:mb-20 md:grid-cols-[1fr_.75fr] md:gap-x-20 md:gap-y-16">
            <div className="rb-12 max-w-lg">
              <p className="mb-3 font-semibold md:mb-4">Conecte-se</p>
              <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
                Entre em contato conosco
              </h2>
              <p className="md:text-md">
                Estamos sempre disponíveis para ouvir seus feedbacks, sugestões
                e resolver qualquer dúvida
              </p>
            </div>
            <div className="flex flex-col">
              <div className="grid auto-cols-fr grid-cols-1 gap-x-4 gap-y-6 py-2">
                <div className="flex flex-row">
                  <div className="mr-4 md:mb-4">
                    <BiEnvelope className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-md leading-[1.4] font-bold md:text-xl">
                      E-mail
                    </h3>
                    <a className="underline" href="#">
                      hello@relume.io
                    </a>
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="mr-4 md:mb-4">
                    <BiPhone className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-md leading-[1.4] font-bold md:text-xl">
                      Telefone
                    </h3>
                    <a className="underline" href="#">
                      +55 (31) 3333-4444
                    </a>
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="mr-4 md:mb-4">
                    <BiMap className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-md leading-[1.4] font-bold md:text-xl">
                      Endereço
                    </h3>
                    <p>Av. Contorno, 1000 - Belo Horizonte, MG</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a href="#" className="justify-self-end md:w-[321.6px] lg:w-auto">
          <img
            src="https://relume-assets.s3.us-east-1.amazonaws.com/placeholder-map-image.svg"
            alt="Relume placeholder map image"
            className="size-full h-[400px] object-cover md:h-[516px]"
          />
        </a>
      </div>
    </section>
  );
}
