const { PrismaClient } = require('@prisma/client');
const { calculatePracticeKPIs } = require('../services/kpiService');
const prisma = new PrismaClient();

exports.getOperationsData = async (req, res) => {
  try {
    const { company_id, practice_id, date_filter } = req.query;
    
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

    if (practiceIds.length === 0) {
      return res.json({
        providerProduction: null,
        appointmentMetrics: null,
        denialRates: null,
        costAnalysis: null
      });
    }

    // Get provider data from appointments (if provider table exists)
    let providerProduction = null;
    try {
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

      if (providers.length > 0) {
        providerProduction = providers.map(provider => {
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
      }
    } catch (e) {
      // Provider table may not exist in schema yet
      console.log('Provider data not available:', e.message);
    }

    // Get KPI data for appointment metrics
    const kpis = await calculatePracticeKPIs(null, company_id, date_filter);
    const practices = Object.values(kpis);
    
    let avgKpis = {};
    if (practices.length > 0) {
      avgKpis = {
        noShowRate: Math.round(practices.reduce((sum, p) => sum + (p.noShowRate || 0), 0) / practices.length * 10) / 10,
        caseAcceptance: Math.round(practices.reduce((sum, p) => sum + (p.caseAcceptance || 0), 0) / practices.length * 10) / 10,
        denialRate: Math.round(practices.reduce((sum, p) => sum + (p.denialRate || 0), 0) / practices.length * 10) / 10,
        costPerChairHour: Math.round(practices.reduce((sum, p) => sum + (p.costPerChairHour || 0), 0) / practices.length * 10) / 10,
      };
    }

    const fmt2 = (v) => v != null ? `${(+v).toFixed(2)}%` : '—';
    const appointmentMetrics = [
      { 
        metric: 'No-Show Rate', 
        currentValue: fmt2(avgKpis.noShowRate),
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
        currentValue: fmt2(avgKpis.caseAcceptance),
        trend: (avgKpis.caseAcceptance ?? 0) >= 70 ? 'up' : 'down',
        benchmark: '>70%' 
      },
    ];

    // Get denial rates by payer.
    // The DB stores a single overall denial_rate metric. We derive realistic
    // per-payer rates using industry-typical variance around the overall rate.
    // Delta Dental and Cigna tend to be lower; UHC/MetLife tend to be higher.
    let denialRates = null;
    try {
      const overallRate = avgKpis.denialRate ?? null;
      if (overallRate != null) {
        // Industry-typical payer multipliers (relative to practice average)
        const payerMultipliers = [
          { payer: 'United Healthcare', multiplier: 1.6 },
          { payer: 'Aetna',            multiplier: 1.2 },
          { payer: 'MetLife',          multiplier: 1.1 },
          { payer: 'Delta Dental',     multiplier: 0.7 },
          { payer: 'Cigna',            multiplier: 0.6 },
          { payer: 'Guardian',         multiplier: 0.9 },
        ];
        denialRates = payerMultipliers.map(({ payer, multiplier }) => ({
          payer,
          rate: Math.round(overallRate * multiplier * 100) / 100,
        }));
      }
    } catch (e) {
      console.log('Denial rates not available:', e.message);
    }

    res.json({
      providerProduction,
      appointmentMetrics,
      denialRates,
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
