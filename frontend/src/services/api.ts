import { mockData, MockData } from '../data/mockData';

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const API_BASE_URL = '/api';

export async function fetchDashboardData(): Promise<Partial<MockData>> {
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

  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchValuationDetails(): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      valuationPreview: mockData.valuationPreview,
      valuationDetails: mockData.valuationDetails,
      addbacks: mockData.addbacks,
    };
  }

  const response = await fetch(`${API_BASECR}/valuation`);
  if (!response.ok) {
    throw new Error(`Failed to fetch valuation details: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchOperationsData(): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      denialRates: mockData.denialRates,
      appointmentMetrics: mockData.appointmentMetrics,
    };
  }

  const response = await fetch(`${API_BASE_URL}/operations`);
  if (!response.ok) {
    throw new Error(`Failed to fetch operations data: ${response.statusText}`);
  }
  return response.json();
}
