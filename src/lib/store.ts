'use client'

import { create } from 'zustand'

export type ModuleKey =
  | 'dashboard'
  | 'calendar'
  | 'reservations'
  | 'guests'
  | 'channels'
  | 'marketing'
  | 'booking-engine'
  | 'loyalty'
  | 'reputation'
  | 'revenue'
  | 'competitors'
  | 'concierge'
  | 'agents'
  | 'housekeeping'
  | 'maintenance'
  | 'corporate'
  | 'experiences'
  | 'finance'
  | 'insights'

interface AppState {
  activeModule: ModuleKey
  selectedGuestId: string | null
  sidebarOpen: boolean
  setModule: (m: ModuleKey) => void
  openGuest: (id: string) => void
  setSidebarOpen: (open: boolean) => void
}

export const useApp = create<AppState>((set) => ({
  activeModule: 'dashboard',
  selectedGuestId: null,
  sidebarOpen: false,
  setModule: (m) => set({ activeModule: m, selectedGuestId: m === 'guests' ? null : null }),
  openGuest: (id) => set({ selectedGuestId: id, activeModule: 'guests' }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
