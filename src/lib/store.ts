'use client'

import { create } from 'zustand'

export type ModuleKey =
  | 'mission-control'
  | 'missions'
  | 'opportunities'
  | 'agents'
  | 'insights'
  | 'digital-twin'
  | 'knowledge-graph'
  | 'predictions'
  | 'segmentation'
  | 'funnel'
  | 'calendar'
  | 'reservations'
  | 'housekeeping'
  | 'maintenance'
  | 'guests'
  | 'loyalty'
  | 'concierge'
  | 'marketing'
  | 'experiments'
  | 'booking-engine'
  | 'reputation'
  | 'corporate'
  | 'experiences'
  | 'revenue'
  | 'competitors'
  | 'channels'
  | 'direct-intel'
  | 'finance'
  | 'multi-property'
  | 'website-builder'
  | 'marketplace'

interface AppState {
  activeModule: ModuleKey
  selectedGuestId: string | null
  sidebarOpen: boolean
  setModule: (m: ModuleKey) => void
  openGuest: (id: string) => void
  setSidebarOpen: (open: boolean) => void
}

export const useApp = create<AppState>((set) => ({
  activeModule: 'mission-control',
  selectedGuestId: null,
  sidebarOpen: false,
  setModule: (m) => set({ activeModule: m, selectedGuestId: null }),
  openGuest: (id) => set({ selectedGuestId: id, activeModule: 'guests' }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
