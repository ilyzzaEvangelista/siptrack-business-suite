import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui'
import { formatCurrency } from '@/utils/cn'

export function SalesChart({ data = [], title = 'Sales trend', dataKey = 'revenue' }) {
  const chartData = data.map((row) => ({
    label: row.label || row.date,
    value: Number(row[dataKey] ?? row.revenue ?? row.total ?? row.profit ?? 0),
  }))

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm text-muted">Trend over the selected period</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#378f7a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#378f7a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8e5e1" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#5c6f6a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5c6f6a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ borderRadius: 12, borderColor: '#d8e5e1' }}
            />
            <Area type="monotone" dataKey="value" stroke="#2a7363" strokeWidth={2.5} fill="url(#salesFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
