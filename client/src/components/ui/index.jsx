import { cn } from '@/utils/cn'

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-white text-ink border border-line hover:bg-brand-50',
    ghost: 'bg-transparent text-muted hover:bg-brand-50 hover:text-ink',
    danger: 'bg-danger text-white hover:opacity-90',
  }
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Label({ className, ...props }) {
  return <label className={cn('mb-1.5 block text-sm font-medium text-ink', className)} {...props} />
}

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-2xl border border-line/80 bg-panel p-5 shadow-[0_1px_2px_rgba(20,34,31,0.04)]', className)}
      {...props}
    />
  )
}

export function Badge({ className, tone = 'default', ...props }) {
  const tones = {
    default: 'bg-brand-50 text-brand-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    success: 'bg-emerald-50 text-emerald-700',
  }
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  )
}
