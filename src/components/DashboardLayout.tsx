import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  toolbar?: ReactNode
  StatsCard?: ReactNode
  tabs?: { key: string; label: string }[]
  activeTab?: string
  onTabChange?: (key: string) => void
  children: ReactNode
}

export default function DashboardLayout({
  toolbar,
  StatsCard,
  tabs,
  activeTab,
  onTabChange,
  children,
}: PageLayoutProps) {
  return (
    <div className="p-6 space-y-6">
      {/* ====  StatsCard  ====  */}
      {
        StatsCard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           {StatsCard}
          </div>
        )
      }
      {/* ===== Tabs ===== */}
      {tabs && tabs.length > 0 && (
        <div className="flex gap-2 border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange?.(tab.key)}
              className={cn(
                'px-4 py-2 font-semibold transition-colors',
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ===== Toolbar ===== */}
      {toolbar && (
        <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {toolbar}
        </div>
      )}
      {/* ===== Page Content ===== */}
      <div>{children}</div>
    </div>
  )
}
