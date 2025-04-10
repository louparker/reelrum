import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid, parse } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price as a currency string
 */
export function formatPrice(price: number, options: {
  currency?: string;
  notation?: Intl.NumberFormatOptions['notation'];
} = {}) {
  const { currency = 'USD', notation = 'standard' } = options
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format a date as a string
 */
export function formatDate(date: Date | string, formatString: string = 'PPP') {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValid(dateObj)) return ''
  
  return format(dateObj, formatString)
}

/**
 * Parse a date string into a Date object
 */
export function parseDate(dateString: string, formatString: string = 'yyyy-MM-dd') {
  if (!dateString) return undefined
  
  const parsedDate = parse(dateString, formatString, new Date())
  
  return isValid(parsedDate) ? parsedDate : undefined
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string) {
  if (!name) return ''
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, length: number = 100) {
  if (!text) return ''
  
  if (text.length <= length) return text
  
  return `${text.substring(0, length)}...`
}

/**
 * Convert a file to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
