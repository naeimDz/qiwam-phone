'use client'

import { useState, useEffect } from 'react'
import { NavItem } from '@/components/ui/nav-item'
import { Menu } from 'lucide-react'
import { menuItems, bottomMenuItems } from '@/lib/menu-config'
import type { SidebarProps } from '@/types'
import Logo from './ui/logo'

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeSection,
  onSectionChange,
  userInfo,
}: SidebarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } flex flex-col bg-bg-primary shadow-lg border-l border-border transition-all duration-300 ease-out`}
      role="navigation"
      aria-label="القائمة الجانبية الرئيسية"
      suppressHydrationWarning
      style={{
        transitionProperty: 'width, transform, opacity',
        willChange: 'width'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div 
            className="flex items-center gap-2.5 transition-opacity duration-200"
            style={{ animationDelay: '0.1s' }}
          >
            <Logo width={36} height={36} className="text-primary" />
            <div className="transition-all duration-200 ease-out">
              <h1 className="text-lg font-bold text-text-primary">محل الهواتف</h1>
              <p className="text-xs text-text-secondary">نظام الإدارة</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <Logo 
            width={26} 
            height={26} 
            className="text-primary mx-auto transition-transform duration-200 hover:scale-110"
          />
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="px-2.5 pt-2">
        <button
          onClick={onToggleCollapse}
          className="w-full p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:scale-[1.02] active:scale-[0.98]"
          aria-label={isCollapsed ? 'فتح القائمة' : 'طي القائمة'}
          aria-expanded={!isCollapsed}
        >
          <Menu 
            size={18} 
            className={`transition-transform duration-300 ${
              isCollapsed ? 'rotate-0' : 'rotate-180'
            }`}
          />
          {!isCollapsed && (
            <span className="text-sm font-semibold transition-opacity duration-150">
              طي القائمة
            </span>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav 
        className="flex-1 overflow-y-auto p-2.5 space-y-1 mt-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent transition-all duration-200"
        aria-label="القائمة الرئيسية"
      >
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            className="transition-all duration-200 ease-out"
            style={{
              transitionDelay: isCollapsed 
                ? '0ms' 
                : `${index * 20}ms`
            }}
          >
            <NavItem
              item={item}
              isActive={activeSection === item.id}
              isCollapsed={isCollapsed}
              onClick={() => onSectionChange(item.id)}
              dir="rtl"
              variant="default"
            />
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div 
        className="p-2.5 border-t border-border space-y-1 transition-all duration-200"
        aria-label="إجراءات إضافية"
      >
        {bottomMenuItems.map((item, index) => {
          const isAlerts = item.id === 'alerts'
          
          return (
            <div
              key={item.id}
              className="transition-all duration-200 ease-out"
              style={{
                transitionDelay: isCollapsed 
                  ? '0ms' 
                  : `${index * 30}ms`
              }}
            >
              <NavItem
                item={item}
                isActive={activeSection === item.id}
                isCollapsed={isCollapsed}
                onClick={() => onSectionChange(item.id)}
                dir="rtl"
                variant={isAlerts ? 'alert' : 'bottom'}
              />
            </div>
          )
        })}
      </div>

      {/* User Profile */}
      {!isCollapsed && userInfo && mounted && (
        <div 
          className="p-3 border-t border-border bg-primary/5 transition-all duration-200 ease-out"
          role="contentinfo"
          aria-label="معلومات المستخدم"
          style={{
            animationDelay: '0.2s'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-white font-bold shadow-sm transition-transform duration-200 hover:scale-105"
              aria-hidden="true"
            >
              {userInfo.initials}
            </div>
            <div className="flex-1 transition-opacity duration-150">
              <p className="text-sm font-bold text-text-primary">{userInfo.name}</p>
              <p className="text-xs flex items-center gap-1 text-text-secondary">
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-accent transition-all duration-300"
                  aria-label="متصل"
                />
                {userInfo.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}