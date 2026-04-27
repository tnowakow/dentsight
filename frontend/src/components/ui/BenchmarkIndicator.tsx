import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface BenchmarkIndicatorProps {
  current: string | number;
  target?: string | number;
  benchmark?: string | number;
  trend?: 'up' | 'down' | 'stable';
}

export const BenchmarkIndicator: React.FC<BenchmarkIndicatorProps> = ({ 
  current, 
  target, 
  benchmark, 
  trend 
}) => {
  const Icon = () => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-amber-500" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md">
      <span className="text-slate-50">{current}</span>
      {target && <span className="opacity-50">|</span>}
      {target && <span className="text-slate-400">T: {target}</span>}
      {benchmark && <span className="opacity-50">|</span>}
      {benchmark && <span className="text-slate-400">B: {benchmark}</span>}
      {trend !== undefined && <Icon />}
    </div>
  );
};
