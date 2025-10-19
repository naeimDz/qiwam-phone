'use client'

import { useState, useRef } from 'react'
import type { NavItemProps } from '@/types'

export function NavItem({ item, isActive, isCollapsed, onClick }: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const Icon = item.icon

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
          isCollapsed ? 'justify-center' : ''
        } ${
          isActive
            ? 'bg-primary text-white shadow-lg'
            : isHovered
            ? 'bg-primary/10'
            : 'text-text-primary'
        }`}
        style={{
          transform: isActive ? 'translateX(-2px)' : 'translateX(0)',
        }}
      >
        <div className="relative">
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          {item.notification && (
            <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
              {item.notification}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between">
            <span className="font-semibold text-sm">{item.label}</span>
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
          </div>
        )}
      </button>

      {/* Tooltip for collapsed state */}
      {isCollapsed && isHovered && buttonRef.current && (
        <div
          className="fixed px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap bg-secondary text-text-primary shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 z-[9999]"
          style={{
            left: `${buttonRef.current.getBoundingClientRect().left - 8}px`,
            top: `${
              buttonRef.current.getBoundingClientRect().top +
              buttonRef.current.getBoundingClientRect().height / 2
            }px`,
            transform: 'translate(-100%, -50%)',
          }}
        >
          {item.label}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-secondary"
          />
        </div>
      )}
    </div>
  )
}
