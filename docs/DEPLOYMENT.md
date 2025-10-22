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

### Multi-stage Docker build

Create `Dockerfile` (if you deploy outside Vercel):

```Dockerfile
# Stage 1 – install deps & build
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2 – runtime image
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
RUN npm install --omit=dev
CMD ["npm", "run", "start"]
```

Bundle it with Docker Compose:

```yaml
app:
  build: .
  env_file: .env
  ports:
    - "3000:3000"
  depends_on:
    db:
      condition: service_healthy
  command: "npm run start"
  environment:
    DATABASE_URL: ${DATABASE_URL}
    SITE_URL: ${SITE_URL}
    NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
db:
  image: postgres:16
  restart: unless-stopped
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: app
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 5s
    retries: 10
  volumes:
    - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

Build & deploy:

```bash
docker compose build
docker compose up -d
npx prisma migrate deploy
npm run db:seed # optional, run inside the container once
```

### Reverse proxy configuration

**Nginx** (`/etc/nginx/conf.d/finsite.conf`):

```nginx
server {
  listen 80;
  server_name example.com;

  location /.well-known/acme-challenge/ {
    root /var/www/html;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_hide_header X-Powered-By;
    proxy_buffering on;
    proxy_max_temp_file_size 0;
  }

  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1024;
}
```

Use Certbot for TLS:

```bash
certbot --nginx -d example.com -d www.example.com
```

**Caddy** alternative:

```
example.com {
  reverse_proxy 127.0.0.1:3000
  encode zstd gzip
  header -Server
  header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
}
```

Both configs enable gzip/brotli and hide framework headers. Ensure `/go/` remains uncached so click tracking executes per request.

### Bare-metal without containers

1. Provision Node.js 20, `build-essential`, and `postgresql-client`.
2. Clone the repository and install dependencies (`npm install`).
3. Build the app: `npm run build`.
4. Run Prisma migrations against your managed PostgreSQL instance: `npx prisma migrate deploy`.
5. Seed data if needed: `npm run db:seed`.
6. Create a systemd unit (`/etc/systemd/system/finsite.service`):

```
[Unit]
Description=FinSite Next.js application
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/finsite
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgres://...
Environment=SITE_URL=https://example.com
Environment=NEXT_PUBLIC_SITE_URL=https://example.com

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable finsite
sudo systemctl start finsite
```

Pair it with the Nginx/Caddy configs above for TLS and caching.

## On-demand revalidation & ISR

- Next.js App Router exposes `revalidatePath`/`revalidateTag`. Create a route handler (e.g., `app/api/revalidate/route.ts`) protected with a secret token. POST to it from your importer or CMS to flush caches for `/`, `/loans`, `/loans/[slug]`, and `/organizations/[slug]` whenever new offers arrive.
- For Vercel, you can also use [`vercel revalidate`](https://vercel.com/docs/incremental-static-regeneration). Provide the same secret used in your route handler.
- Remember to revalidate `/sitemap.xml` after large data imports so search engines crawl fresh URLs.

## Health checks

- Liveness: probe `GET /` or `GET /loans` for HTTP 200.
- Lightweight API check: add `app/api/health/route.ts` returning `{ status: 'ok' }` once you move beyond demo data.
- Database readiness: `pg_isready` (already included in Docker) or an explicit `SELECT 1;` from a cron/smoke test.

Expose `/healthz` via reverse proxy and monitor with your orchestrator (Vercel’s built-in health checks, Kubernetes probe, etc.).

## Rollback procedure

- **Vercel** – open the deployment list, pick the previous healthy deployment, and click "Promote to Production". Because Prisma migrations are versioned, rolling back application code does not automatically revert schema changes; use `prisma migrate resolve --rolled-back` followed by a manual migration if required.
- **Docker / VPS** – tag releases (`docker build -t finsite:<git-sha> .`). To roll back, re-deploy the previous tag:

  ```bash
  docker compose pull app@sha256:<digest>
  docker compose up -d app
  ```

  Keep database migrations backwards-compatible to avoid data loss. For emergency cases, restore from a PITR snapshot before redeploying the older image.

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
