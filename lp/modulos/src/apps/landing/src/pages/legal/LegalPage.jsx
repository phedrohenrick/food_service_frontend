import React, { useEffect } from "react";
import { Link } from "react-router-dom";

// Minutas provisórias dos documentos legais (LGPD). CONTEUDO EM REVISAO JURIDICA —
// devem ser validados/reescritos por advogado antes de valer como documento oficial.
// A versao vigente "de verdade" (para o registro de consentimento) e a do backend:
// ConsentService.currentDocuments().
const UPDATED = "01/07/2026";
const VERSION = "2026-07-01";

const LEGAL_DOCS = {
  privacy: {
    title: "Política de Privacidade",
    intro:
      "A Priatoo respeita a sua privacidade. Esta Política explica, de forma transparente, quais dados pessoais tratamos, para quais finalidades, com quais bases legais, com quem compartilhamos e quais são os seus direitos, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD) e demais normas aplicáveis. Ao utilizar o site priatoo.com.br, o painel do restaurante, o cardápio digital ou qualquer serviço da Priatoo, você declara estar ciente desta Política.",
    sections: [
      {
        h: "1. Quem somos e nossos papéis",
        p: [
          "A Priatoo é uma plataforma de software como serviço (SaaS) que permite a restaurantes montarem cardápio digital com QR Code, receberem pedidos online e de delivery, gerenciarem mesas e comandas, imprimirem cupons e acompanharem métricas de vendas.",
          "É importante entender que atuamos em dois papéis distintos, conforme a LGPD:",
        ],
        ul: [
          "CONTROLADORA dos dados dos lojistas (restaurantes que contratam a Priatoo): decidimos como tratar os dados de cadastro, conta, assinatura e cobrança desses clientes.",
          "OPERADORA dos dados dos clientes finais dos restaurantes (consumidores que fazem pedidos): nesse caso, o restaurante é o CONTROLADOR e define as finalidades; a Priatoo apenas trata esses dados em nome do restaurante, para viabilizar o serviço. Esse relacionamento é regido pelo Contrato de Tratamento de Dados (DPA), disponível em /dpa.",
        ],
      },
      {
        h: "2. A quem esta Política se aplica",
        ul: [
          "Lojistas: pessoas físicas ou jurídicas que criam uma conta e contratam a Priatoo.",
          "Consumidores finais: pessoas que fazem pedidos no cardápio digital de um restaurante que usa a Priatoo.",
          "Visitantes: qualquer pessoa que navega no site institucional priatoo.com.br.",
        ],
      },
      {
        h: "3. Definições rápidas",
        ul: [
          "Dado pessoal: informação relacionada a pessoa natural identificada ou identificável.",
          "Titular: a pessoa a quem os dados se referem.",
          "Tratamento: qualquer operação com dados (coleta, uso, armazenamento, compartilhamento, eliminação, etc.).",
          "Controlador / Operador: quem decide sobre o tratamento / quem trata em nome do controlador.",
          "ANPD: Autoridade Nacional de Proteção de Dados.",
        ],
      },
      {
        h: "4. Quais dados coletamos",
        p: ["Coletamos apenas os dados necessários para operar e melhorar o serviço:"],
        ul: [
          "Dados do lojista (fornecidos por você): nome do responsável, nome do restaurante, e-mail, telefone/WhatsApp, CPF/CNPJ, cidade/UF e endereço do estabelecimento.",
          "Dados dos clientes finais (inseridos no fluxo de pedido): nome, telefone, endereço de entrega, itens e observações do pedido, histórico de pedidos e forma de pagamento escolhida.",
          "Dados de pagamento: processados diretamente pela Stripe. A Priatoo NÃO armazena o número completo do cartão; recebemos apenas identificadores e o status da transação/assinatura.",
          "Dados de autenticação: credenciais de acesso são gerenciadas pelo Keycloak. Se você optar por entrar com a conta Google, recebemos nome, e-mail e um identificador da conta.",
          "Dados de navegação (automáticos): endereço IP, tipo de dispositivo e navegador, páginas acessadas e interações, coletados por cookies e tecnologias semelhantes (ver Política de Cookies em /cookies).",
        ],
      },
      {
        h: "5. Para que usamos e com qual base legal",
        ul: [
          "Criar e manter sua conta e prestar o serviço contratado — execução de contrato.",
          "Processar e acompanhar pedidos e entregas — execução de contrato / a pedido do restaurante.",
          "Processar assinaturas, cobranças e emitir documentos fiscais — execução de contrato e cumprimento de obrigação legal.",
          "Garantir segurança, integridade e prevenção a fraudes — legítimo interesse.",
          "Guardar registros de acesso da aplicação — cumprimento de obrigação legal (Marco Civil da Internet).",
          "Melhorar o produto e medir desempenho (analytics) — consentimento (cookies não essenciais) ou legítimo interesse, conforme o caso.",
          "Enviar comunicações, novidades e ofertas — consentimento, que pode ser revogado a qualquer momento.",
        ],
      },
      {
        h: "6. Cookies",
        p: [
          "Usamos cookies necessários ao funcionamento e, com o seu consentimento, cookies de análise e de marketing. Você controla suas preferências pelo banner de cookies e pode revogá-las quando quiser. Detalhes na Política de Cookies (/cookies).",
        ],
      },
      {
        h: "7. Com quem compartilhamos",
        p: [
          "Não vendemos seus dados. Compartilhamos apenas o necessário, com fornecedores que atuam como operadores e sob obrigações de segurança e confidencialidade:",
        ],
        ul: [
          "Stripe — processamento de pagamentos e assinaturas.",
          "Brevo — envio de e-mails transacionais (confirmações, verificação de conta, avisos).",
          "Cloudflare R2 — armazenamento de imagens (ex.: fotos de itens do cardápio).",
          "Provedor de nuvem/hospedagem — infraestrutura onde a aplicação e o banco de dados são executados.",
          "Google — quando você utiliza o login social.",
          "Autoridades públicas — quando houver obrigação legal ou ordem judicial.",
        ],
      },
      {
        h: "8. Transferência internacional",
        p: [
          "Alguns fornecedores (como a Stripe) podem tratar dados fora do Brasil. Nesses casos, adotamos salvaguardas compatíveis com a LGPD (como cláusulas contratuais e fornecedores que seguem padrões reconhecidos de proteção de dados).",
        ],
      },
      {
        h: "9. Dados dos clientes do restaurante (nosso papel de Operadora)",
        p: [
          "Em relação aos dados dos consumidores finais, o restaurante é o Controlador e a Priatoo é Operadora. Tratamos esses dados apenas conforme as instruções do restaurante e o Contrato de Tratamento de Dados (/dpa). Pedidos de titulares recebidos por nós que digam respeito a esses dados são encaminhados ao restaurante responsável.",
        ],
      },
      {
        h: "10. Por quanto tempo guardamos",
        p: [
          "Mantemos os dados pelo tempo necessário às finalidades desta Política e às obrigações legais. Exemplos: dados de conta enquanto a assinatura estiver ativa; dados fiscais e de cobrança pelos prazos legais (em regra, 5 anos); registros de acesso conforme o Marco Civil. Encerrado o prazo, os dados são eliminados ou anonimizados de forma segura.",
        ],
      },
      {
        h: "11. Seus direitos (art. 18 da LGPD)",
        p: ["Como titular, você pode, a qualquer tempo e gratuitamente, solicitar:"],
        ul: [
          "Confirmação da existência de tratamento e acesso aos seus dados.",
          "Correção de dados incompletos, inexatos ou desatualizados.",
          "Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.",
          "Portabilidade a outro fornecedor, mediante requisição.",
          "Informação sobre com quem compartilhamos seus dados.",
          "Revogação do consentimento e informação sobre as consequências da negativa.",
        ],
      },
      {
        h: "12. Como exercer seus direitos",
        p: [
          "Basta escrever para privacidade@priatoo.com.br. Poderemos solicitar informações para confirmar sua identidade e responderemos no menor prazo possível, observados os limites legais. Se você for cliente de um restaurante, poderemos direcionar o pedido ao restaurante responsável (Controlador).",
        ],
      },
      {
        h: "13. Segurança da informação",
        p: ["Adotamos medidas técnicas e organizacionais para proteger seus dados, entre elas:"],
        ul: [
          "Autenticação e gestão de identidade via Keycloak (OAuth2/JWT).",
          "Isolamento de dados por restaurante (arquitetura multi-tenant) e autorização baseada na titularidade real do recurso.",
          "Criptografia em trânsito (HTTPS/TLS).",
          "Gestão de segredos fora do código-fonte e controle de acesso restrito.",
          "Rotinas de backup e recuperação.",
        ],
      },
      {
        h: "14. Crianças e adolescentes",
        p: [
          "A Priatoo não é direcionada a menores de 18 anos e não coletamos intencionalmente seus dados. Caso identifiquemos coleta indevida, tomaremos medidas para eliminar os dados.",
        ],
      },
      {
        h: "15. Alterações desta Política",
        p: [
          "Podemos atualizar esta Política para refletir mudanças no serviço ou na legislação. A versão vigente e a data de atualização constam no topo desta página. Mudanças relevantes serão comunicadas e, quando exigido por lei, pediremos novo consentimento.",
        ],
      },
      {
        h: "16. Encarregado (DPO), contato e ANPD",
        p: [
          "Encarregado pela Proteção de Dados: privacidade@priatoo.com.br. Você também pode contatar a ANPD (gov.br/anpd) caso entenda necessário.",
        ],
      },
      {
        h: "17. Lei aplicável e foro",
        p: [
          "Esta Política é regida pela legislação brasileira. Fica eleito o foro do domicílio do titular consumidor para dirimir controvérsias, conforme a legislação aplicável.",
        ],
      },
    ],
  },

  terms: {
    title: "Termos de Uso",
    intro:
      "Estes Termos regem o uso da plataforma Priatoo pelos lojistas. Ao usar o serviço, você concorda com eles.",
    sections: [
      { h: "1. Objeto", p: ["A Priatoo licencia o uso de um sistema para gestão de cardápio, pedidos e delivery."] },
      { h: "2. Cadastro e conta", p: ["Você é responsável pela veracidade dos dados e pela segurança das suas credenciais de acesso."] },
      { h: "3. Uso aceitável", p: ["É vedado usar a plataforma para fins ilícitos, enviar conteúdo indevido ou tentar comprometer a segurança do sistema."] },
      { h: "4. Planos e pagamento", p: ["A contratação de planos pagos segue o Contrato de Assinatura. Consulte /contrato."] },
      { h: "5. Propriedade intelectual", p: ["O software, marca e conteúdos da Priatoo são protegidos. O conteúdo cadastrado pelo lojista permanece dele."] },
      { h: "6. Responsabilidades", p: ["O lojista é responsável pelo que publica e pelo relacionamento com seus clientes; a Priatoo fornece a ferramenta."] },
      { h: "7. Suspensão e rescisão", p: ["Podemos suspender contas em caso de violação destes Termos. Você pode encerrar sua conta quando quiser."] },
      { h: "8. Limitação de responsabilidade", p: ["O serviço é fornecido \"no estado em que se encontra\"; nossa responsabilidade observa os limites da lei aplicável."] },
      { h: "9. Alterações", p: ["Estes Termos podem ser atualizados; avisaremos sobre mudanças relevantes."] },
      { h: "10. Foro", p: ["Fica eleito o foro do domicílio do consumidor/contratante, conforme a legislação aplicável."] },
    ],
  },

  subscription: {
    title: "Contrato de Assinatura",
    intro:
      "Este Contrato de Assinatura regula a contratação, pelo Contratante (restaurante/lojista), da licença de uso da plataforma Priatoo, fornecida pela Contratada (Priatoo). Ao assinar um plano ou concluir o checkout, o Contratante declara ter lido, compreendido e aceito integralmente estas condições. Este Contrato deve ser lido em conjunto com os Termos de Uso (/termos), a Política de Privacidade (/privacidade) e o Contrato de Tratamento de Dados (/dpa).",
    sections: [
      {
        h: "1. Definições",
        ul: [
          "Plataforma: o sistema Priatoo (site, painel do restaurante, cardápio digital e serviços correlatos).",
          "Contratada: Priatoo, fornecedora da Plataforma.",
          "Contratante: a pessoa física ou jurídica que cria conta e assina um plano.",
          "Assinatura: a contratação recorrente de um Plano pago.",
          "Plano: o conjunto de funcionalidades e limites disponibilizados conforme o nível contratado.",
          "Trial: período de avaliação gratuito.",
        ],
      },
      {
        h: "2. Objeto",
        p: [
          "A Contratada concede ao Contratante uma licença de uso não exclusiva, intransferível e revogável da Plataforma, no modelo software como serviço (SaaS), pelo prazo da Assinatura. As funcionalidades incluem, conforme o Plano:",
        ],
        ul: [
          "Cardápio digital com QR Code e página pública do restaurante.",
          "Recebimento e gestão de pedidos online e de delivery, em tempo real.",
          "Gestão de mesas e comandas.",
          "Impressão de cupom/comanda do pedido.",
          "Métricas e relatórios de vendas.",
          "Exportação de pedidos.",
        ],
      },
      {
        h: "3. Cadastro, conta e acesso",
        p: [
          "O acesso é feito por conta individual, autenticada com segurança. O Contratante é responsável pela veracidade dos dados informados e pela guarda de suas credenciais, respondendo pelas ações realizadas em sua conta.",
        ],
      },
      {
        h: "4. Planos, funcionalidades e preços",
        p: [
          "Os Planos, funcionalidades, limites e valores vigentes são os exibidos na página de planos (/planos) no momento da contratação. A título informativo, os valores mensais são: Start R$ 25,90; Delivery R$ 79,90; Completo R$ 129,90; e MAX R$ 299,90. Cada Plano pode ter limites (ex.: número de itens do cardápio, número de mesas, unidades) e recursos específicos, indicados na página de planos.",
        ],
      },
      {
        h: "5. Período de teste gratuito (Trial)",
        p: [
          "Novos Contratantes podem ter um período de avaliação gratuito de 30 (trinta) dias, sem necessidade de cartão de crédito, com acesso às funcionalidades correspondentes. Ao término do Trial, o acesso às funcionalidades pagas depende de Assinatura ativa; sem assinatura, a conta passa a operar em modo gratuito/limitado.",
        ],
      },
      {
        h: "6. Forma de pagamento",
        p: [
          "Os pagamentos são processados pela Stripe. A Contratada não armazena o número completo do cartão do Contratante. O Contratante autoriza a cobrança recorrente do Plano no meio de pagamento informado. Documentos fiscais são emitidos conforme a legislação.",
        ],
      },
      {
        h: "7. Renovação automática e ciclo de cobrança",
        p: [
          "A Assinatura é mensal e renova-se automaticamente ao fim de cada ciclo, mediante nova cobrança, até que o Contratante a cancele. A data de cobrança acompanha a data da contratação.",
        ],
      },
      {
        h: "8. Reajuste de preços",
        p: [
          "Os valores podem ser reajustados mediante comunicação prévia ao Contratante (em regra, com pelo menos 30 dias de antecedência). O uso continuado após o reajuste implica concordância; caso não concorde, o Contratante pode cancelar antes da próxima cobrança.",
        ],
      },
      {
        h: "9. Inadimplência e suspensão",
        p: [
          "Em caso de falha ou não pagamento, a Assinatura poderá ser marcada como inadimplente, com um período de tolerância para regularização. Persistindo a inadimplência, as funcionalidades pagas poderão ser suspensas até a regularização, sem prejuízo dos valores devidos.",
        ],
      },
      {
        h: "10. Cancelamento e rescisão",
        p: [
          "O Contratante pode cancelar a qualquer momento, sem multa e sem fidelidade. O acesso às funcionalidades pagas permanece até o fim do ciclo já pago, não havendo cobrança do ciclo seguinte. A Contratada pode rescindir em caso de violação deste Contrato ou dos Termos de Uso.",
        ],
      },
      {
        h: "11. Direito de arrependimento e reembolso",
        p: [
          "Nos termos do art. 49 do Código de Defesa do Consumidor, quando aplicável, o Contratante pode desistir da contratação em até 7 (sete) dias corridos a contar da contratação online, com devolução dos valores eventualmente pagos. Fora dessa hipótese, reembolsos observam a legislação aplicável e a natureza recorrente do serviço.",
        ],
      },
      {
        h: "12. Nível de serviço e manutenção",
        p: [
          "A Contratada envida esforços para manter a Plataforma disponível de forma estável. Poderão ocorrer janelas de manutenção programada, comunicadas quando possível, e manutenções emergenciais. Não constituem indisponibilidade imputável à Contratada as falhas decorrentes de terceiros (internet do Contratante, provedores de nuvem, gateways de pagamento), caso fortuito ou força maior.",
        ],
      },
      {
        h: "13. Obrigações da Contratada",
        ul: [
          "Disponibilizar a Plataforma conforme o Plano contratado.",
          "Adotar medidas de segurança para proteção dos dados (art. 46 da LGPD).",
          "Prestar suporte conforme o nível do Plano.",
          "Comunicar mudanças relevantes no serviço ou nos termos.",
        ],
      },
      {
        h: "14. Obrigações do Contratante",
        ul: [
          "Usar a Plataforma de forma lícita e conforme os Termos de Uso.",
          "Manter dados cadastrais verídicos e atualizados.",
          "Responsabilizar-se pelo conteúdo publicado (cardápio, preços, imagens) e pelo relacionamento com seus clientes.",
          "Ser o Controlador dos dados dos seus clientes, observando a LGPD e o Contrato de Tratamento de Dados (/dpa).",
        ],
      },
      {
        h: "15. Proteção de dados",
        p: [
          "O tratamento de dados pessoais observa a LGPD, a Política de Privacidade (/privacidade) e, quanto aos dados dos clientes do Contratante, o Contrato de Tratamento de Dados (/dpa), no qual a Priatoo atua como Operadora.",
        ],
      },
      {
        h: "16. Propriedade intelectual",
        p: [
          "O software, a marca, o design e demais elementos da Plataforma pertencem à Contratada. O conteúdo cadastrado pelo Contratante permanece de sua titularidade; o Contratante concede à Contratada uma licença limitada para hospedar e exibir esse conteúdo com a finalidade de operar o serviço.",
        ],
      },
      {
        h: "17. Limitação de responsabilidade",
        p: [
          "A Plataforma é fornecida no estado em que se encontra. Na máxima extensão permitida pela lei, a Contratada não responde por danos indiretos ou lucros cessantes, e sua responsabilidade total fica limitada aos valores efetivamente pagos pelo Contratante nos 12 meses anteriores ao evento. Nada neste item afasta direitos irrenunciáveis do consumidor.",
        ],
      },
      {
        h: "18. Confidencialidade",
        p: [
          "As partes manterão sigilo sobre informações confidenciais a que tiverem acesso em razão deste Contrato, salvo obrigação legal de divulgação.",
        ],
      },
      {
        h: "19. Vigência",
        p: ["Este Contrato vigora enquanto a Assinatura estiver ativa, renovando-se a cada ciclo."],
      },
      {
        h: "20. Disposições gerais",
        ul: [
          "A Contratada pode alterar este Contrato, comunicando mudanças relevantes com antecedência razoável.",
          "As comunicações podem ser feitas por e-mail ou pelo painel.",
          "A eventual invalidade de uma cláusula não afeta as demais.",
          "O Contratante não pode ceder este Contrato sem anuência da Contratada.",
        ],
      },
      {
        h: "21. Lei aplicável e foro",
        p: [
          "Este Contrato é regido pela legislação brasileira. Fica eleito o foro do domicílio do Contratante consumidor para dirimir controvérsias, conforme a legislação aplicável.",
        ],
      },
    ],
  },

  dpa: {
    title: "Contrato de Tratamento de Dados (Operador)",
    intro:
      "Adendo que rege o tratamento, pela Priatoo (operadora), dos dados pessoais dos clientes do restaurante (controlador), conforme a LGPD.",
    sections: [
      { h: "1. Definições", p: ["Controlador: o restaurante (lojista). Operador: a Priatoo, que trata os dados em nome do controlador."] },
      { h: "2. Objeto e escopo", p: ["Tratamento de dados de clientes finais (nome, contato, endereço, pedidos) estritamente para viabilizar o serviço contratado."] },
      { h: "3. Obrigações da Priatoo (operadora)", ul: ["Tratar os dados apenas conforme as instruções do controlador.", "Adotar medidas de segurança (art. 46 da LGPD).", "Garantir confidencialidade de quem acessa os dados."] },
      { h: "4. Sub-operadores", p: ["O controlador autoriza o uso dos sub-operadores listados na Política de Privacidade (ex.: hospedagem, e-mail, armazenamento)."] },
      { h: "5. Direitos dos titulares", p: ["A Priatoo auxilia o controlador a atender pedidos de titulares (acesso, correção, exclusão, etc.)."] },
      { h: "6. Incidentes de segurança", p: ["A Priatoo comunica o controlador sem demora injustificada, fornecendo as informações necessárias para as comunicações à ANPD (prazo de 3 dias úteis) e aos titulares, quando aplicável."] },
      { h: "7. Devolução e eliminação", p: ["Ao término do contrato, os dados são devolvidos e/ou eliminados, salvo obrigação legal de guarda."] },
      { h: "8. Vigência", p: ["Este adendo vigora enquanto durar o contrato principal e o tratamento de dados."] },
    ],
  },

  cookies: {
    title: "Política de Cookies",
    intro:
      "Como usamos cookies e tecnologias semelhantes, conforme o Guia da ANPD.",
    sections: [
      { h: "1. O que são cookies", p: ["Pequenos arquivos guardados no seu navegador que permitem o funcionamento do site e, com seu consentimento, análises e personalização."] },
      { h: "2. Categorias que usamos", ul: ["Necessários — essenciais ao funcionamento (base: legítimo interesse).", "Análise/desempenho — nos ajudam a melhorar (base: consentimento).", "Marketing — comunicações e campanhas (base: consentimento)."] },
      { h: "3. Como gerenciar", p: ["No primeiro acesso, o banner permite aceitar, rejeitar os não essenciais ou escolher por categoria. Você pode alterar a escolha a qualquer momento limpando os dados do site ou pelo próprio banner."] },
      { h: "4. Cookies de terceiros", p: ["Alguns serviços (ex.: pagamentos, login social) podem definir cookies próprios, sujeitos às políticas deles."] },
      { h: "5. Contato", p: ["Dúvidas sobre cookies: privacidade@priatoo.com.br."] },
    ],
  },
};

const DOC_PATH = {
  privacy: "/privacidade",
  terms: "/termos",
  subscription: "/contrato",
  dpa: "/dpa",
  cookies: "/cookies",
};

const OTHER_LINKS = [
  { to: "/termos", label: "Termos de Uso" },
  { to: "/privacidade", label: "Privacidade" },
  { to: "/contrato", label: "Contrato de Assinatura" },
  { to: "/dpa", label: "Tratamento de Dados (DPA)" },
  { to: "/cookies", label: "Cookies" },
];

export default function LegalPage({ doc }) {
  const data = LEGAL_DOCS[doc];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (data?.title) document.title = `${data.title} · Priatoo`;
  }, [data]);

  if (!data) return null;

  return (
    <div className="min-h-screen" style={{ background: "#fafaf8" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "#f0ece8", background: "white" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-[5%] py-4">
          <Link to="/" className="text-lg font-extrabold tracking-tight" style={{ color: "#1a0e0d" }}>
            priatoo
          </Link>
          <Link to="/" className="text-sm font-medium transition hover:underline" style={{ color: "#A52A2A" }}>
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-[5%] py-12 md:py-16">
        {/* Aviso de minuta */}

        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#A52A2A" }}>
          Documento legal
        </p>
        <h1
          className="mt-2 text-3xl font-extrabold sm:text-4xl"
          style={{ color: "#1a0e0d", letterSpacing: "-0.02em", fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif" }}
        >
          {data.title}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#9ca3af" }}>
          Versão {VERSION} · Última atualização {UPDATED}
        </p>

        <div className="mt-6 rounded-3xl bg-white p-7 shadow-sm md:p-10" style={{ border: "1px solid #f0ece8" }}>
          {data.intro && (
            <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
              {data.intro}
            </p>
          )}

          <div className="mt-6 space-y-7">
            {data.sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-lg font-bold" style={{ color: "#1a0e0d" }}>
                  {s.h}
                </h2>
                {(s.p || []).map((para, i) => (
                  <p key={i} className="mt-2 text-sm leading-relaxed" style={{ color: "#4b5563" }}>
                    {para}
                  </p>
                ))}
                {s.ul && (
                  <ul className="mt-2 space-y-1.5">
                    {s.ul.map((li, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#4b5563" }}>
                        <span style={{ color: "#FF7F27" }}>•</span>
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>

        {/* Outros documentos */}
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9ca3af" }}>
            Outros documentos
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {OTHER_LINKS.filter((l) => l.to !== DOC_PATH[doc]).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white"
                style={{ border: "1px solid #e5e0dc", color: "#1a0e0d" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
