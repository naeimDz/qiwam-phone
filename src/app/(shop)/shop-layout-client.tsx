// app/(shop)/shop-layout-client.tsx
'use client'

import { useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { CommandPalette } from '@/components/command-palette'
import { ThemePicker } from '@/components/theme-picker'
import { bottomMenuItems, menuItems } from '@/lib/menu-config'
import { getActiveSectionFromPath, getCurrentDateTime } from '@/lib/utils'
import type {  UserInfo } from '@/types'
import {
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react'

interface ShopLayoutClientProps {
  children: ReactNode
}


// Custom hook for commands
function useCommands(router: ReturnType<typeof useRouter>) {
  return useMemo(() => [
    {
      id: 'new-sale',
      label: 'عملية بيع جديدة',
      icon: ShoppingCart,
      shortcut: 'F2',
      action: () => router.push('/sales'),
    },
    {
      id: 'new-customer',
      label: 'إضافة عميل جديد',
      icon: Users,
      shortcut: 'Alt+N',
      action: () => console.log('إضافة عميل'),
    },
    {
      id: 'new-product',
      label: 'إضافة منتج جديد',
      icon: Package,
      shortcut: 'Alt+P',
      action: () => console.log('إضافة منتج'),
    },
    {
      id: 'daily-report',
      label: 'تقرير اليوم',
      icon: BarChart3,
      shortcut: 'Alt+R',
      action: () => router.push('/reports'),
    },
    {
      id: 'search-invoice',
      label: 'البحث عن فاتورة',
      icon: FileText,
      shortcut: 'Alt+F',
      action: () => console.log('بحث فاتورة'),
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
      shortcut: 'Alt+S',
      action: () => router.push('/settings'),
    },
    ...menuItems.map((item) => ({
      id: `nav-${item.id}`,
      label: `الانتقال إلى ${item.label}`,
      icon: item.icon,
      shortcut: item.shortcut,
      action: () => router.push(item.href),
    })),
  ], [router]);
}

// Custom hook for keyboard shortcuts
function useKeyboardShortcuts(router: ReturnType<typeof useRouter>, setCommandOpen: (open: boolean) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
        return
      }
      
      // Direct shortcuts
      switch (e.key) {
        case 'F2':
          e.preventDefault()
          router.push('/sales')
          break
        case 'F1':
          e.preventDefault()
          router.push('/dashboard')
          break
        // Add more shortcuts as needed
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, setCommandOpen])
}

export function ShopLayoutClient({ children }: ShopLayoutClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  // State
const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) setSidebarCollapsed(saved === 'true')
  }, [])
  const [commandOpen, setCommandOpen] = useState(false)
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState('')

  // Derived state
  const activeSection = useMemo(() => 
    getActiveSectionFromPath(pathname), 
    [pathname]
  )
  const currentSection = useMemo(() => 
    menuItems.find((item) => item.id === activeSection),
    [activeSection]
  )

  // Hooks
  const allCommands = useCommands(router)
  useKeyboardShortcuts(router, setCommandOpen)

  // Date/time updates
  useEffect(() => {
    const updateDateTime = () => setCurrentDateTime(getCurrentDateTime())
    
    updateDateTime() // Initial set
    const interval = setInterval(updateDateTime, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Navigation handler
  const allMenuItems = useMemo(() => [...menuItems, ...bottomMenuItems], [])
  const handleSectionChange = useCallback((section: string) => {
    const item = allMenuItems.find((m) => m.id === section)
    if (item) router.push(item.href)
  }, [router, allMenuItems])


  // Mock user data
  const userInfo: UserInfo = useMemo(() => ({
    name: 'محمد أحمد',
    role: 'مدير النظام',
    initials: 'م',
  }), [])

  return (
    <div className="flex h-screen overflow-hidden bg-bg-secondary">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        menuItems={menuItems}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userInfo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          title={currentSection?.label || 'الرئيسية'}
          subtitle={currentDateTime}
          onCommandPaletteOpen={() => setCommandOpen(true)}
          onNewSale={() => router.push('/sales')}
          onColorPaletteOpen={() => setColorPaletteOpen(true)}
        />

        {/* Command Palette */}
        <CommandPalette
          isOpen={commandOpen}
          onClose={() => setCommandOpen(false)}
          commands={allCommands}
          onExecute={(cmd) => {
            cmd.action()
            setCommandOpen(false)
          }}
        />

        {/* Color Palette Picker */}
        <ThemePicker 
          isOpen={colorPaletteOpen} 
          onClose={() => setColorPaletteOpen(false)} 
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}