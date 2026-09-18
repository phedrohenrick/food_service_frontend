# IMPROVEMENTS — Frontend (Priatoo SPA)

> Melhorias/roadmap do client (React CRA em `lp/modulos/src`). Complementa a auditoria em
> [`security-audit-frontend.md`](./security-audit-frontend.md). Projeto de estudo — as notas
> explicam também o **porquê** de cada escolha.

---

## 🔐 Auth: proteção do token no cliente + BFF (cookie HttpOnly)

> Contexto: achado **#1 (Alto)** da auditoria (`security-audit-frontend.md`). O JWT do Keycloak é
> persistido em `localStorage` (`shared/auth/keycloak.js:111`, lido em `shared/services/api.js:52/64`),
> legível por qualquer JS da origem → **exfiltrável por XSS ou dependência comprometida** (token
> "ao portador": quem tem a string, é você). Hoje mitigado pela superfície XSS mínima (sem
> `dangerouslySetInnerHTML`/`eval`), mas é defesa-em-profundidade.

### Quick wins (baratos, fazer primeiro)
1. **Token em memória** em vez de `localStorage`: expor `getToken()` no `keycloak.js` (retorna
   `keycloak.token`), o `api.js` lê dali, e **parar de gravar** no `localStorage`.
   - Trade-off: some no reload → re-hidrata via `check-sso`/`ensureSso` (login silencioso pelo
     cookie do Keycloak em `auth.priatoo.com.br`).
   - Efeito cascata: trocar os pontos que usam `localStorage.authToken` como **flag de login**
     (`generalContext.jsx:855/1337`, `PricingCardsSection.jsx:361`, `Bag.jsx`, `Orders.jsx`,
     `Addresses.jsx`) por `getToken()`/`getKeycloak().authenticated`.
2. **CSP** — na **Vercel** (via `vercel.json` `headers`; a SPA é servida lá, não no nginx).
   Começar em `Content-Security-Policy-Report-Only`, observar violações, depois trocar pro header
   que bloqueia. Diretivas-chave:
   - `script-src 'self'` (sem `unsafe-inline`) → **mata `<script>` inline injetado e `onerror=`** (o vetor de roubo do token).
   - `connect-src 'self' https://api.priatoo.com.br https://auth.priatoo.com.br` → bloqueia o `fetch` de exfiltração pro atacante.
   - `frame-ancestors 'self'` → casa com o achado **#2** (postMessage / anti-embed).
   - `style-src 'self' 'unsafe-inline'` → necessário (CRA/Tailwind e `style={{}}`/`<style>` inline).
   - `img-src 'self' data: https:`, `object-src 'none'`, `base-uri 'self'`.
3. **Higiene de dependências** (o vetor mais realista) — auditar/lockar; o CSP reduz o dano de um pacote comprometido.

> Entrega ~80% da proteção por ~20% do custo, **sem reescrever auth**.

### Alternativa forte: BFF (Backend-for-Frontend) com cookie HttpOnly
O **servidor** passa a fazer o OAuth e guardar os tokens; o navegador recebe só um **cookie de
sessão `HttpOnly; Secure; SameSite`** → **o JS nunca vê o token** (XSS não tem o que roubar).

```
Navegador (SPA)  ──cookie HttpOnly──►  BFF (servidor)  ──Bearer token──►  API / Keycloak
     │ não vê token                       │ guarda tokens na sessão + renova
```

**Como — 2 caminhos:**
- **A) O Spring Boot vira o BFF** (mais natural — hoje é só *resource server*): `spring-boot-starter-oauth2-client`
  + `oauth2Login` (code + PKCE, tokens na `HttpSession`), cookie de sessão HttpOnly, e **token relay**
  (Spring Cloud Gateway `TokenRelay` ou filtro). A SPA chama o BFF com `fetch(..., { credentials:'include' })`
  e **cai fora todo o keycloak-js do front** (`initKeycloak`, `ensureSso`, `loginWithRedirect`,
  `tryRefreshToken`) e o `Authorization: Bearer` do `api.js` (o cookie vai sozinho).
- **B) BFF dedicado** — Spring Cloud Gateway (`TokenRelay`) ou micro serviço Node na frente da API.

**Custo (o que pesa):**
| Frente | Muda | Peso |
|---|---|---|
| **Frontend** | remover keycloak-js; login/logout via BFF; `api.js` sem `Bearer`; `credentials:'include'`; trocar flags `localStorage.authToken` por um `/me` | Médio |
| Backend | virar OAuth2 client + sessão + token relay + renovação | Médio |
| **CSRF (custo escondido)** | Bearer-no-header **não** tem CSRF; **cookie auto-enviado reintroduz CSRF** → `SameSite` + **token CSRF** em POST/PUT/DELETE | Médio |
| Sessão | `HttpSession` não escala multi-instância → **Redis** | Médio |
| Cookies cross-subdomain | SPA `priatoo.com.br` (Vercel) × API `api.priatoo.com.br` (VPS): `Domain=.priatoo.com.br`, `SameSite=Lax`, CORS com `Allow-Credentials` + origem específica | Médio (config chata) |
| QA | auth é caminho crítico — regressão de todos os fluxos | Alto |

**Custo contínuo:** Redis pra sessões, tratamento de CSRF, mais peças móveis.
**Pré-requisitos:** Redis (sessão), config CSRF, CORS/cookie cross-subdomain (idealmente unificar origem via proxy).

### Recomendação / ordem
1. **Agora (barato):** token em memória + CSP em `Report-Only` → enforce + higiene de dependências.
2. **Depois (clientes reais + PII/pagamento em escala):** migrar pro **BFF**.

**Fundamento:** todo modelo de auth é trade-off. *Bearer no header* = sem CSRF, mas token exposto
ao JS. *Cookie HttpOnly* = imune a roubo por JS, mas reintroduz CSRF e exige estado no servidor.
Escolhe-se **qual classe de ataque eliminar** e **qual complexidade pagar**.

---

## Outros itens do frontend
- Ver os demais achados da auditoria em [`security-audit-frontend.md`](./security-audit-frontend.md):
  #2 `postMessage` com `'*'` sem validar `event.origin`, #3 logs de debug no build, #4 PII de lead
  em `localStorage`, #5 gating de entitlement só na UI.
