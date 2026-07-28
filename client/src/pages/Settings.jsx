import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { flavorsApi, settingsApi, sizesApi, usersApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Badge, Button, Card, Input, Label } from '@/components/ui'
import { formatCurrency } from '@/utils/cn'

export default function Settings() {
  const queryClient = useQueryClient()
  const role = useAuthStore((s) => s.user?.role)
  const [businessName, setBusinessName] = useState('')
  const [taxRate, setTaxRate] = useState('0')

  const { data: settingsData } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.list })
  const { data: flavorsData } = useQuery({ queryKey: ['flavors'], queryFn: flavorsApi.list })
  const { data: sizesData } = useQuery({ queryKey: ['sizes'], queryFn: sizesApi.list })
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    enabled: role === 'owner' || role === 'admin',
  })

  const settings = settingsData?.data || settingsData || {}
  const flavors = flavorsData?.data || flavorsData || []
  const sizes = sizesData?.data || sizesData || []
  const users = usersData?.data || usersData || []

  useEffect(() => {
    const map = Array.isArray(settings)
      ? Object.fromEntries(settings.map((s) => [s.key, s.value]))
      : settings
    if (map.business_name) setBusinessName(map.business_name)
    if (map.tax_rate != null) setTaxRate(String(map.tax_rate))
  }, [settings])

  const saveSettings = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-muted">Cup prices, flavor prices, costs, business name & tax</p>
      </header>

      <Card>
        <h2 className="text-lg font-semibold">Business</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Business Name</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <Label>Tax rate (%)</Label>
            <Input type="number" min="0" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={() =>
            saveSettings.mutate({
              business_name: businessName,
              tax_rate: taxRate,
            })
          }
          disabled={saveSettings.isPending}
        >
          Save settings
        </Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Flavor prices</h2>
          <ul className="space-y-3">
            {flavors.map((f) => (
              <li key={f.id} className="flex items-center justify-between text-sm">
                <span>{f.name}</span>
                <span>
                  {formatCurrency(f.price)} <span className="text-muted">/ cost {formatCurrency(f.cost)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Cup / size prices</h2>
          <ul className="space-y-3">
            {sizes.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span>{formatCurrency(s.price)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {(role === 'owner' || role === 'admin') && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">User management</h2>
          <ul className="space-y-3">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-muted">{u.email}</p>
                </div>
                <Badge className="capitalize">{u.role}</Badge>
              </li>
            ))}
            {users.length === 0 ? <li className="text-sm text-muted">No users loaded.</li> : null}
          </ul>
        </Card>
      )}
    </div>
  )
}
