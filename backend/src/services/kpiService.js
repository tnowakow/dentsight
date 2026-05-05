const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Convert a dateFilter string to a { from, to } range in real calendar time.
 * These are the "apparent" dates the user is asking about.
 */
function getApparentDateRange(dateFilter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (dateFilter) {
    case 'today':
      return { from: today, to: now };

    case 'this-week': {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay()); // Sunday
      return { from: start, to: now };
    }

    case 'this-month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: start, to: now };
    }

    case 'last-month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from: start, to: end };
    }

    case 'this-quarter': {
      const q     = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      return { from: start, to: now };
    }

    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { from: start, to: now };
    }

    default:
      // No filter → last 90 days
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return { from: ninetyDaysAgo, to: now };
  }
}

/**
 * Shift a date range backward by a whole number of months so it aligns with
 * the stored seed data. This is what makes the data "float" with today.
 *
 * Seed data is stamped on the 1st of each month going back 12 months from
 * seed time. The most recent stored metric date is the "anchor". We compute
 * how many months have passed since the anchor, then shift the query window
 * back by that offset so the stored data always appears current.
 */
function shiftRangeByOffset(range, monthOffset) {
  const shiftMonth = (d, n) => {
    const copy = new Date(d);
    copy.setMonth(copy.getMonth() - n);
    return copy;
  };
  return {
    from: shiftMonth(range.from, monthOffset),
    to:   shiftMonth(range.to,   monthOffset),
  };
}

/**
 * Get the month offset for a practice: how many calendar months have passed
 * since its most recent stored metric.
 */
async function getMonthOffset(practiceId) {
  const latest = await prisma.metric.findFirst({
    where:   { practiceId },
    orderBy: { metricDate: 'desc' },
    select:  { metricDate: true },
  });
  if (!latest) return 0;

  const now     = new Date();
  const anchor  = latest.metricDate;
  const months  =
    (now.getFullYear() - anchor.getFullYear()) * 12 +
    (now.getMonth()    - anchor.getMonth());
  return Math.max(0, months);
}

/**
 * Calculate health score (0-100) from weighted KPI metrics.
 *
 * Weights and targets:
 *   netCollectionRate  25%  target 95  higher=better
 *   caseAcceptance     20%  target 70  higher=better
 *   denialRate         15%  target 5   lower=better
 *   noShowRate         15%  target 8   lower=better
 *   costPerChairHour   10%  target 250 lower-better  (industry: $150-250/hr total overhead per chair)
 *   dso                15%  target 30  lower=better
 */
function calculateHealthScore(kpis) {
  const { netCollectionRate, caseAcceptance, denialRate, noShowRate, costPerChairHour, dso } = kpis;

  let totalWeight = 0;
  let weightedScore = 0;

  function addMetric(value, weight, target, higherIsBetter) {
    if (value === null || value === undefined) return;
    let score;
    if (higherIsBetter) {
      score = Math.min(value / target, 1) * 100;
    } else {
      score = Math.max(0, (2 - value / target)) * 50;
      score = Math.min(score, 100);
    }
    weightedScore += score * weight;
    totalWeight   += weight;
  }

  addMetric(netCollectionRate, 0.25, 95,  true);
  addMetric(caseAcceptance,    0.20, 70,  true);
  addMetric(denialRate,        0.15, 5,   false);
  addMetric(noShowRate,        0.15, 8,   false);
  addMetric(costPerChairHour,  0.10, 250, false);
  addMetric(dso,               0.15, 30,  false);

  if (totalWeight === 0) return null;
  return Math.round(weightedScore / totalWeight);
}

/**
 * Calculate all KPIs for a practice or company, optionally filtered by date.
 *
 * @param {string|null} practiceId
 * @param {string|null} companyId
 * @param {string}      dateFilter  — 'today' | 'this-week' | 'this-month' | 'last-month' | 'this-quarter' | 'ytd' | null
 */
async function calculatePracticeKPIs(practiceId, companyId, dateFilter) {
  const now = new Date();

  let practiceIds;
  if (companyId) {
    const practices = await prisma.practice.findMany({
      where:  { companyId },
      select: { id: true },
    });
    practiceIds = practices.map(p => p.id);
  } else if (practiceId) {
    practiceIds = [practiceId];
  } else {
    throw new Error('Either practiceId or companyId is required');
  }

  const kpis = {};
  for (const pid of practiceIds) {
    kpis[pid] = await calculateSinglePracticeKPIs(pid, now, dateFilter);
  }
  return kpis;
}

// Metrics where lower = better (averaged differently to make sense)
const LOWER_IS_BETTER = new Set(['denial_rate', 'cost_per_chair_hour', 'no_show_rate', 'dso']);
// Multi-month filters: average all snapshots in the window for a true period view
const MULTI_MONTH_FILTERS = new Set(['this-quarter', 'ytd']);

async function calculateSinglePracticeKPIs(practiceId, now, dateFilter) {
  // Get the apparent date range the user wants
  const apparentRange = getApparentDateRange(dateFilter);

  // Compute how many months the stored data is behind today, then shift the
  // query window backward so it maps to the right monthly snapshots.
  const monthOffset   = await getMonthOffset(practiceId);
  const storedRange   = shiftRangeByOffset(apparentRange, monthOffset);

  // Pull all metrics for this practice within the shifted range
  const metricRows = await prisma.metric.findMany({
    where: {
      practiceId,
      metricDate: { gte: storedRange.from, lte: storedRange.to },
    },
    orderBy: { metricDate: 'desc' },
  });

  // For single-month filters: use the most recent snapshot in the window.
  // For multi-month filters (this-quarter, ytd): average all monthly snapshots
  // so the period genuinely reflects the full window, not just the latest month.
  const latestMetrics = {};
  const isMultiMonth  = MULTI_MONTH_FILTERS.has(dateFilter);

  if (!isMultiMonth) {
    // Most-recent-in-window
    for (const row of metricRows) {
      if (!(row.metricName in latestMetrics)) {
        latestMetrics[row.metricName] = parseFloat(row.metricValue);
      }
    }
  } else {
    // Average all monthly snapshots in the window
    const sums   = {};
    const counts = {};
    for (const row of metricRows) {
      const v = parseFloat(row.metricValue);
      sums[row.metricName]   = (sums[row.metricName]   || 0) + v;
      counts[row.metricName] = (counts[row.metricName] || 0) + 1;
    }
    for (const name of Object.keys(sums)) {
      latestMetrics[name] = sums[name] / counts[name];
    }
  }

  const netCollectionRate        = latestMetrics['net_collection_rate']        ?? null;
  const costPerChairHour         = latestMetrics['cost_per_chair_hour']        ?? null;
  const denialRate               = latestMetrics['denial_rate']                ?? null;
  const caseAcceptance           = latestMetrics['case_acceptance_rate']       ?? null;
  const dso                      = latestMetrics['dso']          != null ? Math.round(latestMetrics['dso']) : null;
  const noShowRate               = latestMetrics['no_show_rate']               ?? null;
  const monthlyProduction        = latestMetrics['monthly_production']         ?? null;
  const unscheduledTreatmentValue= latestMetrics['unscheduled_treatment_value']?? null;

  const kpiSnapshot = { netCollectionRate, costPerChairHour, denialRate, caseAcceptance, dso, noShowRate, monthlyProduction, unscheduledTreatmentValue };
  const healthScore = calculateHealthScore(kpiSnapshot);

  return { healthScore, netCollectionRate, costPerChairHour, denialRate, caseAcceptance, dso, noShowRate, monthlyProduction, unscheduledTreatmentValue };
}

module.exports = { calculatePracticeKPIs, calculateSinglePracticeKPIs, calculateHealthScore };
