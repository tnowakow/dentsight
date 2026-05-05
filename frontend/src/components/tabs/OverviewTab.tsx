import { useState, useEffect } from 'react';
import { useDentsightStore } from '../../store/useDentsightStore';
import { fetchAlerts, fetchMetrics, fetchValuation, fetchKpiData } from '../../services/api';
import { AlertCard } from '../ui/AlertCard';
import { BenchmarkIndicator } from '../ui/BenchmarkIndicator';
import { InfoTooltip } from '../ui/InfoTooltip';
import { formatCurrency, formatPercent } from '../../utils/formatting';

export const OverviewTab = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [valuation, setValuation] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any>(null);

  useEffect(() => {
    if (!selectedCompanyId) return;

    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch alerts (unresolved only)
        const alertsData = await fetchAlerts(selectedCompanyId, false);
        setAlerts(alertsData || []);

        // Fetch metrics for the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const metricsData = await fetchMetrics(
          selectedCompanyId,
          startDate.toISOString(),
          endDate.toISOString()
        );
        setMetrics(metricsData || []);

        // Fetch valuation
        const valuationData = await fetchValuation(selectedCompanyId);
        setValuation(valuationData);

        // Fetch KPI data
        const kpiResponse = await fetchKpiData(selectedCompanyId);
        setKpiData(kpiResponse);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCompanyId]);

  // Health score from KPI data
  const healthScore = kpiData?.healthScore ?? (metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + (m.metricValue || 0), 0) / metrics.length) : null);
  
  // Quick stats from KPI data with fallbacks
  const quickStats = {
    monthlyProduction: kpiData?.monthlyProduction ?? (valuation?.revenue ? valuation.revenue / 12 : null),
    unscheduledTreatmentValue: kpiData?.unscheduledTreatmentValue ?? null,
    noShowRate: kpiData?.noShowRate ?? null,
    caseAcceptance: kpiData?.caseAcceptance ?? null,
    dso: kpiData?.dso ?? null,
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading company data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Active Alerts Panel */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</h2>
        <div className="flex flex-col gap-3">
          {alerts.length > 0 ? alerts.map(alert => (
            <AlertCard 
              key={alert.id} 
              type={alert.type || 'info'} 
              headline={alert.headline || alert.description} 
              subtext={alert.subtext || ''} 
            />
          )) : (
            <div className="text-slate-500 text-sm">No active alerts</div>
          )}
        </div>
      </section>

      {/* 2. Practice Health Score Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1c. Health Score — numeric score, separator, verdict, chevron */}
        <div className="lg:col-span-1 bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-slate-400 font-medium uppercase text-xs tracking-widest">Health Score</h3>
          <div className="flex items-center gap-3">
            <span className="text-5xl font-black text-white">{healthScore != null ? `${healthScore}/100` : '—'}</span>
            <span className="text-slate-600 text-2xl">•</span>
            <span className={`text-xl font-semibold ${healthScore == null ? 'text-slate-500' : healthScore >= 80 ? 'text-emerald-500' : healthScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
              {healthScore == null ? '—' : healthScore >= 80 ? 'Good Standing' : healthScore >= 60 ? 'Needs Attention' : 'Critical'}
            </span>
            <span className="text-slate-500 ml-1">›</span>
          </div>
          <p className="text-sm text-slate-400">
            Overall practice stability is{' '}
            <span className={healthScore == null ? 'text-slate-500 font-semibold' : healthScore >= 80 ? 'text-emerald-500 font-semibold' : healthScore >= 60 ? 'text-yellow-500 font-semibold' : 'text-red-500 font-semibold'}>
              {healthScore == null ? 'Unknown' : healthScore >= 80 ? 'High' : healthScore >= 60 ? 'Moderate' : 'Low'}
            </span>
          </p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Net Collection Rate', value: kpiData?.netCollectionRate != null ? `${kpiData.netCollectionRate}%` : '—', trend: 'up' as const, target: '92%' },
            { label: 'Cost by Chair Hour', value: kpiData?.costPerChairHour != null ? `$${kpiData.costPerChairHour}/hr` : '—', trend: 'stable' as const, target: '$50/hr' },
            { label: 'Denial Rate', value: kpiData?.denialRate != null ? `${kpiData.denialRate}%` : '—', trend: 'stable' as const, target: '5%' },
            { label: 'Case Acceptance', value: kpiData?.caseAcceptance != null ? `${kpiData.caseAcceptance}%` : '—', trend: 'up' as const, target: '70%' }
          ].map((kpi, i) => {
            const tooltips = {
              'Net Collection Rate': {
                title: 'Net Collection Rate',
                description: 'Percentage of total production actually collected from patients and insurance companies.',
                calculation: '(Total Collections / Total Production) × 100\n\nTarget: 95%+ indicates efficient billing and collections process.'
              },
              'Cost by Chair Hour': {
                title: 'Cost per Chair Hour',
                description: 'Average overhead cost per hour of chair time. Measures practice efficiency and overhead management.',
                calculation: 'Total Overhead ÷ Total Chair Hours\n\nTarget: $40-50/hr indicates efficient operations. Higher values suggest overhead optimization needed.'
              },
              'Denial Rate': {
                title: 'Claim Denial Rate',
                description: 'Percentage of insurance claims that are denied or rejected on first submission.',
                calculation: '(Denied Claims / Total Claims Submitted) × 100\n\nTarget: Below 5% indicates strong billing accuracy and insurance relationships.'
              },
              'Case Acceptance': {
                title: 'Case Acceptance Rate',
                description: 'Percentage of recommended treatment plans that patients accept and proceed with.',
                calculation: '(Production from Accepted Cases / Total Production Recommended) × 100\n\nTarget: 70%+ shows effective treatment presentation and patient communication.'
              }
            }[kpi.label] || null

            return (
              <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3 relative">
                {tooltips && <InfoTooltip {...tooltips} />}
                <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{kpi.value}</span>
                </div>
                <BenchmarkIndicator 
                  current={kpi.value} 
                  target={kpi.target} 
                  trend={kpi.trend} 
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. Valuation Preview & Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white space-y-4 shadow-xl shadow-blue-900/20">
            <h3 className="text-blue-100 font-medium uppercase text-xs tracking-widest">Valuation Range Preview</h3>
            <div className="text-4xl font-bold">
              {valuation?.valuation_range ? (
                `${formatCurrency(valuation.valuation_range.low)} - ${formatCurrency(valuation.valuation_range.high)}`
              ) : (
                '$3.15M - $3.40M'
              )}
            </div>
            <button className="text-sm bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-semibold backdrop-blur-md">
              View Detailed Valuation
            </button>
         </div>

         <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Monthly Prod.', value: quickStats.monthlyProduction != null ? formatCurrency(quickStats.monthlyProduction) : '—', icon: '💰', 
                tooltip: {
                  title: 'Monthly Production',
                  description: 'Total gross production (value of all dental services rendered) for the current month.',
                  calculation: 'Sum of all completed procedures × their fee schedule values\n\nIncludes insurance, patient payments, and write-offs.'
                }
              },
              { label: 'Unscheduled', value: formatCurrency(quickStats.unscheduledTreatmentValue), icon: '⏳',
                tooltip: {
                  title: 'Unscheduled Treatment Value',
                  description: 'Total dollar value of accepted treatment plans that have not yet been scheduled for completion.',
                  calculation: 'Sum of all accepted but unscheduled procedure values\n\nRepresents future production pipeline and practice capacity needs.'
                }
              },
              { label: 'No-Show Rate', value: formatPercent(quickStats.noShowRate), icon: '❌',
                tooltip: {
                  title: 'No-Show Rate',
                  description: 'Percentage of scheduled appointments where patients fail to appear or cancel without proper notice.',
                  calculation: '(No-Shows + Late Cancellations / Total Appointments) × 100\n\nTarget: Below 8% - high rates indicate scheduling or communication issues.'
                }
              },
              { label: 'Case Acceptance', value: formatPercent(quickStats.caseAcceptance), icon: '✅',
                tooltip: {
                  title: 'Case Acceptance Rate (Quick View)',
                  description: 'Current month\'s treatment plan acceptance rate - same metric as detailed KPI above.',
                  calculation: '(Accepted Treatment Value / Recommended Treatment Value) × 100'
                }
              },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center space-y-1 relative">
                {stat.tooltip && <InfoTooltip {...stat.tooltip} />}
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};
