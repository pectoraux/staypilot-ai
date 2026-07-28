'use client'

import * as React from 'react'
import { useAuth } from '@/components/auth-provider'
import { AppShell } from '@/components/app-shell'
import { AuthScreen } from '@/components/auth-screen'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white animate-pulse">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14h0M12 14h0M16 14h0M8 17h0M16 17h0" /></svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading StayPilot AI…</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthScreen />
  return <AppShell />
}
