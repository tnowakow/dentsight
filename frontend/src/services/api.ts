import { mockData, type MockData } from '../data/mockData';

// Use mock data for local development when backend is not available
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

// Fetch metrics for a company
export async function fetchMetrics(companyId?: string, from?: string, to?: string): Promise<any[]> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.hygieneTrend;
  }

  let url = `${API_BASE_URL}/metrics`;
  const params = new URLSearchParams();
  
  if (companyId) params.append('company_id', companyId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  return response.json();
}

// Fetch alerts for a company
export async function fetchAlerts(companyId?: string, resolved?: boolean): Promise<any[]> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.alerts;
  }

  let url = `${API_BASE_URL}/alerts`;
  const params = new URLSearchParams();
  
  if (companyId) params.append('company_id', companyId);
  if (resolved !== undefined) params.append('resolved', resolved.toString());
  
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }
  return response.json();
}

// Fetch valuation for a company
export async function fetchValuation(companyId?: string): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      ebitda: mockData.valuationDetails.ebitda,
      valuation_range: {
        low: mockData.valuationDetails.lowRange,
        high: mockData.valuationDetails.highRange,
        most_likely: mockData.valuationDetails.mostLikely
      },
      market_multiple: mockData.valuationDetails.marketMultiple,
      addbacks_total: mockData.addbacks.reduce((sum, item) => sum + item.amount, 0),
      disclaimer: mockData.valuationDetails.disclaimer
    };
  }

  let url = `${API_BASE_URL}/valuation`;
  const params = new URLSearchParams();
  
  if (companyId) params.append('company_id', companyId);
  
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch valuation: ${response.statusText}`);
  }
  return response.json();
}

// Fetch practices for a company
export async function fetchPractices(companyId?: string): Promise<any[]> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: '1', name: 'Main Practice Location', address: '123 Main St' }
    ];
  }

  let url = `${API_BASE_URL}/practices`;
  const params = new URLSearchParams();
  
  if (companyId) params.append('company_id', companyId);
  
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch practices: ${response.statusText}`);
  }
  return response.json();
}

// Fetch metric trend for a specific metric name
export async function fetchMetricTrend(metricName: string, companyId?: string, months = 12): Promise<any[]> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.hygieneTrend;
  }

  let url = `${API_BASE_URL}/metrics/trend/${encodeURIComponent(metricName)}`;
  const params = new URLSearchParams();
  
  if (companyId) params.append('company_id', companyId);
  params.append('months', months.toString());
  
  url += `?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch metric trend: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchKpiData(companyId?: string): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { healthScore: 84, netCollectionRate: 94, costPerChairHour: 42, denialRate: 5.4, caseAcceptance: 72, monthlyProduction: 125000, unscheduledTreatmentValue: 45000, noShowRate: 8.5, dso: 42 };
  }
  const url = companyId ? `${API_BASE_URL}/kpi/company-overview?company_id=${companyId}` : `${API_BASE_URL}/kpi/overview`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch KPI data: ${response.statusText}`);
  return response.json();
}

export async function fetchRecommendations(companyId?: string): Promise<any[]> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { priority: 'high', category: 'Revenue', title: 'Improve Case Acceptance', description: 'Case acceptance is below target.', actions: ['Train staff', 'Use visual aids'], potentialImpact: '+$5,000/month' }
    ];
  }
  
  const url = companyId 
    ? `${API_BASE_URL}/recommendations?company_id=${companyId}`
    : `${API_BASE_URL}/recommendations`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  return response.json();
}

// Fetch operations data (denial rates, appointment metrics)
export async function fetchOperationsData(companyId?: string): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      denialRates: mockData.denialRates,
      appointmentMetrics: mockData.appointmentMetrics,
      providerProduction: mockData.providerProduction
    };
  }

  // Fetch metrics - reserved for future transformation
  await fetchMetrics(companyId);

  return {
    denialRates: [],
    appointmentMetrics: [],
    providerProduction: []
  };
}
