# Dentsight Data Fix Plan - COMPREHENSIVE

**Created:** 2026-05-04  
**Priority:** HIGH  
**Goal:** Make Dentsight use REAL database data for each selected clinic, not mock/hardcoded values

---

## Problem Summary

When users select different clinics in the company dropdown, the dashboard numbers **don't change**. This is because:

1. **Frontend has hardcoded values** in multiple components
2. **Missing API function** - `fetchKpiData()` is called but doesn't exist
3. **Fallback values** mask the missing data instead of showing errors
4. **Backend endpoints exist** but aren't being called properly

---

## Phase 1: Fix API Layer (api.ts)

### Issue: Missing `fetchKpiData` function

**File:** `frontend/src/services/api.ts`

**Action:** Add the missing KPI fetch function:

```typescript
// Add this function to api.ts
export async function fetchKpiData(companyId?: string): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      healthScore: 84,
      netCollectionRate: 94,
      costPerChairHour: 42,
      denialRate: 5.4,
      caseAcceptance: 72,
      monthlyProduction: 125000,
      unscheduledTreatmentValue: 45000,
      noShowRate: 8.5,
      dso: 42
    };
  }

  const url = companyId
    ? `${API_BASE_URL}/kpi/company-overview?company_id=${companyId}`
    : `${API_BASE_URL}/kpi/overview`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch KPI data: ${response.statusText}`);
  }
  return response.json();
}
```

### Verification:
```bash
# Test the endpoint directly
curl "https://dentsight-production.up.railway.app/api/kpi/company-overview?company_id=<COMPANY_ID>"
```

---

## Phase 2: Fix OverviewTab.tsx - HARDCODED KPIs

### Issue: Lines 89-96 have hardcoded KPI values

**File:** `frontend/src/components/tabs/OverviewTab.tsx`

**Current (BROKEN):**
```typescript
{[
  { label: 'Net Collection Rate', value: '94%', trend: 'up' as const, target: '92%' },
  { label: 'Cost by Chair Hour', value: '$42/hr', trend: 'stable' as const, target: '$50/hr' },
  { label: 'Denial Rate', value: '5.4%', trend: 'stable' as const, target: '5%' },
  { label: 'Case Acceptance', value: '72%', trend: 'up' as const, target: '70%' }
].map((kpi, i) => ...
```

**Action:** Replace with dynamic data from API:

1. Add state for KPI data:
```typescript
const [kpiData, setKpiData] = useState<any>(null);
```

2. Add KPI fetch to useEffect:
```typescript
import { fetchKpiData } from '../../services/api';

// Inside useEffect:
const kpiResponse = await fetchKpiData(selectedCompanyId);
setKpiData(kpiResponse);
```

3. Replace hardcoded array with dynamic values:
```typescript
const kpis = kpiData ? [
  { 
    label: 'Net Collection Rate', 
    value: `${kpiData.netCollectionRate || 0}%`, 
    trend: determineTrend(kpiData.netCollectionRate, 92),
    target: '92%' 
  },
  { 
    label: 'Cost by Chair Hour', 
    value: `$${kpiData.costPerChairHour || 0}/hr`, 
    trend: determineTrend(50, kpiData.costPerChairHour), // Lower is better
    target: '$50/hr' 
  },
  { 
    label: 'Denial Rate', 
    value: `${kpiData.denialRate || 0}%`, 
    trend: determineTrend(5, kpiData.denialRate), // Lower is better
    target: '5%' 
  },
  { 
    label: 'Case Acceptance', 
    value: `${kpiData.caseAcceptance || 0}%`, 
    trend: determineTrend(kpiData.caseAcceptance, 70),
    target: '70%' 
  }
] : [];
```

4. Add trend helper function:
```typescript
function determineTrend(current: number, target: number): 'up' | 'down' | 'stable' {
  const diff = current - target;
  if (Math.abs(diff) < 2) return 'stable';
  return diff > 0 ? 'up' : 'down';
}
```

---

## Phase 3: Fix App.tsx - Hardcoded Health Score

### Issue: Line 236 - `const healthScore = 84;`

**File:** `frontend/src/App.tsx`

**Action:** Wire health score to actual calculation from metrics:

```typescript
// Replace hardcoded line with:
const [healthScore, setHealthScore] = useState<number>(0);

// In useEffect when company changes:
useEffect(() => {
  if (!selectedCompanyId) return;
  
  fetchKpiData(selectedCompanyId).then(data => {
    if (data?.healthScore) {
      setHealthScore(data.healthScore);
    } else {
      // Calculate from metrics if not provided
      calculateHealthScore(selectedCompanyId).then(setHealthScore);
    }
  });
}, [selectedCompanyId]);
```

---

## Phase 4: Fix quickStats Hardcoded Values

### Issue: Lines 55-60 in OverviewTab.tsx

**Current (BROKEN):**
```typescript
const quickStats = {
  monthlyProduction: valuation?.revenue ? valuation.revenue / 12 : 125000,
  unscheduledTreatmentValue: 45000,  // HARDCODED!
  noShowRate: 8.5,                    // HARDCODED!
  caseAcceptance: 72,                 // HARDCODED!
  dso: 42,                            // HARDCODED!
};
```

**Action:** Use KPI data:
```typescript
const quickStats = kpiData ? {
  monthlyProduction: kpiData.monthlyProduction || 0,
  unscheduledTreatmentValue: kpiData.unscheduledTreatmentValue || 0,
  noShowRate: kpiData.noShowRate || 0,
  caseAcceptance: kpiData.caseAcceptance || 0,
  dso: kpiData.dso || 0,
} : null;
```

---

## Phase 5: Backend - Ensure KPI Service Returns All Fields

### Issue: Backend may not be calculating all required KPIs

**File:** `backend/src/services/kpiService.js`

**Action:** Verify the `calculatePracticeKPIs` function returns:
- `healthScore` (calculated from weighted metrics)
- `netCollectionRate`
- `costPerChairHour`
- `denialRate`
- `caseAcceptance`
- `monthlyProduction`
- `unscheduledTreatmentValue`
- `noShowRate`
- `dso` (Days Sales Outstanding)

**Add Health Score Calculation:**
```javascript
function calculateHealthScore(metrics) {
  const weights = {
    netCollectionRate: { weight: 0.25, target: 95, direction: 'higher' },
    caseAcceptance: { weight: 0.20, target: 70, direction: 'higher' },
    denialRate: { weight: 0.15, target: 5, direction: 'lower' },
    noShowRate: { weight: 0.15, target: 8, direction: 'lower' },
    costPerChairHour: { weight: 0.10, target: 50, direction: 'lower' },
    dso: { weight: 0.15, target: 30, direction: 'lower' }
  };

  let score = 0;
  for (const [metric, config] of Object.entries(weights)) {
    const value = metrics[metric] || 0;
    let metricScore;
    
    if (config.direction === 'higher') {
      metricScore = Math.min(100, (value / config.target) * 100);
    } else {
      metricScore = Math.max(0, 100 - ((value - config.target) / config.target * 50));
    }
    
    score += metricScore * config.weight;
  }
  
  return Math.round(score);
}
```

---

## Phase 6: Actionable Recommendations Feature

### New Feature: Show clinic-specific recommended actions

**Location:** RightRail component (already has "Recommended Actions" section)

**Data Source:** Create new table or derive from alerts + metrics

**Implementation:**

1. **Backend:** Add `/api/recommendations` endpoint:
```javascript
// backend/src/controllers/recommendationsController.js
exports.getRecommendations = async (req, res) => {
  const { company_id } = req.query;
  
  // Get current metrics
  const metrics = await getLatestMetrics(company_id);
  
  // Generate recommendations based on metric vs benchmark
  const recommendations = [];
  
  if (metrics.caseAcceptance < 70) {
    recommendations.push({
      priority: 'high',
      category: 'Revenue',
      title: 'Improve Case Acceptance',
      description: `Your case acceptance rate (${metrics.caseAcceptance}%) is below the 70% benchmark.`,
      actions: [
        'Review treatment presentation techniques',
        'Implement visual aids for patient education',
        'Offer financing options upfront'
      ],
      potentialImpact: `+$${Math.round((70 - metrics.caseAcceptance) * 500)} monthly revenue`
    });
  }
  
  if (metrics.noShowRate > 10) {
    recommendations.push({
      priority: 'high',
      category: 'Operations',
      title: 'Reduce No-Show Rate',
      description: `Your no-show rate (${metrics.noShowRate}%) is impacting revenue.`,
      actions: [
        'Implement automated appointment reminders',
        'Require confirmation 48 hours before',
        'Establish a cancellation policy with fees'
      ],
      potentialImpact: `Recover ${Math.round(metrics.noShowRate * 2)} appointments/month`
    });
  }
  
  // ... more rules for other metrics
  
  res.json(recommendations);
};
```

2. **Frontend:** Update RightRail to show actionable cards:
```typescript
interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  actions: string[];
  potentialImpact: string;
}
```

---

## Phase 7: Database Verification

### Ensure each clinic has real data

**Run these queries to verify:**

```sql
-- Check companies exist
SELECT id, name FROM "Company";

-- Check each company has practices
SELECT c.name as company, p.name as practice 
FROM "Company" c 
LEFT JOIN practices p ON p.company_id = c.id;

-- Check metrics exist per practice
SELECT p.name, COUNT(m.id) as metric_count 
FROM practices p 
LEFT JOIN metrics m ON m.practice_id = p.id 
GROUP BY p.name;

-- Check alerts exist per practice  
SELECT p.name, COUNT(a.id) as alert_count 
FROM practices p 
LEFT JOIN alerts a ON a.practice_id = p.id 
GROUP BY p.name;

-- Verify metrics have different values
SELECT p.name, m.metric_name, m.metric_value 
FROM practices p 
JOIN metrics m ON m.practice_id = p.id 
WHERE m.metric_date = (SELECT MAX(metric_date) FROM metrics)
ORDER BY p.name, m.metric_name;
```

---

## Testing Checklist

### Before marking complete, verify ALL of these:

- [ ] Select "Apex Dental Group" → Numbers update
- [ ] Select "Bright Smiles Family Dentistry" → Numbers are DIFFERENT
- [ ] Select "High Growth Dental" → Numbers are DIFFERENT
- [ ] Health Score changes per clinic
- [ ] KPIs (Collection Rate, Chair Hour Cost, etc.) change per clinic
- [ ] Valuation range changes per clinic
- [ ] Alerts are clinic-specific
- [ ] Quick stats change per clinic
- [ ] No console errors in browser DevTools
- [ ] API calls include company_id parameter (check Network tab)
- [ ] Recommended Actions show clinic-specific advice

### Production Verification:

```bash
# Test on live site
# 1. Open DevTools Network tab
# 2. Select different companies
# 3. Verify API calls include correct company_id
# 4. Verify response data differs per company
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `frontend/src/services/api.ts` | Add `fetchKpiData()` function |
| `frontend/src/components/tabs/OverviewTab.tsx` | Replace hardcoded KPIs with dynamic data |
| `frontend/src/App.tsx` | Wire health score to API |
| `backend/src/services/kpiService.js` | Add health score calculation |
| `backend/src/controllers/recommendationsController.js` | NEW - actionable recommendations |
| `backend/src/routes/recommendationsRoutes.js` | NEW - recommendation routes |

---

## Success Criteria

**The site is fixed when:**

1. Selecting any clinic shows DIFFERENT numbers
2. All data comes from PostgreSQL, not hardcoded values
3. Health score reflects actual clinic performance
4. Recommended actions are specific to each clinic's weaknesses
5. No fallback/mock values appear in production

---

## Notes for Dev Team

- **DO NOT** just fix one thing and stop - verify the ENTIRE flow
- **DO NOT** use hardcoded fallbacks that mask broken data
- **DO** check browser console for errors after each change
- **DO** verify on production after Railway deploys
- **DO** test at least 3 different clinics to confirm data changes

**This is a demo site for doctors.** It needs to look professional and show REAL data. If a clinic has missing data, show "No data available" - don't fake it with hardcoded numbers.

---

## Contact

Questions? Ping Tom or Bob in the dev channel.
