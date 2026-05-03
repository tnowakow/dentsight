import { create } from 'zustand';

export type Tab = 'overview' | 'operations' | 'financials' | 'valuation';
export type DateFilter = 'today' | 'this-week' | 'this-month' | 'last-month' | 'this-quarter' | 'ytd' | 'custom';

export interface Company {
  id: string;
  name: string;
  isAcquisitionTarget: boolean;
  createdAt: string;
}

interface DentsightState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  lastUpdated: string;
  setLastUpdated: (timestamp: string) => void;
  // Company selector state
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (companyId: string | null) => void;
  isLoadingCompanyData: boolean;
  setIsLoadingCompanyData: (loading: boolean) => void;
}

export const useDentsightStore = create<DentsightState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  dateFilter: 'this-month',
  setDateFilter: (filter) => set({ dateFilter: filter }),
  lastUpdated: new Date().toLocaleString(),
  setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
  // Company selector defaults
  companies: [],
  setCompanies: (companies) => set({ companies }),
  selectedCompanyId: null,
  setSelectedCompanyId: (companyId) => set({ selectedCompanyId: companyId }),
  isLoadingCompanyData: false,
  setIsLoadingCompanyData: (loading) => set({ isLoadingCompanyData: loading }),
}));
