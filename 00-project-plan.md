# Dentsight Project Plan
**Created:** 2026-04-25  
**Author:** John (Project Manager)  
**Status:** Ready for Execution

---

## Executive Summary

Dentsight is a dental practice intelligence dashboard that connects to Open Dental PMS, QuickBooks/Xero, and banking systems to surface actionable KPIs for practice owners. Unlike traditional BI dashboards, Dentsight pivots to an **active alert engine** — dentists receive SMS/email alerts when metrics drift off target (e.g., "Hygiene re-care rate dropped 5% this week"), driving engagement without requiring manual logins.

Target customer is strictly **"exit-ready" practice owners** (planning to sell in 1-3 years) who understand EBITDA language and have highest willingness to pay for valuation optimization tools. Strategic insight: DSOs roll up practices with 50% EBITDA differentials based on owner-comp normalization — Dentsight gives independents negotiating leverage before they talk to brokers.

This project builds on an existing React/Vite demo site (`/Users/tomnow/.openclaw/workspace/dentsight/`) that already has seeded mock data and basic UI components. The dev team will productionize this into a Railway-deployed app with proper architecture, database schema, and HIPAA-compliant patterns from the think tank v2 review.

---

## Key Decisions from Think Tank v2 (MUST INCORPORATE)

### Product Strategy (John's Recommendations)
- ✅ **Alert engine over passive dashboard** — Dentists don't want more charts; they want to know where money is leaking
- ✅ **Cut Equipment & Operations panels entirely** — Reduce Insurance to "denials only", strip Financial to high-impact EBITDA metrics
- ✅ **Target strictly exit-ready owners (1-3 year window)** — Highest ROI for valuation optimization
- ✅ **Pricing: $299-500/month flat fee per location** — Not % of savings (too much audit complexity)

### Valuation Math (Sherlock's Corrections)
- ✅ **EBITDA Margin Normalization approach** — NOT flat multipliers; normalize owner-comp to 27-35% of collections
- ✅ **Valuation ranges, not point estimates** — "$2.85M-$3.45M" not "$3.15M"
- ✅ **Missing metrics to add:** Net Collection Rate, DSO (Days Sales Outstanding), ERA 835 parsing for denial tracking
- ✅ **Clear disclaimer required:** "Informational estimate only — not a certified appraisal"

### Technical Architecture (R&D Architect)
- ✅ **Go binary Edge Connector with Windows Service wrapper** — For crash recovery via Windows SCM
- ✅ **SQL/API hybrid integration** — Chunked queries to avoid rate limits during initial backfill of 10+ year history
- ✅ **Edge-side PHI masking BEFORE cloud transmission** — SHA-256 hash patient IDs, strip names/addresses; cloud-side de-identification is a privacy risk
- ✅ **TimescaleDB on Postgres** — Operational simplicity at target scale (100→1000 practices)
- ✅ **Postgres RLS + app-level tenant scoping** — Defense-in-depth for HIPAA compliance

### Compliance & Legal (Meagan's Requirements)
- ✅ **HIPAA risk register with severity ratings** — Document all PHI handling points
- ✅ **BAA template ready for lawyer review** — Use think-tank template as starting point
- ✅ **PHI minimization at Edge Connector** — De-identify before cloud transmission to reduce HIPAA burden
- ✅ **Position as "business intelligence," not "practice management"** — Avoid state dental practice act restrictions on non-dentist ownership
- ✅ **Data retention policy:** PHI until contract end + 30 days, then secure deletion

### GTM Strategy (Riley's Playbook)
- ✅ **Indirect distribution through trusted advisors** — Dental consultants/M&A brokers as force multiplier (dentists don't seek out business tools)
- ✅ **Content piece #1:** "The 3 Normalization Tricks DSOs Use to Lowball Your Practice" — Hits emotional nerve, shareable on dental forums/LinkedIn
- ✅ **Partner program tiers:** Affiliate 20%, Strategic Partner 30% + white-label, Reseller 40% + API
- ✅ **3-arm pricing test for first 30 customers** — Flat fee vs. tiered by production vs. implementation fee + lower monthly

---

## Team Assignments & Workflow

### Phase 1: Planning (Week 1) — STARTING NOW

#### Vitaly — Technical Architecture Spec
**Deliverable:** `01-architecture.md`  
**Tasks:**
1. Define tech stack: React/TS/Vite/Tailwind + Node.js/Express + PostgreSQL on Railway
2. Design database schema: patients (hashed), appointments, procedures, metrics, alerts tables
3. Specify API endpoints: `/api/metrics`, `/api/alerts`, `/api/valuation`, `/api/practice/:id`
4. Document HIPAA patterns: Edge Connector PHI de-identification flow, RLS policies
5. Create Railway deployment config: `railway.toml`, environment variables list

**Validation:** Schema includes all tables from project brief; HIPAA patterns match Meagan's think-tank recommendations

---

#### JayJay — Industry Requirements + Dental Research
**Deliverable:** `02-industry-requirements.md` + update `industry-research/dental.md`  
**Tasks:**
1. Create/update dental industry research file with:
   - Key KPIs dentists care about (hygiene re-care, cost per chair hour, denial rates)
   - Valuation methodology validation (EBITDA multiples, owner-comp normalization ranges)
   - Industry terminology (CDT codes, production vs. collections, DSO language)
2. Define test scenarios with Riley:
   - "Hygiene re-care drops below 80% → alert fires"
   - "Valuation calculation matches EBITDA × multiple formula"
   - "Denial rate >8% for any payer → warning indicator appears"

**Validation:** Dental KPIs match think-tank metrics; valuation math validated against Sherlock's corrections

---

#### Sofia — UX/UI Design Spec
**Deliverable:** `03-design-spec.md`  
**Tasks:**
1. Wireframe all 4 tabs (Overview, Operations, Financials, Valuation)
2. Design alert component states: warning (amber), info (blue), success (green)
3. Specify field layouts for any forms (manual expense input fallback if QuickBooks integration fails)
4. Define mobile-responsive breakpoints (dentists check on phones between patients)

**Validation:** All 4 tabs designed; benchmark context shown next to every metric; alert engine UI specified

---

#### Riley — Test Scripts (with JayJay)
**Deliverable:** `tests/functional-tests.md` + `tests/technical-tests.md`  
**Tasks:**
1. Functional tests: User workflow scenarios (alert triggers, valuation calculations, benchmark comparisons)
2. Technical tests: API endpoint validation, database schema checks, error handling
3. Industry validation tests with JayJay: Would a real dentist understand these metrics?

**Validation:** Test scripts cover all major features; expected outcomes documented for each test

---

### Phase 2: Build (Weeks 2-3)

#### Maya — Frontend Development
**Deliverable:** `frontend/` folder with complete React app  
**Tasks:**
1. Set up Vite + TypeScript + Tailwind project (or reuse existing `/Users/tomnow/.openclaw/workspace/dentsight/`)
2. Implement Overview tab: Alert panel, practice health score, valuation preview
3. Implement Operations tab: Provider hourly production bars, appointment metrics table
4. Implement Financials tab: Denial rate by payer chart, production breakdown
5. Implement Valuation tab: EBITDA calculation, add-backs list, range visualization
6. Ensure mobile responsiveness (test on phone-sized screens)

**Validation:** Frontend compiles without errors; all 4 tabs render correctly; alerts display at top of overview page

---

#### Marcus — Backend Development
**Deliverable:** `backend/` folder with API + database  
**Tasks:**
1. Set up Node.js/Express server (or Next.js API routes)
2. Create PostgreSQL schema on Railway based on Vitaly's architecture spec
3. Seed database with mock practice data (West Bloomfield Family Dental from think-tank)
4. Implement metric calculation logic: hygiene re-care rate, cost per chair hour, denial rates
5. Build valuation engine: EBITDA normalization, add-backs identification, range calculation
6. Create alert engine: Threshold checks, SMS/email trigger placeholders

**Validation:** Backend API endpoints working; database schema matches architecture spec; mock data seeded correctly; valuation calculations match think-tank formulas

---

### Phase 3: QA + Polish (Week 4)

#### Riley — Test Execution
**Deliverable:** `tests/test-results.md`  
**Tasks:**
1. Run functional tests against deployed app
2. Run technical tests against API endpoints
3. Review results with JayJay for industry validation
4. File bug reports back to Maya/Marcus as needed

**Validation:** All tests pass; JayJay approves industry validation; critical bugs fixed before deployment

---

#### Dana — Documentation
**Deliverable:** `README.md`, `DEPLOYMENT.md`, `DEMO-SCRIPT.md`  
**Tasks:**
1. README: Project overview, tech stack, setup instructions
2. DEPLOYMENT.md: Railway deployment steps, environment variables, troubleshooting
3. DEMO-SCRIPT.md: How Tom walks clients through the app (narrative for client demos)

**Validation:** Documentation complete; demo script ready for client presentations

---

### Phase 4: Deployment (Week 4 End)

#### John — Final Review + Deployment
**Deliverable:** Deployed app on Railway, Telegram summary to Tom  
**Tasks:**
1. Verify all output files exist from Phases 1-3
2. Deploy to Railway (or verify existing deployment works)
3. Test live URL loads correctly on desktop and mobile
4. Send Tom completion notification with:
   - Summary of what was built
   - Live URL for demos
   - Demo script link
   - Next steps (beta customer recruitment, Chris Anderson outreach)

**Validation:** Railway deployment successful; live URL accessible; Tom receives completion notification

---

## Success Criteria — What "Done" Looks Like

### MVP Launch Criteria
1. ✅ Dashboard loads in <3 seconds on 4G connection
2. ✅ All seeded data displays correctly across 4 tabs (Overview, Operations, Financials, Valuation)
3. ✅ Alert engine triggers at least 3 sample alerts on load (hygiene re-care, denial rate, unscheduled treatment value)
4. ✅ Valuation calculation matches think-tank formulas: EBITDA × market multiple with owner-comp normalization
5. ✅ Deployed to Railway with live URL for client demos
6. ✅ Mobile-friendly on phone-sized screens (dentists check between patients)

### Phase 2 Criteria (Real Integrations — Future Sprint)
1. Open Dental Edge Connector successfully extracts data from test practice database
2. PHI de-identification verified (no patient names/DOB in cloud DB)
3. BAA signed with first beta customer
4. 3 founding practices on board at $299/month rate

---

## Risks & Blockers

### Known Risks
1. **Open Dental integration complexity** — Direct SQL queries may require practice-specific schema adjustments; fallback to manual data entry if needed for MVP
2. **QuickBooks API rate limits** — May need chunked extraction or manual expense input form as backup
3. **Valuation liability** — Must include clear disclaimers; Meagan's compliance review required before showing to real customers
4. **HIPAA compliance overhead** — Edge Connector development may take longer than estimated if PHI de-identification proves complex

### Blockers (Waiting On)
1. ✅ **Think tank v2 complete** — All 5 role reports delivered April 25, 2026
2. ⏳ **Tom's approval to proceed** — Greenlight needed before dev team starts building
3. ⏸️ **Chris Anderson beta commitment** — Industry validation from real dentist (not blocking MVP build)

### Mitigation Strategies
- Use existing demo site (`/Users/tomnow/.openclaw/workspace/dentsight/`) as starting point to accelerate frontend work
- Focus on mock data for MVP; defer real integrations to Phase 2
- Get Meagan's BAA template reviewed by lawyer before first customer signup
- Build alert engine with SMS/email placeholders; integrate Twilio in Phase 2

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Planning | Week 1 (Apr 26 - Apr 30) | Architecture spec, design spec, test scripts, industry requirements |
| Build | Weeks 2-3 (May 1 - May 14) | Frontend + backend implementation, database schema, mock data seeding |
| QA + Polish | Week 4 (May 15 - May 21) | Test execution, bug fixes, documentation |
| Deployment | Week 4 End (May 22) | Railway deployment, Tom notification |

**Target MVP Launch:** May 22, 2026 (3 weeks from project start)

---

## Next Steps

1. **Tom approves this plan** — Greenlight to proceed with Phase 1
2. **Vitaly starts architecture spec** — First blocker for frontend/backend work
3. **JayJay + Riley create test scripts** — Parallel with Vitaly, no dependencies
4. **Sofia designs UI/UX** — Can start once project brief is clear (no hard dependency)

Once Phase 1 complete, Maya and Marcus can build in parallel during Weeks 2-3.

---

**John out.** 🎯
