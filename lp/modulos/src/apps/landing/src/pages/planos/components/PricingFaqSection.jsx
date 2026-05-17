"use client";

import React, { useState } from "react";

function IconChevronDown({ rotated }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#DD3F0C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transition: "transform 0.3s ease",
        transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const FAQS = [
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Ao fazer upgrade, o novo plano entra em vigor imediatamente e você paga apenas a diferença proporcional ao período restante. Ao fazer downgrade, a mudança ocorre no próximo ciclo de cobrança.",
  },
  {
    question: "Preciso de cartão de crédito para o plano Grátis?",
    answer: "Não! O plano Grátis não exige cartão de crédito nem nenhum dado de pagamento. Basta criar sua conta com e-mail e senha e você já pode começar a usar imediatamente. Sem surpresas, sem cobranças automáticas.",
  },
  {
    question: "Como funciona o desconto no plano anual?",
    answer: "Ao assinar o plano anual você recebe o equivalente a 2 meses grátis comparado ao pagamento mensal. O valor é cobrado integralmente no início de cada ciclo anual e você economiza cerca de 22%. É possível cancelar antes da renovação sem nenhuma multa.",
  },
  {
    question: "O suporte está disponível em todos os planos?",
    answer: "Sim, todos os planos têm acesso ao suporte. No plano Grátis o atendimento é por e-mail com resposta em até 48h. No Pro, o suporte é por chat com prioridade e resposta em até 4h. No Empresarial, você tem um gerente de conta dedicado e suporte 24/7 via chat, telefone e e-mail.",
  },
];

export function PricingFaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="px-[5%] pb-24" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{ color: "#DD3F0C" }}
          >
            Dúvidas frequentes
          </p>
          <h2
            className="font-extrabold tracking-tight"
            style={{
              fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
              fontSize: "clamp(26px, 3.5vw, 40px)",
              letterSpacing: "-0.025em",
              color: "#0D1F33",
            }}
          >
            Perguntas<br />frequentes
          </h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border transition-colors duration-200"
                style={{
                  borderColor: isOpen ? "rgba(221,63,12,0.28)" : "rgba(13,31,51,0.08)",
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-4 bg-white px-6 py-5 text-left text-sm font-semibold transition-colors duration-150"
                  style={{ color: "#0D1F33" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(13,31,51,0.02)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
                >
                  {faq.question}
                  <IconChevronDown rotated={isOpen} />
                </button>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "260px" : "0px" }}
                >
                  <p
                    className="px-6 pb-5 text-[13.5px] leading-[1.7]"
                    style={{ color: "#4A6278" }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
