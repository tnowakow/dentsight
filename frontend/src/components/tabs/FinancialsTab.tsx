import { useState, useEffect } from 'react';
import { useDentsightStore } from '../../store/useDentsightStore';
import { fetchOperationsData } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { InfoTooltip } from '../ui/InfoTooltip';
import { formatPercent } from '../../utils/formatting';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Default mock data for fallback
const defaultDenialRates = [
  { payer: 'United Healthcare', rate: 10.5 },
  { payer: 'Delta Dental', rate: 4.2 },
  { payer: 'Aetna', rate: 6.8 },
  { payer: 'Cigna', rate: 3.1 },
];

const defaultProductionBreakdown = [
  { label: 'Insurance', value: 75 },
  { label: 'Patient Out-of-Pocket', value: 25 },
];

const defaultCostAnalysis = {
  costPerChairHour: 42,
  supplyCostPercent: 6.5,
  labFeePercent: 8.2,
};

export const FinancialsTab = () => {
  const selectedCompanyId = useDentsightStore((state) => state.selectedCompanyId);
  const [isLoading, setIsLoading] = useState(true);
  const [denialRates, setDenialRates] = useState(defaultDenialRates);
  const [productionBreakdown] = useState(defaultProductionBreakdown); // TODO: wire to API when endpoint returns breakdown data
  const [costAnalysis, setCostAnalysis] = useState(defaultCostAnalysis);

  useEffect(() => {
    if (!selectedCompanyId) return;

    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch operations data which includes denial rates and other metrics
        const opsData = await fetchOperationsData(selectedCompanyId);
        
        // Update state with fetched data if available
        if (opsData?.denialRates != null && opsData.denialRates.length > 0) {
          setDenialRates(opsData.denialRates);
        }
        if (opsData?.costAnalysis) {
          setCostAnalysis({
            costPerChairHour: opsData.costAnalysis.costPerChairHour ?? defaultCostAnalysis.costPerChairHour,
            supplyCostPercent: opsData.costAnalysis.supplyCostPercent ?? defaultCostAnalysis.supplyCostPercent,
            labFeePercent: opsData.costAnalysis.labFeePercent ?? defaultCostAnalysis.labFeePercent,
          });
        }
      } catch (error) {
        console.error('Error fetching financials data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCompanyId]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading financial data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Denial Rate by Payer */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Denial Rate by Payer</h3>
          <InfoTooltip 
            title="Claim Denial Rate by Insurance"
            description="Shows denial rates for each insurance carrier your practice works with. High denial rates indicate billing issues or contract problems."
            calculation="(Denied Claims from Carrier / Total Claims to Carrier) × 100\n\nRed flags: Any payer above 8% needs investigation. Consider switching underperforming carriers." />
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={denialRates} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatPercent(v)} />
              <YAxis dataKey="payer" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
              <Tooltip 
                cursor={{fill: '#1e293b'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
              />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                {denialRates.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rate > 8 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Production Breakdown */}
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Production Breakdown</h3>
            <InfoTooltip 
              title="Production Revenue Sources"
              description="Shows how your practice's production is split between insurance payments and patient out-of-pocket payments."
              calculation="Insurance % = (Insurance Production / Total Production) × 100\nPatient Pay % = (Patient Payments / Total Production) × 100\n\nHealthy mix: 70-80% insurance, 20-30% patient pay indicates good case acceptance." />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productionBreakdown}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productionBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {productionBreakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Cost Analysis */}
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Cost Analysis</h3>
            <InfoTooltip 
              title="Practice Cost Metrics"
              description="Key cost indicators that measure practice efficiency and overhead management."
              calculation="Cost per Chair Hour: Total overhead ÷ total chair hours (target: $200-250/hr)\nIndustry standard: healthy practices run $150-250/hr; above $300/hr signals overhead problems.\nSupply Cost %: Lab/supply costs ÷ production (target: 6-8%)\nLab Fee %: External lab fees ÷ production (target: 7-10%)" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/50 flex justify-between items-center">
              <span className="text-sm text-slate-400">Cost per Chair Hour</span>
              <span className="text-xl font-bold text-white">${(+costAnalysis.costPerChairHour).toFixed(2)}/hr</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/50 flex justify-between items-center">
              <span className="text-sm text-slate-400">Supply Cost %</span>
              <span className="text-xl font-bold text-white">{formatPercent(costAnalysis.supplyCostPercent)}</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/50 flex justify-between items-center">
              <span className="text-sm text-slate-400">Lab Fee %</span>
              <span className="text-xl font-bold text-white">{formatPercent(costAnalysis.labFeePercent)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
