#!/bin/sh

# Run Prisma migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
  
  # Enable TimescaleDB extension (run after connection is established)
  echo "Enabling TimescaleDB extension..."
  psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS timescaledb;" || true
  
  # Create hypertable for metrics if it exists
  psql $DATABASE_URL -c "SELECT create_hypertable('metrics', 'metric_date');" || true
fi

# Start the application
echo "Starting Dentsight server..."
exec node backend/index.js
