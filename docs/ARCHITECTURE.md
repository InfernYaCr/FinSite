# FinSite architecture

> Related docs: [Deployment](./DEPLOYMENT.md) · [Data import](./DATA_IMPORT.md) · [AI hand-off guide](./AI_HANDOFF.md) · [Project README](../README.md)

## Purpose and product vision

FinSite is a finance-comparison experience that helps visitors evaluate short-term loans offered by Russian microfinance organizations (МФО) and banks. The web application delivers:

- Search and comparison workflows for loan offers, complete with rate, amount, and term filters.
- Detail views per organization and per offer, with dynamically generated loan calculators and review summaries.
- Outbound click tracking so that partner redirects can be measured and reconciled with affiliate networks.
- SEO-first rendering that keeps server-side response latency low while emitting structured data for search engines.

Although the current data set is generated deterministically with in-memory helpers, the full stack is wired for a real PostgreSQL database through Prisma, making it ready for live data ingestion once the importer described in [Data import](./DATA_IMPORT.md) is enabled.

## Technical stack at a glance

| Area | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 14 App Router | Server Components by default, nested layouts, route handlers under `app/` |
| Language | TypeScript (strict) | Type-safe utilities, Prisma schema, component props |
| UI | Tailwind CSS + shadcn/ui primitives | Shared UI tokens in `tailwind.config.js`, reusable atoms in `components/ui` |
| Styling | CSS Modules via Tailwind + global CSS | Global entry `app/globals.css`; dark-mode ready tokens |
| Data | Prisma ORM + PostgreSQL | Prisma Client in `src/lib/prisma.ts`, migrations under `prisma/migrations` |
| Mock data | Deterministic generators | `src/lib/loans.ts` and `src/lib/reviews.ts` power demo state |
| Rendering | SSR by default, ISR-ready | Home/collection pages render on the server, route handlers support revalidation hooks |
| Analytics | Prisma-backed click tracking + structured logs | `/go/[offerId]` writes to `ClickTracking` and emits structured JSON logs |
| Testing | Vitest | Lightweight unit tests for utilities (see `tests/`) |

The project targets Node.js 20+ (see `.nvmrc`) and embraces ESM. ESLint + Prettier enforce formatting and linting before commits through Husky hooks.

## Application structure

```
app/
├── layout.tsx          # Root layout with metadata + organization JSON-LD
├── page.tsx            # Landing page with hero, calculator and featured offers
├── loans/              # Loan catalog (list) and detail routes
│   ├── page.tsx
│   └── [slug]/page.tsx
├── organizations/      # Organization-specific landing pages
│   └── [slug]/page.tsx
└── go/[offerId]/route.ts  # Server-side redirect & click tracking API
components/
├── Nav.tsx, Footer.tsx  # Shell components shared across pages
├── layout/              # Sidebar widgets and layout-scoped UI
├── loans/               # Domain-specific components (filters, cards, calculators)
└── ui/                  # shadcn-style reusable primitives and barrel export
src/
└── lib/
    ├── loans.ts         # Deterministic offer generator + query helpers
    ├── loan-query.ts    # URL ↔ filter parser and serializer
    ├── prisma.ts        # Prisma client singleton with structured logging
    ├── reviews.ts       # Deterministic user review generator
    └── seo.ts           # Metadata + JSON-LD builders and canonical URL helpers
prisma/
├── schema.prisma        # Source of truth for the relational model
└── migrations/          # Migrate history; `20251021000000_init` seeds base schema
```

`components/ui/README.md` documents the design system surface area. Global Tailwind tokens live in `tailwind.config.js` and feed both the application shell and shadcn primitives. Utility functions such as `slugify` and arithmetic helpers live under `src/lib/utils.ts` and `src/lib/sum.ts`, with accompanying tests in `tests/sum.test.ts`.

## Rendering and data flow

1. **Server-rendered pages** (`app/page.tsx`, `app/loans/page.tsx`, `app/organizations/[slug]/page.tsx`) compose domain components, call deterministic helpers like `generateOffers`, and render JSON-LD through the shared `<JsonLd />` wrapper. When those helpers transition to real Prisma queries, the surrounding code already expects asynchronous operations and can pivot to `async` data fetching.
2. **Client islands** are carefully scoped: loan calculators and filter controls render as client components while the surrounding layout remains on the server for optimal TTFB.
3. **API-style route handlers** under `app/go/[offerId]/route.ts` run on the Edge/Node runtime, validate inbound params, persist a `ClickTracking` row via Prisma, emit JSON logs, and return a redirect to the partner URL. This is our primary tracking endpoint.
4. **Static assets** (favicons, OG images) can be added under `public/`. SEO metadata uses `siteConfig` values so that both server and client references stay in sync with environment variables.

Because the home and listing pages can remain cached between revalidations, we treat them as ISR-ready. Any future Prisma-backed data fetching can opt into incremental static regeneration via `revalidateTag()` or route revalidation endpoints—see [Deployment](./DEPLOYMENT.md#on-demand-revalidation--isr) for operational notes.

## Data model overview

### Entity relationships

```
City 1 --- * Organization 1 --- * Offer * --- * Tag
                         |                  \
                         |                   * --- * Review
                         |\
                         | * --- * ClickTracking (per offer interaction)
```

- An **Organization** belongs to an optional **City** and owns many **Offers**.
- An **Offer** can target a **City**, reference many **Tags**, gather many **Reviews**, and owns many **ClickTracking** rows.
- **Tags** describe offers (e.g., "без справок"), while **Reviews** capture qualitative feedback.
- **ClickTracking** records every outbound redirect (UTM + request metadata) for analytics reconciliation.

### Prisma excerpts

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  description String?
  website     String?
  cityId      String?
  city        City?    @relation(fields: [cityId], references: [id], onDelete: SetNull)
  offers      Offer[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Offer {
  id             String       @id @default(cuid())
  title          String
  description    String?
  status         OfferStatus  @default(PUBLISHED)
  type           OfferType    @default(DEAL)
  url            String?
  startsAt       DateTime?
  endsAt         DateTime?
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  cityId         String?
  city           City?        @relation(fields: [cityId], references: [id], onDelete: SetNull)
  tags           Tag[]
  reviews        Review[]
  clicks         ClickTracking[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model Review {
  id        String        @id @default(cuid())
  rating    ReviewRating
  title     String?
  comment   String?
  offerId   String
  offer     Offer         @relation(fields: [offerId], references: [id], onDelete: Cascade)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model City {
  id          String   @id @default(cuid())
  name        String
  state       String?
  countryCode String
  slug        String   @unique
  organizations  Organization[]
  offers         Offer[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Tag {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  offers      Offer[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ClickTracking {
  id          String    @id @default(cuid())
  offerId     String
  offer       Offer     @relation(fields: [offerId], references: [id], onDelete: Cascade)
  type        ClickType @default(CLICK)
  userAgent   String?
  referrer    String?
  ipAddress   String?
  utmSource   String?
  utmMedium   String?
  utmCampaign String?
  createdAt   DateTime  @default(now())
}
```

For importer-specific storage (idempotency checkpoints, dry-run summaries), see the recommended `ImportLog` model in [Data import](./DATA_IMPORT.md#importlog-schema).

## SEO and performance strategy

- **Metadata orchestration** lives in `src/lib/seo.ts`, exposing helpers (`buildPageMetadata`, `absoluteUrl`, `loanFinancialProductJsonLd`, etc.) that every page consumes. This keeps canonical URLs, OpenGraph cards, and Twitter metadata synchronized.
- **Sitemap & robots**: `app/sitemap.ts` generates a dynamically dated XML sitemap, while `app/robots.ts` allows everything except `/go/` tracking endpoints and references the sitemap URL built from environment configuration.
- **Structured data**: JSON-LD snippets are embedded through `<JsonLd />` in every major page so that search engines understand loans, organizations, breadcrumbs, and reviews.
- **Performance budgets**: Layouts avoid unnecessary client bundles. Dynamic imports (`dynamic(..., { ssr: false })`) scope the calculator to the client while the rest of the page stays server-rendered. Tailwind and shadcn components remain tree-shakable.
- **Caching targets**: Aim for LCP < 2.5s on core pages. Avoid blocking third-party scripts; affiliate redirect logic happens server-side via `/go/[offerId]`, keeping the client lean.

## Observability, logging, and analytics

- **Structured logs**: Prisma emits `error`/`warn` events that are serialized as JSON (see `src/lib/prisma.ts`). The `/go/[offerId]` handler writes JSON log lines for every click, enabling ingestion by tools like ELK or Datadog.
- **Database analytics**: Every redirect persists a `ClickTracking` row with UTM parameters, user agent, IP guess, and deduplicated affiliate identifiers. Use this table downstream for funnel analysis.
- **Metrics hooks**: Add application-level metrics (e.g., Prometheus counters) around the same handler when moving to production. For Next.js edge instrumentation, drop a `instrumentation.ts` file at the repo root to wire custom spans.
- **Error surfacing**: HTTP exceptions are normalized as JSON with status codes (400, 404, 500) so API consumers and log parsers can react programmatically.

## Next steps

1. Replace deterministic generators with real Prisma queries once the data importer populates the database.
2. Add background revalidation via post-import webhooks—trigger `unstable_revalidatePath('/loans')` once new offers land.
3. Propagate structured logs to a centralized collector and annotate them with deployment metadata (see [Deployment](./DEPLOYMENT.md#observability-and-logging)).

This architecture document should be the starting point for onboarding; follow the links above to dive into operational playbooks and contributor guidance.
