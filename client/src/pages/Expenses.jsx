import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { expensesApi } from '@/services/api'
import { Button, Card, Input, Label, Select } from '@/components/ui'
import { PrintButton } from '@/components/ui/PrintButton'
import { formatCurrency, formatDate } from '@/utils/cn'

const categories = ['rent', 'electricity', 'ice', 'transportation', 'supplies', 'miscellaneous']

const empty = {
  category: 'supplies',
  description: '',
  amount: '',
  expense_date: new Date().toISOString().slice(0, 10),
}

export default function Expenses() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  const { data, isLoading } = useQuery({ queryKey: ['expenses'], queryFn: () => expensesApi.list() })
  const expenses = Array.isArray(data) ? data : []

  const create = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setForm(empty)
      setOpen(false)
    },
  })

  return (
    <div className="space-y-6 print-sheet">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Expenses</h1>
          <p className="mt-1 text-muted">Rent, utilities, ice, transport, supplies & misc</p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <PrintButton />
          <Button onClick={() => setOpen((v) => !v)}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </header>

      {open ? (
        <Card className="no-print">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate({ ...form, amount: Number(form.amount) })
            }}
          >
            <div>
              <Label>Category</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={create.isPending}>
                Save expense
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-brand-50/50 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted">
                    Loading…
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted">
                    No expenses recorded.
                  </td>
                </tr>
              ) : (
                expenses.map((row) => (
                  <tr key={row.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3">{formatDate(row.expense_date)}</td>
                    <td className="px-4 py-3 capitalize">{row.category}</td>
                    <td className="px-4 py-3">{row.description || '—'}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(row.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
