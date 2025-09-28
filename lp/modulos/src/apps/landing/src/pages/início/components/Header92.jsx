"use client";

import { Button } from "@relume_io/relume-ui";

export function Header92() {
  const scrollToForm = (type) => {
    const target = document.getElementById("pre-cadastro");

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (type) {
        target.dispatchEvent(
          new CustomEvent("lead:type", { detail: { type }, bubbles: true })
        );
      }
    }
  };
  return (
    <section id="relume" className="px-[5%] py-12 md:py-16 lg:py-20 bg-background-hero">
      <div className="container">
        <div className="grid auto-cols-fr grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-center">
            <img
              src="/assets/images/lp/1.png"
              className="w-full object-cover"
              alt="Relume placeholder image"
            />
          </div>
          <div className="bg-foreground flex flex-col justify-center p-8 md:p-12">
            <div>
              <h1 className="text-white mb-5 text-6xl font-bold md:mb-6 md:text-9xl lg:text-10xl">
                Mais clientes, mais vendas, menos custos
              </h1>
              <p className="text-white md:text-md">
                Gerencie seu restaurante em um só lugar, aumente suas vendas e expanda seu negócio com as melhores taxas do mercado.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              {/* <Button class="" title="Baixar app" variant="secondary">
                Baixar app
              </Button> */}
              <Button 
                  class="bg-white text-foreground font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition"
                  title="Cadastrar"
                  variant="secondary"
                  onClick={() => scrollToForm("lojista")}
                  data-cta="hero-lojista">
                Sou logista
              </Button>

              <Button class="bg-white text-black font-bold py-2 px-4 rounded-full"  title="Cadastrar" variant="secondary" >
                Sou entregador
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
