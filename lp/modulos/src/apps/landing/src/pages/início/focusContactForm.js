// Rola até a seção "Fale com a gente antes de começar" e destaca o formulário
// com um anel vermelho pulsante por alguns segundos (chamado pelos CTAs de contato).
export function focusContactForm() {
  if (typeof document === "undefined") return;

  const section = document.getElementById("pre-cadastro");
  const form = document.getElementById("lead-form");

  // Se a seção não está nesta página (ex.: /planos), vai pra home na âncora.
  if (!section) {
    window.location.assign("/#pre-cadastro");
    return;
  }

  section.scrollIntoView({ behavior: "smooth" });

  if (form) {
    // reinicia a animação caso já esteja com a classe
    form.classList.remove("lead-form-highlight");
    // força reflow pra reiniciar o keyframe
    void form.offsetWidth;
    form.classList.add("lead-form-highlight");
    window.setTimeout(() => form.classList.remove("lead-form-highlight"), 2800);
  }
}

export default focusContactForm;
