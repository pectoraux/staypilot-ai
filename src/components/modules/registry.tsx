'use client'

import * as React from 'react'
import { useApp, type ModuleKey } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'

const lazy = <T extends { default: React.ComponentType }>(p: Promise<T>) =>
  React.lazy(() => p)

const OutcomeGoalsModule = lazy(import('./outcome-goals').then(m => ({ default: m.OutcomeGoalsModule })))
const AutonomousEngineModule = lazy(import('./autonomous-engine').then(m => ({ default: m.AutonomousEngineModule })))
const MissionControlModule = lazy(import('./mission-control').then(m => ({ default: m.MissionControlModule })))
const MissionsModule = lazy(import('./missions').then(m => ({ default: m.MissionsModule })))
const OpportunitiesModule = lazy(import('./opportunities').then(m => ({ default: m.OpportunitiesModule })))
const CopilotModule = lazy(import('./copilot').then(m => ({ default: m.CopilotModule })))
const AgentsModule = lazy(import('./agents').then(m => ({ default: m.AgentsModule })))
const InsightsModule = lazy(import('./insights').then(m => ({ default: m.InsightsModule })))
const NetworkIntelligenceModule = lazy(import('./network-intelligence').then(m => ({ default: m.NetworkIntelligenceModule })))
const BenchmarkingModule = lazy(import('./benchmarking').then(m => ({ default: m.BenchmarkingModule })))
const DataCloudModule = lazy(import('./data-cloud').then(m => ({ default: m.DataCloudModule })))
const AIMarketplaceModule = lazy(import('./ai-marketplace').then(m => ({ default: m.AIMarketplaceModule })))
const DigitalEmployeesModule = lazy(import('./digital-employees').then(m => ({ default: m.DigitalEmployeesModule })))
const GuestNetworkModule = lazy(import('./guest-network').then(m => ({ default: m.GuestNetworkModule })))
const DigitalTwinModule = lazy(import('./digital-twin').then(m => ({ default: m.DigitalTwinModule })))
const KnowledgeGraphModule = lazy(import('./knowledge-graph').then(m => ({ default: m.KnowledgeGraphModule })))
const PredictionsModule = lazy(import('./predictions').then(m => ({ default: m.PredictionsModule })))
const SegmentationModule = lazy(import('./segmentation').then(m => ({ default: m.SegmentationModule })))
const FunnelModule = lazy(import('./funnel').then(m => ({ default: m.FunnelModule })))
const ReputationIntelModule = lazy(import('./reputation-intel').then(m => ({ default: m.ReputationIntelModule })))
const PropertyBrainModule = lazy(import('./property-brain').then(m => ({ default: m.PropertyBrainModule })))
const EventsModule = lazy(import('./events').then(m => ({ default: m.EventsModule })))
const PredictiveOpsModule = lazy(import('./predictive-ops').then(m => ({ default: m.PredictiveOpsModule })))
const SupplierNetworkModule = lazy(import('./supplier-network').then(m => ({ default: m.SupplierNetworkModule })))
const StaffOSModule = lazy(import('./staff-os').then(m => ({ default: m.StaffOSModule })))
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
const PaymentsModule = lazy(import('./payments').then(m => ({ default: m.PaymentsModule })))
const TreasuryModule = lazy(import('./treasury').then(m => ({ default: m.TreasuryModule })))
const FinanceModule = lazy(import('./finance').then(m => ({ default: m.FinanceModule })))
const APIPlatformModule = lazy(import('./api-platform').then(m => ({ default: m.APIPlatformModule })))
const MultiPropertyModule = lazy(import('./multi-property').then(m => ({ default: m.MultiPropertyModule })))
const WebsiteBuilderModule = lazy(import('./website-builder').then(m => ({ default: m.WebsiteBuilderModule })))
const MarketplaceModule = lazy(import('./marketplace').then(m => ({ default: m.MarketplaceModule })))

const MAP: Record<ModuleKey, React.ComponentType> = {
  'outcome-goals': OutcomeGoalsModule,
  'autonomous-engine': AutonomousEngineModule,
  'mission-control': MissionControlModule,
  'missions': MissionsModule,
  'opportunities': OpportunitiesModule,
  'copilot': CopilotModule,
  'agents': AgentsModule,
  'insights': InsightsModule,
  'network-intelligence': NetworkIntelligenceModule,
  'benchmarking': BenchmarkingModule,
  'data-cloud': DataCloudModule,
  'ai-marketplace': AIMarketplaceModule,
  'digital-employees': DigitalEmployeesModule,
  'guest-network': GuestNetworkModule,
  'digital-twin': DigitalTwinModule,
  'knowledge-graph': KnowledgeGraphModule,
  'predictions': PredictionsModule,
  'segmentation': SegmentationModule,
  'funnel': FunnelModule,
  'reputation-intel': ReputationIntelModule,
  'property-brain': PropertyBrainModule,
  'events': EventsModule,
  'predictive-ops': PredictiveOpsModule,
  'supplier-network': SupplierNetworkModule,
  'staff-os': StaffOSModule,
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
  'payments': PaymentsModule,
  'treasury': TreasuryModule,
  'finance': FinanceModule,
  'api-platform': APIPlatformModule,
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
  const Comp = MAP[activeModule] ?? OutcomeGoalsModule
  return (
    <React.Suspense fallback={<ModuleSkeleton />}>
      <Comp />
    </React.Suspense>
  )
}
