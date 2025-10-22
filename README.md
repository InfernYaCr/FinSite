# FinSite

Next.js 14 (App Router) demo showcasing a fintech comparison experience in Russian. The project renders loan catalogs, organization detail pages, and affiliate redirects while maintaining strong SEO defaults and a reusable shadcn/ui design system.

## Quick start (local development)

```bash
npm install
npm run db:up            # start Postgres via Docker Compose
cp .env.example .env     # configure DATABASE_URL, SITE_URL, NEXT_PUBLIC_SITE_URL
npm run prisma:migrate:dev
npm run db:seed          # optional: load deterministic fixtures
npm run dev              # http://localhost:3000
```

Additional tips:

- `npm run db:down` stops the Dockerized database.
- Use `npm run db:reset` to wipe volumes and re-apply migrations + seeds.
- Prisma Studio: `npm run prisma:studio`.

## Documentation

The new docs folder centralizes onboarding and operational knowledge:

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) – system overview, data model, SEO strategy.
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) – local + Vercel + VPS runbooks, revalidation notes.
- [docs/DATA_IMPORT.md](./docs/DATA_IMPORT.md) – CSV formats, validation rules, importer workflow.
- [docs/AI_HANDOFF.md](./docs/AI_HANDOFF.md) – project passport, prompts, coding conventions.

Start with Architecture for context, then jump to Deployment or Data Import as needed.

## Pages & routes

| Route | Description |
| --- | --- |
| `/` | Homepage with hero, featured offers, and a client-side loan calculator. |
| `/loans` | Server-rendered loan catalog with filters, pagination, and JSON-LD output. |
| `/loans/[slug]` | Offer detail view with calculator, requirements tabs, reviews, and related offers. |
| `/organizations/[slug]` | Organization-specific landing page with aggregate stats and filtered offers. |
| `/go/[offerId]` | Route handler that validates the offer ID, persists a click record, and redirects to the partner URL. |
| `/sitemap.xml`, `/robots.txt` | Generated SEO endpoints wired to environment-configured canonical URLs. |

## Project structure

```
app/                # App Router entry points, layouts, metadata
components/         # Layout shell, domain-specific components, shadcn/ui primitives
src/lib/            # Deterministic data generators, Prisma client, SEO helpers
prisma/             # Prisma schema + migrations + seed script
scripts/            # (Reserved for CLI tools such as the CSV importer)
docs/               # Architecture, deployment, data import, and AI hand-off guides
```

Key environment variables (see `.env.example`):

- `DATABASE_URL` – PostgreSQL connection string used by Prisma.
- `SITE_URL` – Canonical server-side base URL for metadata helpers.
- `NEXT_PUBLIC_SITE_URL` – Client-facing base URL.

## Commands & scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js in development mode. |
| `npm run build` | `prisma generate` + `next build` for production bundles. |
| `npm run start` | Launch Next.js in production mode (after `npm run build`). |
| `npm run lint` | ESLint across the project. |
| `npm run typecheck` | TypeScript project check without emitting JS. |
| `npm run test` | Vitest unit tests (see `tests/`). |
| `npm run prisma:migrate:dev` | Apply migrations locally and regenerate the Prisma client. |
| `npm run prisma:migrate:deploy` | Apply migrations in production/CI. |
| `npm run db:seed` | Seed deterministic fixture data. |
| `npm run db:up` / `npm run db:down` | Manage the Dockerized Postgres instance. |

## Data model snapshot

Prisma models live in `prisma/schema.prisma`. Core entities:

- `Organization` ↔ optional `City` (many-to-one).
- `Offer` ↔ `Organization` (many-to-one) with many `Tag`, `Review`, and `ClickTracking` relations.
- `Tag` – categorizes offers for filtering and SEO.
- `Review` – captures borrower sentiment (deterministic demo data today).
- `ClickTracking` – persists affiliate click metadata from `/go/[offerId]`.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#data-model-overview) for full Prisma excerpts and ER description.

## Deployment overview

- Vercel-friendly: `vercel.json` locks the framework preset and commands.
- Docker Compose (`docker-compose.yml`) provisions Postgres for local and VPS scenarios.
- After deploying, run `npx prisma migrate deploy` and seed as needed.
- Use ISR or manual revalidation once real data flows through the importer (details in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)).

## Design system (shadcn/ui-inspired)

We ship a Tailwind-based design system inspired by shadcn/ui.

Highlights:

- Dark mode ready via the `.dark` class and CSS variables defined in `app/globals.css`.
- Tree-shakable primitives in `components/ui` with an opt-in barrel export (`components/ui/index.ts`).
- Shared tokens and breakpoints configured in `tailwind.config.js`.

Available primitives include `Button`, `Input`, `Select`, `Tabs`, `Card`, `Table`, `Badge`, `Pagination`, `Breadcrumbs`, `Dialog`, and `Sheet`. Usage examples live in `components/ui/README.md`.

## SEO & structured data

- `src/lib/seo.ts` centralizes metadata builders (`buildPageMetadata`, `absoluteUrl`, JSON-LD helpers).
- `app/sitemap.ts` and `app/robots.ts` generate site maps and robots rules from environment-configured base URLs.
- Each major page embeds JSON-LD via `components/seo/JsonLd.tsx`, covering organizations, loan products, breadcrumbs, and reviews.
- Set `SITE_URL`/`NEXT_PUBLIC_SITE_URL` to the canonical domain before deploying.

## Further reading

- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md#deployment-checklist) – production readiness checklist.
- [docs/DATA_IMPORT.md](./docs/DATA_IMPORT.md#csv-formats) – CSV contract for offers and organizations.
- [docs/AI_HANDOFF.md](./docs/AI_HANDOFF.md#prompt-templates-for-ai-contributors) – prompts for feature, bugfix, and importer tasks.

Happy shipping!
