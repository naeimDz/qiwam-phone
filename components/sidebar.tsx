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
      } flex flex-col bg-bg-primary shadow-lg border-l border-border transition-all duration-500`}
      role="navigation"
      aria-label="القائمة الجانبية الرئيسية"
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <Logo width={36} height={36} className="text-primary" />
            <div>
              <h1 className="text-lg font-bold text-text-primary">محل الهواتف</h1>
              <p className="text-xs text-text-secondary">نظام الإدارة</p>
            </div>
          </div>
        )}
        {isCollapsed && <Logo width={26} height={26} className="text-primary mx-auto"/>}
      </div>

      {/* Collapse Toggle */}
      <div className="px-2.5 pt-2">
        <button
          onClick={onToggleCollapse}
          className="w-full p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label={isCollapsed ? 'فتح القائمة' : 'طي القائمة'}
          aria-expanded={!isCollapsed}
        >
          <Menu size={18} />
          {!isCollapsed && <span className="text-sm font-semibold">طي القائمة</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav 
        className="flex-1 overflow-y-auto p-2.5 space-y-1 mt-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
        aria-label="القائمة الرئيسية"
      >
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeSection === item.id}
            isCollapsed={isCollapsed}
            onClick={() => onSectionChange(item.id)}
            dir="rtl"
            variant="default"
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div 
        className="p-2.5 border-t border-border space-y-1"
        aria-label="إجراءات إضافية"
      >
        {bottomMenuItems.map((item) => {
          const isAlerts = item.id === 'alerts'
          
          return (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              isCollapsed={isCollapsed}
              onClick={() => onSectionChange(item.id)}
              dir="rtl"
              variant={isAlerts ? 'alert' : 'bottom'}
            />
          )
        })}
      </div>

      {/* User Profile */}
      {!isCollapsed && userInfo && mounted && (
        <div 
          className="p-3 border-t border-border bg-primary/5"
          role="contentinfo"
          aria-label="معلومات المستخدم"
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-white font-bold shadow-sm"
              aria-hidden="true"
            >
              {userInfo.initials}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">{userInfo.name}</p>
              <p className="text-xs flex items-center gap-1 text-text-secondary">
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-accent"
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