import { create } from 'zustand';

type Tab = 'overview' | 'operations' | 'financials' | 'valuation';

interface DentsightState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const useDentsightStore = create<DentsightState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
