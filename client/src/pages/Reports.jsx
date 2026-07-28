import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/services/api'
import { Card, Select } from '@/components/ui'
import { PrintButton } from '@/components/ui/PrintButton'
import { StatCard } from '@/components/dashboard/StatCard'
import { Banknote, TrendingUp, Wallet } from 'lucide-react'
import { formatDateTime } from '@/utils/cn'

export default function Reports() {
  const [period, setPeriod] = useState('daily')
  const { data, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportsApi.summary({ period }),
  })

  const report = data || {}

  return (
    <div className="space-y-6 print-sheet">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Reports</h1>
          <p className="mt-1 text-muted">Revenue, expenses, and profit by period</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="no-print w-40"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
          <p className="print-only text-sm capitalize text-muted">Period: {period}</p>
          <PrintButton />
        </div>
      </header>

      {isLoading ? (
        <p className="text-muted">Loading report…</p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Revenue" value={report.revenue ?? 0} icon={Banknote} />
            <StatCard title="Expenses" value={report.expenses ?? 0} icon={Wallet} tone="muted" />
            <StatCard title="Profit" value={report.profit ?? 0} icon={TrendingUp} tone="success" />
          </section>
          <Card>
            <p className="text-sm text-muted">Period window (PHT)</p>
            <p className="mt-2 font-medium">
              {formatDateTime(report.from)} → {formatDateTime(report.to)}
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
