"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";

// Balão flutuante no canto inferior direito. Leva o visitante até a seção
// "Fale com a gente antes de começar" (#pre-cadastro). Se por algum motivo a
// seção não estiver na página, navega para a home nessa âncora.
export function WhatsappFab() {
  const goToContact = () => {
    const el = document.getElementById("pre-cadastro");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.assign("/#pre-cadastro");
    }
  };

  return (
    <button
      type="button"
      onClick={goToContact}
      data-cta="whatsapp-fab"
      aria-label="Fale com a gente antes de começar"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full pl-4 pr-5 py-3 text-white shadow-lg transition-transform duration-200 hover:scale-105"
      style={{ background: "#25D366", boxShadow: "0 12px 30px -8px rgba(37,211,102,0.6)" }}
    >
      <span
        aria-hidden="true"
        className="absolute -z-10 inline-flex h-full w-full rounded-full opacity-30"
        style={{ background: "#25D366", animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite" }}
      />
      <FaWhatsapp className="text-2xl" />
      <span className="text-sm font-semibold">Fale com a gente</span>
    </button>
  );
}

export default WhatsappFab;
