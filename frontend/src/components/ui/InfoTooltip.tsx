import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  position = 'bottom-right',
}: InfoTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'above' as 'above' | 'below' })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const TOOLTIP_WIDTH = 288 // w-72 = 18rem = 288px
  const TOOLTIP_APPROX_HEIGHT = 180
  const MARGIN = 12

  const calcCoords = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Decide above vs below
    const placement: 'above' | 'below' =
      rect.top > TOOLTIP_APPROX_HEIGHT + MARGIN ? 'above' : 'below'

    // Horizontal: prefer left-aligned to button, clamp to viewport
    let left = rect.left
    if (left + TOOLTIP_WIDTH > vw - MARGIN) {
      left = vw - TOOLTIP_WIDTH - MARGIN
    }
    if (left < MARGIN) left = MARGIN

    // Vertical
    const top =
      placement === 'above'
        ? rect.top + window.scrollY - MARGIN          // will be shifted up via transform
        : rect.bottom + window.scrollY + MARGIN

    // Clamp bottom edge when below
    const clampedTop =
      placement === 'below' && top + TOOLTIP_APPROX_HEIGHT > vh + window.scrollY
        ? vh + window.scrollY - TOOLTIP_APPROX_HEIGHT - MARGIN
        : top

    setCoords({ top: clampedTop, left, placement })
  }

  const open = () => {
    calcCoords()
    setIsOpen(true)
  }

  const close = () => setIsOpen(false)

  // Button style depends on where it sits in the layout
  const buttonClass =
    position === 'inline'
      ? 'inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-150 flex-shrink-0'
      : 'absolute p-2 rounded-full bg-slate-800/80 hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700 backdrop-blur-sm ' +
        (position === 'bottom-right' ? 'bottom-2 right-2' : 'top-2 right-2')

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={open}
        onMouseLeave={close}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (isOpen) close()
          else open()
        }}
        className={buttonClass}
        aria-label="More information"
      >
        <Info className="w-2.5 h-2.5" />
      </button>

      {isOpen &&
        createPortal(
          <div
            onMouseEnter={open}
            onMouseLeave={close}
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              transform: coords.placement === 'above' ? 'translateY(-100%)' : 'none',
              zIndex: 99999,
              width: TOOLTIP_WIDTH,
            }}
            className="p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl text-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
          >
            <h4 className="font-semibold text-white mb-2">{title}</h4>
            <p className="text-slate-300 leading-relaxed">{description}</p>
            {calculation && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Calculation &amp; Targets
                </p>
                <p className="text-slate-400 text-xs whitespace-pre-line">{calculation}</p>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  )
}
