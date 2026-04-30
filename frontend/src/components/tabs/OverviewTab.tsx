import { mockData } from '../../data/mockData';
import { AlertCard } from '../ui/AlertCard';
import { BenchmarkIndicator } from '../ui/BenchmarkIndicator';
import { InfoTooltip } from '../ui/InfoTooltip';
import { formatCurrency, formatPercent } from '../../utils/formatting';

export const OverviewTab = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Active Alerts Panel */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</h2>
        <div className="flex flex-col gap-3">
          {mockData.alerts.map(alert => (
            <AlertCard 
              key={alert.id} 
              type={alert.type} 
              headline={alert.headline} 
              subtext={alert.subtext} 
            />
          ))}
        </div>
      </section>

      {/* 2. Practice Health Score Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1c. Health Score — numeric score, separator, verdict, chevron */}
        <div className="lg:col-span-1 bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-slate-400 font-medium uppercase text-xs tracking-widest">Health Score</h3>
          <div className="flex items-center gap-3">
            <span className="text-5xl font-black text-white">{mockData.healthScore}/100</span>
            <span className="text-slate-600 text-2xl">•</span>
            <span className="text-xl font-semibold text-emerald-500">Needs Attention</span>
            <span className="text-slate-500 ml-1">›</span>
          </div>
          <p className="text-sm text-slate-400">Overall practice stability is <span className="text-emerald-500 font-semibold">High</span></p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Net Collection Rate', value: '94%', trend: 'up' as const, target: '92%' },
            { label: 'Hygiene Re-appointment', value: '78%', trend: 'down' as const, target: '85%' },
            { label: 'Denial Rate', value: '5.4%', trend: 'stable' as const, target: '5%' },
            { label: 'Case Acceptance', value: '72%', trend: 'up' as const, target: '70%' }
          ].map((kpi, i) => {
            const tooltips = {
              'Net Collection Rate': {
                title: 'Net Collection Rate',
                description: 'Percentage of total production actually collected from patients and insurance companies.',
                calculation: '(Total Collections / Total Production) × 100\n\nTarget: 95%+ indicates efficient billing and collections process.'
              },
              'Hygiene Re-appointment': {
                title: 'Hygiene Re-appointment Rate',
                description: 'Percentage of hygiene patients who book their next cleaning before leaving the office.',
                calculation: '(Patients with Future Hygiene Appointments / Total Hygiene Completions) × 100\n\nTarget: 85%+ ensures consistent patient flow and retention.'
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
            <div className="text-4xl font-bold">{mockData.valuationPreview}</div>
            <button className="text-sm bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-semibold backdrop-blur-md">
              View Detailed Valuation
            </button>
         </div>

         <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Monthly Prod.', value: formatCurrency(mockData.quickStats.monthlyProduction), icon: '💰', 
                tooltip: {
                  title: 'Monthly Production',
                  description: 'Total gross production (value of all dental services rendered) for the current month.',
                  calculation: 'Sum of all completed procedures × their fee schedule values\n\nIncludes insurance, patient payments, and write-offs.'
                }
              },
              { label: 'Unscheduled', value: formatCurrency(mockData.quickStats.unscheduledTreatmentValue), icon: '⏳',
                tooltip: {
                  title: 'Unscheduled Treatment Value',
                  description: 'Total dollar value of accepted treatment plans that have not yet been scheduled for completion.',
                  calculation: 'Sum of all accepted but unscheduled procedure values\n\nRepresents future production pipeline and practice capacity needs.'
                }
              },
              { label: 'No-Show Rate', value: formatPercent(mockData.quickStats.noShowRate), icon: '❌',
                tooltip: {
                  title: 'No-Show Rate',
                  description: 'Percentage of scheduled appointments where patients fail to appear or cancel without proper notice.',
                  calculation: '(No-Shows + Late Cancellations / Total Appointments) × 100\n\nTarget: Below 8% - high rates indicate scheduling or communication issues.'
                }
              },
              { label: 'Case Acceptance', value: formatPercent(mockData.quickStats.caseAcceptance), icon: '✅',
                tooltip: {
                  title: 'Case Acceptance Rate (Quick View)',
                  description: 'Current month\'s treatment plan acceptance rate - same metric as detailed KPI above.',
                  calculation: '(Accepted Treatment Value / Recommended Treatment Value) × 100'
                }
              },
              { label: 'DSO', value: `${mockData.quickStats.dso} days`, icon: '📅',
                tooltip: {
                  title: 'Days Sales Outstanding (DSO)',
                  description: 'Average number of days it takes to collect payment after a service is rendered. Lower is better.',
                  calculation: '(Accounts Receivable / Total Credit Sales) × Number of Days\n\nTarget: Below 40 days. High DSO indicates slow collections or billing issues.'
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
