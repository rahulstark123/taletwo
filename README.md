# TaleTwo

> Your little world, made for two.

TaleTwo is a private digital space for two partners: shared memories, notes, love letters, plans, a bucket list,
special days, daily questions and a shared calendar.

This repository is built milestone by milestone. See [Status](#status).

## Status

| Milestone | Scope | State |
| --- | --- | --- |
| 1. Foundation and Design | Next.js 16 app, design tokens, marketing site, private app shell, dashboard UI on development fixtures | **Done (this commit set)** |
| 2. Database and Authentication | Supabase Auth, Prisma schema and migrations, signup/login/verification, protected routes | Not started |
| 3. Couple Connection | Couple creation, invitations, acceptance, onboarding | Not started |
| 4. Core Modules | Dashboard data, memories, notes, love letters | Not started |
| 5. Planning Modules | Plans, bucket list, special days, daily questions, calendar | Not started |
| 6. Account and Monetization | Notifications, profile, settings, subscriptions, Razorpay webhooks | Not started |
| 7. Quality and Launch | Tests, responsive QA, performance, SEO, deployment | Not started |

Important: in Milestone 1 nothing is stored. The dashboard renders **development fixtures**
(`src/fixtures/dev-dashboard.ts`), `/app` is not yet protected by authentication, and the auth pages are placeholders
that accept no input.

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript
- Tailwind CSS v4 with CSS-variable design tokens (`src/app/globals.css`)
- shadcn/ui (Base UI primitives), Lucide React icons
- Fonts: Playfair Display (headings) and Inter (body), loaded with `next/font`
- Planned: Prisma ORM on Supabase PostgreSQL, Supabase Auth and Storage, React Hook Form and Zod, Zustand where needed

## Getting started

Requirements: Node.js 20.9 or newer (Next.js 16 minimum), npm.

```bash
npm install
cp .env.example .env.local   # optional in Milestone 1; required from Milestone 2
npm run dev                  # http://localhost:3000
```

Useful scripts:

```bash
npm run build   # production build (type-checks as part of the build)
npm run start   # serve the production build
npm run lint    # ESLint
npx tsc --noEmit
```

## Project structure

```
src/
  app/
    (marketing)/     public site: /, /features, /how-it-works, /pricing, /about, /contact, /privacy, /terms
    (auth)/          login, signup, forgot-password, verify-email (placeholders until Milestone 2)
    app/             private shell: /app dashboard, [module] placeholders for unbuilt sections
    layout.tsx       fonts, metadata, theme tokens
    sitemap.ts, robots.ts, not-found.tsx
  components/
    brand/           logo and wordmark
    marketing/       navbar, footer, landing sections, pricing table, legal layout
    layout/          app sidebar, top bar, mobile navigation, shared nav list
    dashboard/       dashboard hero and cards
    preview/         product frame and static dashboard preview for marketing pages
    shared/          page header, section card, empty state
    ui/              shadcn/ui primitives
  config/            site identity, pricing (configurable), navigation
  fixtures/          development-only sample data (clearly labelled)
  lib/               utils, timezone-aware dates, formatting
```

## Design system

- Colours are defined once as CSS variables in `src/app/globals.css` (`--tt-*`) and exposed to Tailwind as
  utilities such as `bg-surface`, `text-muted-foreground`, `bg-brand-primary`, `border-border`.
- Type scale: `.text-hero`, `.text-page-title`, `.text-section-title`, `.text-card-title`, `.text-eyebrow`.
- Radii: cards and modals `20px` (`rounded-card`, `rounded-modal`), buttons and inputs `12px`.
- Shadows: `shadow-soft`, `shadow-card`, `shadow-modal`.
- The dark palette is defined under `.dark`. A user-facing theme toggle is part of Milestone 6.

## Pricing

Launch prices live in `src/config/pricing.ts` (minor units, paise for INR). One Premium subscription covers both
connected partners. From Milestone 6 these records move to the database (`SubscriptionPlan`); the config file becomes
the seed and fallback.

## Known limitations (Milestone 1)

- No database, no authentication, no storage. Every value on `/app` is a fixture.
- Login, sign-up and related pages are placeholders; the navigation links to them work but no account is created.
- Contact email (`src/config/site.ts`) is a placeholder address.
- Legal pages are draft placeholders and have **not** been reviewed by counsel.
- Contrast: the brand secondary text (`#8C857E`) on the `#FAF7F2` background measures about 3.4:1, which is below the
  WCAG AA 4.5:1 target for body text. It is used for supporting text only; it needs a design decision before launch.
  Primary buttons use dark text (`#211F20`) on the `#C97E8B` fill because white text on that fill measures about 3:1.

## Security notes

- Never commit `.env.local` or real keys. `.env*` is git-ignored except `.env.example`.
- `SUPABASE_SERVICE_ROLE_KEY` and all `RAZORPAY_*` secrets are server-only.
- Prisma will run on the server only; the Supabase JS SDK is limited to Auth and Storage.
