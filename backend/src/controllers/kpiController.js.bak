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
    
    // Aggregate across all practices in the company
    const aggregated = Object.values(kpis).reduce((acc, data) => {
      return {
        monthlyProduction: (acc.monthlyProduction || 0) + (data.monthlyProduction || 0),
        unscheduledTreatmentValue: (acc.unscheduledTreatmentValue || 0) + (data.unscheduledTreatmentValue || 0),
        caseAcceptanceRate: (acc.caseAcceptanceRate || 0) + (data.caseAcceptanceRate || 0),
        dso: (acc.dso || 0) + (data.dso || 0),
        costPerChairHour: (acc.costPerChairHour || 0) + (data.costPerChairHour || 0),
        count: acc.count + 1
      };
    }, { count: 0 });

    // Average the rates
    aggregated.caseAcceptance = aggregated.count > 0 
      ? Math.round(aggregated.caseAcceptanceRate / aggregated.count)
      : null;
    
    aggregated.dso = aggregated.count > 0 
      ? Math.round(aggregated.dso / aggregated.count)
      : null;

    res.json({
      company_id,
      ...aggregated,
      quickStats: {
        monthlyProduction: aggregated.monthlyProduction || 0,
        unscheduledTreatmentValue: aggregated.unscheduledTreatmentValue || 0,
        noShowRate: null,
        caseAcceptance: aggregated.caseAcceptance,
        dso: aggregated.dso
      }
    });

  } catch (error) {
    console.error('Get Company Overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
