'use client'

import { Logo } from '@/components/ui/logo'
import { NavItem } from '@/components/ui/nav-item'
import { Settings, Menu } from 'lucide-react'
import { menuItems, bottomMenuItems } from '@/lib/menu-config'
import type { SidebarProps } from '@/types'

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeSection,
  onSectionChange,
  userInfo,
}: SidebarProps) {
  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } flex flex-col bg-bg-primary shadow-lg border-l border-border transition-all duration-500`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <Logo size={36} className="text-primary" />
            <div>
              <h1 className="text-lg font-bold text-text-primary">محل الهواتف</h1>
              <p className="text-xs text-text-secondary">نظام الإدارة</p>
            </div>
          </div>
        )}
        {isCollapsed && <Logo size={28} className="text-primary mx-auto" />}
      </div>

      {/* Collapse Toggle */}
      <div className="px-2.5 pt-2">
        <button
          onClick={onToggleCollapse}
          className="w-full p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Menu size={18} />
          {!isCollapsed && <span className="text-sm font-semibold">طي القائمة</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 mt-2">
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeSection === item.id}
            isCollapsed={isCollapsed}
            onClick={() => onSectionChange(item.id)}
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2.5 border-t border-border space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon
          const isAlerts = item.id === 'alerts'
          
          return (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                isAlerts
                  ? 'text-accent bg-accent/15 hover:bg-accent/25'
                  : 'text-text-secondary hover:bg-hover'
              } ${isCollapsed ? 'justify-center' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon size={20} />
              {!isCollapsed && (
                <>
                  <span className="font-semibold text-sm">{item.label}</span>
                  {item.notification && (
                    <span className="ml-auto bg-accent text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {item.notification}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* User Profile */}
      {!isCollapsed && userInfo && (
        <div className="p-3 border-t border-border bg-primary/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-white font-bold shadow-sm">
              {userInfo.initials}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">{userInfo.name}</p>
              <p className="text-xs flex items-center gap-1 text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {userInfo.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
