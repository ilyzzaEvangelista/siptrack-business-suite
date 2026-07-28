import { useQuery } from '@tanstack/react-query'
import { Banknote, CupSoda, Ruler, TrendingUp, Wallet } from 'lucide-react'
import { dashboardApi } from '@/services/api'
import { StatCard } from '@/components/dashboard/StatCard'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { Card, Badge } from '@/components/ui'
import { PrintButton } from '@/components/ui/PrintButton'
import { formatCurrency } from '@/utils/cn'

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.summary,
  })

  if (isLoading) {
    return <p className="text-muted">Loading dashboard…</p>
  }

  if (error) {
    return <p className="text-danger">Failed to load dashboard. Is the API running?</p>
  }

  const summary = data || {}
  const topFlavor = summary.top_flavor
  const bestSize = summary.best_size

  return (
    <div className="space-y-6 print-sheet">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-muted">Today&apos;s pulse for your sip shop</p>
        </div>
        <PrintButton />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's Sales" value={summary.today_sales ?? 0} icon={Banknote} tone="brand" />
        <StatCard title="Monthly Sales" value={summary.monthly_sales ?? 0} icon={TrendingUp} tone="success" />
        <StatCard title="Total Profit" value={summary.total_profit ?? 0} icon={CupSoda} tone="accent" />
        <StatCard title="Expenses" value={summary.total_expenses ?? summary.expenses ?? 0} icon={Wallet} tone="muted" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart data={summary.sales_chart || []} dataKey="total" />
        </div>
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-muted">Top Selling Flavor</p>
            <p className="mt-2 font-display text-2xl font-semibold">{topFlavor?.flavor?.name || '—'}</p>
            <p className="mt-1 text-sm text-muted">
              {topFlavor?.qty != null
                ? `${topFlavor.qty} sold · ${formatCurrency(topFlavor.revenue || 0)}`
                : 'No sales yet'}
            </p>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">Best Selling Size</p>
                <p className="mt-2 font-display text-2xl font-semibold">{bestSize?.size?.name || '—'}</p>
              </div>
              <Badge>{bestSize?.qty ?? 0} cups</Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Ruler className="h-4 w-4" />
              Most ordered cup size
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
