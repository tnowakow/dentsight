# Dentsight — Technical Architecture Spec

**Author:** Vitaly (System Architect)  
**Date:** 2026-04-26  
**Project:** Dentsight — Dental Practice Intelligence Dashboard  
**Status:** Ready for Build Phase

---

## Executive Summary

This architecture document defines the technical foundation for Dentsight, a dental practice intelligence dashboard that surfaces actionable KPIs from Open Dental PMS and QuickBooks/Xero. The system pivots from passive BI to an **active alert engine**, sending SMS/email notifications when metrics drift off target.

**Key Architectural Decisions:**
- Edge-side PHI de-identification before cloud transmission (HIPAA compliance)
- Postgres RLS for multi-tenancy enforcement
- TimescaleDB extension for time-series metric storage
- Go binary Edge Connector with Windows Service wrapper
- Railway deployment for operational simplicity at target scale (100→1000 practices)

---

## 1. Technology Stack

### Frontend
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | React 18 + TypeScript | Type safety, component reusability |
| Build Tool | Vite 5.x | Fast HMR, Railway-compatible |
| Styling | TailwindCSS v4 | Utility-first, mobile-responsive by default |
| State Management | Zustand | Lightweight, no boilerplate |
| Charts | Recharts | Declarative, React-native |

### Backend
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js 20.x | Railway default, async I/O for data ingestion |
| Framework | Express.js | Simple REST API, middleware support |
| Database | PostgreSQL 15 + TimescaleDB | Relational integrity + time-series optimization |
| Hosting | Railway | Single-service deployment, managed Postgres |

### Edge Connector (Phase 2)
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | Go 1.21+ | Statically linked binary, zero dependencies |
| Windows Integration | Task Scheduler wrapper | Crash recovery, service-like behavior |
| Communication | HTTPS to Railway API | Encrypted in-transit data |

---

## 2. Database Schema Design

### Core Tables

#### `practices` (Multi-tenancy root)
```sql
CREATE TABLE practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    practice_hash VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 of practice identifier
    owner_name VARCHAR(255),
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    subscription_tier VARCHAR(50) DEFAULT 'founding',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy: Each practice only sees its own data
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
CREATE POLICY practice_isolation ON practices
    USING (id = current_setting('app.current_practice_id')::uuid);
```

#### `patients` (PHI-minimized)
```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID REFERENCES practices(id) NOT NULL,
    patient_hash VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 of patient identifier (NO NAMES IN CLOUD)
    age_bucket VARCHAR(20),                     -- e.g., "25-34", "35-44" (NOT exact DOB)
    gender VARCHAR(10),
    insurance_type VARCHAR(100),                -- e.g., "Delta Dental", "United Healthcare"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(practice_id, patient_hash)
);

-- RLS Policy
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY patients_by_practice ON patients
    USING (practice_id = current_setting('app.current_practice_id')::uuid);
```

#### `appointments` (Time-series hypertable)
```sql
-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE appointments (
    time TIMESTAMP WITH TIME ZONE NOT NULL,      -- Appointment date/time
    practice_id UUID REFERENCES practices(id) NOT NULL,
    patient_hash VARCHAR(64) NOT NULL,
    appointment_type VARCHAR(50),                -- e.g., "hygiene", "restorative", "consultation"
    provider_id VARCHAR(100),                    -- Hashed provider identifier
    status VARCHAR(50),                          -- e.g., "completed", "no_show", "cancelled"
    production_value DECIMAL(12,2),              -- Treatment value in dollars
    procedure_codes TEXT[],                      -- CDT codes array
    
    PRIMARY KEY (time, practice_id, patient_hash)
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('appointments', 'time');

-- RLS Policy
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY appointments_by_practice ON appointments
    USING (practice_id = current_setting('app.current_practice_id')::uuid);
```

#### `procedures` (Time-series hypertable)
```sql
CREATE TABLE procedures (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    practice_id UUID REFERENCES practices(id) NOT NULL,
    patient_hash VARCHAR(64) NOT NULL,
    procedure_code VARCHAR(20),                  -- CDT code
    procedure_name VARCHAR(255),
    production_value DECIMAL(12,2) NOT NULL,
    rendered_by VARCHAR(100),                    -- Provider identifier (hashed)
    status VARCHAR(50),                          -- e.g., "completed", "scheduled", "cancelled"
    
    PRIMARY KEY (time, practice_id, patient_hash, procedure_code)
);

SELECT create_hypertable('procedures', 'time');

ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY procedures_by_practice ON procedures
    USING (practice_id = current_setting('app.current_practice_id')::uuid);
```

#### `metrics` (Aggregated KPIs — Materialized Views Source)
```sql
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID REFERENCES practices(id) NOT NULL,
    metric_date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,           -- e.g., "hygiene_recare_rate", "cost_per_chair_hour"
    metric_value DECIMAL(12,4) NOT NULL,
    target_value DECIMAL(12,4),                  -- Practice-specific target
    industry_benchmark DECIMAL(12,4),            -- Industry average for context
    unit VARCHAR(50),                            -- e.g., "%", "$/hour"
    
    UNIQUE(practice_id, metric_date, metric_name)
);

-- Index for fast time-range queries
CREATE INDEX idx_metrics_practice_date ON metrics(practice_id, metric_date DESC);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY metrics_by_practice ON metrics
    USING (practice_id = current_setting('app.current_practice_id')::uuid);
```

#### `alerts` (Active alert engine)
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID REFERENCES practices(id) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,             -- e.g., "warning", "info", "success"
    message TEXT NOT NULL,                       -- Human-readable alert message
    severity INTEGER DEFAULT 2,                  -- 1=critical, 2=warning, 3=info
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Index for active alerts query
    INDEX idx_alerts_active ON alerts(practice_id, is_resolved) WHERE is_resolved = FALSE;
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY alerts_by_practice ON alerts
    USING (practice_id = current_setting('app.current_practice_id')::uuid);
```

#### `expenses` (QuickBooks/Xero data — for EBITDA calculation)
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID REFERENCES practices(id) NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(100),                       -- e.g., "supplies", "lab fees", "rent"
    subcategory VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    is_addback BOOLEAN DEFAULT FALSE,            -- For EBITDA normalization
    addback_reason VARCHAR(255),                 -- e.g., "owner personal expense"
    
    PRIMARY KEY (id)
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_by_practice ON expenses
    USING (practice_id = current_setting('app.current_practice_id')::uuid);
```

### Materialized Views (for OpenClaw analytical queries)

```sql
-- Hygiene re-care rate by month
CREATE MATERIALIZED VIEW mv_hygiene_recare AS
SELECT 
    p.id as practice_id,
    DATE_TRUNC('month', a.time) as metric_month,
    COUNT(DISTINCT a.patient_hash)::float / 
        NULLIF(COUNT(DISTINCT CASE WHEN a.appointment_type = 'hygiene' THEN a.patient_hash END), 0)::float * 100 as recare_rate
FROM appointments a
JOIN practices p ON a.practice_id = p.id
WHERE a.appointment_type = 'hygiene' AND a.status = 'completed'
GROUP BY p.id, metric_month;

-- Cost per chair hour by month
CREATE MATERIALIZED VIEW mv_cost_per_chair_hour AS
SELECT 
    p.id as practice_id,
    DATE_TRUNC('month', e.expense_date) as metric_month,
    SUM(e.amount) / NULLIF(total_hours, 0) as cost_per_hour
FROM expenses e
JOIN practices p ON e.practice_id = p.id
CROSS JOIN (
    SELECT practice_id, COUNT(DISTINCT DATE(time)) * 8 as total_hours  -- Assume 8-hour days
    FROM appointments 
    WHERE practice_id = e.practice_id AND status = 'completed'
    GROUP BY practice_id
) hours
WHERE e.category IN ('supplies', 'lab fees', 'rent', 'utilities', 'payroll')
GROUP BY p.id, metric_month;
```

---

## 3. API Structure

### Base Configuration
- **Base URL:** `https://dentsight-production.up.railway.app/api`
- **Auth:** JWT tokens (practice-scoped)
- **Rate Limiting:** 100 req/min per practice_id
- **CORS:** Frontend domain only

### Endpoints

#### Authentication
```
POST /api/auth/login
  Body: { practice_hash, password }
  Response: { token, practice_id }

POST /api/auth/refresh
  Body: { token }
  Response: { token }
```

#### Metrics
```
GET /api/metrics
  Query: ?practice_id={uuid}&from={date}&to={date}
  Response: [
    {
      metric_name: "hygiene_recare_rate",
      metric_date: "2026-04-01",
      metric_value: 82.5,
      target_value: 85.0,
      industry_benchmark: 80.0,
      unit: "%"
    }
  ]

GET /api/metrics/:metric_name/trend
  Query: ?practice_id={uuid}&months=12
  Response: [{ date, value }] time series
```

#### Alerts
```
GET /api/alerts
  Query: ?practice_id={uuid}&resolved=false
  Response: [
    {
      id: "uuid",
      metric_name: "hygiene_recare_rate",
      alert_type: "warning",
      message: "Hygiene re-care rate dropped to 78% (target: 85%) — could be costing ~$12K/month",
      severity: 2,
      created_at: "2026-04-26T10:30:00Z"
    }
  ]

POST /api/alerts/:id/resolve
  Body: { notes?: string }
  Response: { success: true }
```

#### Valuation
```
GET /api/valuation
  Query: ?practice_id={uuid}
  Response: {
    ebitda: 485000,
    owner_comp_normalized: true,
    addbacks_total: 23000,
    valuation_range: {
      low: 2850000,
      high: 3450000,
      most_likely: 3150000
    },
    market_multiple: {
      low: 6.5,
      high: 7.0,
      current: 6.8
    },
    disclaimer: "Informational estimate only — not a certified appraisal"
  }
```

#### Practice Management
```
GET /api/practice/:id
  Response: { name, location_city, location_state, subscription_tier, created_at }

PUT /api/practice/:id
  Body: { target_values?: { metric_name: value }[] }
  Response: { success: true }
```

#### Data Ingestion (Edge Connector)
```
POST /api/ingest/appointments
  Auth: Edge Connector API key
  Body: { practice_hash, appointments: [...] }
  Response: { ingested_count: 150 }

POST /api/ingest/procedures
  Auth: Edge Connector API key
  Body: { practice_hash, procedures: [...] }
  Response: { ingested_count: 45 }

POST /api/ingest/expenses
  Auth: Edge Connector API key
  Body: { practice_hash, expenses: [...] }
  Response: { ingested_count: 28 }
```

---

## 4. HIPAA Compliance Patterns

### Edge Connector PHI De-identification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DENTAL OFFICE                            │
│  ┌──────────────┐     ┌──────────────┐                     │
│  │ Open Dental  │────▶│   Go Binary  │◀── SHA-256 Hashing  │
│  │   (PMS)      │     │ Edge         │    Strip: names,    │
│  │              │     │ Connector    │       DOB, address  │
│  └──────────────┘     └──────┬───────┘                     │
│                              │ HTTPS (encrypted)           │
└──────────────────────────────┼─────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      CLOUD (Railway)                        │
│  ┌──────────────┐     ┌──────────────┐                     │
│  │   API        │◀────│   Postgres   │    NO PHI STORED    │
│  │  (Express)   │     │   (RLS)      │    Only hashes +    │
│  └──────────────┘     └──────────────┘       metrics       │
└─────────────────────────────────────────────────────────────┘
```

### Key HIPAA Controls

1. **PHI Minimization at Edge**
   - Go binary extracts only aggregated metrics
   - Patient names, DOB, addresses NEVER leave the practice
   - SHA-256 hashing of patient/practice identifiers
   - Cloud database contains zero directly identifiable PHI

2. **Encryption in Transit**
   - All API communication over HTTPS (TLS 1.3)
   - Edge Connector validates Railway certificate
   - JWT tokens for authenticated requests

3. **Multi-Tenancy Isolation**
   - Postgres RLS enforces practice-level data isolation
   - Every query scoped to `current_setting('app.current_practice_id')`
   - Application-level tenant scoping as defense-in-depth

4. **Access Controls**
   - JWT tokens expire after 24 hours
   - Refresh token rotation
   - API keys for Edge Connector (stored in Windows Credential Manager)

5. **Audit Logging**
   - All data access logged to `audit_log` table
   - Practice ID, timestamp, endpoint, user agent captured
   - Logs retained for 7 years (HIPAA requirement)

6. **Data Retention Policy**
   - PHI: Until contract end + 30 days, then secure deletion
   - Aggregated metrics: Indefinitely (non-PHI)
   - Audit logs: 7 years minimum

### BAA Requirements (from Meagan's think-tank report)

```markdown
## Business Associate Agreement — Key Clauses

1. **Permitted Uses:** Data processing for business intelligence only
2. **Safeguards:** Encryption, access controls, audit logging implemented
3. **Breach Notification:** 72-hour notification window to practice owner
4. **Subcontractors:** Railway (hosting) covered under their BAA
5. **Termination:** Data return/destruction within 30 days of contract end
6. **Compliance:** Annual HIPAA risk assessment required
```

---

## 5. Hosting Strategy (Railway)

### Deployment Configuration

#### `railway.toml`
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node backend/server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
healthCheckPath = "/api/health"
healthCheckTimeout = 30
```

#### Environment Variables (Railway Dashboard)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dentsight

# JWT
JWT_SECRET=<generate-256-bit-random-string>
JWT_EXPIRY=24h

# Edge Connector API Keys
EDGE_CONNECTOR_API_KEY=<per-practice-keys-stored-in-db>

# Alerting (Phase 2)
TWILIO_ACCOUNT_SID=<account-sid>
TWILIO_AUTH_TOKEN=<auth-token>
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# Email (Phase 2)
SENDGRID_API_KEY=<api-key>
FROM_EMAIL=noreply@dentsight.ai

# Application
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://dentsight.ai
```

### Railway Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway Project                          │
│  ┌──────────────────┐         ┌────────────────────────┐   │
│  │  Web Service     │◀───────▶│  PostgreSQL +          │   │
│  │  (Node.js)       │         │  TimescaleDB           │   │
│  │  Port: 3000      │         │  Managed, auto-backup  │   │
│  └──────────────────┘         └────────────────────────┘   │
│          │                                                   │
│          ▼                                                   │
│  ┌──────────────────┐                                       │
│  │  Custom Domain   │   dentsight.ai → Railway CDN          │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Scaling Strategy

| Metric | Current (MVP) | Phase 2 (100 practices) | Phase 3 (1000 practices) |
|--------|---------------|-------------------------|--------------------------|
| Railway Plan | Hobby ($5/mo) | Pro ($20/mo) | Pro + Read Replica |
| Postgres Size | 1GB | 2GB | 4GB + Timescale Cloud |
| CPU | Shared | 1X | 2X |
| Backup Retention | 7 days | 30 days | 90 days |

---

## 6. Alert Engine Architecture

### Threshold Configuration (per practice, overridable)

```javascript
// Default thresholds from industry benchmarks
const ALERT_THRESHOLDS = {
  hygiene_recare_rate: {
    target: 85,
    warning_below: 80,
    critical_below: 75,
    unit: '%'
  },
  no_show_rate: {
    target: 2,
    warning_above: 5,
    critical_above: 8,
    unit: '%'
  },
  denial_rate: {
    target: 5,
    warning_above: 8,
    critical_above: 12,
    unit: '%'
  },
  cost_per_chair_hour: {
    target: 600,
    warning_above: 700,
    critical_above: 850,
    unit: '$/hour'
  }
};
```

### Alert Generation Flow

```javascript
// Cron job runs hourly (Node.js)
async function generateAlerts() {
  const practices = await getAllActivePractices();
  
  for (const practice of practices) {
    setTenantContext(practice.id);
    
    const metrics = await getLatestMetrics(practice.id);
    const thresholds = await getPracticeThresholds(practice.id);
    
    for (const metric of metrics) {
      const alert = checkThreshold(metric, thresholds);
      
      if (alert) {
        // Create alert record
        await createAlert({
          practice_id: practice.id,
          metric_name: metric.name,
          alert_type: alert.severity >= 3 ? 'critical' : 'warning',
          message: formatAlertMessage(metric, alert),
          severity: alert.severity
        });
        
        // Queue for SMS/email (Phase 2)
        await queueNotification({
          practice_id: practice.id,
          alert_id: alert.id,
          channels: ['email'] // Add 'sms' in Phase 2
        });
      }
    }
  }
}

function formatAlertMessage(metric, alert) {
  const impact = calculateFinancialImpact(metric.name, metric.value, alert.target);
  return `${metric.display_name} is ${metric.value}${metric.unit} (target: ${alert.target}${metric.unit}) — could be costing ~$${impact}/month`;
}
```

---

## 7. Valuation Engine Implementation

### EBITDA Calculation with Owner-Comp Normalization

```javascript
// From Sherlock's think-tank corrections
function calculateValuation(practice_id) {
  // Step 1: Get annual production (collections)
  const annualProduction = getAnnualCollections(practice_id);
  
  // Step 2: Calculate raw EBITDA
  const expenses = getAnnualExpenses(practice_id);
  const rawEBITDA = annualProduction - expenses.total;
  
  // Step 3: Normalize owner compensation to industry standard (27-35% of collections)
  const currentOwnerComp = expenses.owner_compensation || 0;
  const normalizedOwnerComp = annualProduction * 0.31; // Midpoint of 27-35%
  const ebitdaAddback = normalizedOwnerComp - currentOwnerComp;
  
  // Step 4: Add back non-recurring expenses
  const addbacks = getAddbacks(practice_id); // From expenses table where is_addback=true
  
  // Step 5: Calculate normalized EBITDA
  const normalizedEBITDA = rawEBITDA + ebitdaAddback + addbacks.total;
  
  // Step 6: Apply market multiple (current range: 6.5-7.0x for add-on deals)
  const valuationRange = {
    low: normalizedEBITDA * 6.5,
    high: normalizedEBITDA * 7.0,
    most_likely: normalizedEBITDA * 6.8
  };
  
  return {
    ebitda: normalizedEBITDA,
    owner_comp_normalized: true,
    addbacks_total: addbacks.total,
    valuation_range: valuationRange,
    market_multiple: { low: 6.5, high: 7.0, current: 6.8 },
    disclaimer: "Informational estimate only — not a certified appraisal"
  };
}
```

---

## 8. Security Considerations

### Authentication & Authorization
- JWT tokens with practice_id claim for automatic tenant scoping
- Refresh token rotation to prevent replay attacks
- API keys for Edge Connector stored in database (encrypted at rest)

### Data Protection
- Postgres encryption at rest (Railway default)
- TLS 1.3 for all data in transit
- No PHI in cloud logs (structured logging with PII filtering)

### Infrastructure Security
- Railway private networks (no public DB access)
- Firewall rules: only port 3000 exposed
- Dependabot enabled for dependency updates

---

## 9. Development Environment Setup

### Local Development

```bash
# Clone repository
git clone git@github.com:tomnowakowski/dentsight.git
cd dentsight

# Install dependencies
npm install

# Set up local Postgres (or use Railway database)
# Update .env.local with DATABASE_URL

# Run migrations
npx prisma migrate dev

# Seed mock data
npm run seed

# Start backend
npm run dev

# Start frontend (separate terminal)
cd frontend
npm run dev
```

### `.env.example`
```bash
DATABASE_URL=postgresql://localhost:5432/dentsight_dev
JWT_SECRET=dev-secret-change-in-production
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## 10. Migration Path from Demo Site

The existing demo site at `/Users/tomnow/.openclaw/workspace/dentsight/` can be reused for:
- UI component patterns (charts, tables, alert cards)
- Mock data structure reference
- TailwindCSS styling conventions

**Migration Steps:**
1. Audit existing components for reusability
2. Update mock data to match new schema
3. Integrate with backend API endpoints
4. Add authentication layer (JWT)
5. Deploy to Railway as production environment

---

## Summary & Next Steps

### Key Decisions Made
✅ Tech stack: React/TS/Vite/Tailwind + Node.js/Express + Postgres/TimescaleDB on Railway  
✅ Database schema: 6 core tables with RLS multi-tenancy  
✅ API structure: REST endpoints for metrics, alerts, valuation, practice management  
✅ HIPAA patterns: Edge-side PHI de-identification, zero PHI in cloud  
✅ Alert engine: Threshold-based with SMS/email placeholders  
✅ Valuation math: EBITDA normalization with owner-comp adjustment  

### Blockers Resolved
- ✅ Multi-tenancy strategy (RLS + app-level scoping)
- ✅ HIPAA compliance approach (edge-side masking)
- ✅ Time-series optimization (TimescaleDB hypertables)
- ✅ Alert engine architecture (cron-based threshold checking)

### Ready for Next Phase
This architecture spec enables:
1. **JayJay** to create industry requirements with validated KPIs
2. **Sofia** to design UI/UX with clear data models
3. **Maya** to build frontend with defined API contracts
4. **Marcus** to implement backend with schema and endpoints

---

**Vitaly complete — 01-architecture.md created** 🏗️

**Summary:** Technical architecture defined for Dentsight with React/TS/Vite/Tailwind frontend, Node.js/Express backend, Postgres+TimescaleDB on Railway. Key decisions: edge-side PHI de-identification (HIPAA), RLS multi-tenancy, alert engine with threshold checking, EBITDA normalization for valuation. Database schema includes 6 core tables with materialized views for analytics. Ready for build phase.
