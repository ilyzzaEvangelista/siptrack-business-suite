import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { analyticsApi } from '@/services/api'
import { Card } from '@/components/ui'
import { PrintButton } from '@/components/ui/PrintButton'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { formatCurrency, formatNumber } from '@/utils/cn'

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsApi.summary,
  })

  const analytics = data || {}

  if (isLoading) return <p className="text-muted">Loading analytics…</p>

  const bestSellers = (analytics.best_sellers || []).map((row) => ({
    name: row.item_name || row.flavor?.name || 'Item',
    quantity: Number(row.qty_sold ?? row.quantity ?? row.qty ?? 0),
    revenue: Number(row.revenue || 0),
  }))

  const slowList = (analytics.slow_moving || []).map((row) => ({
    name: row.item_name || row.name || 'Item',
    quantity: row.qty_sold ?? row.quantity ?? 0,
  }))
  const usageList = (analytics.inventory_usage?.usage || []).map((row) => ({
    name: row.inventory?.name || 'Item',
    quantity: row.qty_out ?? 0,
  }))

  const revenueChart = analytics.revenue_chart || []
  const profitChart = analytics.profit_chart || []

  return (
    <div className="space-y-6 print-sheet">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Analytics</h1>
          <p className="mt-1 text-muted">Revenue, profit, bestsellers & inventory usage</p>
        </div>
        <PrintButton />
      </header>

      <section className="print-hide-charts no-print grid gap-4 lg:grid-cols-2">
        <SalesChart data={revenueChart} title="Revenue" dataKey="revenue" />
        <SalesChart data={profitChart} title="Profit" dataKey="profit" />
      </section>

      <section className="print-hide-charts no-print grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Best sellers</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8e5e1" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5c6f6a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5c6f6a' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#378f7a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">Slow moving & inventory usage</h3>
          <ul className="space-y-3">
            {[...slowList, ...usageList].slice(0, 8).map((row, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between border-b border-line/70 pb-2 text-sm last:border-0"
              >
                <span>{row.name || row.item_name || 'Item'}</span>
                <span className="text-muted">{formatNumber(row.quantity ?? row.usage ?? row.qty ?? 0, 2)}</span>
              </li>
            ))}
            {slowList.length === 0 && usageList.length === 0 ? (
              <li className="text-sm text-muted">No analytics data yet.</li>
            ) : null}
          </ul>
        </Card>
      </section>

      {/* Print-friendly tables (charts often blank/oversized on paper) */}
      <div className="print-only space-y-6">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-line px-4 py-3">
            <h3 className="font-semibold">Daily revenue</h3>
          </div>
          <table className="print-only-table min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenueChart.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{row.date || row.label}</td>
                  <td className="px-4 py-2">{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
              {revenueChart.length === 0 ? (
                <tr>
                  <td className="px-4 py-2" colSpan={2}>
                    No revenue data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-line px-4 py-3">
            <h3 className="font-semibold">Daily profit</h3>
          </div>
          <table className="print-only-table min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {profitChart.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{row.date || row.label}</td>
                  <td className="px-4 py-2">{formatCurrency(row.profit)}</td>
                </tr>
              ))}
              {profitChart.length === 0 ? (
                <tr>
                  <td className="px-4 py-2" colSpan={2}>
                    No profit data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-line px-4 py-3">
            <h3 className="font-semibold">Best sellers</h3>
          </div>
          <table className="print-only-table min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty sold</th>
                <th className="px-4 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{formatNumber(row.quantity, 0)}</td>
                  <td className="px-4 py-2">{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
              {bestSellers.length === 0 ? (
                <tr>
                  <td className="px-4 py-2" colSpan={3}>
                    No bestseller data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-line px-4 py-3">
            <h3 className="font-semibold">Slow moving & inventory usage</h3>
          </div>
          <table className="print-only-table min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {[...slowList, ...usageList].slice(0, 20).map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{formatNumber(row.quantity, 2)}</td>
                </tr>
              ))}
              {slowList.length === 0 && usageList.length === 0 ? (
                <tr>
                  <td className="px-4 py-2" colSpan={2}>
                    No usage data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
