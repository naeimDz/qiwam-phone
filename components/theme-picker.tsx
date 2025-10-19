'use client'

import { X, Check, Smartphone } from 'lucide-react'
import { useTheme, colorPalettes } from '@/lib/theme'
import type { ColorPalettePickerProps } from '@/types'

export function ThemePicker({ isOpen, onClose }: ColorPalettePickerProps) {
  const { currentPalette, changePalette, isDark } = useTheme()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden p-6 bg-bg-primary border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-text-primary">🎨 اختر لون النظام</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all text-text-secondary hover:bg-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(colorPalettes).map(([key, palette]) => {
            const paletteColors = isDark ? palette.dark : palette.light
            const isSelected = currentPalette === key

            return (
              <button
                key={key}
                onClick={() => {
                  changePalette(key)
                  setTimeout(onClose, 300)
                }}
                className="relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 bg-bg-secondary"
                style={{
                  borderColor: isSelected ? paletteColors.primary : 'var(--color-border)',
                  boxShadow: isSelected ? `0 4px 20px ${paletteColors.primary}30` : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: paletteColors.primary }}
                  >
                    <Smartphone className="text-white" size={24} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-sm text-text-primary">{palette.name}</p>
                    <div className="flex gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: paletteColors.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: paletteColors.accent }}
                      />
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div
                    className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: paletteColors.primary }}
                  >
                    <Check className="text-white" size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <p className="mt-6 text-sm text-center text-text-secondary">
          جرب الألوان المختلفة واختر اللي يناسب ذوقك 🎨
        </p>
      </div>
    </div>
  )
}
