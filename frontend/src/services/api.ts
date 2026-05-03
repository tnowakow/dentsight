import { mockData, type MockData } from '../data/mockData';

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const API_BASE_URL = '/api';

// Company types
export interface Company {
  id: string;
  name: string;
  isAcquisitionTarget: boolean;
  createdAt: string;
}

// Mock companies for development (matches JayJay's 10 scenarios)
const mockCompanies: Company[] = [
  { id: '1', name: 'Apex Dental Group', isAcquisitionTarget: true, createdAt: '2024-01-15' },
  { id: '2', name: 'Bright Smiles Family Dentistry', isAcquisitionTarget: false, createdAt: '2019-03-22' },
  { id: '3', name: 'Coastal Dental Care', isAcquisitionTarget: true, createdAt: '2015-07-10' },
  { id: '4', name: 'Emerald City Dentistry', isAcquisitionTarget: false, createdAt: '2024-08-05' },
  { id: '5', name: 'Gateway Dental Associates', isAcquisitionTarget: true, createdAt: '2017-11-30' },
  { id: '6', name: 'Harbor View Dental', isAcquisitionTarget: false, createdAt: '2020-04-18' },
  { id: '7', name: 'Mountain Peak Dental', isAcquisitionTarget: true, createdAt: '2018-09-12' },
  { id: '8', name: 'Oakwood Family Dentistry', isAcquisitionTarget: false, createdAt: '2023-02-28' },
  { id: '9', name: 'Riverside Dental Studio', isAcquisitionTarget: true, createdAt: '2016-06-07' },
  { id: '10', name: 'Summit Smile Center', isAcquisitionTarget: false, createdAt: '2021-12-03' },
];

// Fetch all companies for the dropdown selector
export async function fetchCompanies(): Promise<Company[]> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCompanies;
  }

  const response = await fetch(`${API_BASE_URL}/companies`);
  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchDashboardData(companyId?: string): Promise<Partial<MockData>> {
  if (useMockData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      alerts: mockData.alerts,
      healthScore: mockData.healthScore,
      quickStats: mockData.quickStats,
      hygieneTrend: mockData.hygieneTrend,
      providerProduction: mockData.providerProduction,
      appointmentMetrics: mockData.appointmentMetrics,
      denialRates: mockData.denialRates,
      productionBreakdown: mockData.productionBreakdown,
      costAnalysis: mockData.costAnalysis,
    };
  }

  const url = companyId 
    ? `${API_BASE_URL}/dashboard?companyId=${companyId}`
    : `${API_BASE_URL}/dashboard`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchValuationDetails(companyId?: string): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      valuationPreview: mockData.valuationPreview,
      valuationDetails: mockData.valuationDetails,
      addbacks: mockData.addbacks,
    };
  }

  const url = companyId
    ? `${API_BASE_URL}/valuation?companyId=${companyId}`
    : `${API_BASE_URL}/valuation`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch valuation details: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchOperationsData(companyId?: string): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      denialRates: mockData.denialRates,
      appointmentMetrics: mockData.appointmentMetrics,
    };
  }

  const url = companyId
    ? `${API_BASE_URL}/operations?companyId=${companyId}`
    : `${API_BASE_URL}/operations`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch operations data: ${response.statusText}`);
  }
  return response.json();
}
