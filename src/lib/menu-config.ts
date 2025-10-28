import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  AlertCircle,
  Wallet,
  FileInput,
} from 'lucide-react'
import type { MenuItem } from '@/types'

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'الرئيسية',
    icon: Home,
    href: '/',
    shortcut: 'Alt+1'
  },
  { 
    id: 'cash-register', 
    label: 'الصندوق', 
    icon: Wallet, 
    href: '/cash-register',
    shortcut: 'F8'
  },
  {
    id: 'sales',
    label: 'نقطة البيع',
    icon: ShoppingCart,
    href: '/sales',
    badge: 'F2',
    shortcut: 'F2'
  },
  {
    id: 'inventory',
    label: 'المخزون',
    icon: Package,
    href: '/inventory',
    notification: 5,
    shortcut: 'Alt+3'
  },
  { 
    id: 'purchase', 
    label: 'فاتورة شراء', 
    icon: FileInput, 
    href: '/purchase-invoice',
    shortcut: 'F6'
  },
  {
    id: 'customers',
    label: 'العملاء',
    icon: Users,
    href: '/customers',
    shortcut: 'Alt+4'
  },
  { 
    id: 'expenses', 
    label: 'النفقات اليومية', 
    icon: Wallet, 
    href: '/expenses' 
  },
  {
    id: 'reports',
    label: 'التقارير',
    icon: BarChart3,
    href: '/reports',
    shortcut: 'Alt+5'
  }
]

export const bottomMenuItems: MenuItem[] = [
  {
    id: 'alerts',
    label: 'التنبيهات',
    icon: AlertCircle,
    href: '/alerts',
    notification: 3
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: Settings,
    href: '/settings'
  }
]

export const shortcuts = {
  commandPalette: 'Ctrl+K',
  newSale: 'F2',
  search: 'Ctrl+F',
  escape: 'Esc'
}
