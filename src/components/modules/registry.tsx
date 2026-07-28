'use client'

import * as React from 'react'
import { useApp, type ModuleKey } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy-load each module so only the active one is compiled on demand.
const lazy = <T extends { default: React.ComponentType }>(p: Promise<T>) =>
  React.lazy(() => p)

const MissionControlModule = lazy(import('./mission-control').then(m => ({ default: m.MissionControlModule })))
const MissionsModule = lazy(import('./missions').then(m => ({ default: m.MissionsModule })))
const OpportunitiesModule = lazy(import('./opportunities').then(m => ({ default: m.OpportunitiesModule })))
const AgentsModule = lazy(import('./agents').then(m => ({ default: m.AgentsModule })))
const InsightsModule = lazy(import('./insights').then(m => ({ default: m.InsightsModule })))
const DigitalTwinModule = lazy(import('./digital-twin').then(m => ({ default: m.DigitalTwinModule })))
const KnowledgeGraphModule = lazy(import('./knowledge-graph').then(m => ({ default: m.KnowledgeGraphModule })))
const PredictionsModule = lazy(import('./predictions').then(m => ({ default: m.PredictionsModule })))
const SegmentationModule = lazy(import('./segmentation').then(m => ({ default: m.SegmentationModule })))
const FunnelModule = lazy(import('./funnel').then(m => ({ default: m.FunnelModule })))
const CalendarModule = lazy(import('./calendar').then(m => ({ default: m.CalendarModule })))
const ReservationsModule = lazy(import('./reservations').then(m => ({ default: m.ReservationsModule })))
const HousekeepingModule = lazy(import('./housekeeping').then(m => ({ default: m.HousekeepingModule })))
const MaintenanceModule = lazy(import('./maintenance').then(m => ({ default: m.MaintenanceModule })))
const GuestsModule = lazy(import('./guests').then(m => ({ default: m.GuestsModule })))
const LoyaltyModule = lazy(import('./loyalty').then(m => ({ default: m.LoyaltyModule })))
const ConciergeModule = lazy(import('./concierge').then(m => ({ default: m.ConciergeModule })))
const MarketingModule = lazy(import('./marketing').then(m => ({ default: m.MarketingModule })))
const ExperimentsModule = lazy(import('./experiments').then(m => ({ default: m.ExperimentsModule })))
const BookingEngineModule = lazy(import('./booking-engine').then(m => ({ default: m.BookingEngineModule })))
const ReputationModule = lazy(import('./reputation').then(m => ({ default: m.ReputationModule })))
const CorporateModule = lazy(import('./corporate').then(m => ({ default: m.CorporateModule })))
const ExperiencesModule = lazy(import('./experiences').then(m => ({ default: m.ExperiencesModule })))
const RevenueModule = lazy(import('./revenue').then(m => ({ default: m.RevenueModule })))
const CompetitorsModule = lazy(import('./competitors').then(m => ({ default: m.CompetitorsModule })))
const ChannelsModule = lazy(import('./channels').then(m => ({ default: m.ChannelsModule })))
const DirectIntelModule = lazy(import('./direct-intel').then(m => ({ default: m.DirectIntelModule })))
const FinanceModule = lazy(import('./finance').then(m => ({ default: m.FinanceModule })))
const MultiPropertyModule = lazy(import('./multi-property').then(m => ({ default: m.MultiPropertyModule })))
const WebsiteBuilderModule = lazy(import('./website-builder').then(m => ({ default: m.WebsiteBuilderModule })))
const MarketplaceModule = lazy(import('./marketplace').then(m => ({ default: m.MarketplaceModule })))

const MAP: Record<ModuleKey, React.ComponentType> = {
  'mission-control': MissionControlModule,
  'missions': MissionsModule,
  'opportunities': OpportunitiesModule,
  'agents': AgentsModule,
  'insights': InsightsModule,
  'digital-twin': DigitalTwinModule,
  'knowledge-graph': KnowledgeGraphModule,
  'predictions': PredictionsModule,
  'segmentation': SegmentationModule,
  'funnel': FunnelModule,
  'calendar': CalendarModule,
  'reservations': ReservationsModule,
  'housekeeping': HousekeepingModule,
  'maintenance': MaintenanceModule,
  'guests': GuestsModule,
  'loyalty': LoyaltyModule,
  'concierge': ConciergeModule,
  'marketing': MarketingModule,
  'experiments': ExperimentsModule,
  'booking-engine': BookingEngineModule,
  'reputation': ReputationModule,
  'corporate': CorporateModule,
  'experiences': ExperiencesModule,
  'revenue': RevenueModule,
  'competitors': CompetitorsModule,
  'channels': ChannelsModule,
  'direct-intel': DirectIntelModule,
  'finance': FinanceModule,
  'multi-property': MultiPropertyModule,
  'website-builder': WebsiteBuilderModule,
  'marketplace': MarketplaceModule,
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
  const Comp = MAP[activeModule] ?? MissionControlModule
  return (
    <React.Suspense fallback={<ModuleSkeleton />}>
      <Comp />
    </React.Suspense>
  )
}
