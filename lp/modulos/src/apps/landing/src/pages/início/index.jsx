import React from "react";
import { Navbar1 } from "./components/navbar-01";
import { Layout395 } from "./components/layout-395";
import { Layout237 } from "./components/layout-237";
import { Testimonial17 } from "./components/testimonial-17";
import { Footer1 } from "./components/footer-01";
import { Header92 } from "./components/Header92";
import { PreCadastroSection } from "./components/PreCadastroSection";

export default function Page() {
  return (
    <div>
      <Navbar1 />
      <Header92 />
      <PreCadastroSection />
      <Layout395 />
      <Layout237 />
      <Testimonial17 />
      <Footer1 />
    </div>
  );
}
