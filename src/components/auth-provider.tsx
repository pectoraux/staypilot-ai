'use client'

import * as React from 'react'

interface AppUser {
  id: string
  email: string
  name: string
  role: string
  isDemo: boolean
}

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch('/api/me')
      const data = await res.json()
      setUser(data.user)
    } catch {
      setUser(null)
    }
    setLoading(false)
  }, [])

  React.useEffect(() => { refresh() }, [refresh])

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (data.error) return { error: data.error }
    setUser(data.user)
    return {}
  }, [])

  const logout = React.useCallback(async () => {
    await fetch('/api/logout', { method: 'POST' })
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return React.useContext(AuthContext)
}
