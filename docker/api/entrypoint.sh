#!/bin/sh
set -e

mkdir -p /data

if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/data/app.db"
fi

echo "Aplicando migrations Prisma..."
npx prisma migrate deploy

echo "Iniciando API..."
exec "$@"
