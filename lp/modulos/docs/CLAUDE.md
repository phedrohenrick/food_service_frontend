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

All three are **lazy-loaded** in `src/App.js` via `React.lazy`. Root `StorefrontProvider` wraps everything.

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

---

## API Service — `src/shared/services/api.js`

Singleton `ApiService`. Methods: `get`, `post`, `put`, `patch`, `delete`.

**Auto-injected headers:**
- `X-Tenant-Slug` — from URL pathname or `localStorage.tenantSlug`
- `Authorization: Bearer <token>` — skipped for public GET endpoints

**Public endpoints** (no auth): `/tenants`, `/menu-items`, `/menu-categories`, `/options`, `/option-groups`, `/banners`, `/neighborhoods`

**Base URL:** `process.env.REACT_APP_API_URL` (default: `http://localhost:81`)

**Error behavior:** 401 → redirect to Keycloak login (customer app only).

---

## Authentication — `src/shared/auth/keycloak.js`

Two Keycloak clients:
- `frontend-web` → customers (`/:slug/app/*`)
- `restaurant-owner-portal` → merchants (`/:slug/dashboard/*`)

**Key functions:**
- `initKeycloak(onReady)` — `login-required`, used in protected routes
- `ensureSso()` — `check-sso`, used in public pages (optional auth)
- `loginWithRedirect(redirectUri)` — programmatic PKCE login
- Token auto-refreshed every 20s; stored in `localStorage.authToken`

**Login routes:** `/login`, `/login/lojista`, `/login/entregador`, `/login/cliente`, `/login/esqueci-senha`

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
REACT_APP_KC_REALM=food-service-realm
REACT_APP_KC_CLIENT_ID=frontend-web
REACT_APP_KC_MERCHANT_CLIENT_ID=restaurant-owner-portal
REACT_APP_GOOGLE_FORM_ACTION=<google-forms-url>
```

---

## Hard Rules

- **Read `generalContext.jsx` before touching state** — all actions and selectors live there.
- **Never bypass `useStorefront()`** — do not import context directly.
- **No new global state libraries** — context + useReducer is the pattern; keep it.
- **Shared UI components** go in `src/shared/components/ui/` and must be exported via `index.js`.
- **New pages** follow existing page folder pattern; add route in the app's own router file.
- **API calls** always go through `ApiService` — never raw `fetch` outside the service.
- **Auth gates** use `initKeycloak` (protected) or `ensureSso` (public) — never roll custom auth.
- **Do not add comments** unless the WHY is non-obvious. Never describe what code does.
- **Do not add error handling** for scenarios that cannot happen. Trust internal guarantees.
- **No half-finished features** — if you can't complete it, say so.
