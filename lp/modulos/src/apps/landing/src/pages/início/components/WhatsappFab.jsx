"use client";

import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { focusContactForm } from "../focusContactForm";

// Balão flutuante (canto inferior direito). Só aparece — deslizando de baixo pra
// cima — a partir da seção "Veja o Priatoo em 60 segundos" (#demo) pra baixo.
// Ao clicar, rola até o formulário de contato e o destaca.
export function WhatsappFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const compute = () => {
      const demo = document.getElementById("demo");
      if (!demo) {
        setVisible(false);
        return;
      }
      // Mostra assim que a seção do vídeo entra na parte de baixo da tela e
      // mantém visível em tudo que vem depois dela.
      const top = demo.getBoundingClientRect().top;
      setVisible(top <= window.innerHeight * 0.8);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => focusContactForm()}
      data-cta="whatsapp-fab"
      aria-label="Fale com a gente antes de começar"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full pl-4 pr-5 py-3 text-white transition-all duration-300 ease-out"
      style={{
        background: "#25D366",
        boxShadow: "0 12px 30px -8px rgba(37,211,102,0.6)",
        transform: visible ? "translateY(0)" : "translateY(160%)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <FaWhatsapp className="text-2xl" />
      <span className="text-sm font-semibold">Fale com a gente</span>
    </button>
  );
}

export default WhatsappFab;
