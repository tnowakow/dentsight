/**
 * Force en-US locale for all number/currency/percentage formatting
 * to prevent locale bleed (e.g. %4.2%, K145K)
 */

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompactCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/** Large whole-number amounts (EBITDA, valuation, addbacks) — no decimals */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/** Format a KPI rate/percentage value to exactly 2 decimal places */
export const formatKpiPercent = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return `${(+value).toFixed(2)}%`;
};

/** Format a dollar-per-hour rate to 2 decimal places */
export const formatChairHour = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return `$${(+value).toFixed(2)}/hr`;
};
