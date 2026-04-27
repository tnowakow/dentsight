import { useState } from 'react'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  title: string
  description: string
  calculation?: string
  position?: 'bottom-right' | 'top-right' | 'inline'
}

export const InfoTooltip = ({ 
  title, 
  description, 
  calculation,
  position = 'bottom-right' 
}: InfoTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    'bottom-right': 'absolute bottom-2 right-2',
    'top-right': 'absolute top-2 right-2',
    'inline': 'ml-2 align-middle',
  }

  const tooltipPositionClasses = {
    'bottom-right': 'bottom-full mb-2 right-0',
    'top-right': 'top-full mt-2 right-0',
    'inline': 'bottom-full mb-1 left-0',
  }

  return (
    <div className="relative inline-block" onMouseLeave={() => setIsOpen(false)}>
      {/* Tooltip Content */}
      {isOpen && (
        <div 
          className={`absolute ${tooltipPositionClasses[position]} z-50 w-72 p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-sm animate-in fade-in zoom-in duration-200`}
        >
          <h4 className="font-semibold text-white mb-2">{title}</h4>
          <p className="text-slate-300 leading-relaxed mb-3">{description}</p>
          {calculation && (
            <div className="pt-2 border-t border-slate-700">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Calculation</p>
              <p className="text-slate-400 text-xs">{calculation}</p>
            </div>
          )}
          {/* Arrow */}
          <div className={`absolute w-3 h-3 bg-slate-800 border-r border-b border-slate-700 transform rotate-45 ${
            position === 'bottom-right' ? 'bottom-[-6px] right-8' : 
            position === 'top-right' ? 'top-[-6px] right-8' : 'top-[-6px] left-8'
          }`} />
        </div>
      )}

      {/* Info Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        onMouseEnter={() => setIsOpen(true)}
        className={`${positionClasses[position]} p-2 rounded-full bg-slate-800/80 hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700 backdrop-blur-sm`}
        title="Learn more"
      >
        <Info className="w-3 h-3" />
      </button>
    </div>
  )
}
