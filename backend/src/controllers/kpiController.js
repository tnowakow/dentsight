const { calculatePracticeKPIs } = require('../services/kpiService');

exports.getOverviewData = async (req, res) => {
  try {
    const { practice_id, company_id } = req.query;
    
    if (!practice_id && !company_id) {
      return res.status(400).json({ error: 'Either practice_id or company_id is required' });
    }

    const kpis = await calculatePracticeKPIs(practice_id || null, company_id);
    
    // Return data for the first practice if multiple exist
    const practiceId = Array.isArray(kpis) ? Object.keys(kpis)[0] : practice_id;
    const overviewData = kpis[practiceId];

    res.json({
      practiceId,
      ...overviewData,
      quickStats: {
        monthlyProduction: overviewData.monthlyProduction || 0,
        unscheduledTreatmentValue: overviewData.unscheduledTreatmentValue || 0,
        noShowRate: null, // Would need appointment status tracking
        caseAcceptance: overviewData.caseAcceptanceRate || 0,
        dso: overviewData.dso || 0
      }
    });

  } catch (error) {
    console.error('Get Overview Data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

    const round2 = (n) => Math.round(n * 100) / 100;
    res.json({
      company_id,
      healthScore: Math.round(summed.healthScore / count),
      netCollectionRate: round2(summed.netCollectionRate / count),
      costPerChairHour: round2(summed.costPerChairHour / count),
      denialRate: round2(summed.denialRate / count),
      caseAcceptance: round2(summed.caseAcceptance / count),
      noShowRate: round2(summed.noShowRate / count),
      dso: round2(summed.dso / count),
      monthlyProduction: Math.round(summed.monthlyProduction),
      unscheduledTreatmentValue: Math.round(summed.unscheduledTreatmentValue)
    });

  } catch (error) {
    console.error('Get Company Overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};