import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { inventoryApi } from '@/services/api'
import { Badge, Button, Card, Input, Label, Select } from '@/components/ui'
import { PrintButton } from '@/components/ui/PrintButton'
import { formatCurrency, formatNumber } from '@/utils/cn'

const categories = ['powder', 'cups', 'lids', 'straws', 'ice', 'sugar', 'water', 'syrups', 'other']

const emptyForm = {
  name: '',
  category: 'powder',
  unit: 'pcs',
  quantity: 0,
  reorder_level: 0,
  unit_cost: 0,
}

export default function Inventory() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [adjustId, setAdjustId] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ type: 'in', quantity: 0, notes: '' })

  const { data, isLoading } = useQuery({ queryKey: ['inventory'], queryFn: inventoryApi.list })
  const items = Array.isArray(data) ? data : []

  const create = useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setForm(emptyForm)
      setOpen(false)
      setError('')
    },
    onError: (err) => {
      const msg = err.response?.data?.message
      const fieldErrors = err.response?.data?.errors
      setError(msg || (fieldErrors ? Object.values(fieldErrors).flat().join(' ') : 'Failed to add item'))
    },
  })

  const adjust = useMutation({
    mutationFn: ({ id, payload }) => inventoryApi.adjust(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setAdjustId(null)
      setAdjustForm({ type: 'in', quantity: 0, notes: '' })
    },
  })

  const remove = useMutation({
    mutationFn: inventoryApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  const handleDelete = (item) => {
    if (!window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return
    remove.mutate(item.id)
  }

  return (
    <div className="space-y-6 print-sheet">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Inventory</h1>
          <p className="mt-1 text-muted">Track powder, cups, lids, straws, ice, sugar, water & syrups</p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <PrintButton />
          <Button
            onClick={() => {
              setOpen((v) => !v)
              setError('')
            }}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </header>

      {open ? (
        <Card className="no-print">
          <form
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate({
                name: form.name.trim(),
                category: form.category,
                unit: form.unit.trim() || 'pcs',
                quantity: Number(form.quantity) || 0,
                reorder_level: Number(form.reorder_level) || 0,
                unit_cost: Number(form.unit_cost) || 0,
              })
            }}
          >
            <div>
              <Label>Item name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Plastic Cups"
                required
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Unit</Label>
              <Input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="pcs, kg, L…"
                required
              />
            </div>
            <div>
              <Label>Starting quantity</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div>
              <Label>Reorder level</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
              />
            </div>
            <div>
              <Label>Unit cost</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.unit_cost}
                onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
              />
            </div>

            {error ? <p className="text-sm text-danger md:col-span-2 xl:col-span-3">{error}</p> : null}

            <div className="flex gap-2 md:col-span-2 xl:col-span-3">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Save item'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="no-print grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? <p className="text-muted">Loading inventory…</p> : null}
        {items.map((item) => {
          const low = Number(item.quantity) <= Number(item.reorder_level)
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="mt-1 text-xs capitalize text-muted">{item.category}</p>
                </div>
                <Badge tone={low ? 'danger' : 'success'}>{low ? 'Low stock' : 'In stock'}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted">Quantity</p>
                  <p className="font-semibold">
                    {formatNumber(item.quantity, 2)} {item.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Unit cost</p>
                  <p className="font-semibold">{formatCurrency(item.unit_cost)}</p>
                </div>
              </div>

              {adjustId === item.id ? (
                <form
                  className="mt-4 space-y-3 border-t border-line pt-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    adjust.mutate({
                      id: item.id,
                      payload: {
                        type: adjustForm.type,
                        quantity: Number(adjustForm.quantity),
                        notes: adjustForm.notes,
                      },
                    })
                  }}
                >
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={adjustForm.type}
                      onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                    >
                      <option value="in">Stock in</option>
                      <option value="out">Stock out</option>
                      <option value="adjustment">Adjustment</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={adjustForm.quantity}
                      onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={adjust.isPending}>
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setAdjustId(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="no-print mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setAdjustId(item.id)}>
                    Adjust stock
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:bg-red-50 hover:text-danger"
                    onClick={() => handleDelete(item)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {!isLoading && items.length > 0 ? (
        <Card className="print-only overflow-hidden p-0">
          <table className="print-only-table min-w-full text-left text-sm">
            <thead className="border-b border-line bg-brand-50/50 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Reorder</th>
                <th className="px-4 py-3 font-medium">Unit cost</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const low = Number(item.quantity) <= Number(item.reorder_level)
                return (
                  <tr key={item.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 capitalize">{item.category}</td>
                    <td className="px-4 py-3">{formatNumber(item.quantity, 2)}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{formatNumber(item.reorder_level, 2)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.unit_cost)}</td>
                    <td className="px-4 py-3">{low ? 'Low stock' : 'In stock'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      ) : null}

      {!isLoading && items.length === 0 && !open ? (
        <Card className="no-print flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-ink">No inventory items yet</p>
            <p className="mt-1 text-sm text-muted">Add powder, cups, lids, and other supplies to get started.</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </Card>
      ) : null}
    </div>
  )
}
