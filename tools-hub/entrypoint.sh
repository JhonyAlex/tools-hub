#!/bin/sh
set -e

echo "Running Prisma migrations..."

# If the pgvector migration was previously marked as failed (P3009), resolve it
# as rolled-back so migrate deploy can re-apply it cleanly. Idempotent: safe to
# run even if the migration was never failed or is already resolved.
./node_modules/.bin/prisma migrate resolve \
  --rolled-back 20260315090000_aurislm_tenancy_pgvector 2>/dev/null || true

./node_modules/.bin/prisma migrate deploy

echo "Starting Next.js server..."
node server.js
