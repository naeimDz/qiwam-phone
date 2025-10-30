import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { menuItems } from "./menu-config"
import { ActionResult } from "./types/action.types"

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


/**
 * Create a successful ActionResult
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

/**
 * Create a failed ActionResult
 */
export function failure<T = void>(error: string): ActionResult<T> {
  return { success: false, error }
}

/**
 * Execute an action and return ActionResult
 */
export async function executeAction<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return success(data)
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'حدث خطأ')
  }
}


/**
 * ✅ Helper: استخراج البيانات من FormData بشكل صحيح
 */
export function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  
  for (const [key, value] of formData.entries()) {
    // تحويل empty strings إلى null (للـ optional fields)
    data[key] = value === '' ? null : value
  }
  
  return data
}