import { useDentsightStore } from '../../store/useDentsightStore';
import { Home, Activity, DollarSign, Calculator, Calendar } from 'lucide-react';
import { OverviewTab } from '../tabs/OverviewTab';
import { FinancialsTab } from '../tabs/FinancialsTab';
import { OperationsTab } from '../tabs/OperationsTab';
import { ValuationTab } from '../tabs/ValuationTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'operations', label: 'Operations', icon: Activity },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'valuation', label: 'Valuation', icon: Calculator },
] as const;

export const AppLayout: React.FC<{ children?: React.ReactNode }> = () => {
  const { activeTab, setActiveTab, dateFilter, setDateFilter } = useDentsightStore();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 p-6 space-y-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
          Dentsight
        </div>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-90/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pb-20 md:pb-0">
        <header className="md:hidden h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="text-xl font-bold text-blue-500">Dentsight</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dashboard</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'financials' && <FinancialsTab />}
          {activeTab === 'operations' && <OperationsTab />}
          {activeTab === 'valuation' && <ValuationTab />}
        </div>
      </main>

      {/* Right Rail - Date Filter (Desktop Only) */}
      <aside className="hidden lg:flex w-56 flex-col border-l border-slate-800 p-6 space-y-6 bg-slate-950">
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Filter</h3>
          <div className="space-y-2">
            {(['this-week', 'this-month'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  dateFilter === filter
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="font-medium">
                  {filter === 'this-week' ? 'This Week' : 'This Month'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Filter</h3>
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
            <p className="text-sm text-slate-200 font-medium">
              {dateFilter === 'this-week' ? 'This Week' : 'This Month'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {dateFilter === 'this-week'
                ? 'Showing data for the current week'
                : 'Showing data for the current month'}
            </p>
          </div>
        </div>
      </aside>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-800 bg-slate-950/90 backdrop-blur-lg flex items-center justify-around px-2 z-40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              activeTab === tab.id ? 'text-blue-500' : 'text-slate-500'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-tight">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
