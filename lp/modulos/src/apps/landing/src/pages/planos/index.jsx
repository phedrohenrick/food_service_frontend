import React, { useState } from "react";
import { NavbarLight } from "./components/NavbarLight";
import { PricingHeroSection } from "./components/PricingHeroSection";
import { PricingCardsSection } from "./components/PricingCardsSection";
import { PricingComparisonTable } from "./components/PricingComparisonTable";
import { PricingFaqSection } from "./components/PricingFaqSection";
import { PricingCtaSection } from "./components/PricingCtaSection";
import { FooterLight } from "./components/FooterLight";

export default function PlanosPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ background: "#FFFFFF" }}>
      <NavbarLight />
      <PricingHeroSection annual={annual} onToggle={() => setAnnual((v) => !v)} />
      <PricingCardsSection annual={annual} />
      <PricingComparisonTable />
      <PricingFaqSection />
      <PricingCtaSection />
      <FooterLight />
    </div>
  );
}
