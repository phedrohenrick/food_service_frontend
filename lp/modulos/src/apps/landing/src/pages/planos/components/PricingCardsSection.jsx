"use client";

import React, { useState } from "react";
import { Lock, CalendarX2, Headphones, BadgeCheck } from "lucide-react";
import api from '../../../../../../shared/services/api';
import { loginWithRedirect } from '../../../../../../shared/auth/keycloak';

const PRICES = {
  min: { monthly: "68,90", annual: "68,90" },
  pro: { monthly: "129,80", annual: "129,80" },
  max: { monthly: "299,79", annual: "299,79" },
};

const FREE_FEATURES = [
  { text: "Cardápio digital (até 30 itens)", included: true },
  { text: "1 mesa cadastrada", included: true },
  { text: "QR Code do cardápio", included: true },
  { text: "Suporte por e-mail", included: true },
  { text: "Pedidos online", included: false },
  { text: "Controle de garçons", included: false },
  { text: "Métricas e relatórios", included: false },
];

const PRO_FEATURES = [
  { text: "Cardápio digital ilimitado", included: true },
  { text: "Até 20 mesas cadastradas", included: true },
  { text: "Pedidos online pelo cardápio", included: true },
  { text: "Painel de métricas básico", included: true },
  { text: "Controle de garçons", included: true },
  { text: "Integração WhatsApp básica", included: true },
  { text: "Suporte prioritário por chat", included: true },
];

const ENT_FEATURES = [
  { text: "Tudo do Pro, mais:", included: true },
  { text: "Mesas ilimitadas", included: true },
  { text: "Multi-unidades (até 5 restaurantes)", included: true },
  { text: "Painel de métricas avançado", included: true },
  { text: "Relatórios personalizados", included: true },
  { text: "API de integração", included: true },
  { text: "Gerente de conta dedicado", included: true },
  { text: "Suporte 24/7", included: true },
];

const TRUST_ITEMS = [
  { icon: Lock, text: "Sem contrato de fidelidade" },
  { icon: CalendarX2, text: "Cancele quando quiser" },
  { icon: Headphones, text: "Suporte em português" },
  { icon: BadgeCheck, text: "30 dias grátis" },
];

function IconUtensils() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function IconTrendingUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M3 9h6" /><path d="M3 15h6" /><path d="M13 7h5" /><path d="M13 11h5" /><path d="M13 15h5" />
    </svg>
  );
}

function IconDiamond() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M11 3 8 9l4 13 4-13-3-6" /><path d="M2 9h20" />
    </svg>
  );
}

function IconCheckCircle({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconMinusCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A9AB0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
    </svg>
  );
}

export function PricingCardsSection({ annual }) {
  const k = annual ? "annual" : "monthly";

  return (
    <section className="px-[5%] pb-24" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3 md:items-start">
          <PlanCard
            tier="Plano MIN"
            icon={<IconUtensils />}
            iconBg="rgba(13,31,51,0.06)"
            iconColor="#4A6278"
            desc="Perfeito para começar a digitalizar seu restaurante."
            price={PRICES.min[k]}
            savingsNote={null}
            features={FREE_FEATURES}
            ctaLabel="Assinar plano"
            ctaVariant="ghost"
            microCopy="Sem cartão de crédito"
            priceId="min_monthly"
          />

          <PlanCard
            tier="Plano PRO"
            icon={<IconTrendingUp />}
            iconBg="rgba(14,165,233,0.10)"
            iconColor="#0EA5E9"
            desc="Para restaurantes que querem crescer com controle total da operação."
            price={PRICES.pro[k]}
            savingsNote={null}
            features={PRO_FEATURES}
            ctaLabel="Assinar plano"
            ctaVariant="primary"
            microCopy="30 dias grátis · sem cartão"
            popular
            priceId="pro_monthly"
          />

          <PlanCard
            tier="Plano MAX"
            icon={<IconBuilding />}
            iconBg="rgba(56,189,248,0.10)"
            iconColor="#0EA5E9"
            desc="Para redes e restaurantes de alta performance que exigem o máximo."
            price={PRICES.max[k]}
            savingsNote={null}
            features={ENT_FEATURES}
            ctaLabel="Assinar plano"
            ctaVariant="blue"
            microCopy="Onboarding dedicado incluso"
            priceId="max_monthly"
          />
        </div>

        <TrustStrip />
      </div>
    </section>
  );
}

function PlanCard({ tier, icon, iconBg, iconColor, desc, price, savingsNote, features, ctaLabel, ctaVariant, microCopy, popular, priceId }) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl bg-white transition-all duration-200"
      style={{
        border: popular ? "2px solid #0EA5E9" : "1.5px solid rgba(13,31,51,0.1)",
        boxShadow: popular
          ? "0 4px 24px rgba(14,165,233,0.14)"
          : "0 1px 4px rgba(13,31,51,0.06)",
        order: undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = popular ? "#0EA5E9" : "rgba(14,165,233,0.4)";
        e.currentTarget.style.boxShadow = popular
          ? "0 8px 32px rgba(14,165,233,0.22)"
          : "0 4px 16px rgba(13,31,51,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = popular ? "#0EA5E9" : "rgba(13,31,51,0.1)";
        e.currentTarget.style.boxShadow = popular
          ? "0 4px 24px rgba(14,165,233,0.14)"
          : "0 1px 4px rgba(13,31,51,0.06)";
      }}
    >
      {popular && (
        <div
          className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white"
          style={{ background: "#0EA5E9", whiteSpace: "nowrap" }}
        >
          <IconDiamond />
          Mais popular
        </div>
      )}

      <div className="flex flex-1 flex-col p-8">
        <div
          className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>

        <p
          className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: popular ? "#0EA5E9" : "#8A9AB0" }}
        >
          {tier}
        </p>

        <p className="mb-6 text-sm leading-relaxed" style={{ color: "#4A6278" }}>
          {desc}
        </p>

        <div className="mb-1 flex items-end gap-0.5 leading-none">
          <span className="self-start pt-2 text-base font-semibold" style={{ color: "#8A9AB0" }}>
            R$
          </span>
          <span
            className="font-extrabold tracking-tight"
            style={{
              fontSize: "clamp(40px,4vw,52px)",
              letterSpacing: "-0.04em",
              color: popular ? "#0EA5E9" : "#0D1F33",
            }}
          >
            {price}
          </span>
          <span className="self-end pb-1.5 text-[15px]" style={{ color: "#8A9AB0" }}>
            /mês
          </span>
        </div>

        <div className="mb-6 min-h-5 text-xs" style={{ color: "#8A9AB0" }}>
          {savingsNote ? (
            <>
              <span className="line-through opacity-60">{savingsNote.orig}</span>
              {" · "}
              <span style={{ color: "#0EA5E9", fontWeight: 600 }}>{savingsNote.saving}</span>
            </>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>

        <div className="mb-6 h-px" style={{ background: "rgba(13,31,51,0.08)" }} />

        <ul className="mb-8 flex-1 space-y-3">
          {features.map((feat) => (
            <li
              key={feat.text}
              className="flex items-start gap-2.5 text-[13.5px] leading-snug"
              style={{ color: feat.included ? "#0D1F33" : "#8A9AB0" }}
            >
              <span className="mt-px flex-shrink-0">
                {feat.included
                  ? <IconCheckCircle color="#0EA5E9" />
                  : <IconMinusCircle />
                }
              </span>
              {feat.text}
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <CtaButton variant={ctaVariant} label={ctaLabel} priceId={priceId} />
          {microCopy && (
            <p className="text-center text-[11px]" style={{ color: "#8A9AB0" }}>
              {microCopy}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CtaButton({ variant, label, priceId }) {
  const [loading, setLoading] = useState(false);
  const base = "block w-full rounded-xl py-3.5 text-center text-sm font-bold transition-all duration-150";

  const handleClick = async () => {
    try { localStorage.setItem('pendingPriceId', priceId); } catch (_) {}

    const token = (() => { try { return localStorage.getItem('authToken'); } catch (_) { return null; } })();
    const slug = (() => { try { return localStorage.getItem('tenantSlug') || localStorage.getItem('authTenantSlug'); } catch (_) { return null; } })();

    if (token && slug) {
      setLoading(true);
      try {
        const res = await api.post('/subscriptions/checkout', { priceId });
        if (res?.url) { window.location.href = res.url; return; }
      } catch (_) {}
      window.location.href = `/${slug}/dashboard/settings`;
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await loginWithRedirect(`${origin}/onboarding/start`);
  };

  const text = loading ? 'Redirecionando...' : label;

  if (variant === "primary") {
    return (
      <button
        className={base}
        style={{ background: "#0EA5E9", color: "#fff", opacity: loading ? 0.7 : 1 }}
        disabled={loading}
        onClick={handleClick}
        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#0284C7"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#0EA5E9"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {text}
      </button>
    );
  }

  if (variant === "blue") {
    return (
      <button
        className={base}
        style={{ background: "#FFFFFF", color: "#0EA5E9", border: "1.5px solid rgba(14,165,233,0.35)", opacity: loading ? 0.7 : 1 }}
        disabled={loading}
        onClick={handleClick}
        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "rgba(14,165,233,0.06)"; e.currentTarget.style.borderColor = "#0EA5E9"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = "rgba(14,165,233,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {text}
      </button>
    );
  }

  return (
    <button
      className={base}
      style={{ background: "#FFFFFF", color: "#4A6278", border: "1.5px solid rgba(13,31,51,0.18)", opacity: loading ? 0.7 : 1 }}
      disabled={loading}
      onClick={handleClick}
      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "rgba(13,31,51,0.04)"; e.currentTarget.style.color = "#0D1F33"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#4A6278"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {text}
    </button>
  );
}

function TrustStrip() {
  return (
    <div
      className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 rounded-2xl px-10 py-6"
      style={{ background: "#075985" }}
    >
      {TRUST_ITEMS.map(({ icon: Icon, text }, i) => (
        <React.Fragment key={text}>
          <div className="flex items-center gap-2.5 text-sm font-medium" style={{ color: "rgba(255,255,255,0.95)" }}>
            <Icon className="h-4 w-4 flex-shrink-0" style={{ color: "#7DD3FC" }} strokeWidth={1.5} />
            {text}
          </div>
          {i < TRUST_ITEMS.length - 1 && (
            <span className="hidden h-1 w-1 rounded-full sm:block" style={{ background: "rgba(255,255,255,0.25)" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
