import { useState, useEffect } from 'react';
import { useDentsightStore } from '../../store/useDentsightStore';
import { fetchValuation } from '../../services/api';
import { InfoTooltip } from '../ui/InfoTooltip';
import { formatNumber } from '../../utils/formatting';

export const ValuationTab = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [isLoading, setIsLoading] = useState(true);
  const [valuationData, setValuationData] = useState<any>(null);

  useEffect(() => {
    if (!selectedCompanyId) return;

    setIsLoading(true);
    
    const fetchValuationData = async () => {
      try {
        const data = await fetchValuation(selectedCompanyId);
        setValuationData(data);
      } catch (error) {
        console.error('Error fetching valuation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchValuationData();
  }, [selectedCompanyId]);

  // Default values for display when data is not available
  const ebitda = valuationData?.ebitda || 485000;
  const addbacksTotal = valuationData?.addbacks_total || 23000;
  const lowRange = valuationData?.valuation_range?.low || 3150000;
  const highRange = valuationData?.valuation_range?.high || 3400000;
  const mostLikely = valuationData?.valuation_range?.most_likely || 3300000;
  const marketMultiple = valuationData?.market_multiple || { low: 6.5, high: 7.0, current: 6.8 };
  const disclaimer = valuationData?.disclaimer || 'Informational estimate only — not a certified appraisal';

  // Mock addbacks for now (can be fetched from backend later)
  const addbacks = [
    { name: 'Owner Salary Adjustment', amount: 120000, category: 'Owner Comp' },
    { name: 'Personal Vehicle Lease', amount: 8000, category: 'One-time expense' },
    { name: 'Non-recurring Marketing', amount: 5000, category: 'Marketing' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading valuation data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. EBITDA Calculation Breakdown */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">EBITDA Calculation</h3>
          <InfoTooltip 
            title="EBITDA (Earnings Before Interest, Taxes, Depreciation & Amortization)"
            description="The primary metric used to value dental practices. Shows the practice's true earning power by adding back non-recurring expenses."
            calculation="Gross Production - Operating Expenses + Add-backs = EBITDA\n\nAdd-backs: Owner-specific costs not tied to normal operations (personal expenses, one-time costs, above-market salaries)" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/50">
            <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Gross Production</span>
            <span className="font-bold text-white">$750,000</span>
          </div>
          <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/50">
             <span className="text-slate-4	4 font-medium uppercase tracking-wider text-[10px]">Total Add-backs</span>
             <span className="font-bold text-emerald-500">+${formatNumber(addbacksTotal)}</span>
          </div>
           <div className="flex justify-between items-center text-lg py-4 border-t border-slate-700">
            <span className="font-bold text-white">Normalized EBITDA</span>
            <span className="text-2xl font-black text-blue-500">${formatNumber(ebitda)}</span>
          </div>
        </div>
      </section>

      {/* 2. Add-backs List */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Add-backs List</h3>
          <InfoTooltip 
            title="EBITDA Add-backs"
            description="Non-recurring or owner-specific expenses added back to EBITDA to show the practice's true earning potential for a new owner."
            calculation="Common add-backs:\n• Owner salary adjustments (to market rate)\n• Personal expenses run through business\n• One-time legal/marketing costs\n• Non-recurring repairs\n\nTotal add-backs increase valuation." />
        </div>
        <div className="divide-y divide-slate-800">
          {addbacks.map((item, i) => (
            <div key={i} className="p-6 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
              <div>
                <h4 className="text-white font-medium">{item.name}</h4>
                <span className="text-xs text-slate-500 uppercase tracking-wide">{item.category}</span>
              </div>
              <span className="text-emerald-500 font-bold">+${formatNumber(item.amount)}</span>
            </div>
          ))}
          {/* 4b. Total Add-Backs Summary */}
          <div className="p-6 flex justify-between items-center bg-slate-800/30 font-bold">
            <span className="text-white">Total Add-Backs</span>
            <span className="text-emerald-400 text-lg">+${formatNumber(addbacks.reduce((sum, item) => sum + item.amount, 0))}</span>
          </div>
        </div>

        {/* Owner Comp Normalization Note */}
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-start gap-3">
            <InfoTooltip
              title="Owner Compensation Normalization"
              description="Adjusts the owner's salary to a market-rate manager salary, since a new owner wouldn't pay themselves the same amount."
              calculation="If owner takes below-market salary: add difference to EBITDA\nIf owner takes above-market salary: subtract difference from EBITDA\n\nThis ensures valuation reflects true practice earnings, not owner-specific compensation."
              position="top-right" />
            <p className="text-sm text-slate-400">
              <span className="text-slate-200 font-medium">Owner Comp Normalization:</span> Owner salary adjusted to market rate for a practice manager. This add-back reflects the difference between what the current owner takes home vs. what a new owner would pay a hired manager.
            </p>
          </div>
        </div>
      </section>

      {/* EBITDA Multiple Info */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Market Multiple</h3>
          <InfoTooltip
            title="EBITDA Multiple"
            description="The multiplier applied to your normalized EBITDA to estimate practice value. Dental practices typically sell for 6-7x EBITDA."
            calculation="Valuation = Normalized EBITDA × Market Multiple\n\nFactors affecting multiple:\n• Practice location and demographics\n• Growth trend (increasing EBITDA = higher multiple)\n• Provider tenure and retention\n• Production mix (insurance vs patient pay)\n\nCurrent multiple: {valuationDetails.marketMultiple.current}x" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Current Multiple</span>
          <span className="text-2xl font-black text-blue-500">{marketMultiple.current}x</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Range</span>
          <span className="text-white">{marketMultiple.low}x — {marketMultiple.high}x</span>
        </div>
      </section>

      {/* 3. Valuation Range Visualization */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-8 relative">
         <div className="flex items-center justify-between">
           <h3 className="text-lg font-semibold text-white">Valuation Range</h3>
           <InfoTooltip 
             title="Practice Valuation Range"
             description="Estimated market value based on current EBITDA multiplied by industry standard multiples (6.5x - 7.0x for healthy practices)."
             calculation="Valuation = Normalized EBITDA × Market Multiple\n\nCurrent multiple: {valuationDetails.marketMultiple.current}x\nLow range: {valuationDetails.marketMultiple.low}x × EBITDA\nHigh range: {valuationDetails.marketMultiple.high}x × EBITDA\n\nMultiples vary by location, growth trend, and practice quality." />
         </div>
         
         <div className="relative pt-4 pb-12 px-4">
            {/* The visual slider track */}
            <div className="h-4 w-full bg-slate-800 rounded-full relative overflow-hidden">
               <div 
                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                 style={{ width: '100%' }} 
               />
            </div>

            {/* Ticks/Markers */}
            <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <span>Low: ${formatNumber(lowRange)}</span>
              <span>High: ${formatNumber(highRange)}</span>
            </div>

            {/* The "Most Likely" Marker */}
            <div 
               className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10"
               style={{ left: '50%' }} 
            />
             <div className="mt-4 text-center">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Most Likely Value</span>
                <p className="text-3xl font-black text-white mt-1">${formatNumber(mostLikely)}</p>
             </div>
         </div>

         <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
            <p className="text-xs text-amber-500 font-medium leading-relaxed italic">
              {disclaimer}
            </p>
         </div>
      </section>
    </div>
  );
};
