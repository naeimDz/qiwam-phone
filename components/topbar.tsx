'use client'

import { Search, Command, Sun, Moon, Bell, ShoppingCart } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import type { TopBarProps } from '@/types'

export function TopBar({
  title,
  subtitle,
  onCommandPaletteOpen,
  onNewSale,
  onColorPaletteOpen,
}: TopBarProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="px-6 py-4 bg-bg-primary shadow-sm border-b border-border">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
          <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Command Palette Trigger */}
          <button
            onClick={onCommandPaletteOpen}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text-secondary bg-bg-primary transition-all duration-300 hover:shadow-md hover:border-primary/30"
          >
            <Search size={16} />
            <span className="text-sm font-medium">بحث سريع...</span>
            <div className="flex items-center gap-1 mr-2 px-2 py-0.5 rounded text-xs font-bold bg-bg-secondary text-text-secondary">
              <Command size={10} />
              <span>K</span>
            </div>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all duration-300 text-text-secondary bg-bg-secondary hover:bg-hover"
            title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Color Palette Picker */}
          <button
            onClick={onColorPaletteOpen}
            className="p-2.5 rounded-xl transition-all duration-300 text-text-secondary bg-bg-secondary hover:bg-hover group relative"
            title="اختيار الألوان"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 0 0 20 4 4 0 0 0 4-4V8h-4" />
            </svg>
          </button>

          {/* Notifications */}
          <button
            className="p-2.5 rounded-xl transition-all duration-300 relative text-text-secondary hover:bg-hover"
            title="التنبيهات"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </button>

          {/* New Sale Button */}
          <button
            onClick={onNewSale}
            className="px-5 py-2.5 text-white rounded-xl transition-all duration-300 font-bold flex items-center gap-2 hover:scale-105 active:scale-95 shadow-md text-sm bg-accent"
            style={{ boxShadow: '0 3px 10px rgba(var(--color-accent), 0.3)' }}
          >
            <ShoppingCart size={16} />
            عملية جديدة
          </button>
        </div>
      </div>
    </div>
  )
}
