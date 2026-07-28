import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const PHT = 'Asia/Manila'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value) {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: digits,
  }).format(Number(value) || 0)
}

/** Format a date in Philippine Time (e.g. Jul 27, 2026) */
export function formatDate(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/** Format date + time in Philippine Time (e.g. Jul 27, 2026, 3:45 PM) */
export function formatDateTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}
