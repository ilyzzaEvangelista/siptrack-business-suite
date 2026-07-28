import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wallet,
  BarChart3,
  LineChart,
  ClipboardList,
  Settings,
  LogOut,
  CupSoda,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn, formatDateTime } from '@/utils/cn'
import { Button } from '@/components/ui'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sales', label: 'Sales', icon: ShoppingBag },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="print-root min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="no-print border-b border-line bg-panel/90 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <CupSoda className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink">SipTrack</p>
              <p className="text-xs text-muted">Business Suite</p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-muted hover:bg-brand-50 hover:text-ink',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden border-t border-line pt-4 lg:block">
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs capitalize text-muted">{user?.role}</p>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <main className="print-main min-w-0 p-4 md:p-6 lg:p-8">
        <div className="print-only mb-4 border-b border-black/20 pb-3">
          <p className="font-display text-xl font-semibold">SipTrack Business Suite</p>
          <p className="text-sm text-muted">Printed {formatDateTime(new Date())} (PHT)</p>
          {user?.name ? (
            <p className="text-sm text-muted">
              Prepared by {user.name} ({user.role})
            </p>
          ) : null}
        </div>
        <Outlet />
      </main>
    </div>
  )
}
