import { mockData } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceArea } from 'recharts';
import { InfoTooltip } from '../ui/InfoTooltip';

export const OperationsTab = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Provider Hourly Production */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Provider Hourly Production</h3>
          <InfoTooltip 
            title="Hourly Production by Provider"
            description="Measures each provider's efficiency in terms of production value generated per chair hour. Compare doctors and hygienists separately."
            calculation="Total Production ÷ Total Chair Hours\n\nDoctor target: $400-500/hr\nHygienist target: $100-130/hr\n\nLow numbers indicate underutilization or scheduling gaps." />
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData.providerProduction} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#3b82f6' }}
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
              />
              <Bar 
                dataKey="hourlyProduction" 
                radius={[4, 4, 0, 0]}
                fill="#3b82f6"
                maxBarSize={50}
              >
                {mockData.providerProduction.map((entry, index) => (
                  <cell 
                    key={`cell-${index}`} 
                    fill={entry.hourlyProduction >= entry.target ? '#10b981' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 2. Appointment Metrics Table */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Appointment Metrics</h3>
          <InfoTooltip 
            title="Appointment Performance Indicators"
            description="Key metrics tracking how well your appointment book is performing. Trends show if you're improving (↑) or declining (↓)."
            calculation="No-Show Rate: Target <8%\nCancellation Rate: Target <10%\nCase Acceptance: Target >70%\n\nTrends indicate month-over-month changes." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Metric</th>
                <th className="px-6 py-4">Current</th>
                <th className="px-6 py-4">Trend</th>
                <th className="px-6 py-4">Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {mockData.appointmentMetrics.map((metric, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{metric.metric}</td>
                  <td className="px-6 py-4 text-white font-bold">{metric.currentValue}</td>
                  <td className="px-6 py-4">
                    <span className={metric.trend === 'up' ? 'text-emerald-500' : metric.trend === 'down' ? 'text-amber-500' : 'text-slate-500'}>
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate	4">{metric.benchmark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Hygiene Re-care Trend */}
      <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Hygiene Re-care Trend</h3>
          <InfoTooltip 
            title="Hygiene Recall/Re-care Rate"
            description="Percentage of hygiene patients who return for their next scheduled cleaning. Green zone shows target range (80-85%)."
            calculation="(Returning Hygiene Patients / Total Hygiene Completions) × 100\n\nTarget: 80-85%\nBelow 75% indicates recall system problems\nAbove 90% is exceptional performance" />
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData.hygieneTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              {/* Target Zone Overlay */}
              <ReferenceArea y1={80} y2={85} fill="#10b981" fillOpacity={0.05} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
