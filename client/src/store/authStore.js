import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/api/client'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setSession: (user, token) => {
        localStorage.setItem('siptrack_token', token)
        set({ user, token, isAuthenticated: true })
      },

      login: async (email, password) => {
        const { data } = await api.post('/login', { email, password })
        get().setSession(data.user, data.token)
        return data
      },

      logout: async () => {
        try {
          await api.post('/logout')
        } catch {
          // ignore network errors on logout
        }
        localStorage.removeItem('siptrack_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'siptrack-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('siptrack_token', state.token)
        }
      },
    },
  ),
)
