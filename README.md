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

## Useful scripts
- npm run prisma:generate
- npm run prisma:migrate:dev
- npm run prisma:migrate:deploy
- npm run prisma:studio
- npm run db:up
- npm run db:down
- npm run db:reset

## Notes
- The initial migration is included under prisma/migrations.
- The Prisma schema targets PostgreSQL using the DATABASE_URL defined in your .env file.
