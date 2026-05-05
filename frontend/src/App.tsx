import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { useDentsightStore, type DateFilter } from './store/useDentsightStore';
import { fetchAlerts, fetchValuation, fetchRecommendations } from './services/api';

// Fetch KPI data from backend
const fetchKpiData = async (companyId: string) => {
  const response = await fetch(`/api/kpi/company-overview?company_id=${companyId}`);
  if (!response.ok) throw new Error('Failed to fetch KPIs');
  return response.json();
};
import { formatCurrency, formatKpiPercent, formatChairHour } from './utils/formatting';
import { CompanySelector } from './components/CompanySelector';
import { InfoTooltip } from './components/ui/InfoTooltip';
import { 
  Home, Activity, DollarSign, Calculator, ChevronDown, Calendar, HelpCircle, 
  AlertTriangle, CheckCircle2, ArrowRight, TrendingUp, Clock, DollarSign as DollarIcon,
  ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

// DENTSIGHT UI REFACTOR - Global Header (Confirmed Top Nav and Mobile Menu)
const GlobalHeader = () => {
  const { dateFilter, setDateFilter, selectedCompanyId } = useDentsightStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const dateOptions: { value: DateFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Refetch data when selected company changes
  useEffect(() => {
    if (selectedCompanyId) {
      console.log(`Company changed to ID: ${selectedCompanyId} - triggering data refetch`);
      // Dashboard components will automatically refetch via their own useEffect hooks
      // that watch the store's selectedCompanyId
    }
  }, [selectedCompanyId]);

  // TODO: pass range to API - currently just logging for now
  useEffect(() => {
    console.log(`Date filter changed to: ${dateFilter}`);
  }, [dateFilter]);

  const navItems = [
    { path: '/', label: 'Overview', icon: Home },
    { path: '/operations', label: 'Operations', icon: Activity },
    { path: '/financials', label: 'Financials', icon: DollarSign },
    { path: '/valuation', label: 'Valuation', icon: Calculator },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="h-full max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          {/* Left: Logo + Company Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <img src="/favicon.svg" alt="tooth" className="w-6 h-6" />
              <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">Dentsight</span>
            </Link>
            
            {/* Company Selector Component */}
            <CompanySelector />
          </div>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Date Filter + Data Current + Profile */}
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-slate-300">{dateOptions.find(d => d.value === dateFilter)?.label}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {dateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDateDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
                    {dateOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setDateFilter(option.value);
                          setDateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          dateFilter === option.value
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Data Current Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Data current as of {new Date().toLocaleTimeString()}</span>
            </div>

            {/* Profile + Help */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white" title="Help & Support">
                <HelpCircle className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                TN
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <img src="/favicon.svg" alt="tooth" className="w-5 h-5" />
            <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">Dentsight</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 py-4">
            {/* Clinic selector on mobile */}
            <div className="px-4 pb-3 border-b border-slate-800 mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Selected Clinic</p>
              <CompanySelector />
            </div>
            <nav className="flex flex-col gap-2 px-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

// ============================================================================
// PRIORITY CARD COMPONENT (Section 1 of spec)
// ============================================================================

interface PriorityCardProps {
  icon: React.ReactNode;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaPath: string;
  severity: 'high' | 'medium' | 'low';
  drillDownData?: any;
}

const PriorityCard: React.FC<PriorityCardProps> = ({ icon, headline, subtext, ctaText, ctaPath, severity, drillDownData }) => {
  const severityStyles = {
    high: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50',
    medium: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50',
    low: 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50',
  };

  return (
    <Link to={ctaPath} state={{ priority: drillDownData }} className={`block p-6 rounded-xl border-2 transition-all ${severityStyles[severity]} group`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${severity === 'high' ? 'bg-amber-500/20 text-amber-500' : severity === 'medium' ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{headline}</h3>
          <p className="text-slate-400 text-sm mb-4">{subtext}</p>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            {ctaText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================================================
// COMPACT HEALTH SCORE COMPONENT (Section 1 of spec)
// ============================================================================

const CompactHealthScore = () => {
  const [expanded, setExpanded] = useState(false);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<{ name: string; score: number; weight: number }[]>([]);
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);

  // Per-metric tooltip content shown in the expanded Health Performance Score panel
  const metricInfo: Record<string, { title: string; description: string; calculation: string }> = {
    'Net Collection Rate': {
      title: 'Net Collection Rate Score',
      description: 'How much of your billed production is actually collected after insurance adjustments and write-offs. A high score means you are capturing nearly all the revenue you earn.',
      calculation: 'Score = (actual ÷ 95% target) × 100, capped at 100\nWeight: 25% of overall Health Score\nTarget: ≥95% | Industry benchmark: 92–98%'
    },
    'Case Acceptance': {
      title: 'Case Acceptance Score',
      description: 'Percentage of presented treatment plans that patients accept and schedule. Low acceptance means revenue is being left on the table — patients need treatment but aren\'t saying yes.',
      calculation: 'Score = (actual ÷ 70% target) × 100, capped at 100\nWeight: 20% of overall Health Score\nTarget: ≥70% | Top practices hit 80%+'
    },
    'Denial Rate': {
      title: 'Denial Rate Score',
      description: 'Percentage of submitted insurance claims rejected by payers. Lower is better — high denials delay cash flow and increase admin burden.',
      calculation: 'Score = (2 − actual ÷ 5% target) × 50 (lower rate = higher score)\nWeight: 15% of overall Health Score\nTarget: ≤5% | Above 8% needs immediate attention'
    },
    'No-Show Rate': {
      title: 'No-Show Rate Score',
      description: 'Percentage of scheduled appointments where the patient does not arrive. Every no-show is a chair sitting empty — typically $200–400 in lost production each time.',
      calculation: 'Score = (2 − actual ÷ 8% target) × 50 (lower rate = higher score)\nWeight: 15% of overall Health Score\nTarget: ≤8% | Each 1% above target = ~$2K/month lost'
    },
    'Cost per Chair Hour': {
      title: 'Cost per Chair Hour Score',
      description: 'Total practice overhead divided by total chair operating hours. Measures how efficiently the practice manages its costs relative to capacity.',
      calculation: 'Score = (2 − actual ÷ $250 target) × 50 (lower cost = higher score)\nWeight: 10% of overall Health Score\nTarget: ≤$250/hr | Lean practices: $150–200/hr | Above $300/hr = overhead problem'
    },
    'Days Sales Outstanding': {
      title: 'Days Sales Outstanding (DSO) Score',
      description: 'Average number of days between providing a service and receiving payment. High DSO means cash is tied up in receivables and collections are slow.',
      calculation: 'Score = (2 − actual ÷ 30-day target) × 50 (lower days = higher score)\nWeight: 15% of overall Health Score\nTarget: ≤30 days | Above 45 days = AR/collections problem'
    },
  };

  useEffect(() => {
    if (!selectedCompanyId) return;
    fetchKpiData(selectedCompanyId)
      .then((data: any) => {
        if (data?.healthScore != null) setHealthScore(data.healthScore);
        const metrics = [
          // Scores mirror kpiService.js formula so the panel matches the backend health score
          { name: 'Net Collection Rate', score: data?.netCollectionRate != null ? Math.min(100, (data.netCollectionRate / 95) * 100) : 0, weight: 25 },
          { name: 'Case Acceptance', score: data?.caseAcceptance != null ? Math.min(100, (data.caseAcceptance / 70) * 100) : 0, weight: 20 },
          { name: 'Denial Rate', score: data?.denialRate != null ? Math.max(0, Math.min(100, (2 - data.denialRate / 5) * 50)) : 0, weight: 15 },
          { name: 'No-Show Rate', score: data?.noShowRate != null ? Math.max(0, Math.min(100, (2 - data.noShowRate / 8) * 50)) : 0, weight: 15 },
          { name: 'Cost per Chair Hour', score: data?.costPerChairHour != null ? Math.max(0, Math.min(100, (2 - data.costPerChairHour / 250) * 50)) : 0, weight: 10 },
          { name: 'Days Sales Outstanding', score: data?.dso != null ? Math.max(0, Math.min(100, (2 - data.dso / 30) * 50)) : 0, weight: 15 },
        ];
        setHealthMetrics(metrics);
      })
      .catch(() => {});
  }, [selectedCompanyId]);
  
  const getVerdict = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-emerald-500' };
    if (score >= 80) return { text: 'Good', color: 'text-blue-500' };
    if (score >= 70) return { text: 'Needs Attention', color: 'text-amber-500' };
    return { text: 'Critical', color: 'text-red-500' };
  };

  const verdict = getVerdict(healthScore ?? 0);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Collapsed State - Inline Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Health Performance Score</span>
          <span className="text-slate-700 hidden sm:block">│</span>
          <span className="text-3xl font-black text-white">{healthScore}</span>
          <span className="text-slate-600 text-xl">•</span>
          <span className={`font-semibold ${verdict.color}`}>{verdict.text}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{expanded ? 'Show less' : 'View details'}</span>
          {expanded ? <ChevronLeft className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4 -rotate-90" />}
        </div>
      </button>

      {/* Expanded State */}
      {expanded && (
        <div className="p-6 pt-0 border-t border-slate-800 mt-1 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Health Performance Score</h4>
            <InfoTooltip
              position="inline"
              title="Health Performance Score Breakdown"
              description="Each metric is converted to a 0–100 score based on how close it is to its industry target. Scores are weighted and averaged to produce the overall Health Score shown above."
              calculation="Score 90–100: Excellent\nScore 70–89: Good\nScore 50–69: Needs Attention\nScore below 50: Critical\n\nHover the ⓘ next to each metric for its specific formula and target."
            />
          </div>
          <div className="space-y-3">
            {healthMetrics.map((metric) => {
              const roundedScore = Math.round(metric.score * 100) / 100;
              const info = metricInfo[metric.name];
              const barColor = metric.score >= 70 ? 'bg-emerald-500' : metric.score >= 50 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={metric.name} className="flex items-center gap-3">
                  {/* Label + tooltip */}
                  <div className="flex items-center gap-1 w-44 flex-shrink-0">
                    <span className="text-sm text-slate-300 truncate">{metric.name}</span>
                    {info && (
                      <InfoTooltip
                        position="inline"
                        title={info.title}
                        description={info.description}
                        calculation={info.calculation}
                      />
                    )}
                  </div>
                  {/* Bar */}
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${roundedScore}%` }}
                    />
                  </div>
                  {/* Score label */}
                  <span className="text-sm font-bold text-white w-16 text-right whitespace-nowrap">
                    {roundedScore.toFixed(2)}
                  </span>
                  {/* Weight */}
                  <span className="text-xs text-slate-500 w-14 text-right">({metric.weight}% wt)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// RIGHT HAND RAIL - "THIS WEEK" (Section 2 of spec)
// ============================================================================

const RightRail = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [alerts, setAlerts] = useState<any[]>([]);
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!selectedCompanyId) return;
    fetchAlerts(selectedCompanyId, false)
      .then(data => setAlerts(data || []))
      .catch(() => {});
  }, [selectedCompanyId]);

  return (
    <aside className="w-80 flex-shrink-0 space-y-6">
      {/* Active Alerts — compact list */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</h3>
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert, i) => (
              <Link
                key={i}
                to={`/priorities/alert-${i}`}
                state={{ priority: {
                  title: alert.headline || alert.metricName || 'Alert',
                  description: alert.subtext || alert.message || '',
                  priority: alert.severity >= 2 ? 'high' : alert.severity >= 1 ? 'medium' : 'low',
                  category: 'Alert',
                  actions: [],
                  potentialImpact: null,
                }}}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 hover:bg-slate-800 transition-colors border border-slate-800/50 hover:border-amber-500/30"
              >
                <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                  alert.severity >= 2 ? 'bg-red-500' : alert.severity >= 1 ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{alert.headline || alert.metricName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{alert.subtext || alert.message}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-slate-300">No active alerts</p>
          </div>
        )}
      </div>

      {/* Today */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Today</p>
        <p className="text-white font-medium">{formattedDate}</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">Data current</span>
        </div>
      </div>
    </aside>
  );
};

// ============================================================================
// RECOMMENDED ACTIONS HERO — fetches recommendations and renders as hero cards
// ============================================================================

const RecommendedActionsHero = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCompanyId) return;
    setLoading(true);
    fetchRecommendations(selectedCompanyId)
      .then(data => setRecommendations((data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCompanyId]);

  const iconForCategory = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'revenue cycle':
      case 'collections': return <DollarSign className="w-6 h-6" />;
      case 'scheduling efficiency': return <Calendar className="w-6 h-6" />;
      case 'patient conversion': return <TrendingUp className="w-6 h-6" />;
      case 'cash flow': return <Clock className="w-6 h-6" />;
      case 'treatment scheduling': return <CheckCircle2 className="w-6 h-6" />;
      default: return <AlertTriangle className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Recommended Actions
        </h2>
        <div className="space-y-3">
          {[1,2].map(i => (
            <div key={i} className="h-24 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        Recommended Actions
      </h2>
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <PriorityCard
              key={i}
              icon={iconForCategory(rec.category)}
              headline={rec.title}
              subtext={rec.description}
              ctaText="View Action Steps"
              ctaPath={`/priorities/${i}`}
              severity={rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'medium' : 'low'}
              drillDownData={rec}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-4 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold">All metrics are on target</p>
            <p className="text-slate-400 text-sm mt-1">No recommended actions at this time. Keep up the great work!</p>
          </div>
        </div>
      )}
    </section>
  );
};

// ============================================================================
// OVERVIEW TAB - REFACTORED (Section 1 of spec)
// ============================================================================

const OverviewTab = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [isLoading, setIsLoading] = useState(true);
  const [valuationPreview, setValuationPreview] = useState('$3.15M - $3.40M');
  const [kpiData, setKpiData] = useState<any>({});

  useEffect(() => {
    if (!selectedCompanyId) return;

    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch valuation for preview
        const valuationData = await fetchValuation(selectedCompanyId);
        if (valuationData?.valuation_range) {
          setValuationPreview(
            `${formatCurrency(valuationData.valuation_range.low)} - ${formatCurrency(valuationData.valuation_range.high)}`
          );
        }

        // Fetch KPI data from backend (fields are at root level, not nested)
        const kpi = await fetchKpiData(selectedCompanyId);
        setKpiData(kpi || {});
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCompanyId]);


  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading overview data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Recommended Actions — Hero Block */}
      <RecommendedActionsHero />

      {/* 2. Compact Health Score Row */}
      <section>
        <CompactHealthScore />
      </section>

      {/* 3. Secondary KPI Grid - Smaller, Denser */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { 
            label: 'Net Collection', 
            value: formatKpiPercent(kpiData.netCollectionRate), 
            trend: (kpiData.netCollectionRate ?? 0) >= 92 ? 'up' as const : 'down' as const, 
            target: '92%' 
          },
          { 
            // Industry accurate: total overhead / chair hours. Healthy = $150-250/hr
            label: 'Cost by Chair Hour', 
            value: formatChairHour(kpiData.costPerChairHour), 
            trend: (kpiData.costPerChairHour ?? 999) <= 250 ? 'up' as const : 'down' as const, 
            target: '$250/hr'
          },
          { 
            label: 'Denial Rate', 
            value: formatKpiPercent(kpiData.denialRate), 
            trend: (kpiData.denialRate ?? 100) <= 5 ? 'up' as const : 'down' as const, 
            target: '5%' 
          },
          { 
            label: 'Case Acceptance', 
            value: formatKpiPercent(kpiData.caseAcceptance), 
            trend: (kpiData.caseAcceptance ?? 0) >= 70 ? 'up' as const : 'down' as const, 
            target: '70%' 
          }
        ].map((kpi: { label: string; value: string; trend: 'up' | 'down' | 'stable'; target: string }, i) => (
          <Link
            key={i}
            to={`/kpis/${kpi.label.replace(/\s+/g, '-').toLowerCase()}`}
            className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all group"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">{kpi.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{kpi.value}</span>
            </div>
            <div className={`text-xs font-medium mt-2 ${
              kpi.trend === 'up' ? 'text-emerald-500' : kpi.trend === 'down' ? 'text-amber-500' : 'text-slate-500'
            }`}>
              {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '—'} vs target ({kpi.target})
            </div>
          </Link>
        ))}
      </section>

      {/* 4. Quick Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Monthly Prod.', value: kpiData.monthlyProduction ? formatCurrency(kpiData.monthlyProduction) : '—', icon: DollarIcon },
          { label: 'Unscheduled', value: kpiData.unscheduledTreatmentValue ? formatCurrency(kpiData.unscheduledTreatmentValue) : '—', icon: Clock },
          { label: 'No-Show Rate', value: formatKpiPercent(kpiData.noShowRate), icon: AlertTriangle },
          { label: 'Case Acceptance', value: formatKpiPercent(kpiData.caseAcceptance), icon: CheckCircle2 },
          { label: 'DSO', value: kpiData.dso != null ? `${(+kpiData.dso).toFixed(2)} days` : '—', icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center text-center">
            <stat.icon className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{stat.label}</p>
            <p className="text-sm font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* 5. Valuation Preview Card — bottom */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-xl text-white space-y-4 shadow-xl shadow-blue-900/20">
        <h3 className="text-blue-100 font-medium uppercase text-xs tracking-widest">Valuation Range Preview</h3>
        <div className="text-4xl font-bold">{valuationPreview}</div>
        <Link to="/valuation" className="inline-block text-sm bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-semibold backdrop-blur-md">
          View Detailed Valuation →
        </Link>
      </section>
    </div>
  );
};

// ============================================================================
// DRILL-DOWN PLACEHOLDER PAGES (for routing)
// ============================================================================

const PriorityDetailPage = () => {
  const { state } = useLocation() as { state: { priority?: any } | null };
  const { id } = useParams<{ id: string }>();
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [priority, setPriority] = useState<any>(state?.priority || null);
  const [loading, setLoading] = useState(!state?.priority);

  useEffect(() => {
    // If we navigated directly (no router state), refetch and find by index
    if (!state?.priority && selectedCompanyId) {
      fetchRecommendations(selectedCompanyId)
        .then((recs) => {
          const idx = parseInt(id || '0', 10);
          setPriority(recs[idx] || null);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, selectedCompanyId]);

  const priorityColors = {
    high: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', bar: 'border-red-500/40' },
    medium: { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', bar: 'border-amber-500/40' },
    low: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', bar: 'border-blue-500/40' },
  };
  const colors = priorityColors[(priority?.priority as keyof typeof priorityColors) || 'low'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!priority) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <p className="text-slate-400">Priority not found. It may have been resolved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in duration-500">
      {/* Back */}
      <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Overview
      </Link>

      {/* Header */}
      <div className={`bg-slate-900 rounded-xl border-2 ${colors.bar} p-6 space-y-3`}>
        <div className="flex items-start gap-3 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colors.badge}`}>
            {priority.priority} priority
          </span>
          <span className="text-xs font-medium text-slate-400 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
            {priority.category}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">{priority.title}</h1>
        <p className="text-slate-300 leading-relaxed">{priority.description}</p>
      </div>

      {/* Action Steps */}
      {priority.actions?.length > 0 && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Action Steps</h2>
          <ol className="space-y-3">
            {priority.actions.map((action: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-slate-300 text-sm leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Potential Impact */}
      {priority.potentialImpact && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Potential Impact</p>
            <p className="text-emerald-300 text-sm leading-relaxed">{priority.potentialImpact}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const KPIDetailPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-white">KPI Details</h1>
      <p className="text-slate-400">This is a placeholder for KPI drill-down view.</p>
      {/* TODO: wire to backend - fetch and display detailed KPI information */}
    </div>
  );
};

// ============================================================================
// OTHER TABS (Operations, Financials, Valuation) - Simplified imports
// ============================================================================

import { OperationsTab } from './components/tabs/OperationsTab';
import { FinancialsTab } from './components/tabs/FinancialsTab';
import { ValuationTab } from './components/tabs/ValuationTab';

// ============================================================================
// MAIN APP COMPONENT WITH ROUTING
// ============================================================================

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <GlobalHeader />
        
        <main className="max-w-[1920px] mx-auto px-4 py-6">
          <Routes>
            {/* Overview Route with Right Rail */}
            <Route path="/" element={
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-1 min-w-0">
                  <OverviewTab />
                </div>
                {/* Hide right rail on mobile, show on desktop */}
                <aside className="hidden md:block w-80 flex-shrink-0">
                  <RightRail />
                </aside>
              </div>
            } />
            
            {/* Other Routes */}
            <Route path="/operations" element={<OperationsTab />} />
            <Route path="/financials" element={<FinancialsTab />} />
            <Route path="/valuation" element={<ValuationTab />} />
            
            {/* Drill-down Placeholders */}
            <Route path="/priorities/:id" element={<PriorityDetailPage />} />
            <Route path="/kpis/:name" element={<KPIDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
