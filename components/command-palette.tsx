'use client'

import { useState, useEffect } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import type { CommandPaletteProps } from '@/types'

export function CommandPalette({ isOpen, onClose, commands, onExecute }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (!isOpen) setSearchQuery('')
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden bg-bg-primary border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search size={20} className="text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أمر، صفحة، أو عملية..."
            className="flex-1 outline-none text-lg bg-transparent text-text-primary placeholder:text-text-secondary"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all text-text-secondary hover:bg-hover"
          >
            <X size={18} />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            <div className="space-y-1">
              {filteredCommands.map((cmd) => {
                const CmdIcon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      onExecute(cmd)
                      onClose()
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-text-primary hover:bg-primary/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                        <CmdIcon size={18} />
                      </div>
                      <span className="font-semibold">{cmd.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cmd.shortcut && (
                        <span className="text-xs px-2 py-1 rounded-lg font-bold bg-bg-secondary text-text-secondary">
                          {cmd.shortcut}
                        </span>
                      )}
                      <ArrowRight
                        size={16}
                        className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto mb-3 text-text-secondary/30" />
              <p className="text-text-secondary">لا توجد نتائج</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2.5 flex items-center justify-between text-xs bg-bg-secondary text-text-secondary">
          <div className="flex items-center gap-4">
            <span>↑↓ للتنقل</span>
            <span>Enter للتنفيذ</span>
            <span>Esc للإغلاق</span>
          </div>
          <span className="font-semibold">اختصارات لوحة المفاتيح</span>
        </div>
      </div>
    </div>
  )
}
