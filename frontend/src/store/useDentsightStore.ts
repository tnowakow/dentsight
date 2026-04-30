import { create } from 'zustand';

type Tab = 'overview' | 'operations' | 'financials' | 'valuation';
type DateFilter = 'this-week' | 'this-month';

interface DentsightState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
}

export const useDentsightStore = create<DentsightState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  dateFilter: 'this-month',
  setDateFilter: (filter) => set({ dateFilter: filter }),
}));
