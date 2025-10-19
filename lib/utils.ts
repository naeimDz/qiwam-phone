import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { menuItems } from "./menu-config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Format date to Arabic locale
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ar-DZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Format time to Arabic locale
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Get current date and time formatted
 */
export function getCurrentDateTime(): string {
  const now = new Date()
  return `${formatDate(now)} - ${formatTime(now)}`
}


export const getActiveSectionFromPath = (pathname: string) => {
  return menuItems.find((m) => m.href === pathname)?.id || 'dashboard';
};