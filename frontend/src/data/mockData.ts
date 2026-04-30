export type AlertType = 'warning' | 'success' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  headline: string;
  subtext: string;
  severity: number;
}

export interface MetricPoint {
  date: string;
  value: number;
}

export interface ProviderProduction {
  name: string;
  hourlyProduction: number;
  type: 'doctor' | 'hygienist';
  target: number;
}

export interface AppointmentMetric {
  metric: string;
  currentValue: string;
  trend: 'up' | 'down' | 'stable';
  benchmark: string;
}

export interface PayerDenial {
  payer: string;
  rate: number;
}

export interface ValuationData {
  ebitda: number;
  addbacksTotal: number;
  lowRange: number;
  highRange: number;
  mostLikely: number;
  marketMultiple: {
    low: number;
    high: number;
    current: number;
  };
  disclaimer: string;
}

export interface AddbackItem {
  name: string;
  amount: number;
  category: string;
}

export interface MockData {
  alerts: Alert[];
  healthScore: number;
  quickStats: {
    monthlyProduction: number;
    unscheduledTreatmentValue: number;
    noShowRate: number;
    caseAcceptance: number;
    dso: number;
  };
  valuationPreview: string;
  hygieneTrend: MetricPoint[];
  providerProduction: ProviderProduction[];
  appointmentMetrics: AppointmentMetric[];
  denialRates: PayerDenial[];
  productionBreakdown: { label: string; value: number }[];
  costAnalysis: {
    costPerChairHour: number;
    supplyCostPercent: number;
    labFeePercent: number;
  };
  valuationDetails: ValuationData;
  addbacks: AddbackItem[];
}

export const mockData: MockData = {
  alerts: [
    {
      id: '1',
      type: 'warning',
      headline: 'Hygiene Re-care Rate Drop',
      subtext: 'Current rate 78% (Target: 80%) — could be costing ~$12K/month',
      severity: 2,
    },
    {
      id: '2',
      type: 'success',
      headline: 'Case Acceptance Target Met',
      subtext: 'Achieved 72% this month against target of 70%',
      severity: 3,
    },
    {
      id: '3',
      type: 'info',
      headline: 'New Expense Logged',
      subtext: 'Monthly lab fees processed for April.',
      severity: 3,
    },
  ],
  healthScore: 84,
  quickStats: {
    monthlyProduction: 125000,
    unscheduledTreatmentValue: 45000,
    noShowRate: 8.5,
    caseAcceptance: 72,
    dso: 42,
  },
  valuationPreview: '$3.15M - $3.40M',
  hygieneTrend: [
    { date: 'Jan', value: 82 },
    { date: 'Feb', value: 80 },
    { date: 'Mar', value: 78 },
    { date: 'Apr', value: 81 },
    { date: 'May', value: 84 },
    { date: 'Jun', value: 83 },
  ],
  providerProduction: [
    { name: 'Dr. Smith', hourlyProduction: 450, type: 'doctor', target: 400 },
    { name: 'Dr. Jones', hourlyProduction: 380, type: 'doctor', target: 400 },
    { name: 'Hygienist Sarah', hourlyProduction: 120, type: 'hygienist', target: 100 },
    { name: 'Hygienist Mike', hourlyProduction: 115, type: 'hygienist', target: 100 },
  ],
  appointmentMetrics: [
    { metric: 'No-show Rate', currentValue: '8.5%', trend: 'up', benchmark: '7%' },
    { metric: 'Cancellation Rate', currentValue: '12%', trend: 'down', benchmark: '10%' },
    { metric: 'Case Acceptance', currentValue: '72%', trend: 'up', benchmark: '70%' },
  ],
  denialRates: [
    { payer: 'United Healthcare', rate: 10.5 },
    { payer: 'Delta Dental', rate: 4.2 },
    { payer: 'Aetna', rate: 6.8 },
    { payer: 'Cigna', rate: 3.1 },
  ],
  productionBreakdown: [
    { label: 'Insurance', value: 75 },
    { label: 'Patient Out-of-Pocket', value: 25 },
  ],
  costAnalysis: {
    costPerChairHour: 42,
    supplyCostPercent: 6.5,
    labFeePercent: 8.2,
  },
  valuationDetails: {
    ebitda: 485000,
    addbacksTotal: 23000,
    lowRange: 3150000,
    highRange: 3400000,
    mostLikely: 3300000,
    marketMultiple: {
      low: 6.5,
      high: 7.0,
      current: 6.8,
    },
    disclaimer: 'Informational estimate only — not a certified appraisal',
  },
  addbacks: [
    { name: 'Owner Salary Adjustment', amount: 120000, category: 'Owner Comp' },
    { name: 'Personal Vehicle Lease', amount: 8000, category: 'One-time expense' },
    { name: 'Non-recurring Marketing', amount: 5000, category: 'Marketing' },
  ],
};
