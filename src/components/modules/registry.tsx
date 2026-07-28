'use client'

import * as React from 'react'
import { useApp, type ModuleKey } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy-load each module so only the active one is compiled on demand.
// This keeps dev-server memory low (avoids compiling all 19 heavy modules at once).
const DashboardModule = React.lazy(() => import('./dashboard').then(m => ({ default: m.DashboardModule })))
const CalendarModule = React.lazy(() => import('./calendar').then(m => ({ default: m.CalendarModule })))
const ReservationsModule = React.lazy(() => import('./reservations').then(m => ({ default: m.ReservationsModule })))
const GuestsModule = React.lazy(() => import('./guests').then(m => ({ default: m.GuestsModule })))
const ChannelsModule = React.lazy(() => import('./channels').then(m => ({ default: m.ChannelsModule })))
const MarketingModule = React.lazy(() => import('./marketing').then(m => ({ default: m.MarketingModule })))
const BookingEngineModule = React.lazy(() => import('./booking-engine').then(m => ({ default: m.BookingEngineModule })))
const LoyaltyModule = React.lazy(() => import('./loyalty').then(m => ({ default: m.LoyaltyModule })))
const ReputationModule = React.lazy(() => import('./reputation').then(m => ({ default: m.ReputationModule })))
const RevenueModule = React.lazy(() => import('./revenue').then(m => ({ default: m.RevenueModule })))
const CompetitorsModule = React.lazy(() => import('./competitors').then(m => ({ default: m.CompetitorsModule })))
const ConciergeModule = React.lazy(() => import('./concierge').then(m => ({ default: m.ConciergeModule })))
const AgentsModule = React.lazy(() => import('./agents').then(m => ({ default: m.AgentsModule })))
const HousekeepingModule = React.lazy(() => import('./housekeeping').then(m => ({ default: m.HousekeepingModule })))
const MaintenanceModule = React.lazy(() => import('./maintenance').then(m => ({ default: m.MaintenanceModule })))
const CorporateModule = React.lazy(() => import('./corporate').then(m => ({ default: m.CorporateModule })))
const ExperiencesModule = React.lazy(() => import('./experiences').then(m => ({ default: m.ExperiencesModule })))
const FinanceModule = React.lazy(() => import('./finance').then(m => ({ default: m.FinanceModule })))
const InsightsModule = React.lazy(() => import('./insights').then(m => ({ default: m.InsightsModule })))

const MAP: Record<ModuleKey, React.ComponentType> = {
  dashboard: DashboardModule,
  calendar: CalendarModule,
  reservations: ReservationsModule,
  guests: GuestsModule,
  channels: ChannelsModule,
  marketing: MarketingModule,
  'booking-engine': BookingEngineModule,
  loyalty: LoyaltyModule,
  reputation: ReputationModule,
  revenue: RevenueModule,
  competitors: CompetitorsModule,
  concierge: ConciergeModule,
  agents: AgentsModule,
  housekeeping: HousekeepingModule,
  maintenance: MaintenanceModule,
  corporate: CorporateModule,
  experiences: ExperiencesModule,
  finance: FinanceModule,
  insights: InsightsModule,
}

function ModuleSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function ModuleRegistry() {
  const { activeModule } = useApp()
  const Comp = MAP[activeModule] ?? DashboardModule
  return (
    <React.Suspense fallback={<ModuleSkeleton />}>
      <Comp />
    </React.Suspense>
  )
}
