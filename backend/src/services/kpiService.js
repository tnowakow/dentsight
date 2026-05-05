const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculate health score (0-100) from weighted KPI metrics.
 * 
 * Weights and targets:
 *   netCollectionRate  25%  target 95  higher=better
 *   caseAcceptance     20%  target 70  higher=better
 *   denialRate         15%  target 5   lower=better
 *   noShowRate         15%  target 8   lower=better
 *   costPerChairHour   10%  target 50  lower=better
 *   dso                15%  target 30  lower=better
 */
function calculateHealthScore(kpis) {
  const {
    netCollectionRate,
    caseAcceptance,
    denialRate,
    noShowRate,
    costPerChairHour,
    dso
  } = kpis;

  let totalWeight = 0;
  let weightedScore = 0;

  function addMetric(value, weight, target, higherIsBetter, cap = 100) {
    if (value === null || value === undefined) return;
    let score;
    if (higherIsBetter) {
      // Score = min(value / target, 1) * 100
      score = Math.min(value / target, 1) * 100;
    } else {
      // Score = max(0, 2 - value / target) * 50  — 100 at 0, 50 at target, 0 at 2x target
      score = Math.max(0, (2 - value / target) / 1) * 50;
      score = Math.min(score, 100);
    }
    weightedScore += score * weight;
    totalWeight += weight;
  }

  addMetric(netCollectionRate, 0.25, 95, true);
  addMetric(caseAcceptance, 0.20, 70, true);
  addMetric(denialRate, 0.15, 5, false);
  addMetric(noShowRate, 0.15, 8, false);
  addMetric(costPerChairHour, 0.10, 50, false);
  addMetric(dso, 0.15, 30, false);

  if (totalWeight === 0) return null;

  return Math.round(weightedScore / totalWeight);
}

/**
 * Calculate all KPIs for a practice or company
 */
async function calculatePracticeKPIs(practiceId, companyId) {
  const now = new Date();

  // Determine which practices to query
  let practiceIds;
  if (companyId) {
    const practices = await prisma.practice.findMany({
      where: { companyId },
      select: { id: true }
    });
    practiceIds = practices.map(p => p.id);
  } else if (practiceId) {
    practiceIds = [practiceId];
  } else {
    throw new Error('Either practiceId or companyId is required');
  }

  // Calculate metrics for each practice
  const kpis = {};

  for (const pid of practiceIds) {
    kpis[pid] = await calculateSinglePracticeKPIs(pid, now);
  }

  return kpis;
}

async function calculateSinglePracticeKPIs(practiceId, now) {
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Pull all known metrics for this practice in one query for efficiency
  const metricRows = await prisma.metric.findMany({
    where: {
      practiceId,
      metricDate: { gte: ninetyDaysAgo }
    },
    orderBy: { metricDate: 'desc' }
  });

  // Build a lookup map: metricName → most recent value
  const latestMetrics = {};
  for (const row of metricRows) {
    if (!(row.metricName in latestMetrics)) {
      latestMetrics[row.metricName] = parseFloat(row.metricValue);
    }
  }

  const netCollectionRate = latestMetrics['net_collection_rate'] ?? null;
  const costPerChairHour = latestMetrics['cost_per_chair_hour'] ?? null;
  const denialRate = latestMetrics['denial_rate'] ?? null;
  const caseAcceptance = latestMetrics['case_acceptance_rate'] ?? null;
  const dso = latestMetrics['dso'] !== undefined ? Math.round(latestMetrics['dso']) : null;
  const noShowRate = latestMetrics['no_show_rate'] ?? null;
  const monthlyProduction = latestMetrics['monthly_production'] ?? null;
  const unscheduledTreatmentValue = latestMetrics['unscheduled_treatment_value'] ?? null;

  const kpiSnapshot = {
    netCollectionRate,
    costPerChairHour,
    denialRate,
    caseAcceptance,
    dso,
    noShowRate,
    monthlyProduction,
    unscheduledTreatmentValue
  };

  const healthScore = calculateHealthScore(kpiSnapshot);

  return {
    healthScore,
    netCollectionRate,
    costPerChairHour,
    denialRate,
    caseAcceptance,
    dso,
    noShowRate,
    monthlyProduction,
    unscheduledTreatmentValue
  };
}

module.exports = {
  calculatePracticeKPIs,
  calculateSinglePracticeKPIs,
  calculateHealthScore
};
