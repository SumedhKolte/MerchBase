# MerchBase — Product Admin Dashboard

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Axios · [DummyJSON](https://dummyjson.com).
No data-fetching, table, or pagination libraries: all state logic is custom hooks.

```bash
npm install
npm run dev                                    # http://localhost:3000  (emilys / emilyspass)
npm run format                                 # Prettier (printWidth 100)
NEXT_PUBLIC_API_DELAY_MS=2000 npm run dev      # add ?delay=2000 to every GET to demo race handling
```

## Architecture

| Concern                  | Where                                                                         | Notes                                                                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP                     | `services/api.ts`                                                             | One Axios instance. Request interceptor injects `Bearer` token; response interceptor purges the session on 401 and normalizes errors into `ApiError`.                                                   |
| Endpoints                | `services/productService.ts`, `services/authService.ts`                       | Typed functions; every GET accepts an `AbortSignal`. `listProducts` picks search / category / all.                                                                                                      |
| Session                  | `lib/session.ts` + `context/AuthContext.tsx`                                  | Token in a cookie (readable by `proxy.ts`), profile in `localStorage`, exposed through `useSyncExternalStore` (no hydration mismatch).                                                                  |
| Route guard              | `proxy.ts`                                                                    | Next 16 renamed `middleware.ts` → `proxy.ts`. Redirects `/products/**` → `/login?from=…` and `/login` → `/products`.                                                                                    |
| URL state                | `hooks/useProductParams.ts`                                                   | URL is the single source of truth. `parseProductParams` sanitizes (`?page=abc&limit=9999` → defaults) and the hook rewrites the URL to its canonical form.                                              |
| Fetching                 | `hooks/useProducts.ts`                                                        | AbortController per request (stale responses can't win); loading is _derived_ from a request key.                                                                                                       |
| Search                   | `components/products/SearchInput.tsx`                                         | 400 ms debounce, `/` to focus, `Esc` to clear. Search and category are mutually exclusive (DummyJSON limitation).                                                                                       |
| CRUD overlay             | `lib/overlay.ts` + `context/ProductOverlayContext.tsx`                        | `localAdded` / `localUpdated` / `localDeleted` layered over API responses, persisted to `sessionStorage`; "Reset demo changes" clears it.                                                               |
| Theming                  | `app/globals.css`, `lib/theme.ts`, `hooks/useTheme.ts`                        | Semantic color tokens (`bg-surface`, `text-fg-muted`, `border-line`, `bg-accent`) defined once per theme. Light / Dark / System toggle; an inline `<head>` script sets `.dark` before paint (no flash). |
| Layout preference        | `hooks/useViewMode.ts`                                                        | Table or grid on desktop, remembered in `localStorage` (a display preference, so not in the URL). Phones always get cards.                                                                              |
| Category navigation      | `components/products/CategoryNav.tsx`                                         | Sticky rail at `xl`+, scrollable pills below. Both write the URL `category` param (the dropdown was removed).                                                                                           |
| Selection & bulk actions | `hooks/useRowSelection.ts`, `components/products/BulkActionBar.tsx`           | Selection is scoped to the current table state, so paging or filtering starts fresh without a reset effect. Bulk export and bulk delete.                                                                |
| CSV export               | `lib/csv.ts`                                                                  | RFC 4180 quoting plus spreadsheet formula-injection guarding; downloaded client-side.                                                                                                                   |
| Shortcuts                | `hooks/useHotkey.ts`                                                          | `/` search · `Esc` clear/close · `N` new product · `?` help. Ignored while typing or when a dialog is open.                                                                                             |
| Pure logic               | `lib/pagination.ts`, `lib/validation.ts`, `lib/format.ts`, `lib/inventory.ts` | Framework-free and unit-testable.                                                                                                                                                                       |

## Browser automation note

Signing in with the demo account through the login **form** in branded Google Chrome triggers
Chrome's Password Manager breach warning ("Change your password — found in a data breach";
`emilyspass` is a public demo password). That dialog is **tab-modal**: it silently blocks all mouse
and keyboard input to the tab, survives reloads, and is invisible to the DOM and page screenshots —
so automated clicks appear to "not register". It is browser UI, not an app bug. For automated runs,
either use Playwright's bundled Chromium (no Google Password Manager), dismiss the dialog, or create
the session via `POST https://dummyjson.com/auth/login` and set the `mb_token` cookie plus the
`mb_user` localStorage entry directly.

# MerchBase
