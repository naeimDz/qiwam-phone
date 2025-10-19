// app/(shop)/shop-layout-client.tsx

'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { CommandPalette } from '@/components/command-palette'
import { ThemePicker } from '@/components/theme-picker'
import { menuItems } from '@/lib/menu-config'
import { getCurrentDateTime } from '@/lib/utils'
import type { Command, UserInfo } from '@/types'
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react'

interface ShopLayoutClientProps {
  children: ReactNode
}

export function ShopLayoutClient({ children }: ShopLayoutClientProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [commandOpen, setCommandOpen] = useState(false)
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState('')

  // Update date/time every minute
  useEffect(() => {
    setCurrentDateTime(getCurrentDateTime())
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
      if (e.key === 'F2') {
        e.preventDefault()
        router.push('/sales')
        setActiveSection('sales')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // User info - can be fetched from API in real app
  const userInfo: UserInfo = {
    name: 'محمد أحمد',
    role: 'مدير النظام',
    initials: 'م',
  }

  // Command palette actions
  const allCommands: Command[] = [
    {
      id: 'new-sale',
      label: 'عملية بيع جديدة',
      icon: ShoppingCart,
      shortcut: 'F2',
      action: () => {
        router.push('/sales')
        setActiveSection('sales')
      },
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
      action: () => {
        router.push('/reports')
        setActiveSection('reports')
      },
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
      action: () => {
        router.push('/settings')
        setActiveSection('settings')
      },
    },
    ...menuItems.map((item) => ({
      id: `nav-${item.id}`,
      label: `الانتقال إلى ${item.label}`,
      icon: item.icon,
      shortcut: item.shortcut,
      action: () => {
        router.push(item.href)
        setActiveSection(item.id)
      },
    })),
  ]

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    const item = menuItems.find((m) => m.id === section)
    if (item) {
      router.push(item.href)
    }
  }

  const currentSection = menuItems.find((item) => item.id === activeSection)

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
          onNewSale={() => {
            router.push('/sales')
            setActiveSection('sales')
          }}
          onColorPaletteOpen={() => setColorPaletteOpen(true)}
        />

        {/* Command Palette */}
        <CommandPalette
          isOpen={commandOpen}
          onClose={() => setCommandOpen(false)}
          commands={allCommands}
          onExecute={(cmd) => cmd.action()}
        />

        {/* Color Palette Picker */}
        <ThemePicker isOpen={colorPaletteOpen} onClose={() => setColorPaletteOpen(false)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
