#!/bin/sh

# Run Prisma migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  cd /app/backend && npx prisma migrate deploy --schema=./prisma/schema.prisma || true
fi

# Start the application
echo "Starting Dentsight server..."
cd /app/backend && exec node index.js
