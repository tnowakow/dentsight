# Dentsight — Dental Practice Intelligence Dashboard

**Project Owner:** Tom Nowakowski  
**Created:** 2026-04-25  
**Status:** Planning Phase  
**Priority:** High (next ZenticPro-style demo app)

---

## 🎯 Executive Summary

Build a dental practice intelligence dashboard that connects to Open Dental PMS, QuickBooks/Xero, and banking systems to surface actionable KPIs for practice owners. The product pivots from "passive valuation calculator" to **active alert engine** — dentists get SMS/email alerts when metrics drift off target, driving engagement without requiring manual logins.

**Target Customer:** Dental practice owners who are "exit-ready" (planning to sell in 1-3 years) and understand EBITDA language. These owners have highest willingness to pay for valuation optimization tools.

**Strategic Insight:** DSOs/IDSOs roll up practices with EBITDA differentials of 50% based on owner-comp normalization. Dentsight gives independent dentists negotiating leverage by showing their true practice value before they talk to brokers.

---

## 📊 Product Requirements

### Core Features (MVP)

#### 1. Active Alert Engine
- SMS/Email alerts when key metrics drift off target
- Examples: "Hygiene re-care rate dropped to 78% (target: 85%) — could be costing ~$12K/month"
- Push notifications for denial spikes, no-show trends, unscheduled treatment value thresholds

#### 2. Operations Dashboard
**Metrics:**
- Hygiene re-care rate (% of hygiene patients rebooked)
- Unscheduled treatment value ($ in planned treatment not scheduled)
- No-show rate & cancellation rate
- Case acceptance rate (% of proposed treatments accepted)
- Provider hourly production (doctor vs. hygienist benchmarks)

**Benchmarks:** Industry averages + target ranges displayed for context

#### 3. Financial Dashboard
**Metrics:**
- Cost per chair hour ($/hour — key efficiency metric)
- Denial rate by payer (identify problematic insurance carriers)
- Production by provider (track associate performance)
- Supply cost % and lab cost % of production
- Net collection rate (% of billed amount collected)
- DSO (Days Sales Outstanding)

#### 4. Valuation Engine (DSO Offer Evaluator)
**Features:**
- Practice valuation range (not point estimate — e.g., "$2.85M-$3.45M")
- EBITDA calculation with owner-comp normalization (27-35% of collections)
- Add-backs identification (non-recurring expenses, personal items on business account)
- Market multiple application (current 6.5-7.0x for add-on deals)
- Clear disclaimer: "Informational estimate only — not a certified appraisal"

**Critical:** Use EBITDA Margin Normalization approach, NOT flat multipliers (see think-tank/domain-expert-sherlock.md)

---

## 🏗️ Technical Architecture

### Stack (Standard ZenticPro Pattern)
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js/Express or Next.js API routes
- **Database:** PostgreSQL on Railway (with TimescaleDB extension for time-series metrics)
- **Hosting:** Railway (single service deployment)
- **GitHub:** Repo at `github.com/tomnowakowski/dentsight`

### Data Sources (Phase 1: Mock → Phase 2: Real Integrations)

#### Open Dental PMS Integration
**Approach:** Direct SQL queries with chunked extraction (avoid rate limits during initial backfill of 10+ year history)

**Key Tables/Queries:**
- `patient` table — patient demographics, DOB, contact info
- `appnt` table — appointments, no-shows, cancellations
- `procedure` table — treatments rendered, CDT codes, production values
- `treatmentplan` table — planned but unscheduled treatment value

**HIPAA Compliance:** De-identify PHI at Edge Connector before cloud transmission:
- SHA-256 hash patient IDs
- Strip names, addresses, DOB from cloud database
- Store only aggregated metrics in cloud (re-care rates, production totals)

#### QuickBooks/Xero Integration
**Data Points:**
- Expense categories (supplies, lab fees, rent, utilities, payroll)
- Revenue by provider (if tracked)
- Accounts receivable aging (for DSO calculation)

**Fallback:** Manual expense input form if QuickBooks integration proves too complex for MVP

#### Banking/Payments Integration
**Data Points:**
- Daily collections totals
- Payment method breakdown (insurance, patient responsibility, HMO)
- Denial/rejection tracking

---

## 🎨 UX/UI Requirements

### Design Principles
1. **Alert-first interface** — Dashboard shows active alerts at top, not charts
2. **Benchmark context everywhere** — Every metric shows target + industry average
3. **Mobile-friendly** — Dentists check on phones between patients
4. **Dark mode default** — Professional, reduces eye strain

### Key Screens

#### 1. Overview (Home)
- Active alerts panel (warning/info/success cards)
- Practice health score summary (3-5 key metrics with trend indicators)
- Valuation range preview ($X.XM - $Y.YM)
- Quick stats grid: monthly production, unscheduled treatment value, no-show rate, case acceptance

#### 2. Operations Tab
- Provider hourly production bar chart (doctor vs. hygienist vs. targets)
- Appointment metrics table (no-show %, cancellation %, case acceptance %)
- Hygiene re-care trend line (last 12 months)

#### 3. Financials Tab
- Denial rate by payer horizontal bar chart (flag payers >8% denial rate)
- Production by provider breakdown
- Cost analysis: cost per chair hour, supply/lab cost percentages

#### 4. Valuation Tab
- EBITDA calculation breakdown
- Add-backs list with descriptions and amounts
- Valuation range visualization (slider showing low/high/most likely)
- Disclaimer text prominent at bottom

---

## 🧪 Test Scenarios (JayJay + Riley)

### Functional Tests
1. **Alert Trigger Flow:** Set hygiene re-care rate to 75% → verify alert fires with correct message
2. **Valuation Calculation:** Input $485K EBITDA, 6.8x multiple → verify range shows $3.29M-$3.80M
3. **Denial Rate Flagging:** Set United Healthcare denial to 10% → verify warning indicator appears

### Industry Validation (JayJay)
- Would a real dentist understand "cost per chair hour" terminology?
- Is the valuation disclaimer legally sufficient or does it need lawyer review?
- Are the benchmark targets realistic for independent practices vs. DSOs?

---

## 📈 Success Metrics

### MVP Launch Criteria
1. Dashboard loads in <3 seconds on 4G connection
2. All seeded data displays correctly across 4 tabs
3. Alert engine triggers at least 3 sample alerts on load
4. Valuation calculation matches think-tank formulas (EBITDA × multiple)
5. Deployed to Railway with live URL for client demos

### Phase 2 Criteria (Real Integrations)
1. Open Dental Edge Connector successfully extracts data from test practice database
2. PHI de-identification verified (no patient names/DOB in cloud DB)
3. BAA signed with first beta customer
4. 3 founding practices on board at $299/month rate

---

## 🚫 What NOT to Build (Red Lines)

1. ❌ Patient-facing features (HIPAA liability explosion)
2. ❌ Workflow automation / patient communication (competes with PMS vendors)
3. ❌ Valuation certification / appraisal guarantees (legal liability)
4. ❌ Real-time streaming pipeline (hourly batch updates sufficient)
5. ❌ CRM or billing/invoicing modules (stay in "visibility layer" only)

---

## 📚 Reference Documents

### Think Tank v2 Reports (Required Reading)
- `think-tank/lumen/v2/role-product-strategist-john.md` — Product pivot, target customer, pricing
- `think-tank/lumen/v2/role-rd-architect.md` — Technical architecture, ADRs, HIPAA patterns
- `think-tank/lumen/v2/role-domain-expert-sherlock.md` — Valuation math corrections, missing metrics
- `think-tank/lumen/v2/role-compliance-meagan.md` — HIPAA risk register, BAA template, state restrictions
- `think-tank/lumen/v2/role-gtm-riley.md` — GTM strategy, partner program, content marketing

### Existing Demo Site (Starting Point)
- `/Users/tomnow/.openclaw/workspace/dentsight/` — React/Vite demo with seeded data
- Can be used as reference for UI components and mock data structure

---

## 🗓️ Timeline & Milestones

**Week 1:** Architecture + Design Phase
- Vitaly: Technical spec, database schema, hosting strategy
- Sofia: UX/UI design spec (wireframes, field layouts)
- JayJay: Industry requirements document (dental practice workflows)

**Week 2-3:** Build Phase
- Maya: Frontend implementation (4 tabs + alert engine)
- Marcus: Backend API, database setup, mock data seeding

**Week 4:** QA + Deployment
- Riley: Test scripts execution, bug reports
- Dana: Documentation + demo script
- Deploy to Railway, share URL with Tom for client demos

---

## 💰 Budget & Resources

### Infrastructure Costs (Monthly)
- Railway hosting: ~$20/month (Postgres + Node.js service)
- Domain (dentsight.ai or similar): ~$12/year
- Total: <$50/month for demo environment

### Development Resources
- Dev team agents (John, Vitaly, Sofia, JayJay, Maya, Marcus, Riley, Dana)
- Tom's review time: 2-3 hours total across planning + final review

---

## 📞 Stakeholders

**Primary:** Tom Nowakowski — Final approval, client demo delivery  
**Industry Advisor:** Chris Anderson (West Bloomfield dentist) — Beta feedback, industry validation  
**Dev Team Lead:** John (Project Manager agent) — Task coordination, progress reporting
