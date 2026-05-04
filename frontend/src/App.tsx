import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useDentsightStore, type DateFilter } from './store/useDentsightStore';
import { fetchAlerts, fetchValuation } from './services/api';
import { formatCurrency } from './utils/formatting';
import { CompanySelector } from './components/CompanySelector';
import { 
  Home, Activity, DollarSign, Calculator, ChevronDown, Calendar, HelpCircle, 
  AlertTriangle, CheckCircle2, Info, ArrowRight, TrendingUp, Clock, DollarSign as DollarIcon,
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
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
              Dentsight
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
          <Link to="/" className="text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            Dentsight
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 py-4">
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
}

const PriorityCard: React.FC<PriorityCardProps> = ({ icon, headline, subtext, ctaText, ctaPath, severity }) => {
  const severityStyles = {
    high: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50',
    medium: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50',
    low: 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50',
  };

  return (
    <Link to={ctaPath} className={`block p-6 rounded-xl border-2 transition-all ${severityStyles[severity]} group`}>
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
  const healthScore = 84; // TODO: calculate from metrics API

  const healthMetrics = [
    { name: 'Net Collection Rate', score: 94, weight: 20, target: 92 },
    { name: 'Hygiene Re-appointment', score: 78, weight: 25, target: 85 },
    { name: 'Denial Rate', score: 95, weight: 15, target: 95 }, // Inverted - lower is better
    { name: 'Case Acceptance', score: 72, weight: 20, target: 70 },
    { name: 'No-Show Rate', score: 85, weight: 10, target: 92 }, // Inverted
    { name: 'Provider Utilization', score: 88, weight: 10, target: 85 },
  ];
  
  const getVerdict = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-emerald-500' };
    if (score >= 80) return { text: 'Good', color: 'text-blue-500' };
    if (score >= 70) return { text: 'Needs Attention', color: 'text-amber-500' };
    return { text: 'Critical', color: 'text-red-500' };
  };

  const verdict = getVerdict(healthScore);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Collapsed State - Inline Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
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
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Component Metrics</h4>
          <div className="space-y-3">
            {healthMetrics.map((metric) => (
              <div key={metric.name} className="flex items-center gap-4">
                <span className="text-sm text-slate-300 w-40">{metric.name}</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      metric.score >= metric.target ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white w-12 text-right">{metric.score}</span>
                <span className="text-xs text-slate-500 w-12">({metric.weight}%)</span>
              </div>
            ))}
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
  const { dateFilter, selectedCompanyId } = useDentsightStore();
  const [priorities, setPriorities] = useState<any[]>([]);
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!selectedCompanyId) return;
    fetchAlerts(selectedCompanyId, false)
      .then(data => setPriorities((data || []).filter((a: any) => a.severity <= 2).slice(0, 4)))
      .catch(() => {});
  }, [selectedCompanyId]);
  
  // Map date filter to display text
  const getDateFilterDisplayText = (filter: DateFilter) => {
    switch (filter) {
      case 'today': return "Today's Priorities";
      case 'this-week': return "This Week's Priorities";
      case 'this-month': return "This Month's Priorities";
      case 'last-month': return "Last Month's Priorities";
      case 'this-quarter': return "This Quarter's Priorities";
      case 'ytd': return "Year to Date's Priorities";
      case 'custom': return "Custom Range Priorities";
      default: return "This Week's Priorities";
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 space-y-6">
      {/* Date & Active Range */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">{getDateFilterDisplayText(dateFilter)}</h3>
        <p className="text-white font-medium">{formattedDate}</p>
        <p className="text-xs text-slate-500 mt-1">Active range: Last 7 days</p>
      </div>

      {/* Recommended Actions */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Actions</h3>
        <div className="space-y-2">
          {priorities.map((priority, i) => (
            <Link
              key={i}
              to={`/priorities/${priority.id}`}
              className="block p-3 rounded-lg bg-slate-950/50 hover:bg-slate-800 transition-colors border border-slate-800/50 hover:border-blue-500/30"
            >
              <p className="text-sm text-white font-medium">{priority.headline}</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{priority.subtext}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Last Refreshed */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Refreshed</h3>
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          2 minutes ago
        </p>
      </div>
    </aside>
  );
};

// ============================================================================
// OVERVIEW TAB - REFACTORED (Section 1 of spec)
// ============================================================================

const OverviewTab = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [valuationPreview, setValuationPreview] = useState('$3.15M - $3.40M');
  const [quickStats, setQuickStats] = useState<any>({});

  useEffect(() => {
    if (!selectedCompanyId) return;

    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch alerts (unresolved only)
        const alertsData = await fetchAlerts(selectedCompanyId, false);
        setAlerts(alertsData || []);

        // Fetch valuation for preview
        const valuationData = await fetchValuation(selectedCompanyId);
        if (valuationData?.valuation_range) {
          setValuationPreview(
            `${formatCurrency(valuationData.valuation_range.low)} - ${formatCurrency(valuationData.valuation_range.high)}`
          );
        }
        if (valuationData) {
          setQuickStats({
            monthlyProduction: valuationData.revenue ? Math.round(valuationData.revenue / 12) : null,
            unscheduledTreatmentValue: null,
            noShowRate: null,
            caseAcceptance: null,
            dso: null,
          });
        }
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCompanyId]);

  // Convert alerts to priorities for hero section
  const priorityAlerts = alerts.map(alert => ({
    id: alert.id,
    headline: alert.headline || alert.description,
    subtext: alert.subtext || '',
    type: alert.type || 'info',
    severity: alert.severity || 2,
    ctaText: (alert.type === 'warning' || alert.severity === 1) ? 'Address Issue' : 'View Details',
    ctaPath: `/priorities/${alert.id}`,
  }));

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
      {/* 1. This Week's Priorities - Hero Block */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          This Week's Priorities
        </h2>
        <div className="space-y-3">
          {priorityAlerts.map((alert) => (
            <PriorityCard
              key={alert.id}
              icon={
                alert.type === 'warning' 
                  ? <AlertTriangle className="w-6 h-6" />
                  : alert.type === 'success'
                  ? <CheckCircle2 className="w-6 h-6" />
                  : <Info className="w-6 h-6" />
              }
              headline={alert.headline}
              subtext={alert.subtext}
              ctaText={alert.ctaText}
              ctaPath={alert.ctaPath}
              severity={alert.severity}
            />
          ))}
        </div>
      </section>

      {/* 2. Compact Health Score Row */}
      <section>
        <CompactHealthScore />
      </section>

      {/* 3. Secondary KPI Grid - Smaller, Denser */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Net Collection', value: '94%', trend: 'up' as const, target: '92%' },
          { label: 'Cost by Chair Hour', value: '$42/hr', trend: 'stable' as const, target: '$50/hr'},
          { label: 'Denial Rate', value: '5.4%', trend: 'stable' as const, target: '5%' },
          { label: 'Case Acceptance', value: '72%', trend: 'up' as const, target: '70%' }
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

      {/* 4. Valuation Preview Card */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-xl text-white space-y-4 shadow-xl shadow-blue-900/20">
        <h3 className="text-blue-100 font-medium uppercase text-xs tracking-widest">Valuation Range Preview</h3>
        <div className="text-4xl font-bold">{valuationPreview}</div>
        <Link to="/valuation" className="inline-block text-sm bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-semibold backdrop-blur-md">
          View Detailed Valuation →
        </Link>
      </section>

      {/* 5. Quick Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Monthly Prod.', value: quickStats.monthlyProduction ? formatCurrency(quickStats.monthlyProduction) : '—', icon: DollarIcon },
          { label: 'Unscheduled', value: quickStats.unscheduledTreatmentValue ? formatCurrency(quickStats.unscheduledTreatmentValue) : '—', icon: Clock },
          { label: 'No-Show Rate', value: quickStats.noShowRate ? `${quickStats.noShowRate}%` : '—', icon: AlertTriangle },
          { label: 'Case Acceptance', value: quickStats.caseAcceptance ? `${quickStats.caseAcceptance}%` : '—', icon: CheckCircle2 },
          { label: 'DSO', value: quickStats.dso ? `${quickStats.dso} days` : '—', icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center text-center">
            <stat.icon className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{stat.label}</p>
            <p className="text-sm font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

// ============================================================================
// DRILL-DOWN PLACEHOLDER PAGES (for routing)
// ============================================================================

const PriorityDetailPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-white">Priority Details</h1>
      <p className="text-slate-400">This is a placeholder for priority drill-down view.</p>
      {/* TODO: wire to backend - fetch and display detailed priority information */}
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
