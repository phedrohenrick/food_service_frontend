# CLAUDE.md — Priatoo Food Service Frontend

## Project Identity
**Priatoo** — multi-tenant food delivery SaaS.  
Stack: **React 19**, **React Router 6**, **Keycloak 23**, **Tailwind CSS + Relume UI preset**, no TypeScript.  
Build: Create React App (not Vite). Entry: `src/index.js` → `src/App.js`.

---

## Three Apps — One Repo

| App | URL prefix | Entry file | Purpose |
|-----|-----------|-----------|---------|
| **Landing** | `/` | `src/apps/landing/src/routes/index.jsx` | Public marketing + signups |
| **Customer** | `/:slug/app` | `src/apps/customer-app/CustomerApp.jsx` | Food ordering for end-users |
| **Dashboard** | `/:slug/dashboard` | `src/apps/restaurant-dashboard-v2/RestaurantDashboardApp.jsx` | Restaurant owner portal |
| **Garçom** | `/:slug/garcom` | `src/apps/garcom/GarcomApp.jsx` | Tablet UI for waiters (table management, no auth) |

All apps are **lazy-loaded** in `src/App.js` via `React.lazy`. Root `StorefrontProvider` wraps everything.

> The path `src/apps/customer-app/src/App.jsx` exists but is **not referenced** anywhere — the active entry is `customer-app/CustomerApp.jsx`. Don't edit the inner one expecting effects.

---

## Key File Map

```
src/
├── App.js                                         # Root router + lazy loaders (71 lines)
├── shared/
│   ├── generalContext.jsx                         # THE main state file (1970 lines) — read this first
│   ├── services/api.js                            # HTTP client singleton (127 lines)
│   ├── auth/keycloak.js                           # Keycloak OIDC (210 lines)
│   ├── hooks/
│   │   ├── useApi.js                              # Basic fetch hook
│   │   └── useLocalStorage.js                    # localStorage persistence
│   ├── components/ui/
│   │   ├── Button.jsx, Input.jsx, Modal.jsx, ImageUpload.jsx
│   │   └── index.js                              # barrel export
│   └── utils/
│       ├── formatters.js                         # formatCurrency, formatDate, formatPhone, formatCPF, formatCNPJ
│       └── validators.js                         # email, phone, CPF, CNPJ validators
├── features/auth/                                # Login pages (5 role-based routes)
├── onboarding/StartOnboarding.jsx                # /onboarding/start
└── apps/
    ├── landing/src/pages/                        # 9 pages (início, servicos, sobre-nos, contato, blog, etc.)
    ├── customer-app/src/pages/                   # Home, Product, Bag, Addresses, AddressForm, Orders, OrderDetails
    └── restaurant-dashboard-v2/src/pages/        # Dashboard, Orders, Menu, Settings, ProductEdit, FirstAccessWizard
```

---

## State Management — `StorefrontProvider`

Single `useReducer` context in `src/shared/generalContext.jsx`. **No Redux.**

**State shape:**
```js
{
  tenant, user,
  addresses, cart, cartItems, cartItemOptions,
  menuCategories, menuItems, optionGroups, options, banners,
  neighborhoods, orders, statuses, orderItems, orderItemOptions
}
```

**Key selectors (memoized):**
- `getMenuItemsByCategory(categoryId)` → filtered array
- `getOptionGroupsForItem(itemId)` → groups with nested options
- `getCartDetailedItems()` → cart items with calculated totals
- `getOrderDetailed(orderId)` → full order + timeline
- `cartTotals` → `{ subtotal, serviceFee, deliveryFee, total }`

**Async action creators (dispatch + API call):**
- Cart: `addToCart`, `updateCartItem`, `placeOrder`
- Address: `saveAddress`, `deleteAddress`
- Menu: `saveMenuItem`, `saveMenuCategory`, `saveOption`, `updateTenant`

Pattern: **optimistic dispatch → API call → revert on error.**

**Consumer hook:** `useStorefront()` — always use this, never use context directly.

> ⚠️ **Handlers from `useStorefront()` are NOT memoized.** Functions like `reloadOrders`, `setCartAddress`, `saveAddress` get a new reference every time the provider dispatches. Never put them in `useEffect` deps — that re-fires the effect on every state change, causing reload loops, racing API calls, and visible flicker (already seen in `Orders.jsx`, `Addresses.jsx`, `CustomerApp.jsx`). Pattern to use: stash in a `useRef` and call `ref.current()` inside the effect, with stable deps like `[isAuthenticated]` or `[]`. Add an `inFlight` guard if you also poll.

---

## API Service — `src/shared/services/api.js`

Singleton `ApiService`. Methods: `get`, `post`, `put`, `patch`, `delete`.

**Auto-injected headers:**
- `X-Tenant-Slug` — from URL pathname or `localStorage.tenantSlug`
- `Authorization: Bearer <token>` — skipped for public GET endpoints

**Public endpoints** (no auth): `/tenants`, `/menu-items`, `/menu-categories`, `/options`, `/option-groups`, `/banners`, `/neighborhoods`, `/tables`, `/tabs`

**Base URL:** `process.env.REACT_APP_API_URL` (default: `http://localhost:81`)

**401 recovery flow (customer-app only):**
1. Try `tryRefreshToken()` (which `await ensureSso()` if Keycloak isn't initialized yet, then `updateToken(0)`).
2. If a fresh token comes back, **retry the same request once** with the new `Authorization` header.
3. Only if refresh fails AND there are no callback params in URL AND no login in progress, fall back to `loginWithRedirect()` (silent, no `prompt`).
4. 403 is never auto-redirected — it means authenticated but unauthorized.

---

## Authentication — `src/shared/auth/keycloak.js`

Two Keycloak clients, resolved from URL by `resolveClientId`:
- `frontend-web` → customers (`/:slug/app/*`)
- `restaurant-owner-portal` → merchants (`/onboarding/*` and `/:slug/dashboard/*`)

**Key functions:**
- `initKeycloak(onReady)` — `login-required`, used in protected routes (Dashboard, Onboarding). Always forces login.
- `ensureSso()` — `check-sso`, used by the customer-app on mount. Dedup'd via internal `ssoPromise` so concurrent calls share a single init.
- `loginWithRedirect(redirectUri, { forcePrompt = false })` — programmatic PKCE login. **`prompt=login` is opt-in** via `forcePrompt: true` (default: silent SSO via Keycloak session cookie). Use `forcePrompt: true` only when you must force re-credentials (e.g., account switch).
- `tryRefreshToken()` — used by `api.js` on 401; calls `ensureSso` if needed, then `updateToken(0)`. Returns `true` if a fresh token is persisted.
- `isLoginInProgress()` — sessionStorage flag, 120s TTL, guards the 401-handler from looping during the redirect window.
- Refresh loop: `setInterval(updateToken(30), 20000)` — started on any successful auth, persists new tokens to `localStorage.authToken`.

**Operation order matters in `ensureSso`:** persist token → clear callback params → start refresh loop → clear login-in-progress flag. Don't reorder — if you clear `loginInProgress` before persisting, racing API calls hitting 401 in that window will trigger an auto-redirect loop.

**Login routes:** `/login`, `/login/lojista`, `/login/entregador`, `/login/cliente`, `/login/esqueci-senha`

**Customer auth on mount** (`CustomerApp.jsx`): `ensureSso()` once on mount (deps `[]`, NOT `[reloadOrders]`), then calls `reloadOrdersRef.current()` to fetch authenticated data. If you change this, expect the loop bug back.

---

## Brand & Design System

**Tailwind config** (`tailwind.config.js`):
```js
presets: ["@relume_io/relume-tailwind"]
colors:
  background.primary:       '#ffffff'
  background.hero:          '#EA1D2C'   // hero red — primary brand color
  background.orange:        '#FF7F27'   // accent orange
  background.priatoo_brown: '#502420'   // brand brown
  background.gray:          '#F5F5F5'
  border.primary:           '#aaaaaa'
zIndex.999: '999'           // modals/overlays
```

**Icons:** Lucide React only. **No** custom SVG unless in `public/assets/`.

**No CSS-in-JS.** Pure Tailwind utility classes. No `styled-components`, no CSS modules.

**Assets:** `public/assets/images/lp/` — logos, avatars, banners, `loading.mp4`.

**Anti-patterns to avoid:**
- Never use default Tailwind `indigo-*` or `blue-*` as primary. Use `background.hero` (#EA1D2C).
- Never `transition-all`. Animate only `transform` and `opacity`.
- Never `shadow-md` alone — use layered, tinted shadows.

---

## Multi-Tenant Rules

- Tenant slug lives in the **URL path**: `/:slug/app` or `/:slug/dashboard`
- API service auto-reads slug from `window.location.pathname`
- Fallback: `localStorage.tenantSlug`
- Never hardcode a slug. Always derive from URL or context.

---

## Data Normalization Convention

| Direction | Convention |
|-----------|-----------|
| Backend → Frontend | `camelCase` → `snake_case` |
| Frontend → Backend payload | `snake_case` → `camelCase` |

Normalization happens inside async action creators in `generalContext.jsx`.

---

## Route Summary

```
/                              Landing: HomePage
/servicos                      Landing: ServicesPage
/sobre-nos                     Landing: AboutPage
/contato                       Landing: ContactPage
/blog                          Landing: BlogPage
/blog/:slug                    Landing: BlogPostPage
/cadastro-entregadores         Landing: DeliverySignupPage
/cadastro-restaurantes         Landing: RestaurantSignupPage
/entrega-de-comida             Landing: FoodDeliveryPage

/login                         Auth: LoginLanding (role selector)
/login/lojista                 Auth: MerchantLogin
/login/entregador              Auth: DeliveryLogin
/login/cliente                 Auth: CustomerLogin
/login/esqueci-senha           Auth: ForgotPassword
/onboarding/start              Onboarding: StartOnboarding

/:slug/app/                    Customer: Home (storefront/menu)
/:slug/app/produto/:slug       Customer: ProductDetail
/:slug/app/sacola              Customer: Bag (cart)
/:slug/app/enderecos           Customer: AddressList
/:slug/app/enderecos/novo      Customer: AddressForm (create)
/:slug/app/enderecos/:id       Customer: AddressForm (edit)
/:slug/app/pedidos             Customer: OrderHistory
/:slug/app/pedidos/:id         Customer: OrderDetails

/:slug/dashboard/              Dashboard: Overview & stats
/:slug/dashboard/orders        Dashboard: Orders management
/:slug/dashboard/menu          Dashboard: Menu editor
/:slug/dashboard/settings      Dashboard: Store settings
```

---

## Dashboard: First Access Wizard

Located in `src/apps/restaurant-dashboard-v2/`. 12-step guided onboarding for new restaurant owners.
- Step progress persisted in `localStorage`
- Triggered when tenant is new/incomplete
- Rendered inside `RestaurantDashboardApp.jsx`

---

## Environment Variables

```
REACT_APP_API_URL=http://localhost:81
REACT_APP_KC_URL=http://localhost:8080
REACT_APP_KC_REALM=priatoo
REACT_APP_KC_CLIENT_ID=frontend-web
REACT_APP_KC_MERCHANT_CLIENT_ID=restaurant-owner-portal
REACT_APP_GOOGLE_FORM_ACTION=<google-forms-url>
```

---

## Domain Notes — recurring traps

### Delivery fee & neighborhood coverage
- `getDeliveryFeeForAddress` in `generalContext.jsx` looks up the address's `neighborhood_id` in `state.neighborhoods`. **Returns 0 silently** when there's no match (deleted bairro, free-text bairro never registered) — there's no "uncovered" sentinel value.
- `Neighborhood` carries a `status` field: `ACTIVE` (default, delivered to) or `REJECTED` (merchant explicitly said no). REJECTED bairros are kept in the same list (active=true), filtered by UI.
- `Bag.jsx` blocks checkout **only** when `selectedAddressCoverage.rejected === true` (status REJECTED). A bairro that simply isn't in the list lets the order through — the backend auto-creates an `UnrecognizedNeighborhood` entry the merchant sees in Settings.
- The merchant's "Não entrego aqui" button in `Settings.jsx` upserts a Neighborhood with status=REJECTED (via `/unrecognized-neighborhoods/{id}/reject`). "Reverter" clears it.
- `Settings.jsx` filters status=REJECTED out of the "Áreas atendidas" list; `AddressForm.jsx` filters them out of the autocomplete.

### Polling pattern (Orders page)
`Orders.jsx` polls `reloadOrders` every 10s. Two safeguards make it stable:
1. `reloadOrdersRef` — stable across renders, avoids effect re-firing on `reloadOrders` reference changes.
2. `inFlight` boolean inside the tick — prevents concurrent reloads. Without this, late responses from earlier polls can overwrite newer state and the UI flickers between the current and previous status.

Also: status pill is sourced from a local "sticky" `statusByOrder` map that only advances (never regresses) — a defense against stale responses arriving out of order.

### Address neighborhood matching
`AddressForm.jsx` matches typed bairro against the tenant's neighborhoods (filtered to non-REJECTED). If match → `neighborhoodId` set. If no match → `neighborhoodId: null` + free-text `neighborhoodName` → backend records as unrecognized. Don't try to "auto-create" a neighborhood at order time — the unrecognized queue is the explicit funnel for that.

### Garçom app
- Lives at `/:slug/garcom`, **no auth required** (tablet shared between staff).
- Public endpoints `/tables/**` and `/tabs/**` are open for read; `POST /tabs/open/**`, `POST /tabs/*/items`, `DELETE /tabs/*/items/*` are also unauthenticated by design — controlled by physical access to the tablet.

---

## Hard Rules

- **Read `generalContext.jsx` before touching state** — all actions and selectors live there.
- **Never bypass `useStorefront()`** — do not import context directly.
- **No new global state libraries** — context + useReducer is the pattern; keep it.
- **Shared UI components** go in `src/shared/components/ui/` and must be exported via `index.js`.
- **New pages** follow existing page folder pattern; add route in the app's own router file.
- **API calls** always go through `ApiService` — never raw `fetch` outside the service.
- **Auth gates** use `initKeycloak` (protected) or `ensureSso` (public) — never roll custom auth.
- **Never put `useStorefront()` handlers in `useEffect` deps** — see warning above. Use refs.
- **`loginWithRedirect` defaults to silent SSO.** Only pass `{ forcePrompt: true }` when an explicit account switch is required.
- **Do not add comments** unless the WHY is non-obvious. Never describe what code does.
- **Do not add error handling** for scenarios that cannot happen. Trust internal guarantees.
- **No half-finished features** — if you can't complete it, say so.
