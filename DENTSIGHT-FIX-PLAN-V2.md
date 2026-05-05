# Dentsight Fix Plan v2 — COMPLETE DATA FLOW FIX

**Created:** 2026-05-04  
**Status:** Ready for John to orchestrate  
**Priority:** CRITICAL

---

## Root Cause Analysis

After tracing the full data flow from Database → API → Frontend, I found **4 distinct bugs**:

| Bug | Location | Impact |
|-----|----------|--------|
| 1 | `kpiController.getCompanyOverview()` | KPIs (Net Collection, Denial Rate, etc.) always same |
| 2 | `kpiController.getCompanyOverview()` | Health Score not returned → defaults to "Critical" |
| 3 | `alertsController.getAlerts()` | Returns `message` but frontend expects `headline`/`subtext` |
| 4 | `RightRail` component | Uses alerts instead of recommendations endpoint |

---

## Bug 1: kpiController.getCompanyOverview() — Missing Fields

**File:** `backend/src/controllers/kpiController.js`

**Problem:** The `getCompanyOverview` function aggregates data but ONLY returns:
- `monthlyProduction`
- `unscheduledTreatmentValue`  
- `caseAcceptanceRate` ← wrong field name!
- `dso`
- `costPerChairHour`

**Missing fields that frontend expects:**
- `healthScore`
- `netCollectionRate`
- `denialRate`
- `noShowRate`
- `caseAcceptance` ← correct field name

**Root cause:** The reduce function only picks certain fields and doesn't pass through the others.

### FIX — Replace entire `getCompanyOverview` function:

```javascript
exports.getCompanyOverview = async (req, res) => {
  try {
    const { company_id } = req.query;
    
    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    const kpis = await calculatePracticeKPIs(null, company_id);
    const practices = Object.values(kpis);
    
    if (practices.length === 0) {
      return res.json({
        company_id,
        healthScore: null,
        netCollectionRate: null,
        costPerChairHour: null,
        denialRate: null,
        caseAcceptance: null,
        noShowRate: null,
        dso: null,
        monthlyProduction: null,
        unscheduledTreatmentValue: null
      });
    }

    // For single-practice companies, return that practice's data directly
    if (practices.length === 1) {
      const data = practices[0];
      return res.json({
        company_id,
        healthScore: data.healthScore,
        netCollectionRate: data.netCollectionRate,
        costPerChairHour: data.costPerChairHour,
        denialRate: data.denialRate,
        caseAcceptance: data.caseAcceptance,
        noShowRate: data.noShowRate,
        dso: data.dso,
        monthlyProduction: data.monthlyProduction,
        unscheduledTreatmentValue: data.unscheduledTreatmentValue
      });
    }

    // For multi-practice companies, average the rate metrics and sum the dollar metrics
    const count = practices.length;
    const summed = practices.reduce((acc, data) => ({
      healthScore: (acc.healthScore || 0) + (data.healthScore || 0),
      netCollectionRate: (acc.netCollectionRate || 0) + (data.netCollectionRate || 0),
      costPerChairHour: (acc.costPerChairHour || 0) + (data.costPerChairHour || 0),
      denialRate: (acc.denialRate || 0) + (data.denialRate || 0),
      caseAcceptance: (acc.caseAcceptance || 0) + (data.caseAcceptance || 0),
      noShowRate: (acc.noShowRate || 0) + (data.noShowRate || 0),
      dso: (acc.dso || 0) + (data.dso || 0),
      monthlyProduction: (acc.monthlyProduction || 0) + (data.monthlyProduction || 0),
      unscheduledTreatmentValue: (acc.unscheduledTreatmentValue || 0) + (data.unscheduledTreatmentValue || 0),
    }), {});

    res.json({
      company_id,
      healthScore: Math.round(summed.healthScore / count),
      netCollectionRate: Math.round((summed.netCollectionRate / count) * 10) / 10,
      costPerChairHour: Math.round((summed.costPerChairHour / count) * 10) / 10,
      denialRate: Math.round((summed.denialRate / count) * 10) / 10,
      caseAcceptance: Math.round((summed.caseAcceptance / count) * 10) / 10,
      noShowRate: Math.round((summed.noShowRate / count) * 10) / 10,
      dso: Math.round(summed.dso / count),
      monthlyProduction: Math.round(summed.monthlyProduction),
      unscheduledTreatmentValue: Math.round(summed.unscheduledTreatmentValue)
    });

  } catch (error) {
    console.error('Get Company Overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

**This single fix solves:**
- ✅ KPIs not changing between clinics
- ✅ Health Score stuck at Critical
- ✅ CompactHealthScore component working

---

## Bug 2: alertsController — Missing headline/subtext transformation

**File:** `backend/src/controllers/alertsController.js`

**Problem:** Database stores `message` field, but frontend expects `headline` and `subtext`.

### FIX — Transform alerts before returning:

```javascript
exports.getAlerts = async (req, res) => {
  try {
    const { practice_id, resolved, company_id } = req.query;

    let whereClause = {};
    
    if (company_id) {
      const practices = await prisma.practice.findMany({
        where: { companyId: company_id },
        select: { id: true }
      });
      whereClause.practiceId = { in: practices.map(p => p.id) };
    } else if (practice_id) {
      whereClause.practiceId = practice_id;
    }
    
    if (resolved === 'true') whereClause.isResolved = true;
    else if (resolved === 'false') whereClause.isResolved = false;

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }]
    });

    // Transform to frontend-expected format
    const transformed = alerts.map(alert => ({
      id: alert.id,
      practiceId: alert.practiceId,
      metricName: alert.metricName,
      type: alert.alertType,
      severity: alert.severity,
      headline: generateHeadline(alert.metricName, alert.severity),
      subtext: alert.message,
      isResolved: alert.isResolved,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Get Alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function generateHeadline(metricName, severity) {
  const severityPrefix = severity >= 2 ? '⚠️ ' : severity >= 1 ? '📊 ' : '✅ ';
  const headlines = {
    'denial_rate': 'High Claim Denial Rate',
    'net_collection_rate': 'Collection Rate Below Target',
    'case_acceptance_rate': 'Case Acceptance Needs Improvement',
    'new_patients': 'New Patient Volume Update',
    'hygiene_production': 'Hygiene Production Alert',
    'no_show_rate': 'No-Show Rate Elevated',
    'cost_per_chair_hour': 'Chair Hour Costs High'
  };
  return severityPrefix + (headlines[metricName] || `${metricName} Alert`);
}
```

---

## Bug 3: RightRail uses alerts instead of recommendations

**File:** `frontend/src/App.tsx` (RightRail component, around line 318)

**Problem:** The "Recommended Actions" section calls `fetchAlerts()` but should call `fetchRecommendations()` for actionable advice.

**BUT FIRST** — Need to add `fetchRecommendations` to api.ts.

### FIX Step 1 — Add to `frontend/src/services/api.ts`:

```typescript
export async function fetchRecommendations(companyId?: string): Promise<any[]> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { priority: 'high', category: 'Revenue', title: 'Improve Case Acceptance', description: 'Case acceptance is below target.', actions: ['Train staff', 'Use visual aids'], potentialImpact: '+$5,000/month' }
    ];
  }
  
  const url = companyId 
    ? `${API_BASE_URL}/recommendations?company_id=${companyId}`
    : `${API_BASE_URL}/recommendations`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  return response.json();
}
```

### FIX Step 2 — Update RightRail in `frontend/src/App.tsx`:

Find the RightRail component (~line 310). Change:

```typescript
// OLD:
import { fetchAlerts, fetchValuation } from './services/api';
// ...
fetchAlerts(selectedCompanyId, false)
  .then(data => setPriorities((data || []).filter((a: any) => a.severity <= 2).slice(0, 4)))
```

To:

```typescript
// NEW:
import { fetchAlerts, fetchValuation, fetchRecommendations } from './services/api';
// ...
fetchRecommendations(selectedCompanyId)
  .then(data => setPriorities((data || []).slice(0, 4)))
```

### FIX Step 3 — Update priority display to match recommendation format:

```tsx
// OLD:
<p className="text-sm text-white font-medium">{priority.headline}</p>
<p className="text-xs text-slate-500 mt-1 line-clamp-2">{priority.subtext}</p>

// NEW:
<p className="text-sm text-white font-medium">{priority.title}</p>
<p className="text-xs text-slate-500 mt-1 line-clamp-2">{priority.description}</p>
```

---

## Verification Queries

Run these to confirm data is working:

```sql
-- Check each company returns different KPI values
SELECT c.name, m.metric_name, m.metric_value 
FROM "Company" c 
JOIN practices p ON p.company_id = c.id 
JOIN metrics m ON m.practice_id = p.id 
WHERE m.metric_name = 'net_collection_rate' 
AND m.metric_date = (SELECT MAX(metric_date) FROM metrics)
ORDER BY c.name;

-- Check alerts exist with messages
SELECT p.name, a.metric_name, a.message, a.severity 
FROM practices p 
JOIN alerts a ON a.practice_id = p.id 
WHERE a.is_resolved = false;
```

---

## Testing Checklist

After deploying, verify:

- [ ] Select "High Growth Dental" → Note KPI values
- [ ] Select "Generations Dental Care" → KPIs MUST be different
- [ ] Select "Digital Dental Dynamics" → KPIs MUST be different
- [ ] Health Score shows a number (not "Critical" by default)
- [ ] Health Score changes between clinics
- [ ] Recommended Actions shows specific advice (not blank)
- [ ] Recommended Actions changes between clinics
- [ ] No browser console errors

---

## File Changes Summary

| File | Change |
|------|--------|
| `backend/src/controllers/kpiController.js` | Replace `getCompanyOverview` function entirely |
| `backend/src/controllers/alertsController.js` | Add headline/subtext transformation + `generateHeadline` helper |
| `frontend/src/services/api.ts` | Add `fetchRecommendations` function |
| `frontend/src/App.tsx` | RightRail: switch from alerts to recommendations, update field names |

---

## For John — Sprint Execution

**Agent sequence (one at a time):**

1. **Marcus** — Fix `kpiController.js` and `alertsController.js` (backend)
2. **Maya** — Fix `api.ts` and `App.tsx` RightRail (frontend)
3. **Riley** — Test all 3 clinics on production

**Context budget reminder:** Keep each agent prompt under 3,000 chars. Point them to this file for the exact code changes — don't paste the code in the prompt.

---

## Success Criteria

The site is FIXED when:
1. Every KPI (Net Collection, Denial Rate, etc.) shows different values per clinic
2. Health Score is a real number that changes per clinic
3. Recommended Actions shows specific, actionable advice per clinic
4. No hardcoded fallback values appear anywhere
