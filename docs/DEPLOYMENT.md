# Deployment guide

> Also see: [Architecture](./ARCHITECTURE.md) for system context · [Data import](./DATA_IMPORT.md) for seeding pipelines · [AI hand-off](./AI_HANDOFF.md) for day-to-day execution guidelines.

## Local development workflow

1. **Node version** – use Node 20 (see `.nvmrc`). Enable `corepack` so `pnpm` is available if preferred.
2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start PostgreSQL via Docker Compose**:

   ```bash
   npm run db:up
   # or: docker compose up -d db
   ```

   This provisions a `postgres:16` container defined in `docker-compose.yml` with health checks and a persistent `pgdata` volume.

4. **Bootstrap environment variables**:

   ```bash
   cp .env.example .env
   ```

   Update `DATABASE_URL`, `SITE_URL`, and `NEXT_PUBLIC_SITE_URL` if you are not using the defaults (`http://localhost:3000`).

5. **Apply database migrations & generate the Prisma Client**:

   ```bash
   npm run prisma:migrate:dev
   # alias: npx prisma migrate dev
   ```

6. **Seed demo content**:

   ```bash
   npm run db:seed
   ```

7. **Run the dev server**:

   ```bash
   npm run dev
   ```

   The app will be available at <http://localhost:3000>. The Prisma database listens on port `5432`.

8. **Shut down services**:

   ```bash
   npm run db:down
   ```

   Add `-v` (or run `npm run db:reset`) to wipe the local volume.

### Helpful npm scripts

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint over the entire project |
| `npm run typecheck` | TypeScript project check (no emit) |
| `npm run test` | Vitest in watch mode |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Start Next.js in production mode |
| `npm run prisma:studio` | Open Prisma Studio against the target DB |

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string used by Prisma |
| `DIRECT_URL` | ⛔️ optional | Secondary connection string for migrations (connection pooling setups) |
| `SITE_URL` | ✅ | Absolute canonical base URL for server-side SEO helpers |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Client-visible base URL; keep it identical to `SITE_URL` |
| `LOG_LEVEL` | optional | Future hook for structured logging verbosity |

Keep `.env` out of version control (`.gitignore` already covers it). Use the same variable names in Vercel, Docker, or bare-metal environments.

## Vercel deployment

1. **Project linking**:

   ```bash
   vercel link
   ```

2. **Environment variables** – configure the variables above for Preview and Production environments. Example secret creation:

   ```bash
   vercel secrets add preview_database_url "postgres://user:pass@host:5432/db"
   vercel secrets add production_database_url "postgres://user:pass@host:5432/db"
   ```

   Then map them in the Vercel dashboard or via `vercel env add` to `DATABASE_URL`, `SITE_URL`, and `NEXT_PUBLIC_SITE_URL`.

3. **Build pipeline** – Vercel uses the `next` preset. The build command is `npm run build`, which runs `prisma generate` automatically before `next build`.

4. **Database migrations** – run against the deployment target before promoting a build:

   ```bash
   vercel env pull .env.vercel.local
   npx prisma migrate deploy --schema prisma/schema.prisma
   ```

   If you seed production data separately, execute `npm run db:seed` once after migrations.

5. **Preview vs production** – every non-`main` branch creates a Preview URL. Only `main` (or `vercel --prod`) promotes to production. Use preview databases or connection pooling to avoid polluting prod data.

6. **Post-deploy tasks** – once a deployment is live, trigger [ISR revalidation](#on-demand-revalidation--isr) if fresh data was imported.

### Vercel edge caching

- Collection and home pages can be statically cached once Prisma-backed data is implemented. Use `revalidatePath('/loans')` in a server action or post-import webhook to expire caches.
- The `/go/[offerId]` route should disable caching (`cache: 'no-store'`) if you migrate it to a `route.ts` returning redirects (Next.js route handlers already skip caching for dynamic redirects).

## VPS deployments

### Multi-stage Docker image

The repository now ships with a production-ready multi-stage `Dockerfile` that targets Node.js 20, installs `libvips` for Next.js image optimization, and prunes development dependencies before publishing the runtime layer. The entrypoint (`scripts/docker-entrypoint.sh`) applies Prisma migrations on every container boot and supports optional seeding via `RUN_SEED_ON_START`.

```bash
docker build --target runner -t finsite:latest .
docker run --env-file .env -p 3000:3000 finsite:latest
```

Set `SKIP_MIGRATIONS=true` if you need to skip the automatic `prisma migrate deploy` (for example when running migrations separately).

### Docker Compose stack (app + optional Postgres + Nginx)

`docker-compose.yml` orchestrates three services:

- `app` – the Next.js container published from the Dockerfile.
- `nginx` – reverse proxy built from `deploy/nginx/` with brotli/gzip, 80→443 redirects, ACME webroot, and caching for `/_next/static` & `/_next/image`.
- `db` – optional Postgres 16 service gated behind the `db` profile for people without a managed database.

Bootstrap the stack on a VPS:

```bash
cp .env.example .env
# edit .env to set DATABASE_URL=postgresql://postgres:postgres@db:5432/app?schema=public
# set SITE_URL/NEXT_PUBLIC_SITE_URL to https://your-domain
```

Update `deploy/nginx/finsite.conf` with the production hostnames before building the proxy image. Request certificates once using the ACME webroot:

```bash
docker run --rm -it \
  -v "$(pwd)/.infra/letsencrypt:/etc/letsencrypt" \
  -v "$(pwd)/.infra/certbot:/var/www/certbot" \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email ops@example.com \
  --agree-tos --no-eff-email \
  -d finsite.example.com -d www.finsite.example.com
```

Start the services:

```bash
# with the bundled Postgres container
COMPOSE_PROFILES=app,nginx,db docker compose up -d

# if you use an external database
COMPOSE_PROFILES=app,nginx docker compose up -d
```

Set `APP_IMAGE` to the tag you built or pulled (the GitHub Actions workflow sets it automatically). When `APP_IMAGE` is unset, Compose falls back to building the image locally from the repository source.

Migrations are executed automatically by the entrypoint, but you can rerun them (and seed) at any time:

```bash
docker compose exec -T app npx prisma migrate deploy --schema prisma/schema.prisma
docker compose exec -T app npm run db:seed
```

> **Note:** `npm run db:seed` clears and re-populates the database with deterministic fixtures—use it for first-time installs, demos, or staging environments.

Mounts under `.infra/letsencrypt` and `.infra/certbot` persist TLS assets and ACME challenges respectively. Expose `/healthz` in your load balancer; Nginx forwards calls to the Next.js health endpoint at `/api/healthz`. Set `RUN_SEED_ON_START=true` in `.env` if you want the container to seed on boot (helpful for disposable staging environments).

### Systemd unit (bare-metal alternative)

For teams that prefer running directly on the host, copy `deploy/systemd/finsite.service` to `/etc/systemd/system/finsite.service`, create an unprivileged user, and configure an environment file:

```bash
sudo adduser --system --group --home /var/www/finsite finsite
sudo mkdir -p /etc/finsite
sudo tee /etc/finsite/finsite.env >/dev/null <<'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db-host:5432/app?schema=public
SITE_URL=https://finsite.example.com
NEXT_PUBLIC_SITE_URL=https://finsite.example.com
RUN_SEED_ON_START=false
EOF
sudo chown -R finsite:finsite /var/www/finsite
```

Deploy application code to `/var/www/finsite`, run `npm install` and `npm run build`, then enable the unit:

```bash
sudo systemctl daemon-reload
sudo systemctl enable finsite
sudo systemctl start finsite
```

The service applies migrations on start and conditionally seeds when `RUN_SEED_ON_START=true`.

### GitHub Actions continuous deployment

`.github/workflows/deploy.yml` builds and pushes the Docker image to GHCR, then connects to the VPS over SSH to refresh the Compose stack, execute `prisma migrate deploy`, and optionally seed data. Configure the following secrets:

| Secret | Purpose |
| --- | --- |
| `GHCR_USERNAME`, `GHCR_TOKEN` | Credentials for `docker login ghcr.io` |
| `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` | Connection details for the target server |
| `VPS_APP_DIR` | Absolute path to the project on the VPS (contains `docker-compose.yml`) |
| `VPS_COMPOSE_PROFILES` (optional) | Override the profiles passed to `docker compose up` |
| `RUN_SEED_ON_DEPLOY` (optional) | When `true`, runs `npm run db:seed` after migrations |

> **Heads-up:** the seed script truncates data before re-populating fixtures—enable the flag for first-time deployments or demo environments only.

Deployments run automatically on pushes to `main` and can be triggered manually via *workflow_dispatch*.

## On-demand revalidation & ISR

- Next.js App Router exposes `revalidatePath`/`revalidateTag`. Create a route handler (e.g., `app/api/revalidate/route.ts`) protected with a secret token. POST to it from your importer or CMS to flush caches for `/`, `/loans`, `/loans/[slug]`, and `/organizations/[slug]` whenever new offers arrive.
- For Vercel, you can also use [`vercel revalidate`](https://vercel.com/docs/incremental-static-regeneration). Provide the same secret used in your route handler.
- Remember to revalidate `/sitemap.xml` after large data imports so search engines crawl fresh URLs.

## Health checks

- Container liveness: `GET http://localhost:3000/api/healthz` (used by the Docker health check). The handler performs a `SELECT 1` through Prisma and returns `{ status: 'ok', database: 'reachable' }`.
- Reverse proxy: expose `https://<domain>/healthz`, which Nginx forwards to the upstream `/api/healthz`.
- Database readiness: `pg_isready` (bundled in the Postgres service) or a lightweight `SELECT 1` cron via `docker compose exec app`.

Monitor these endpoints with your orchestrator and alerting stack.

## Rollback procedure

- **Vercel** – open the deployment list, pick the previous healthy deployment, and click "Promote to Production". Because Prisma migrations are versioned, rolling back application code does not automatically revert schema changes; use `prisma migrate resolve --rolled-back` followed by a manual migration if required.
- **Docker / VPS** – images published to GHCR are tagged with the commit SHA and `latest`. To roll back, point the stack at a previous tag and recreate the app container:

  ```bash
  export APP_IMAGE=ghcr.io/<org>/<repo>:<previous-sha>
  docker compose up -d app
  docker compose ps
  ```

  Keep Prisma migrations backwards-compatible; if you must revert a schema change, use `prisma migrate resolve --rolled-back <migration-id>` and restore from database backups when necessary.

## Observability and logging

- Route handler logs (`console.info`, `console.warn`, `console.error`) already output JSON payloads. Pipe container stdout to your log stack (CloudWatch, Loki) and parse by `event` field.
- Prisma emits query, warn, and error events—build alerts on `event=prisma_error`.
- Add uptime monitors for `/` and `/go/test-offer` to ensure both SSR pages and redirect handlers respond as expected.

## Deployment checklist

- [ ] Environment variables applied (DATABASE_URL, SITE_URL, NEXT_PUBLIC_SITE_URL).
- [ ] Prisma migrations deployed (`npx prisma migrate deploy`).
- [ ] Seed task executed (as appropriate for the environment).
- [ ] Reverse proxy caching configured (gzip/brotli enabled, `/go/` uncached).
- [ ] Health checks reporting green.
- [ ] Revalidation secret configured and documented.
- [ ] Observability sinks receiving logs (Prisma + click tracking).

Follow this runbook whenever you promote a build or provision a new environment.
