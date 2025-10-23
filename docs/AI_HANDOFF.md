# AI hand-off & contributor guide

This document serves as the "project passport" for automated or human contributors who need to plan, execute, and validate FinSite changes quickly.

> Complementary references: [Architecture](./ARCHITECTURE.md) for structure, [Deployment](./DEPLOYMENT.md) for runbooks, and [Data import](./DATA_IMPORT.md) for catalog operations. The public overview lives in [README](../README.md).

## Project passport

- **Name**: FinSite – loan comparison portal for the Russian market.
- **Primary stack**: Next.js 14 (App Router) + TypeScript, Tailwind, shadcn/ui, Prisma ORM, PostgreSQL.
- **Rendering strategy**: Server Components by default, selectively hydrated client components (loan calculator, filters). Supports SSR and ISR.
- **Data layer**: Prisma models (`Organization`, `Offer`, `Review`, `City`, `Tag`, `ClickTracking`). Demo data generated via deterministic helpers until the CSV importer is rolled out.
- **Routing**:
  - `/` – Homepage with hero, featured offers, client-side calculator.
  - `/loans` – Server-rendered catalog with filters, pagination, JSON-LD.
  - `/loans/[slug]` – Offer detail view with tabs, related offers, reviews.
  - `/organizations/[slug]` – Organization overview + filtered offers.
  - `/go/[offerId]` – Route handler; validates ID, logs click, redirects to partner URL.
  - `/sitemap.xml`, `/robots.txt` – SEO endpoints.
- **APIs & scripts**: Prisma client in `src/lib/prisma.ts`, import pipeline under `scripts/` (see [Data import](./DATA_IMPORT.md)).
- **Environment variables**: `DATABASE_URL`, `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, optional `DIRECT_URL`.
- **Tooling commands**: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run prisma:migrate:dev`, `npm run db:seed`.

## Prompt templates for AI contributors

Use these structured prompts when coordinating with an LLM or code-generation agent.

### Feature work

```
You are working on FinSite (Next.js 14 + Prisma). Goal: <describe the feature>.
Constraints:
- Update or add App Router routes under `app/`.
- Use existing shadcn/ui components or follow their patterns in `components/ui`.
- Persist data through Prisma models defined in `prisma/schema.prisma`.
- Keep SEO helpers (`src/lib/seo.ts`) in sync with any new routes.
Acceptance:
- Tests (`npm run test`) continue to pass.
- Pages render without TypeScript errors (`npm run typecheck`).
- Lint passes (`npm run lint`).
Refer to docs in `docs/` for architecture, deployment, and imports.
```

### Bug fixes

```
Context: FinSite Next.js app.
Bug summary: <issue>.
Reproduce: <steps>.
Expect: <expected>.
Current behavior: <actual>.
Debugging hints:
- Check relevant components under `components/`
- Inspect Prisma interactions in `src/lib`
- Verify SEO metadata from `src/lib/seo.ts`
Deliverable:
- Root cause identified and fixed.
- Regression test added (Vitest or page-level test).
- Docs updated if behavior changes.
```

### Data import tasks

```
We are preparing a CSV import for FinSite.
Input files: <list>.
Validate against the contract in docs/DATA_IMPORT.md.
Steps:
1. Run dry run: pnpm ts-node scripts/import-offers.ts <file> --dry-run
2. Resolve validation warnings.
3. Commit import: add --commit and include organizations if needed.
4. Trigger revalidation (see docs/DEPLOYMENT.md).
5. Update ImportLog notes.
```

## Acceptance criteria examples

- **UI change**: "New homepage widget renders above the fold, loads in <1s on broadband (Lighthouse), includes JSON-LD update, and passes axe-core accessibility scan."*
- **API change**: "`/go/[offerId]` returns 400 for malformed IDs, logs structured error, and stores no database row; unit tests cover both success and failure cases."*
- **Importer change**: "CSV importer rejects invalid payout types with a clear message, logs to `ImportLog` with `status = FAILED`, and leaves the transactional batch rolled back."*

Use these templates when drafting QA plans or code review comments.

## Coding conventions

- Prefer **server components**; mark client components with `'use client'` only when stateful interactivity is required.
- Keep styling in Tailwind classes; avoid inline styles unless dynamic values demand them.
- Follow shadcn/ui patterns (`components/ui`) for new primitives to ensure consistent interactions and accessibility.
- Naming: camelCase for variables, PascalCase for components, snake_case only for database columns (handled by Prisma).
- Use `src/lib` for reusable domain logic; do not sprinkle helpers across components.
- Prisma queries belong in server components/route handlers. Share query builders in `src/lib` to keep business logic testable.
- When modifying the Prisma schema, create a migration (`npx prisma migrate dev`) and regenerate the client (`npm run prisma:generate`).

## Testing approach

- Unit tests: add or update Vitest suites under `tests/` (mirroring lib filenames) for pure functions (`sum`, loan filters, parsers).
- Component smoke tests: leverage React Testing Library (if added) or consider Playwright for E2E (future roadmap).
- For Prisma-related logic, prefer integration tests using an ephemeral database or the existing deterministic generators to avoid flaky IO.
- Always run `npm run test` and `npm run typecheck` after significant changes. Git hooks execute Prettier/ESLint automatically.

## Performance & SEO guardrails

- Maintain LCP < 2.5s on `/` and `/loans`. Avoid large, blocking client bundles.
- Keep canonical URLs, meta descriptions, and JSON-LD consistent by routing updates through `src/lib/seo.ts`.
- Ensure new pages render `metadata` exports and reference `absoluteUrl` for canonical links.
- Do not block the main thread with large client computations; consider server computations or Web Workers for heavy lifting.
- Reserve `/go/` for server-side redirects only—no client-side redirect loops.
- When adding third-party scripts, defer or lazy-load them and document consent implications.

## Collaboration tips

- Cross-link relevant doc sections in commits/PR descriptions to speed up reviews.
- When handing off partially completed work, include:
  - Scope recap.
  - Remaining tasks and blockers.
  - Commands needed to reproduce the environment.
  - Any feature flags or environment variables toggled for local testing.
- Default branch is `main`. Release branches should be prefixed with `release/`, feature branches with `feature/`, docs with `docs/`.

Keep this hand-off document current as the codebase evolves so AI and human contributors can remain in lockstep.
