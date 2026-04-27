#!/bin/sh

# Run Prisma migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  cd /app/backend && npx prisma migrate deploy --schema=./prisma/schema.prisma || true
  
  # Seed the database if it's empty (check for any practices)
  PRACTICE_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM practices" | tr -d ' ')
  if [ "$PRACTICE_COUNT" = "0" ]; then
    echo "Database is empty, seeding with demo data..."
    cd /app/backend && npx ts-node prisma/seed.ts || true
  else
    echo "Database already has data, skipping seed"
  fi
fi

# Start the application
echo "Starting Dentsight server..."
cd /app/backend && exec node index.js
