'use client'

import { create } from 'zustand'

export type ModuleKey =
  | 'outcome-dashboard' | 'workforce-console' | 'copilot' | 'waitlist'
  | 'outcome-goals' | 'autonomous-engine'
  | 'mission-control' | 'missions' | 'opportunities' | 'agents' | 'insights'
  | 'network-intelligence' | 'benchmarking' | 'ai-marketplace' | 'digital-employees' | 'guest-network'
  | 'digital-twin' | 'knowledge-graph' | 'predictions' | 'segmentation' | 'funnel'
  | 'reputation-intel' | 'property-brain' | 'events' | 'predictive-ops'
  | 'supplier-network'
  | 'data-cloud'
  | 'staff-os'
  | 'calendar' | 'reservations' | 'housekeeping' | 'maintenance'
  | 'guests' | 'loyalty' | 'concierge'
  | 'marketing' | 'experiments' | 'booking-engine' | 'reputation' | 'corporate' | 'experiences'
  | 'revenue' | 'competitors' | 'channels' | 'direct-intel' | 'payments' | 'treasury' | 'finance'
  | 'api-platform'
  | 'multi-property' | 'website-builder' | 'marketplace'

interface AppState {
  activeModule: ModuleKey
  selectedGuestId: string | null
  sidebarOpen: boolean
  copilotOpen: boolean
  setModule: (m: ModuleKey) => void
  openGuest: (id: string) => void
  setSidebarOpen: (open: boolean) => void
  setCopilotOpen: (open: boolean) => void
}

export const useApp = create<AppState>((set) => ({
  activeModule: 'outcome-dashboard',
  selectedGuestId: null,
  sidebarOpen: false,
  copilotOpen: false,
  setModule: (m) => set({ activeModule: m, selectedGuestId: null }),
  openGuest: (id) => set({ selectedGuestId: id, activeModule: 'guests' }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCopilotOpen: (open) => set({ copilotOpen: open }),
}))
