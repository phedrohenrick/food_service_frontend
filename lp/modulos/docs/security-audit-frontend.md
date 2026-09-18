# Auditoria de Segurança — Frontend (Priatoo SPA)

- **Data:** 2026-09-18
- **Escopo:** apenas client-side — `lp/modulos/src` (apps `landing`, `customer-app`, `restaurant-dashboard-v2`, `onboarding`; compartilhado em `shared/`). CRA (sem TypeScript).
- **Método:** agente `security-auditor` (read-only: Read/Grep/Glob) + verificação manual dos pontos-chave. A autorização é assumida como **enforçada no backend**; os achados abaixo tratam do que o **cliente** vaza, manuseia mal ou confia indevidamente.
- **Nota:** projeto de estudo — o relatório serve tanto pra corrigir quanto pra aprender os fundamentos (armazenamento de token, `postMessage`/origin, CSP, XSS surface).

> ✅ Confirmado: **não há** `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` nem `document.write` em todo o `lp/modulos/src` — a superfície de DOM-XSS é genuinamente mínima.

---

## Prioridade sugerida
1. Tirar o JWT do `localStorage` (ou publicar um CSP estrito) — **#1**.
2. Travar origens do `postMessage` nos dois lados — **#2**.
3. Remover logs de debug (pedido/e-mail/credenciais) do build de produção — **#3**.
4. Remover o fallback de PII de lead em `localStorage` — **#4**.
5. Confirmar que o backend enforce os entitlements independente da UI — **#5**.

---

## Achados (por severidade)

### #1 — JWT em `localStorage` (risco de exfiltração via XSS) — 🔴 Alto
- **Onde:** `shared/auth/keycloak.js:111` (`persistToken` → `localStorage.setItem('authToken', ...)`); leitura em `shared/services/api.js:52` e `:64`.
- **Problema:** o access token do Keycloak fica no `localStorage`, legível por qualquer JS da origem. Anula a proteção padrão do `keycloak-js`, que mantém o token **em memória**.
- **Impacto:** qualquer XSS (ou um único script/dependência de terceiro comprometido na origem) lê `localStorage.authToken` e exfiltra um bearer válido → impersonação total da conta/loja até expirar.
- **Mitigação atual:** superfície de XSS pequena hoje (sem innerHTML etc.; o único `<style>` dinâmico é sanitizado — ver #6). É **defesa em profundidade**, mas continua Alto porque token é o alvo de maior valor e está "a um XSS de distância".
- **Correção:** usar `keycloak.token` em memória (passar um getter para o `ApiService` em vez de ler `localStorage`); ou migrar para cookie **HttpOnly + SameSite** via BFF. Se mantiver `localStorage` por continuidade entre abas/reload, publicar **CSP estrito** (`script-src` sem `unsafe-inline`) pra reduzir o caminho de exfiltração.

### #2 — `postMessage` com origin curinga `'*'` e listeners sem validar `event.origin` — 🟡 Médio
- **Onde (lojista):** `apps/restaurant-dashboard-v2/src/components/BrandPreviewPhone.jsx:50` (`win.postMessage({...}, '*')`) e listener em `:61-67` (sem checar origin/source).
- **Onde (cliente):** `apps/customer-app/CustomerApp.jsx:58` (`window.parent?.postMessage({ type: 'priatoo-preview-ready' }, '*')`) e listener em `:51-57` (sem checar origin).
- **Problema:** mensagens saem para `'*'` e os handlers agem sobre qualquer remetente. O app do cliente é embutível em iframe por qualquer site (sem restrição de framing observada).
- **Impacto (hoje baixo):** só trafega cor de destaque (`priatoo-preview-accent`) e um sinal `priatoo-preview-ready` — sem token/PII. Um parent malicioso consegue spoofar "ready" ou injetar cor (UI spoofing), não roubar dados. **Mas o padrão é frágil**: se algum dia uma mensagem carregar dados do tenant/token, vaza para `'*'`.
- **Correção:** trocar `'*'` pela origem exata (`window.location.origin` — o preview é same-origin `/${slug}/app`); em **todo** handler `message`, validar `event.origin === window.location.origin` (idealmente também `event.source === iframe.contentWindow`) antes de agir. Adicionar `sandbox`/`frame-ancestors` (CSP) pra o app do cliente não ser enquadrado por sites arbitrários.

### #3 — Logs de debug de pedido/e-mail/credenciais no build — 🟢 Baixo
- **Onde:** `shared/generalContext.jsx:1675` — `console.log('Place Order Payload:', payload)` (loga `tenantId`, `userId`, `addressId`, totais, canal de pagamento e itens a cada checkout). Formulários de newsletter logam o e-mail: `.../footer-01.jsx:20` (`console.log({ email })`). Stubs de login logam o form: `pages/login/index.js:14` (`console.log('Login attempt:', formData)`) e `features/auth/{MerchantLogin,CustomerLogin,DeliveryLogin}.jsx`.
- **Problema:** o build de produção envia esses logs. Expõem identificadores (IDs, e-mails, conteúdo de pedido) no console e em telemetria que capture console.
- **Impacto:** shoulder-surfing / captura em sessão de suporte / scraping de console pega dados de cliente. **Nenhum segredo/token é logado** (verificado — nenhum `console.*` imprime `authToken`/`token`).
- **Correção:** remover esses `console.log`/debug (ou colocá-los atrás de `process.env.NODE_ENV !== 'production'`). O `login/index.js:14` loga credenciais cruas → **remover**.

### #4 — PII de lead salva em `localStorage` em texto puro — 🟢 Baixo
- **Onde:** `apps/landing/src/pages/início/components/LeadPopup.jsx:134-137` e `PreCadastroSection.jsx:176` — sem `REACT_APP_LEAD_ENDPOINT`/`REACT_APP_GOOGLE_FORM_ACTION` configurado, o lead (nome, e-mail, telefone, dados do negócio) é anexado em `localStorage["fs-pre-cadastros"]`.
- **Problema:** PII persiste no cliente **indefinidamente**, sem expiração, legível por qualquer script da origem, e nunca é limpa. Além disso o dado fica "perdido" (não é enviado a lugar nenhum) — lacuna de tratamento de dados (LGPD).
- **Correção:** remover o fallback de `localStorage` (falhar visivelmente); ou garantir que os env de endpoint estejam **sempre** configurados em produção (branch morto). Se precisar de fallback, não persistir PII em `localStorage`.

### #5 — Gating de entitlement é só de UI e "falha aberto" enquanto carrega — 🟢 Baixo (informativo)
- **Onde:** `apps/restaurant-dashboard-v2/src/pages/Orders.jsx:412-413` (`ordersAllowed = !entitlementsLoaded || canUseFeature('online_orders')`); mesmo padrão em `Metricas.jsx:412-414` e `Mesas.jsx:152-153`. `canUseFeature` em `shared/generalContext.jsx:1223`.
- **Problema:** o bloqueio é **cosmético** e deliberadamente **falha aberto** antes de carregar os entitlements. Dá pra burlar por devtools/estado React ou chamando a API direto.
- **Impacto:** nenhum **se** o backend enforca entitlement por request. Se o backend confiar no cliente pra se autolimitar, é bypass de recurso pago.
- **Correção:** tratar a UI como apresentação; **confirmar que o backend enforca** cada entitlement nos endpoints correspondentes (`/orders`, métricas, mesas). Sem mudança no cliente além de consciência.

### #6 — Cor do tenant injetada em `<style>` — ✔️ Verificado SEGURO
- **Onde:** `apps/customer-app/CustomerApp.jsx:123-131` interpola `previewAccent.*` num `<style>` inline, vindo de `postMessage` (#2).
- **Por que é seguro:** o valor passa por `resolveAccent` → `normalizeHex` (`shared/utils/accentColor.js:3-18`), que só retorna hex estrito `#[0-9a-fA-F]{3,8}` ou o default; sem como injetar `}`, `<` ou escapes CSS. **Sem ação** — a menos que `normalizeHex` seja afrouxado.

---

## Avaliado e NÃO é problema (mitigado)

- **Open redirect via `loginWithRedirect`:** todo caller monta `redirectUri` a partir de `window.location.origin`/`href`, nunca de query param controlável (`keycloak.js:191-216`, `Bag.jsx:240/301`, `Orders.jsx:104`, `Addresses.jsx:116`, navbars, `PricingCardsSection.jsx:389`). O Keycloak ainda valida `redirect_uri` contra as URIs registradas. **Baixo/sem risco.**
- **Handler de 401 / refresh:** `api.js:61-70` faz refresh e retry **uma vez**; `:78-79` só limpa `authToken` quando a request de fato levava `Authorization` (não em GET público); sem `loginWithRedirect` automático no 401. O `setInterval` de 20s (`keycloak.js:127-137`) é limitado e engole erros. **Sem loop.**
- **`Authorization`/`X-Tenant-Slug`:** token corretamente **omitido** em GET público (`api.js:45-56`) e anexado no resto; `X-Tenant-Slug` pulado para `/tenants/by-slug/*` (`api.js:38-43`). O slug é controlável pelo cliente (vem da URL/localStorage) — **esperado**; cabe ao backend amarrar o tenant do token ao tenant pedido (mesma classe do gap cross-tenant/IDOR do backend; nada que o cliente resolva).
- **Upload presigned (`api.js:133-159`):** o único caller (`R2ImageUpload.jsx:167-184`) reencoda tudo pra `image/webp` via canvas → `Content-Type` fixo e seguro (sem smuggling de HTML/SVG). Backend ainda deve validar `contentType`/`size`.
- **`REACT_APP_*` no bundle:** `KC_URL/REALM/CLIENT_ID/MERCHANT_CLIENT_ID` (`keycloak.js:4-8`), `API_URL` (`api.js:2`), `LEAD_ENDPOINT`/`GOOGLE_FORM_ACTION` — todos **públicos por design** (config de OIDC public client + endpoints públicos). **Nenhum é segredo.** Só nunca colocar um segredo real num `REACT_APP_*` (o CRA inlina no bundle).

---

## Já está bem feito
- Sem `dangerouslySetInnerHTML`/`innerHTML`/`eval`/`document.write` — superfície DOM-XSS mínima.
- **PKCE** (`S256`) e `checkLoginIframe: false` consistentes (`keycloak.js:151, 201, 230`).
- Params de callback (`code`, `session_state`, `state`, `iss`) removidos da URL após processar (`keycloak.js:94-107`) — evita replay/loop.
- GET público omite o bearer; 401 só invalida sessão quando havia token (`api.js:45-56, 78-79`) — evita deslogar por soluço do backend.
- O único valor de tenant que chega a um `<style>` é validado como hex estrito (`accentColor.js`).
- Logout limpa `authToken` antes de redirecionar (`DashboardLayout.jsx:163-166`).

---

## Próximo passo
Rodar a mesma auditoria no **backend** (Spring Boot) — foco no que já está mapeado: **autorização multi-tenant / IDOR** (amarrar tenant do token ↔ tenant pedido), enforcement de **entitlements por endpoint** (ver #5), segredos e o fluxo Keycloak/Stripe. (Instalar o `security-auditor` também no repo do backend.)
