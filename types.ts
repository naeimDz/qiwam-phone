import { LucideIcon } from 'lucide-react'

// ============================================
// Navigation & Menu Types
// ============================================
export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: string
  notification?: number
  shortcut?: string
}

export interface MenuItem extends NavItem {
  href: string
}

// ============================================
// Theme Types
// ============================================
export interface ColorPalette {
  name: string
  light: {
    primary: string
    accent: string
  }
  dark: {
    primary: string
    accent: string
  }
}

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  bgPrimary: string
  bgSecondary: string
  bgLight: string
  textPrimary: string
  textSecondary: string
  border: string
  hover: string
}

export interface Theme {
  colors: ThemeColors
}

export interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  currentPalette: string
  changePalette: (paletteKey: string) => void
  colorPalettes: Record<string, ColorPalette>
}

// ============================================
// Command Palette Types
// ============================================
export interface Command {
  id: string
  label: string
  icon: LucideIcon
  shortcut?: string
  action: () => void
}

// ============================================
// User Types
// ============================================
export interface UserInfo {
  name: string
  role: string
  initials: string
}

// ============================================
// Component Props Types
// ============================================
export interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  menuItems: MenuItem[]
  activeSection: string
  onSectionChange: (section: string) => void
  userInfo?: UserInfo
}

export interface TopBarProps {
  title: string
  subtitle: string
  onCommandPaletteOpen: () => void
  onNewSale: () => void
  onColorPaletteOpen: () => void
}

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
  onExecute: (command: Command) => void
}

export interface ColorPalettePickerProps {
  isOpen: boolean
  onClose: () => void
}

export interface NavItemProps {
  item: MenuItem
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}

export interface LogoProps {
  size?: number
  className?: string
}
