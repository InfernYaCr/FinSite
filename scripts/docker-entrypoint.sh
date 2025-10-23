#!/usr/bin/env bash
set -euo pipefail

cd /app

if [ "${SKIP_MIGRATIONS:-false}" != "true" ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy --schema prisma/schema.prisma
fi

if [ "${RUN_SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding database (RUN_SEED_ON_START=true)..."
  npm run db:seed
fi

echo "Starting Next.js application"
exec "$@"
