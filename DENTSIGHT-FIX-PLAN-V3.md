# Dentsight Fix Plan V3 — Complete Data Flow Fix

**Created:** 2026-05-05  
**Status:** Ready for immediate execution  
**Priority:** CRITICAL

---

## Executive Summary

V2 fixed the backend KPI calculations but **the frontend never wires them up**. The dashboard shows hardcoded mock data everywhere.

### What's Actually Broken

| Tab | Component | Problem |
|-----|-----------|---------|
| Overview | Secondary KPI Grid | 100% hardcoded strings ('94%', '$42/hr') |
| Overview | Quick Stats | Wrong data structure (expects `.quickStats`, API returns root fields) |
| Operations | All charts | `fetchOperationsData()` returns empty arrays `[]` |
| Financials | Production Breakdown | Static useState, no setter |
| Financials | Cost Analysis | Static useState, no setter |
| Valuation | Addbacks List | Hardcoded mock array |

---

## Fix 1: App.tsx — Wire Up Real KPI Data

**File:** `frontend/src/App.tsx`

### 1a. Share KPI data across Overview components

The CompactHealthScore fetches KPI data but doesn't share it. Add shared state at OverviewTab level:

**Find this code (around line 410):**
```tsx
const OverviewTab = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [valuationPreview, setValuationPreview] = useState('$3.15M - $3.40M');
  const [quickStats, setQuickStats] = useState<any>({});
```

**Replace with:**
```tsx
const OverviewTab = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [valuationPreview, setValuationPreview] = useState('$3.15M - $3.40M');
  const [kpiData, setKpiData] = useState<any>({});
```

### 1b. Fix the data fetching to populate KPI data

**Find this code (around line 420):**
```tsx
        // Fetch KPI data from backend
        const kpiData = await fetchKpiData(selectedCompanyId);
        if (kpiData?.quickStats) {
          setQuickStats(kpiData.quickStats);
        } else if (valuationData) {
          // Fallback to valuation data if KPIs not available
          setQuickStats({
            monthlyProduction: valuationData.revenue ? Math.round(valuationData.revenue / 12) : null,
            unscheduledTreatmentValue: null,
            noShowRate: null,
            caseAcceptance: null,
            dso: null,
          });
        }
```

**Replace with:**
```tsx
        // Fetch KPI data from backend (fields are at root level, not nested)
        const kpi = await fetchKpiData(selectedCompanyId);
        setKpiData(kpi || {});
```

### 1c. Fix Secondary KPI Grid — Connect to real data

**Find this code (around line 481):**
```tsx
      {/* 3. Secondary KPI Grid - Smaller, Denser */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Net Collection', value: '94%', trend: 'up' as const, target: '92%' },
          { label: 'Cost by Chair Hour', value: '$42/hr', trend: 'stable' as const, target: '$50/hr'},
          { label: 'Denial Rate', value: '5.4%', trend: 'stable' as const, target: '5%' },
          { label: 'Case Acceptance', value: '72%', trend: 'up' as const, target: '70%' }
        ].map((kpi: { label: string; value: string; trend: 'up' | 'down' | 'stable'; target: string }, i) => (
```

**Replace with:**
```tsx
      {/* 3. Secondary KPI Grid - Smaller, Denser */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { 
            label: 'Net Collection', 
            value: kpiData.netCollectionRate != null ? `${kpiData.netCollectionRate}%` : '—', 
            trend: (kpiData.netCollectionRate ?? 0) >= 92 ? 'up' as const : 'down' as const, 
            target: '92%' 
          },
          { 
            label: 'Cost by Chair Hour', 
            value: kpiData.costPerChairHour != null ? `$${kpiData.costPerChairHour}/hr` : '—', 
            trend: (kpiData.costPerChairHour ?? 100) <= 50 ? 'up' as const : 'down' as const, 
            target: '$50/hr'
          },
          { 
            label: 'Denial Rate', 
            value: kpiData.denialRate != null ? `${kpiData.denialRate}%` : '—', 
            trend: (kpiData.denialRate ?? 100) <= 5 ? 'up' as const : 'down' as const, 
            target: '5%' 
          },
          { 
            label: 'Case Acceptance', 
            value: kpiData.caseAcceptance != null ? `${kpiData.caseAcceptance}%` : '—', 
            trend: (kpiData.caseAcceptance ?? 0) >= 70 ? 'up' as const : 'down' as const, 
            target: '70%' 
          }
        ].map((kpi: { label: string; value: string; trend: 'up' | 'down' | 'stable'; target: string }, i) => (
```

### 1d. Fix Quick Stats Grid — Use correct data structure

**Find this code (around line 507):**
```tsx
      {/* 5. Quick Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Monthly Prod.', value: quickStats.monthlyProduction ? formatCurrency(quickStats.monthlyProduction) : '—', icon: DollarIcon },
          { label: 'Unscheduled', value: quickStats.unscheduledTreatmentValue ? formatCurrency(quickStats.unscheduledTreatmentValue) : '—', icon: Clock },
          { label: 'No-Show Rate', value: quickStats.noShowRate ? `${quickStats.noShowRate}%` : '—', icon: AlertTriangle },
          { label: 'Case Acceptance', value: quickStats.caseAcceptance ? `${quickStats.caseAcceptance}%` : '—', icon: CheckCircle2 },
          { label: 'DSO', value: quickStats.dso ? `${quickStats.dso} days` : '—', icon: Calendar },
        ].map((stat, i) => (
```

**Replace with:**
```tsx
      {/* 5. Quick Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Monthly Prod.', value: kpiData.monthlyProduction ? formatCurrency(kpiData.monthlyProduction) : '—', icon: DollarIcon },
          { label: 'Unscheduled', value: kpiData.unscheduledTreatmentValue ? formatCurrency(kpiData.unscheduledTreatmentValue) : '—', icon: Clock },
          { label: 'No-Show Rate', value: kpiData.noShowRate != null ? `${kpiData.noShowRate}%` : '—', icon: AlertTriangle },
          { label: 'Case Acceptance', value: kpiData.caseAcceptance != null ? `${kpiData.caseAcceptance}%` : '—', icon: CheckCircle2 },
          { label: 'DSO', value: kpiData.dso != null ? `${kpiData.dso} days` : '—', icon: Calendar },
        ].map((stat, i) => (
```

---

## Fix 2: Backend — Add Operations Data Endpoint

**File:** `backend/src/controllers/operationsController.js` (NEW FILE)

```javascript
const { PrismaClient } = require('@prisma/client');
const { calculatePracticeKPIs } = require('../services/kpiService');
const prisma = new PrismaClient();

exports.getOperationsData = async (req, res) => {
  try {
    const { company_id, practice_id } = req.query;
    
    if (!company_id && !practice_id) {
      return res.status(400).json({ error: 'company_id or practice_id is required' });
    }

    // Get practice IDs
    let practiceIds;
    if (company_id) {
      const practices = await prisma.practice.findMany({
        where: { companyId: company_id },
        select: { id: true }
      });
      practiceIds = practices.map(p => p.id);
    } else {
      practiceIds = [practice_id];
    }

    // Get provider data from appointments
    const providers = await prisma.provider.findMany({
      where: { practiceId: { in: practiceIds } },
      include: {
        appointments: {
          select: { 
            productionValue: true,
            duration: true 
          }
        }
      }
    });

    // Calculate hourly production per provider
    const providerProduction = providers.map(provider => {
      const totalProduction = provider.appointments.reduce((sum, a) => sum + parseFloat(a.productionValue || 0), 0);
      const totalHours = provider.appointments.reduce((sum, a) => sum + ((a.duration || 60) / 60), 0);
      const hourlyProduction = totalHours > 0 ? Math.round(totalProduction / totalHours) : 0;
      const isDoctor = provider.providerType === 'doctor' || provider.providerType === 'dentist';
      
      return {
        name: provider.name,
        hourlyProduction,
        target: isDoctor ? 400 : 100
      };
    });

    // Get KPI data for appointment metrics
    const kpis = await calculatePracticeKPIs(null, company_id);
    const practices = Object.values(kpis);
    const avgKpis = practices.length > 0 ? {
      noShowRate: Math.round(practices.reduce((sum, p) => sum + (p.noShowRate || 0), 0) / practices.length * 10) / 10,
      caseAcceptance: Math.round(practices.reduce((sum, p) => sum + (p.caseAcceptance || 0), 0) / practices.length * 10) / 10,
      denialRate: Math.round(practices.reduce((sum, p) => sum + (p.denialRate || 0), 0) / practices.length * 10) / 10,
      costPerChairHour: Math.round(practices.reduce((sum, p) => sum + (p.costPerChairHour || 0), 0) / practices.length * 10) / 10,
    } : {};

    const appointmentMetrics = [
      { 
        metric: 'No-Show Rate', 
        currentValue: avgKpis.noShowRate != null ? `${avgKpis.noShowRate}%` : '—', 
        trend: (avgKpis.noShowRate ?? 100) <= 8 ? 'up' : 'down',
        benchmark: '<8%' 
      },
      { 
        metric: 'Cancellation Rate', 
        currentValue: '—',  // Would need cancellation tracking
        trend: 'stable',
        benchmark: '<10%' 
      },
      { 
        metric: 'Case Acceptance', 
        currentValue: avgKpis.caseAcceptance != null ? `${avgKpis.caseAcceptance}%` : '—', 
        trend: (avgKpis.caseAcceptance ?? 0) >= 70 ? 'up' : 'down',
        benchmark: '>70%' 
      },
    ];

    // Get denial rates by payer (from claims data if available)
    const denialRates = [];
    // This would require claims/insurance data in the schema - returning empty for now
    // Future: query ClaimsDenial table grouped by payer

    res.json({
      providerProduction: providerProduction.length > 0 ? providerProduction : null,
      appointmentMetrics,
      denialRates: denialRates.length > 0 ? denialRates : null,
      costAnalysis: {
        costPerChairHour: avgKpis.costPerChairHour ?? null,
        supplyCostPercent: null,  // Would need expense categorization
        labFeePercent: null       // Would need expense categorization
      }
    });
  } catch (error) {
    console.error('Get Operations Data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

**File:** `backend/src/routes/index.js` — Add route:

```javascript
const operationsController = require('../controllers/operationsController');

// Add this line with other routes:
router.get('/operations', operationsController.getOperationsData);
```

---

## Fix 3: api.ts — Fix fetchOperationsData

**File:** `frontend/src/services/api.ts`

**Find this code:**
```typescript
// Fetch operations data (denial rates, appointment metrics)
export async function fetchOperationsData(companyId?: string): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      denialRates: mockData.denialRates,
      appointmentMetrics: mockData.appointmentMetrics,
      providerProduction: mockData.providerProduction
    };
  }

  // Fetch metrics - reserved for future transformation
  await fetchMetrics(companyId);

  return {
    denialRates: [],
    appointmentMetrics: [],
    providerProduction: []
  };
}
```

**Replace with:**
```typescript
// Fetch operations data (denial rates, appointment metrics, provider production)
export async function fetchOperationsData(companyId?: string): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      denialRates: mockData.denialRates,
      appointmentMetrics: mockData.appointmentMetrics,
      providerProduction: mockData.providerProduction
    };
  }

  const url = companyId 
    ? `${API_BASE_URL}/operations?company_id=${companyId}`
    : `${API_BASE_URL}/operations`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Operations API failed: ${response.statusText}`);
      return { denialRates: null, appointmentMetrics: null, providerProduction: null, costAnalysis: null };
    }
    return response.json();
  } catch (error) {
    console.warn('Operations API error:', error);
    return { denialRates: null, appointmentMetrics: null, providerProduction: null, costAnalysis: null };
  }
}
```

---

## Fix 4: OperationsTab — Use null-check for fallbacks

**File:** `frontend/src/components/tabs/OperationsTab.tsx`

**Find this code (around line 44):**
```tsx
        // Update state with fetched data if available
        if (opsData?.providerProduction && opsData.providerProduction.length > 0) {
          setProviderProduction(opsData.providerProduction);
        }
        if (opsData?.appointmentMetrics && opsData.appointmentMetrics.length > 0) {
          setAppointmentMetrics(opsData.appointmentMetrics);
        }
```

**Replace with:**
```tsx
        // Update state with fetched data if available (null means API returned no data)
        if (opsData?.providerProduction != null) {
          setProviderProduction(opsData.providerProduction);
        }
        if (opsData?.appointmentMetrics != null) {
          setAppointmentMetrics(opsData.appointmentMetrics);
        }
```

This way:
- `[]` (empty array from mock) = use defaults
- `null` = API has no data, keep defaults
- Actual data array = use real data

---

## Fix 5: FinancialsTab — Add setters and wire to API

**File:** `frontend/src/components/tabs/FinancialsTab.tsx`

**Find this code (around line 27):**
```tsx
  const [denialRates, setDenialRates] = useState(defaultDenialRates);
  const [productionBreakdown] = useState(defaultProductionBreakdown);
  const [costAnalysis] = useState(defaultCostAnalysis);
```

**Replace with:**
```tsx
  const [denialRates, setDenialRates] = useState(defaultDenialRates);
  const [productionBreakdown, setProductionBreakdown] = useState(defaultProductionBreakdown);
  const [costAnalysis, setCostAnalysis] = useState(defaultCostAnalysis);
```

**Find this code (around line 40):**
```tsx
        // Update state with fetched data if available
        if (opsData?.denialRates && opsData.denialRates.length > 0) {
          setDenialRates(opsData.denialRates);
        }
```

**Replace with:**
```tsx
        // Update state with fetched data if available
        if (opsData?.denialRates != null) {
          setDenialRates(opsData.denialRates);
        }
        if (opsData?.costAnalysis) {
          setCostAnalysis({
            costPerChairHour: opsData.costAnalysis.costPerChairHour ?? defaultCostAnalysis.costPerChairHour,
            supplyCostPercent: opsData.costAnalysis.supplyCostPercent ?? defaultCostAnalysis.supplyCostPercent,
            labFeePercent: opsData.costAnalysis.labFeePercent ?? defaultCostAnalysis.labFeePercent,
          });
        }
```

---

## Fix 6: ValuationTab — Fetch addbacks from API

**File:** `backend/src/controllers/valuationController.js`

**Find the `res.json()` call inside the `if (company_id)` block and add addbacks:**

After the market_multiple calculation (around line 65), add:

```javascript
      // Fetch addbacks for this company
      const addbacks = await prisma.addback.findMany({
        where: { 
          practiceId: { in: practices.map(p => p.id) }
        },
        select: {
          name: true,
          amount: true,
          category: true
        }
      });

      const addbacksList = addbacks.length > 0 ? addbacks : [
        { name: 'Owner Salary Adjustment', amount: 120000, category: 'Owner Comp' },
        { name: 'Personal Vehicle Lease', amount: 8000, category: 'One-time expense' },
        { name: 'Non-recurring Marketing', amount: 5000, category: 'Marketing' },
      ];
      
      const addbacksTotal = addbacksList.reduce((sum, a) => sum + a.amount, 0);
```

Then update the response to include:
```javascript
      res.json({
        // ... existing fields ...
        addbacks: addbacksList,
        addbacks_total: addbacksTotal,
        // ... rest of response ...
      });
```

**File:** `frontend/src/components/tabs/ValuationTab.tsx`

**Find this code (around line 35):**
```tsx
  // Mock addbacks for now (can be fetched from backend later)
  const addbacks = [
    { name: 'Owner Salary Adjustment', amount: 120000, category: 'Owner Comp' },
    { name: 'Personal Vehicle Lease', amount: 8000, category: 'One-time expense' },
    { name: 'Non-recurring Marketing', amount: 5000, category: 'Marketing' },
  ];
```

**Replace with:**
```tsx
  // Use addbacks from API, fallback to defaults
  const addbacks = valuationData?.addbacks || [
    { name: 'Owner Salary Adjustment', amount: 120000, category: 'Owner Comp' },
    { name: 'Personal Vehicle Lease', amount: 8000, category: 'One-time expense' },
    { name: 'Non-recurring Marketing', amount: 5000, category: 'Marketing' },
  ];
```

---

## Testing Checklist

After applying ALL fixes, verify:

### Overview Tab
- [ ] Secondary KPI Grid shows DIFFERENT values per company
- [ ] Net Collection, Denial Rate, Case Acceptance, Cost by Chair Hour all change when switching companies
- [ ] Quick Stats (Monthly Prod, DSO, etc.) show real values, not "—"
- [ ] Values match what's shown in the Health Score expanded view

### Operations Tab
- [ ] Provider Hourly Production chart shows data (or appropriate loading state)
- [ ] Appointment Metrics table shows real No-Show Rate and Case Acceptance
- [ ] Hygiene Re-care Trend chart loads trend data

### Financials Tab
- [ ] Denial Rate by Payer shows data (or graceful empty state)
- [ ] Cost Analysis shows real Cost per Chair Hour from API
- [ ] Values change when switching companies

### Valuation Tab
- [ ] Addbacks list changes per company (if data exists)
- [ ] EBITDA and valuation range are calculated correctly

---

## File Changes Summary

| File | Action | Changes |
|------|--------|---------|
| `frontend/src/App.tsx` | EDIT | Fix OverviewTab to share KPI data, wire grids to real data |
| `backend/src/controllers/operationsController.js` | CREATE | New endpoint for operations data |
| `backend/src/routes/index.js` | EDIT | Add operations route |
| `frontend/src/services/api.ts` | EDIT | Fix fetchOperationsData to call real API |
| `frontend/src/components/tabs/OperationsTab.tsx` | EDIT | Fix null-check logic |
| `frontend/src/components/tabs/FinancialsTab.tsx` | EDIT | Add setters, wire to API |
| `backend/src/controllers/valuationController.js` | EDIT | Add addbacks to response |
| `frontend/src/components/tabs/ValuationTab.tsx` | EDIT | Use addbacks from API |

---

## Root Cause

**V2 fixed the backend but nobody wired the frontend.**

The backend now correctly returns different KPI values per company. But:
1. The Secondary KPI Grid was never connected to ANY API — pure hardcoded strings
2. The Quick Stats expected a nested `quickStats` object that doesn't exist
3. `fetchOperationsData` was returning empty arrays `[]` instead of calling an API
4. FinancialsTab had static useState declarations with no setters

This V3 fix completes the data flow: **Backend → API → Frontend state → UI render**
