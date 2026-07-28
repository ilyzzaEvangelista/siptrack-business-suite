import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import AppLayout from '@/layouts/AppLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Sales from '@/pages/Sales'
import Inventory from '@/pages/Inventory'
import Expenses from '@/pages/Expenses'
import Reports from '@/pages/Reports'
import Analytics from '@/pages/Analytics'
import PurchaseOrders from '@/pages/PurchaseOrders'
import Settings from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="sales" element={<Sales />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
