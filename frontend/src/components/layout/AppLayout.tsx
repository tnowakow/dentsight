import { useDentsightStore } from '../../store/useDentsightStore';
import { Home, Activity, DollarSign, Calculator } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'operations', label: 'Operations', icon: Activity },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'valuation', label: 'Valuation', icon: Calculator },
] as const;

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab } = useDentsightStore();

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
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-80	0 bg-slate-950/90 backdrop-blur-lg flex items-center justify-around px-2 z-40">
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
