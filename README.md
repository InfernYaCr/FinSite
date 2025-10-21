# Prisma + PostgreSQL initialization

This repository sets up Prisma with a PostgreSQL database and defines initial data models.

## Models
- Organization
- Offer
- Review
- City
- Tag
- ClickTracking

Enums: OfferStatus, OfferType, ReviewRating, ClickType

## Prerequisites
- Node.js 18+
- Docker (for local PostgreSQL)

## Getting started
1. Install dependencies:
   npm install

2. Start local Postgres (via Docker):
   npm run db:up

3. Configure environment variables:
   cp .env.example .env
   # Optionally update DATABASE_URL in .env

4. Run the initial migration and generate the Prisma client:
   npm run prisma:migrate:dev

5. (Optional) Open Prisma Studio:
   npm run prisma:studio

## Demo data seeding
The project includes a deterministic seed script that creates:
- 8–10 organizations
- 50+ offers with varied types, statuses, dates, cities, and tags
- A catalog of cities and tags
- Sample reviews on many published offers

How to run:
1. Ensure the database is up and migrated (see steps above)
2. Seed the database:
   npm run db:seed

This uses prisma/seed.cjs with a fixed RNG seed to ensure the same locale-friendly content on every run. You can inspect the data using Prisma Studio:
   npm run prisma:studio

You can also reset the database and re-apply migrations and seed in one go:
   npm run db:reset

## Useful scripts
- npm run prisma:generate
- npm run prisma:migrate:dev
- npm run prisma:migrate:deploy
- npm run prisma:studio
- npm run db:up
- npm run db:down
- npm run db:reset
- npm run db:seed

## Notes
- The initial migration is included under prisma/migrations.
- The Prisma schema targets PostgreSQL using the DATABASE_URL defined in your .env file.

---

# Design System (shadcn/ui-inspired)

We added a Tailwind-based design system inspired by shadcn/ui. It provides a consistent theme and a set of reusable UI primitives.

Highlights
- Dark mode via `.dark` class
- Theme tokens powered by CSS variables (see app/globals.css)
- Tree-shaking friendly named exports
- Primitives live under `components/ui`

Available components
- Button, Input, Select, Tabs, Card, Table, Badge
- Pagination, Breadcrumbs, Dialog (modal), Sheet (drawer)

How to use
- Import components directly from their files (best for tree-shaking):
  import { Button } from '@/components/ui/button'

- Or import from the barrel file:
  import { Button } from '@/components/ui'

Theme configuration
- tailwind.config.js defines color tokens and other theme extensions
- app/globals.css sets CSS variables for light and dark schemes and base styles

Docs and examples
- See components/ui/README.md for usage examples of each primitive
