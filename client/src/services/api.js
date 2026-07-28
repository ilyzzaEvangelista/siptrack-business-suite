import api from '@/api/client'

const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary').then((r) => r.data),
}

export const salesApi = {
  list: (params) => api.get('/sales', { params }).then((r) => unwrapList(r.data)),
  create: (payload) => api.post('/sales', payload).then((r) => r.data),
  show: (id) => api.get(`/sales/${id}`).then((r) => r.data),
}

export const inventoryApi = {
  list: () => api.get('/inventory').then((r) => unwrapList(r.data)),
  create: (payload) => api.post('/inventory', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/inventory/${id}`, payload).then((r) => r.data),
  adjust: (id, payload) => api.post(`/inventory/${id}/adjust`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/inventory/${id}`).then((r) => r.data),
}

export const expensesApi = {
  list: (params) => api.get('/expenses', { params }).then((r) => unwrapList(r.data)),
  create: (payload) => api.post('/expenses', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/expenses/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/expenses/${id}`).then((r) => r.data),
}

export const reportsApi = {
  summary: (params) => api.get('/reports/summary', { params }).then((r) => r.data),
}

export const analyticsApi = {
  summary: async () => {
    const [revenue_chart, profit_chart, best_sellers, slow_moving, inventory_usage] = await Promise.all([
      api.get('/analytics/revenue-chart').then((r) => r.data),
      api.get('/analytics/profit-chart').then((r) => r.data),
      api.get('/analytics/best-sellers').then((r) => r.data),
      api.get('/analytics/slow-moving').then((r) => r.data),
      api.get('/analytics/inventory-usage').then((r) => r.data),
    ])
    return { revenue_chart, profit_chart, best_sellers, slow_moving, inventory_usage }
  },
}

export const flavorsApi = {
  list: () => api.get('/flavors').then((r) => r.data),
  create: (payload) => api.post('/flavors', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/flavors/${id}`, payload).then((r) => r.data),
}

export const sizesApi = {
  list: () => api.get('/sizes').then((r) => r.data),
  create: (payload) => api.post('/sizes', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/sizes/${id}`, payload).then((r) => r.data),
}

export const settingsApi = {
  list: () => api.get('/settings').then((r) => r.data),
  update: (map) =>
    api
      .put('/settings', {
        settings: Object.entries(map).map(([key, value]) => ({
          key,
          value: value == null ? null : String(value),
          group: 'general',
        })),
      })
      .then((r) => r.data),
}

export const purchaseOrdersApi = {
  list: () => api.get('/purchase-orders').then((r) => unwrapList(r.data)),
  create: (payload) => api.post('/purchase-orders', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/purchase-orders/${id}`, payload).then((r) => r.data),
  receive: (id) => api.post(`/purchase-orders/${id}/receive`).then((r) => r.data),
}

export const suppliersApi = {
  list: () => api.get('/suppliers').then((r) => r.data),
}

export const usersApi = {
  list: () => api.get('/users').then((r) => r.data),
  create: (payload) => api.post('/users', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data),
}
