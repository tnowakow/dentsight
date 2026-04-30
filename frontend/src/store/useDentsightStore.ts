import { create } from 'zustand';

type Tab = 'overview' | 'operations' | 'financials' | 'valuation';
type DateFilter = 'today' | 'this-week' | 'this-month' | 'last-month' | 'this-quarter' | 'ytd' | 'custom';

interface DentsightState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  lastUpdated: string;
  setLastUpdated: (timestamp: string) => void;
}

export const useDentsightStore = create<DentsightState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  dateFilter: 'this-month',
  setDateFilter: (filter) => set({ dateFilter: filter }),
  lastUpdated: new Date().toLocaleString(),
  setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
}));
