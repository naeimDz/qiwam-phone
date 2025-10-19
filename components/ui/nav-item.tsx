'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { NavItemProps } from '@/types'

export function NavItem({ 
  item, 
  isActive, 
  isCollapsed, 
  onClick, 
  dir = 'rtl',
  variant = 'default' // 'default' | 'bottom' | 'alert'
}: NavItemProps & {
  dir?: 'ltr' | 'rtl'
  variant?: 'default' | 'bottom' | 'alert'
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [tooltipPos, setTooltipPos] = useState<{left: number, top: number} | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  const Icon = item.icon

  // Variant-based styling
  const variantStyles = useMemo(() => {
    switch (variant) {
      case 'alert':
        return {
          base: 'text-accent',
          hover: 'bg-accent/25 text-accent',
          active: 'bg-accent text-white',
          bg: 'bg-accent/15'
        }
      case 'bottom':
        return {
          base: 'text-text-secondary',
          hover: 'bg-hover text-text-primary',
          active: 'bg-primary/10 text-primary',
          bg: ''
        }
      default:
        return {
          base: 'text-text-primary',
          hover: 'bg-primary/10 text-primary',
          active: 'bg-primary text-white',
          bg: ''
        }
    }
  }, [variant])

  const tooltipBgColor = variant === 'alert' ? 'bg-accent' : 'bg-primary'

  // Debounced hover handler
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (isCollapsed) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true)
      }, 300) // 300ms delay
    }
  }, [isCollapsed])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setShowTooltip(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  // Calculate tooltip position
  useEffect(() => {
    if (isCollapsed && showTooltip && buttonRef.current && tooltipRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const tooltipWidth = tooltipRef.current.offsetWidth
      const viewportWidth = window.innerWidth
      
      let leftPos = dir === 'rtl' 
        ? rect.left - tooltipWidth - 12 
        : rect.right + 12

      // Prevent tooltip from going off-screen
      if (dir === 'rtl') {
        leftPos = Math.max(8, leftPos)
      } else {
        leftPos = Math.min(leftPos, viewportWidth - tooltipWidth - 8)
      }

      setTooltipPos({
        left: leftPos,
        top: rect.top + rect.height / 2
      })
    }
  }, [showTooltip, isCollapsed, dir])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }, [onClick])

const buttonClasses = useMemo(() => {
  const baseClasses = 'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-300 outline-none'
  const justifyClass = isCollapsed ? 'justify-center' : 'justify-start'

  // اختيار الألوان والخلفية حسب الحالة والvariant
  let stateClasses = ''
  const v = variantStyles

  if (isActive) {
    stateClasses = `${v.active} shadow-lg scale-[0.98] border-none`
  } else if (isHovered) {
    stateClasses = `${v.hover} border-none`
  } else {
    stateClasses = `${v.base} ${v.bg} border-none`
  }

  return `${baseClasses} ${justifyClass} ${stateClasses}`
}, [isActive, isHovered, isCollapsed, variantStyles])


  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        className={buttonClasses}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
        role="button"
        tabIndex={0}
        style={{
          transform: isActive ? 'translateX(-2px)' : 'translateX(0)',
        }}
      >
        <div className="relative">
          <Icon 
            size={20} 
            strokeWidth={isActive ? 2.5 : 2}
            aria-hidden="true"
          />
          {item.notification && (
            <span 
              className="absolute -top-1.5 -right-1.5 bg-accent text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold"
              aria-label={`${item.notification} إشعارات جديدة`}
            >
              {item.notification}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between">
            <span className="font-semibold text-sm">
              {item.label}
            </span>
            {item.badge && (
              <span
                className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-secondary/10 text-text-secondary'
                }`}
              >
                {item.badge}
              </span>
            )}
            {item.notification && !item.badge && (
              <span className="bg-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {item.notification}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Tooltip for collapsed state */}
      {isCollapsed && showTooltip && (
        <div
          ref={tooltipRef}
          className={`fixed px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap 
                      shadow-2xl pointer-events-none z-[9999] animate-in fade-in slide-in-from-right-2 duration-200
                      ${tooltipBgColor} text-white`}
          style={tooltipPos ? {
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            transform: 'translateY(-50%)'
          } : undefined}
          role="tooltip"
        >
          {item.label}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 ${tooltipBgColor}`}
            style={{
              [dir === 'rtl' ? 'right' : 'left']: dir === 'rtl' ? '-0.5rem' : 'auto',
              [dir === 'rtl' ? 'left' : 'right']: dir === 'rtl' ? 'auto' : '-0.5rem'
            }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}