'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { ThemeContextType, ColorPalette } from '@/types'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const colorPalettes: Record<string, ColorPalette> = {
  green: {
    name: 'أخضر زيتوني',
    light: { primary: '#556B2F', accent: '#E28E35' },
    dark: { primary: '#6B8E3D', accent: '#F5A259' }
  },
  blue: {
    name: 'أزرق احترافي',
    light: { primary: '#2563EB', accent: '#F59E0B' },
    dark: { primary: '#3B82F6', accent: '#FBB040' }
  },
  purple: {
    name: 'بنفسجي عصري',
    light: { primary: '#7C3AED', accent: '#EC4899' },
    dark: { primary: '#8B5CF6', accent: '#F472B6' }
  },
  teal: {
    name: 'فيروزي منعش',
    light: { primary: '#0D9488', accent: '#F97316' },
    dark: { primary: '#14B8A6', accent: '#FB923C' }
  },
  red: {
    name: 'أحمر قوي',
    light: { primary: '#DC2626', accent: '#FBBF24' },
    dark: { primary: '#EF4444', accent: '#FCD34D' }
  },
  indigo: {
    name: 'نيلي أنيق',
    light: { primary: '#4F46E5', accent: '#10B981' },
    dark: { primary: '#6366F1', accent: '#34D399' }
  },
  orange: {
    name: 'برتقالي دافئ',
    light: { primary: '#EA580C', accent: '#8B5CF6' },
    dark: { primary: '#F97316', accent: '#A78BFA' }
  },
  pink: {
    name: 'وردي لطيف',
    light: { primary: '#DB2777', accent: '#06B6D4' },
    dark: { primary: '#EC4899', accent: '#22D3EE' }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [currentPalette, setCurrentPalette] = useState('green')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const savedPalette = localStorage.getItem('palette')
    
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
    
    if (savedPalette && colorPalettes[savedPalette]) {
      setCurrentPalette(savedPalette)
    }
  }, [])

  // Update CSS variables when theme or palette changes
  useEffect(() => {
    const palette = colorPalettes[currentPalette]
    const paletteColors = isDark ? palette.dark : palette.light

    const root = document.documentElement
    
    if (isDark) {
      root.style.setProperty('--color-primary', paletteColors.primary)
      root.style.setProperty('--color-secondary', '#E8E8E8')
      root.style.setProperty('--color-accent', paletteColors.accent)
      root.style.setProperty('--color-bg-primary', '#1A1A1A')
      root.style.setProperty('--color-bg-secondary', '#242424')
      root.style.setProperty('--color-bg-light', '#2E2E2E')
      root.style.setProperty('--color-text-primary', '#F5F5F5')
      root.style.setProperty('--color-text-secondary', '#A8A8A8')
      root.style.setProperty('--color-border', '#3A3A3A')
      root.style.setProperty('--color-hover', '#333333')
    } else {
      root.style.setProperty('--color-primary', paletteColors.primary)
      root.style.setProperty('--color-secondary', '#3A3A3A')
      root.style.setProperty('--color-accent', paletteColors.accent)
      root.style.setProperty('--color-bg-primary', '#FFFFFF')
      root.style.setProperty('--color-bg-secondary', '#F5F5F5')
      root.style.setProperty('--color-bg-light', '#FAFAFA')
      root.style.setProperty('--color-text-primary', '#1E1E1E')
      root.style.setProperty('--color-text-secondary', '#6E6E6E')
      root.style.setProperty('--color-border', '#E5E5E5')
      root.style.setProperty('--color-hover', '#F5F5F5')
    }
  }, [isDark, currentPalette])

  const palette = colorPalettes[currentPalette]
  const paletteColors = isDark ? palette.dark : palette.light

  const theme = {
    colors: {
      primary: paletteColors.primary,
      secondary: isDark ? '#E8E8E8' : '#3A3A3A',
      accent: paletteColors.accent,
      bgPrimary: isDark ? '#1A1A1A' : '#FFFFFF',
      bgSecondary: isDark ? '#242424' : '#F5F5F5',
      bgLight: isDark ? '#2E2E2E' : '#FAFAFA',
      textPrimary: isDark ? '#F5F5F5' : '#1E1E1E',
      textSecondary: isDark ? '#A8A8A8' : '#6E6E6E',
      border: isDark ? '#3A3A3A' : '#E5E5E5',
      hover: isDark ? '#333333' : '#F5F5F5'
    }
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const changePalette = (paletteKey: string) => {
    if (colorPalettes[paletteKey]) {
      setCurrentPalette(paletteKey)
      localStorage.setItem('palette', paletteKey)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        currentPalette,
        changePalette,
        colorPalettes
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
