import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { purchaseOrdersApi, suppliersApi } from '@/services/api'
import { Badge, Button, Card, Input, Label, Select } from '@/components/ui'
import { PrintButton } from '@/components/ui/PrintButton'
import { formatCurrency } from '@/utils/cn'

const empty = {
  supplier_id: '',
  item_name: '',
  quantity: 1,
  unit_price: 0,
  status: 'pending',
}

export default function PurchaseOrders() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: purchaseOrdersApi.list,
  })
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.list,
  })

  const create = useMutation({
    mutationFn: purchaseOrdersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setForm(empty)
      setOpen(false)
      setError('')
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create PO'),
  })

  const receive = useMutation({
    mutationFn: purchaseOrdersApi.receive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  return (
    <div className="space-y-6 print-sheet">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Purchase Orders</h1>
          <p className="mt-1 text-muted">Supplier, item, quantity, price & status</p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <PrintButton />
          <Button onClick={() => setOpen((v) => !v)}>
            <Plus className="h-4 w-4" />
            New PO
          </Button>
        </div>
      </header>

      {open ? (
        <Card className="no-print">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate({
                supplier_id: Number(form.supplier_id),
                item_name: form.item_name,
                quantity: Number(form.quantity),
                unit_price: Number(form.unit_price),
                status: form.status,
              })
            }}
          >
            <div>
              <Label>Supplier</Label>
              <Select
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                required
              >
                <option value="">Select supplier</option>
                {(suppliers || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Item</Label>
              <Input
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                required
              />
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
              <Label>Price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={create.isPending}>
                Create PO
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
                <th className="px-4 py-3 font-medium">PO #</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-muted">
                    Loading…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-muted">
                    No purchase orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((po) => (
                  <tr key={po.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3 font-medium">{po.po_number}</td>
                    <td className="px-4 py-3">{po.supplier?.name || '—'}</td>
                    <td className="px-4 py-3">{po.item_name}</td>
                    <td className="px-4 py-3">{po.quantity}</td>
                    <td className="px-4 py-3">{formatCurrency(po.unit_price)}</td>
                    <td className="px-4 py-3">
                      <Badge className="capitalize">{po.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {po.status !== 'received' && po.status !== 'cancelled' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="no-print"
                          onClick={() => receive.mutate(po.id)}
                        >
                          Mark received
                        </Button>
                      ) : (
                        '—'
                      )}
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
