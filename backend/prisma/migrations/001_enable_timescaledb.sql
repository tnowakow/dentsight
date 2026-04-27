-- Enable TimescaleDB extension for time-series data support
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertable for metrics (time-series optimized)
-- This makes time-based queries much faster
SELECT create_hypertable('metrics', 'metric_date');
