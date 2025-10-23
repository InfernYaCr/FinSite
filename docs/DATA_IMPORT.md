# Data import playbook

> Read alongside: [Architecture](./ARCHITECTURE.md) for the domain model and [Deployment](./DEPLOYMENT.md) for post-import cache invalidation. Contributor guidance for AI or human operators lives in [AI hand-off](./AI_HANDOFF.md).

## Goals and data sources

FinSite keeps its catalog synchronized with upstream partners through three complementary pipelines:

1. **Deterministic seeds** – the existing demo data (`prisma/seed.cjs`) populates the schema with fixture-friendly organizations, offers, tags, cities, and click tracking rows. This is ideal for local development and smoke tests.
2. **CSV batch imports** – the primary mechanism for ingesting or updating production data. Partners deliver nightly exports for organizations and offers; the CLI importer validates and upserts rows idempotently.
3. **Back-office admin (planned)** – a React-based interface will sit on top of Prisma for manual curation, with workflow hooks reusing the validation and logging logic from the importer.

Every import must be **repeatable** (idempotent on `externalId`/`slug`), **validated** (schema parity + domain rules), and **observable** (audit trail written to `ImportLog`).

## Seed scripts and fixtures

- `npm run db:seed` executes `prisma/seed.cjs` against the database referenced by `DATABASE_URL`.
- The seed script creates:
  - ~10 `Organization` rows tied to generated `City` entries.
  - 50+ `Offer` rows with deterministic filters (`generateOffers` in `src/lib/loans.ts`).
  - A curated set of `Tag` rows and sample `Review` rows.
- Seeded data is always safe to wipe (`npm run db:reset`) because it is randomly generated from stable seeds.

Use seeds for development only. Production environments should rely on CSV imports.

## CSV formats

The importer expects UTF-8 CSV files with headers. Keep values comma-separated and quote strings containing commas.

### `organizations.csv`

| Column | Required | Example | Notes |
| --- | --- | --- | --- |
| `externalId` | ✅ | `org_001` | Stable upstream identifier used for idempotent upserts |
| `slug` | ✅ | `zaymer` | Lowercase URL slug, unique per organization |
| `name` | ✅ | `Займер` | Display name |
| `description` | ⛔️ | `Онлайн-займы до 30 минут` | Rich text (markdown allowed) |
| `website` | ⛔️ | `https://zaymer.ru` | Absolute HTTPS URL |
| `status` | ✅ | `active` | Enum: `active`, `inactive`, `hidden` |
| `citySlug` | ⛔️ | `moskva` | References `City.slug`; importer auto-creates cities when absent |
| `logoUrl` | ⛔️ | `https://cdn.partner/logo.png` | Stored for future UI use |
| `tags` | ⛔️ | `онлайн;карта` | Semicolon-separated list; importer maps to Tag connections |
| `contactEmail` | ⛔️ | `support@zaymer.ru` | Used for future admin outreach |
| `supportPhone` | ⛔️ | `8 800 500-55-50` | Normalized before storage |

### `offers.csv`

| Column | Required | Example | Notes |
| --- | --- | --- | --- |
| `externalId` | ✅ | `offer_123` | Primary idempotency key |
| `slug` | ✅ | `zaymer-50000` | Unique slug per offer (used for `/loans/[slug]`) |
| `orgSlug` | ✅ | `zaymer` | Joins with `Organization.slug` |
| `title` | ✅ | `Займер: займ до 50 000 ₽` | Display title |
| `description` | ⛔️ | `Первый займ без процентов` | Markdown permitted |
| `status` | ✅ | `PUBLISHED` | Syncs with Prisma enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`) |
| `type` | ✅ | `DEAL` | Prisma enum (`DEAL`, `COUPON`, `DISCOUNT`, `EVENT`, `JOB`) |
| `partnerUrl` | ✅ | `https://partner.ru/apply?subid=...` | Redirect target consumed by `/go/[offerId]` |
| `rateMin` | ✅ | `7.5` | Annual percentage rate lower bound |
| `rateMax` | ✅ | `28.9` | Must be ≥ `rateMin` |
| `amountMin` | ✅ | `5000` | Rubles |
| `amountMax` | ✅ | `200000` | Rubles, ≥ `amountMin` |
| `termMinDays` | ✅ | `30` | Days; importer converts to months for Prisma |
| `termMaxDays` | ✅ | `365` | Days; ≥ `termMinDays` |
| `payoutType` | ✅ | `card|bank` | Pipe-separated list mapped to enum values (`card`, `bank`, `cash`, `ewallet`) |
| `borrowerRequirements` | ⛔️ | `passport|age18Plus` | Pipe list matched against enum in `loans.ts`/Zod |
| `fees` | ⛔️ | `0` | Numeric; future extension |
| `rating` | ⛔️ | `4.6` | Optional fallback when no reviews exist |
| `featured` | ⛔️ | `true` | Boolean flag for homepage modules |
| `tags` | ⛔️ | `быстро|онлайн` | Pipe-separated; ensures Tag relations |
| `cities` | ⛔️ | `moskva|sankt-peterburg` | Optional override for targeted cities |
| `startsAt` | ⛔️ | `2024-01-01` | ISO date |
| `endsAt` | ⛔️ | `2024-03-01` | ISO date; >= `startsAt` if present |

Sample snippet:

```csv
externalId,slug,orgSlug,title,status,type,partnerUrl,rateMin,rateMax,amountMin,amountMax,termMinDays,termMaxDays,payoutType,borrowerRequirements,featured
offer_123,zaymer-50000,zaymer,"Займер: займ до 50 000 ₽",PUBLISHED,DEAL,https://partner.ru/zaymer?subid=abc,7.5,28.9,5000,200000,30,365,"card|bank","passport|age18Plus",true
```

## Validation and transformation rules

The importer uses Zod schemas to enforce the contract above:

- `rateMin`/`rateMax` must be positive numbers; `rateMax >= rateMin`.
- `amountMin`/`amountMax` must be integers; `amountMax <= 1_000_000` (configurable guardrail).
- `termMinDays`/`termMaxDays` converted to months with ceiling rounding; importer warns when ranges exceed 5 years.
- `payoutType` values must exist in the enumerated set; unknown values raise validation errors.
- `borrowerRequirements` validated against the canonical list (`passport`, `incomeProof`, `noBadCredit`, `citizenship`, `age18Plus`).
- `partnerUrl` must be HTTPS.
- `featured` and boolean columns accept `true/false`, `1/0`, or `yes/no`.
- `tags` and `cities` are normalized to lower-case slugs.

Imports are **idempotent**:

- Organizations upsert on `externalId` (fallback `slug`).
- Offers upsert on `externalId`; if absent, fallback to `slug + orgSlug` to avoid duplicates.
- Offer-to-tag and offer-to-city relations are diffed and synchronized on every run.

When validation fails, the importer collects errors and exits with a non-zero status after printing a summary table.

## Dry-run and execution modes

- `--dry-run` (default) parses and validates CSV rows, emits a preview table, and writes an `ImportLog` entry with `status = "DRY_RUN"`.
- `--commit` performs database upserts inside a transaction per batch. Transactions are sized via `--batch-size` (default `100`).
- Each batch logs successes, warnings (e.g. unknown tags auto-created), and validation failures.

Example dry-run invocation:

```bash
pnpm ts-node scripts/import-offers.ts ./data/offers.csv --dry-run
```

Sample output:

```
Parsed 142 rows (offers.csv)
✔ 142 valid rows
⚠ 3 warnings (auto-created tags: онлайн, заявка-1)
ℹ Nothing written to the database (dry-run). Use --commit to persist changes.
```

## CLI importer usage

The CLI lives at `scripts/import-offers.ts` (paired with helper modules under `src/lib/import/` once implemented). Usage:

```bash
pnpm ts-node scripts/import-offers.ts ./data/offers.csv --commit --organizations ./data/organizations.csv
```

Flags:

- `--organizations <path>` – optional, run organization sync before offers.
- `--dry-run` (default) vs `--commit` – toggle persistence.
- `--batch-size <n>` – tune transaction size; default `100`.
- `--log <level>` – set to `debug` for verbose row-by-row tracing.
- `--concurrency <n>` – parallelize batches (safe for Postgres with `SERIALIZABLE` isolation).

Error handling:

- Validation errors print per-row context and exit with code `1`.
- Database errors (e.g. missing foreign key) roll back the active transaction and exit with code `2`.
- Network or file access issues exit with code `3`.
- Partial failures are summarized in the final report with counts per error category.

## ImportLog schema

Add the following Prisma model (or confirm it exists) to maintain an audit trail:

```prisma
model ImportLog {
  id          String    @id @default(cuid())
  source      String
  filename    String
  rowCount    Int
  inserted    Int
  updated     Int
  skipped     Int
  status      String   // DRY_RUN, SUCCESS, FAILED
  message     String?
  startedAt   DateTime @default(now())
  finishedAt  DateTime?
  details     Json?
}
```

Example row produced after a successful run:

```json
{
  "source": "offers-csv",
  "filename": "offers_2024-10-20.csv",
  "rowCount": 142,
  "inserted": 12,
  "updated": 130,
  "skipped": 0,
  "status": "SUCCESS",
  "message": "Upsert complete",
  "details": {
    "warnings": ["Auto-created city: novosibirsk"],
    "batchSize": 100,
    "durationMs": 4230
  }
}
```

Store the raw importer logs alongside the table to simplify cross-referencing, or ship them to your centralized log stack.

## Operational checklist

- [ ] CSV headers validated against the contract above.
- [ ] Run a dry run first and inspect the warning list.
- [ ] Promote new `Tag` or `City` slugs to marketing/legal if they affect public copy.
- [ ] Commit the import with `--commit` once validation passes.
- [ ] Trigger content revalidation (`/`, `/loans`, `/sitemap.xml`) post-commit (see [Deployment](./DEPLOYMENT.md#on-demand-revalidation--isr)).
- [ ] Review `ImportLog` entries and shipping logs for anomalies.

## Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `ENOENT: no such file or directory` | Verify absolute/relative paths; wrap in quotes when containing spaces. |
| `Foreign key violation on orgSlug` | Ensure `organizations.csv` includes the slug or run with `--organizations` first. |
| `Invalid payoutType` | Check for typos; supported values: `card`, `bank`, `cash`, `ewallet`. |
| Import appears slow | Lower `--batch-size` or increase `--concurrency`; ensure Postgres has sufficient CPU/IO. |
| Revalidation cache stale | Call the revalidation endpoint with the shared secret (see Deployment guide). |

Keep this playbook up to date as importer modules evolve. All future importer-related code lives under `scripts/` and `src/lib/import/`.
