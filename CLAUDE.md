# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build (TypeScript errors are intentionally ignored — see next.config.mjs)
npm run lint      # ESLint
npm run start     # Start production server
```

No test runner is configured in package.json scripts despite README mentioning Jest/Playwright.

## Architecture Overview

This is a multi-tenant **IT Retail Management SaaS** built with Next.js 16 App Router. One Supabase project backs all tenants; Row-Level Security (RLS) policies enforce tenant isolation at the database level.

### Data layer

- **Supabase PostgreSQL** — no ORM. Queries are written directly with `supabase-js` v2.
- Four Supabase client entry points:
  - `lib/supabase/client.ts` — browser (client components)
  - `lib/supabase/server.ts` — server components & API routes
  - `lib/supabase/proxy.ts` — middleware only
  - `lib/supabase/admin.ts` — admin operations that bypass RLS
- Migrations live in `supabase/migrations/` as plain SQL files.

### Authentication & authorization

- Supabase Auth with email/password. Sessions are stored in HTTP-only cookies and refreshed by `middleware.ts` on every request.
- `lib/auth.ts` is the single source of truth for auth helpers: `getCurrentUser()`, `isSuperAdmin()`, `hasShopAccess()`, `getShopMemberRole()`.
- Super-admin is determined by the `ADMIN_EMAILS` environment variable, not a database role.
- Four roles: `super_admin`, `shop_owner`, `manager`, `staff`.

### Request handling split

| Layer | Location | Use for |
|---|---|---|
| Server Actions | `actions/*.ts` | Form mutations, data writes |
| API Routes | `app/api/` | Webhooks, third-party callbacks, image processing, push notifications |
| Custom hooks | `hooks/use-*.ts` | Client-side data fetching and state |

### Key external integrations

- **BKash** — payment gateway (`lib/bkash.ts`, `app/api/bkash/`, `hooks/use-bkash-payment.ts`)
- **Google Gemini** — AI features via `@google/generative-ai` (CV builder, photo enhancement, extension API)
- **Resend** — transactional email (`lib/resend.ts`, `lib/email-templates.ts`)
- **Vercel Blob** — file storage (`lib/upload.ts`)
- **Web Push** — push notifications (`lib/push-notifications.ts`, `app/api/push/`)
- **Browser Extension** — dedicated API surface under `app/api/extension/`

### UI system

- **shadcn/ui** "new-york" style with Tailwind CSS v4 (OKLch color space, CSS variables for theming).
- All primitive components are in `components/ui/` — edit these only when changing design tokens or fixing bugs.
- `components.json` configures shadcn aliases (`@/components`, `@/lib/utils`, etc.).
- Icons: `lucide-react`.

### Multi-shop tenancy

- A user can own or be a member of multiple shops.
- `lib/get-user-shop.ts` resolves the active shop from session/context.
- `lib/subscription-context.tsx` + `lib/subscription-limits.ts` enforce per-shop feature limits.
- The `dashboard/shop/` subtree contains all shop-specific pages and `components/dashboard/shop/` has the matching components.

### Important configuration notes

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true`. Do not remove these without checking the entire codebase for type errors first.
- Server Actions body size limit is 50 MB (needed for image upload features).
- `patch-cropper-2.js` runs on `postinstall` to patch `react-easy-crop` — do not remove without testing the photo editor.
