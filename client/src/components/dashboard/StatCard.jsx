import { formatCurrency } from '@/utils/cn'
import { Card } from '@/components/ui'
import { cn } from '@/utils/cn'

export function StatCard({ title, value, hint, icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    accent: 'bg-orange-50 text-accent',
    success: 'bg-emerald-50 text-success',
    muted: 'bg-slate-100 text-muted',
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('rounded-xl p-2.5', tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  )
}
