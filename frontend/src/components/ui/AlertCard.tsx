import { type AlertType } from '../../data/mockData';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AlertCardProps {
  type: AlertType;
  headline: string;
  subtext: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({ type, headline, subtext }) => {
  const variants = {
    warning: {
      container: 'bg-amber-500/10 border-amber-500 text-amber-500',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    success: {
      container: 'bg-emerald-500/10 border-emerald-500 text-emerald-500',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500 text-blue-500',
      icon: <Info className="w-5 h-5" />,
    },
  };

  const variant = variants[type] || variants.info;

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 border rounded-lg transition-all animate-in fade-in slide-in-from-top-2',
      variant.container
    )}>
      <div className="mt-0.5">{variant.icon}</div>
      <div>
        <h3 className="font-bold leading-tight">{headline}</h3>
        <p className="text-sm opacity-90 mt-1">{subtext}</p>
      </div>
    </div>
  );
};
