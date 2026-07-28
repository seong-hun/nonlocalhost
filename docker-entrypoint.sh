#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
cd /app/packages/db && DATABASE_PATH="$DATABASE_PATH" bun run db:migrate

echo "[entrypoint] Starting API server..."
cd /app
exec "$@"
