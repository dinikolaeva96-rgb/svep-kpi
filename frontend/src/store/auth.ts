import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '@/types'

interface AuthState {
  accessToken: string | null
  refreshTokenVal: string | null
  user: AuthUser | null
  setTokens: (access: string, refresh: string) => void
  refresh: () => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshTokenVal: null,
      user: null,

      setTokens(access, refresh) {
        const user = jwtDecode<AuthUser>(access)
        set({ accessToken: access, refreshTokenVal: refresh, user })
      },

      async refresh() {
        const rt = get().refreshTokenVal
        if (!rt) return false
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt }),
          })
          if (!res.ok) return false
          const { accessToken } = await res.json()
          const user = jwtDecode<AuthUser>(accessToken)
          set({ accessToken, user })
          return true
        } catch {
          return false
        }
      },

      logout() {
        const rt = get().refreshTokenVal
        if (rt) fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }) })
        set({ accessToken: null, refreshTokenVal: null, user: null })
      },
    }),
    { name: 'svep-auth', partialize: (s) => ({ refreshTokenVal: s.refreshTokenVal }) as AuthState }
  )
)
