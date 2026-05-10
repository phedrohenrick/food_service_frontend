import React from "react";
import { Navbar1 } from "./components/navbar-01";
import { HeroCopySection } from "./components/HeroCopySection";
import { StatsBarSection } from "./components/StatsBarSection";
import { AhaMomentSection } from "./components/AhaMomentSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { DemoVideoSection } from "./components/DemoVideoSection";
import { CalculatorSection } from "./components/CalculatorSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { Testimonial17 } from "./components/testimonial-17";
import { PreCadastroSection } from "./components/PreCadastroSection";
import { FinalCTASection } from "./components/FinalCTASection";
import { Footer1 } from "./components/footer-01";

export default function Page() {
  return (
    <div>
      <Navbar1 />
      <HeroCopySection />
      <StatsBarSection />
      <AhaMomentSection />
      <FeaturesSection />
      <DemoVideoSection />
      <CalculatorSection />
      <HowItWorksSection />
      <Testimonial17 />
      <PreCadastroSection />
      <FinalCTASection />
      <Footer1 />
    </div>
  );
}
