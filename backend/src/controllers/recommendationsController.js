const { calculatePracticeKPIs } = require('../services/kpiService');

/**
 * Generate rule-based recommendations from KPI data.
 * @param {Object} kpis - KPI snapshot for a single practice
 * @returns {Array} recommendations sorted by priority (high first)
 */
function generateRecommendations(kpis) {
  const recommendations = [];

  // ── HIGH PRIORITY ────────────────────────────────────────────────────────────

  if (kpis.caseAcceptance !== null && kpis.caseAcceptance < 70) {
    recommendations.push({
      priority: 'high',
      category: 'Patient Conversion',
      title: 'Improve Case Acceptance',
      description: `Case acceptance rate is ${kpis.caseAcceptance.toFixed(1)}%, below the 70% target. Patients are not accepting recommended treatment plans at an optimal rate, directly limiting production revenue.`,
      actions: [
        'Train front desk and clinical staff on patient communication and value presentation',
        'Implement same-day treatment options to reduce decision delays',
        'Review financial options presented — offer in-house payment plans or CareCredit',
        'Use visual aids and intraoral cameras to help patients understand treatment needs',
        'Follow up with patients who deferred treatment within 2 weeks'
      ],
      potentialImpact: `Increasing acceptance to 75% could add ${kpis.monthlyProduction ? `$${Math.round(kpis.monthlyProduction * 0.08).toLocaleString()}/month` : 'significant revenue'} in production`
    });
  }

  if (kpis.noShowRate !== null && kpis.noShowRate > 10) {
    recommendations.push({
      priority: 'high',
      category: 'Scheduling Efficiency',
      title: 'Reduce No-Show Rate',
      description: `No-show rate is ${kpis.noShowRate.toFixed(1)}%, exceeding the 10% threshold. High no-show rates leave chairs empty and erode production capacity.`,
      actions: [
        'Implement automated appointment reminders (SMS + email) at 72h, 24h, and 2h before appointment',
        'Collect credit card on file for new patients and enforce a no-show fee policy',
        'Create an active cancellation waitlist to fill last-minute openings',
        'Identify repeat no-show patients and require prepayment or move to walk-in only',
        'Track no-show patterns by day/time to identify scheduling adjustments'
      ],
      potentialImpact: `Reducing no-shows to 8% recovers approximately ${kpis.monthlyProduction ? `$${Math.round(kpis.monthlyProduction * ((kpis.noShowRate - 8) / 100)).toLocaleString()}/month` : 'meaningful chair time'} in lost production`
    });
  }

  // ── MEDIUM PRIORITY ───────────────────────────────────────────────────────────

  if (kpis.denialRate !== null && kpis.denialRate > 8) {
    recommendations.push({
      priority: 'medium',
      category: 'Revenue Cycle',
      title: 'Review Billing Process',
      description: `Claim denial rate is ${kpis.denialRate.toFixed(1)}%, above the 8% acceptable threshold. Excessive denials delay cash flow and increase administrative overhead.`,
      actions: [
        'Audit the top 5 denial reason codes and address root causes with clinical staff',
        'Verify patient insurance eligibility at least 48 hours before appointments',
        'Review coding accuracy — ensure CDT codes match clinical documentation',
        'Implement pre-authorization workflows for high-value procedures',
        'Track denial trends monthly and set a target to reduce by 2% per quarter'
      ],
      potentialImpact: `Reducing denials to 5% typically recovers 2-4% of gross production in previously uncollected revenue`
    });
  }

  if (kpis.netCollectionRate !== null && kpis.netCollectionRate < 90) {
    recommendations.push({
      priority: 'medium',
      category: 'Collections',
      title: 'Collections Follow-up Needed',
      description: `Net collection rate is ${kpis.netCollectionRate.toFixed(1)}%, below the 90% minimum benchmark. This indicates patient balances or insurance reimbursements are not being fully collected.`,
      actions: [
        'Implement a structured AR follow-up cycle: 30, 60, and 90 days outstanding',
        'Collect patient portions at time of service — use terminal prompts and payment confirmations',
        'Review writeoffs and adjustments to ensure they are authorized and appropriate',
        'Consider outsourcing accounts receivable over 90 days to a dental collections agency',
        'Send monthly patient statements with clear payment instructions and online pay links'
      ],
      potentialImpact: `Improving collection rate to 95% could recover ${kpis.monthlyProduction ? `$${Math.round(kpis.monthlyProduction * ((95 - kpis.netCollectionRate) / 100)).toLocaleString()}/month` : 'outstanding balances'} in uncollected revenue`
    });
  }

  // ── LOW PRIORITY (informational) ─────────────────────────────────────────────

  if (kpis.dso !== null && kpis.dso > 30) {
    recommendations.push({
      priority: 'low',
      category: 'Cash Flow',
      title: 'Reduce Days Sales Outstanding (DSO)',
      description: `DSO is ${kpis.dso} days, above the 30-day target. Slower collections mean capital is tied up in receivables.`,
      actions: [
        'Increase frequency of insurance claim submissions — submit daily if possible',
        'Follow up on claims older than 14 days that have not been adjudicated',
        'Offer a small prompt-payment discount for patients who pay at time of service'
      ],
      potentialImpact: `Reducing DSO to 30 days improves predictable monthly cash flow`
    });
  }

  if (kpis.unscheduledTreatmentValue !== null && kpis.unscheduledTreatmentValue > 30000) {
    recommendations.push({
      priority: 'low',
      category: 'Treatment Scheduling',
      title: 'Convert Unscheduled Treatment Value',
      description: `There is $${kpis.unscheduledTreatmentValue.toLocaleString()} in treatment plans that have been presented but not scheduled. This is deferred revenue sitting on the table.`,
      actions: [
        'Run a monthly unscheduled treatment report and assign follow-up calls to front desk',
        'Send targeted outreach to patients with open treatment plans older than 30 days',
        'Use hygiene appointments as an opportunity to reschedule deferred restorative work'
      ],
      potentialImpact: `Converting even 20% of unscheduled treatment adds $${Math.round(kpis.unscheduledTreatmentValue * 0.2).toLocaleString()} in near-term production`
    });
  }

  // Sort: high → medium → low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * GET /api/recommendations?practice_id=...
 * GET /api/recommendations?company_id=...
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { practice_id, company_id } = req.query;

    if (!practice_id && !company_id) {
      return res.status(400).json({ error: 'Either practice_id or company_id is required' });
    }

    const kpisMap = await calculatePracticeKPIs(practice_id || null, company_id || null);

    if (practice_id) {
      // Single practice
      const kpis = kpisMap[practice_id];
      if (!kpis) {
        return res.status(404).json({ error: 'Practice not found or no metrics available' });
      }
      const recommendations = generateRecommendations(kpis);
      return res.json({
        practiceId: practice_id,
        kpiSummary: kpis,
        recommendationCount: recommendations.length,
        recommendations
      });
    }

    // Company — aggregate KPIs across practices, return per-practice recommendations
    const practiceResults = Object.entries(kpisMap).map(([pid, kpis]) => ({
      practiceId: pid,
      kpiSummary: kpis,
      recommendations: generateRecommendations(kpis)
    }));

    // Also compute company-level aggregate (averaged rates)
    const values = Object.values(kpisMap);
    const avg = (key) => {
      const vals = values.map(v => v[key]).filter(v => v !== null);
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };

    const aggregateKPIs = {
      healthScore: avg('healthScore'),
      netCollectionRate: avg('netCollectionRate'),
      caseAcceptance: avg('caseAcceptance'),
      denialRate: avg('denialRate'),
      noShowRate: avg('noShowRate'),
      dso: avg('dso'),
      costPerChairHour: avg('costPerChairHour'),
      monthlyProduction: values.reduce((s, v) => s + (v.monthlyProduction || 0), 0),
      unscheduledTreatmentValue: values.reduce((s, v) => s + (v.unscheduledTreatmentValue || 0), 0)
    };

    return res.json({
      companyId: company_id,
      aggregateKPIs,
      practiceCount: practiceResults.length,
      practices: practiceResults
    });

  } catch (error) {
    console.error('Get Recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export for testing
exports.generateRecommendations = generateRecommendations;
