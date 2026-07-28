// StayPilot V5 — Digital Twin
// The live model of the business. Everything the AI reasons about comes from here.
// Initialized from V1 mock data but MUTABLE — tools change it, events fire, UI observes.
import { create } from 'zustand'
import { GUESTS, RESERVATIONS, ROOMS, PROPERTY, occupancyForDate } from '@/lib/data'

export interface TwinState {
  // Live business state
  rooms: typeof ROOMS
  reservations: typeof RESERVATIONS
  guests: typeof GUESTS
  pricing: Record<string, number> // roomId -> current rate
  campaigns: Array<{ id: string; name: string; status: string; sent: number; opened: number; converted: number; revenue: number }>
  staff: Array<{ id: string; name: string; role: string; status: string }>
  maintenance: Array<{ id: string; room: string; issue: string; status: string; priority: string }>
  cleaning: Array<{ id: string; room: string; status: string; assignee: string }>
  competitors: Array<{ id: string; name: string; avgRate: number; occupancy: number }>
  marketDemand: number // 0-100 index
  reviews: Array<{ id: string; platform: string; rating: number; sentiment: string; responded: boolean }>

  // Live metrics (derived + mutable)
  occupancyToday: number
  revenueToday: number
  directShare: number
  otaCommissionRate: number
  repeatGuestRate: number
  avgGuestSpend: number
  avgRating: number
  inquiriesToday: number
  cancellationsToday: number

  // Workforce counters (live)
  tasksCompletedToday: number
  autoActionsToday: number
  revenueRecoveredToday: number
  revenueAtRiskToday: number
  approvalsPending: number

  // Timestamp of last update (for "live" feel)
  lastTick: number
  tickCount: number

  // Actions
  setRoomStatus: (roomId: string, status: string) => void
  setPricing: (roomId: string, rate: number) => void
  addCampaign: (c: TwinState['campaigns'][0]) => void
  updateCampaign: (id: string, patch: Partial<TwinState['campaigns'][0]>) => void
  addMaintenance: (m: TwinState['maintenance'][0]) => void
  resolveMaintenance: (id: string) => void
  setCleaning: (id: string, status: string) => void
  addReservation: (r: TwinState['reservations'][0]) => void
  updateGuest: (id: string, patch: Record<string, unknown>) => void
  incrementMetric: (key: 'tasksCompletedToday' | 'autoActionsToday' | 'revenueRecoveredToday' | 'approvalsPending' | 'inquiriesToday' | 'cancellationsToday') => void
  addRevenue: (amount: number) => void
  tick: () => void
  recompute: () => void
}

const initialPricing: Record<string, number> = {}
ROOMS.forEach((r) => { initialPricing[r.id] = r.baseRate })

const today = () => new Date().toISOString().slice(0, 10)

export const useTwin = create<TwinState>((set, get) => ({
  rooms: ROOMS,
  reservations: RESERVATIONS,
  guests: GUESTS,
  pricing: initialPricing,
  campaigns: [
    { id: 'c1', name: 'Weekend Flash Sale', status: 'Active', sent: 48, opened: 12, converted: 3, revenue: 4200 },
    { id: 'c2', name: 'Loyalty Reboot', status: 'Scheduled', sent: 0, opened: 0, converted: 0, revenue: 0 },
    { id: 'c3', name: 'Corporate Q4', status: 'Active', sent: 34, opened: 28, converted: 5, revenue: 28750 },
  ],
  staff: [
    { id: 's1', name: 'Abena', role: 'Reception', status: 'On shift' },
    { id: 's2', name: 'Akua', role: 'Housekeeping', status: 'On shift' },
    { id: 's3', name: 'Kojo', role: 'Maintenance', status: 'On call' },
    { id: 's4', name: 'Adwoa', role: 'Supervisor', status: 'On shift' },
  ],
  maintenance: [
    { id: 'mt1', room: '102', issue: 'AC noise', status: 'Open', priority: 'Medium' },
    { id: 'mt2', room: '303', issue: 'Jacuzzi leak (predicted)', status: 'Predicted', priority: 'High' },
  ],
  cleaning: [
    { id: 'cl1', room: '101', status: 'Done', assignee: 'Grace' },
    { id: 'cl2', room: '203', status: 'In Progress', assignee: 'Akua' },
    { id: 'cl3', room: '303', status: 'Pending', assignee: 'Akua' },
  ],
  competitors: [
    { id: 'cp1', name: 'Golden Tulip', avgRate: 980, occupancy: 82 },
    { id: 'cp2', name: 'Ibis Styles', avgRate: 720, occupancy: 88 },
    { id: 'cp3', name: 'Kempinski', avgRate: 2100, occupancy: 69 },
  ],
  marketDemand: 68,
  reviews: [
    { id: 'rv1', platform: 'Google', rating: 5, sentiment: 'positive', responded: true },
    { id: 'rv2', platform: 'Booking.com', rating: 4, sentiment: 'positive', responded: false },
    { id: 'rv3', platform: 'Airbnb', rating: 2, sentiment: 'negative', responded: false },
  ],

  occupancyToday: occupancyForDate(today()),
  revenueToday: 12400,
  directShare: 41,
  otaCommissionRate: 15,
  repeatGuestRate: 38,
  avgGuestSpend: 1180,
  avgRating: 4.4,
  inquiriesToday: 14,
  cancellationsToday: 1,

  tasksCompletedToday: 47,
  autoActionsToday: 31,
  revenueRecoveredToday: 18600,
  revenueAtRiskToday: 9800,
  approvalsPending: 4,

  lastTick: Date.now(),
  tickCount: 0,

  setRoomStatus: (roomId, status) =>
    set((s) => ({ rooms: s.rooms.map((r) => r.id === roomId ? { ...r, status: status as never } : r) })),

  setPricing: (roomId, rate) =>
    set((s) => ({ pricing: { ...s.pricing, [roomId]: rate } })),

  addCampaign: (c) => set((s) => ({ campaigns: [c, ...s.campaigns] })),
  updateCampaign: (id, patch) => set((s) => ({ campaigns: s.campaigns.map((c) => c.id === id ? { ...c, ...patch } : c) })),

  addMaintenance: (m) => set((s) => ({ maintenance: [m, ...s.maintenance] })),
  resolveMaintenance: (id) => set((s) => ({ maintenance: s.maintenance.map((m) => m.id === id ? { ...m, status: 'Resolved' } : m) })),

  setCleaning: (id, status) => set((s) => ({ cleaning: s.cleaning.map((c) => c.id === id ? { ...c, status } : c) })),

  addReservation: (r) => set((s) => ({ reservations: [r, ...s.reservations] })),
  updateGuest: (id, patch) => set((s) => ({ guests: s.guests.map((g) => g.id === id ? { ...g, ...patch } as never : g) })),

  incrementMetric: (key) => set((s) => ({ [key]: s[key] + 1 } as Partial<TwinState>)),
  addRevenue: (amount) => set((s) => ({ revenueToday: s.revenueToday + amount, revenueRecoveredToday: s.revenueRecoveredToday + amount })),

  tick: () => set((s) => ({ lastTick: Date.now(), tickCount: s.tickCount + 1 })),

  recompute: () => {
    const s = get()
    const occ = occupancyForDate(today())
    const direct = Math.round((s.reservations.filter((r) => !['Airbnb', 'Booking.com', 'Expedia', 'Agoda', 'Vrbo'].includes(r.source)).length / Math.max(1, s.reservations.length)) * 100)
    const repeat = Math.round((s.guests.filter((g) => g.repeatVisits > 0).length / Math.max(1, s.guests.length)) * 100)
    set({ occupancyToday: occ, directShare: direct, repeatGuestRate: repeat })
  },
}))

// Snapshot helper for the engine to reason over
export function twinSnapshot() {
  return useTwin.getState()
}
