#!/bin/bash
# Run all migration files in order against the database
# Usage: ./scripts/migrate.sh

set -e

DB_URL=${DATABASE_URL:-"postgresql://fleet_user:fleet_pass@localhost:5432/fleet_db"}

for file in backend/migrations/*.sql; do
  echo "Running migration: $file"
  psql "$DB_URL" -f "$file"
done

echo "All migrations complete"
