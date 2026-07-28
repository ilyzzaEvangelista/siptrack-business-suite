import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { flavorsApi, salesApi, sizesApi } from '@/services/api'
import { Badge, Button, Card, Input, Label, Select } from '@/components/ui'
import { PrintButton } from '@/components/ui/PrintButton'
import { formatCurrency, formatDateTime } from '@/utils/cn'

const emptyForm = {
  customer_name: '',
  size_id: '',
  flavor_id: '',
  quantity: 1,
  discount: 0,
  payment_method: 'cash',
}

export default function Sales() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const { data: salesData, isLoading } = useQuery({ queryKey: ['sales'], queryFn: () => salesApi.list() })
  const { data: flavorsData } = useQuery({ queryKey: ['flavors'], queryFn: flavorsApi.list })
  const { data: sizesData } = useQuery({ queryKey: ['sizes'], queryFn: sizesApi.list })

  const sales = Array.isArray(salesData) ? salesData : []
  const flavors = Array.isArray(flavorsData) ? flavorsData : []
  const sizes = Array.isArray(sizesData) ? sizesData : []

  const preview = useMemo(() => {
    const flavor = flavors.find((f) => String(f.id) === String(form.flavor_id))
    const size = sizes.find((s) => String(s.id) === String(form.size_id))
    const qty = Number(form.quantity) || 0
    const discount = Number(form.discount) || 0
    const unitPrice = (Number(flavor?.price) || 0) + (Number(size?.price) || 0)
    const unitCost = (Number(flavor?.cost) || 0) + (Number(size?.cost) || 0)
    const revenue = Math.max(unitPrice * qty - discount, 0)
    const cost = unitCost * qty
    return { unitPrice, revenue, cost, profit: revenue - cost }
  }, [form, flavors, sizes])

  const createSale = useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setForm(emptyForm)
      setOpen(false)
      setError('')
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create sale'),
  })

  const submit = (e) => {
    e.preventDefault()
    createSale.mutate({
      customer_name: form.customer_name || null,
      discount: Number(form.discount) || 0,
      payment_method: form.payment_method,
      items: [
        {
          flavor_id: Number(form.flavor_id),
          size_id: Number(form.size_id),
          quantity: Number(form.quantity),
          discount: 0,
        },
      ],
    })
  }

  return (
    <div className="space-y-6 print-sheet">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Sales</h1>
          <p className="mt-1 text-muted">Record orders and auto-compute profit</p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <PrintButton />
          <Button onClick={() => setOpen((v) => !v)}>
            <Plus className="h-4 w-4" />
            New Sale
          </Button>
        </div>
      </header>

      {open ? (
        <Card className="no-print">
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={submit}>
            <div>
              <Label>Customer</Label>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                placeholder="Walk-in"
              />
            </div>
            <div>
              <Label>Cup Size</Label>
              <Select
                value={form.size_id}
                onChange={(e) => setForm({ ...form, size_id: e.target.value })}
                required
              >
                <option value="">Select size</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (+{formatCurrency(s.price)})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Flavor</Label>
              <Select
                value={form.flavor_id}
                onChange={(e) => setForm({ ...form, flavor_id: e.target.value })}
                required
              >
                <option value="">Select flavor</option>
                {flavors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {formatCurrency(f.price)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
              />
            </div>
            <div>
              <Label>Payment</Label>
              <Select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="maya">Maya</option>
                <option value="card">Card</option>
              </Select>
            </div>

            <div className="md:col-span-2 xl:col-span-3 grid gap-3 rounded-xl bg-brand-50/70 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted">Revenue</p>
                <p className="text-lg font-semibold">{formatCurrency(preview.revenue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Cost</p>
                <p className="text-lg font-semibold">{formatCurrency(preview.cost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Profit</p>
                <p className="text-lg font-semibold text-success">{formatCurrency(preview.profit)}</p>
              </div>
            </div>

            {error ? <p className="text-sm text-danger md:col-span-2 xl:col-span-3">{error}</p> : null}

            <div className="flex gap-2 md:col-span-2 xl:col-span-3">
              <Button type="submit" disabled={createSale.isPending}>
                {createSale.isPending ? 'Saving…' : 'Complete Sale'}
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
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Profit</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-muted" colSpan={6}>
                    Loading sales…
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted" colSpan={6}>
                    No sales yet. Create your first order.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3 font-medium">{sale.invoice_no}</td>
                    <td className="px-4 py-3">{sale.customer_name || 'Walk-in'}</td>
                    <td className="px-4 py-3">
                      <Badge className="capitalize">{sale.payment_method}</Badge>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3 text-success">{formatCurrency(sale.profit)}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatDateTime(sale.sold_at)}
                    </td>
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
