import type { ModuleKey } from '@/lib/store'
import {
  Target, Zap, Rocket, Sparkles, Bot, FileText, Command, Network, BarChart3,
  Store, Globe2, Box, Share2, TrendingUp, Users, Filter, Layers,
  Star, Brain, Webhook, Wallet, Crown, Plug,
  CalendarDays, BookOpen, MessageCircle, Megaphone, FlaskConical,
  Building2, Package, Crosshair, Radio, Wrench, Cloud,
  Map, LayoutDashboard,
} from 'lucide-react'

export interface NavItem {
  key: ModuleKey
  label: string
  icon: typeof LayoutDashboard
  group: string
  badge?: string
  isNew?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  // Outcomes — the V4 centerpiece
  { key: 'outcome-goals', label: 'Outcome Goals', icon: Target, group: 'Outcomes', badge: '6', isNew: true },
  { key: 'autonomous-engine', label: 'Autonomous Engine', icon: Zap, group: 'Outcomes', isNew: true },
  { key: 'mission-control', label: 'Mission Control', icon: Rocket, group: 'Outcomes' },
  { key: 'missions', label: 'Active Missions', icon: Sparkles, group: 'Outcomes', badge: '5' },
  { key: 'opportunities', label: 'Opportunity Feed', icon: Sparkles, group: 'Outcomes', badge: '10' },
  { key: 'copilot', label: 'Hospitality Copilot', icon: Command, group: 'Outcomes', badge: '⌘K' },
  { key: 'agents', label: 'AI Workforce', icon: Bot, group: 'Outcomes', badge: '12' },
  { key: 'insights', label: 'Daily Brief', icon: FileText, group: 'Outcomes', badge: 'CEO' },

  // Network — network effects
  { key: 'network-intelligence', label: 'Network Intelligence', icon: Network, group: 'Network', badge: '5K' },
  { key: 'benchmarking', label: 'AI Benchmarking', icon: BarChart3, group: 'Network' },
  { key: 'data-cloud', label: 'Data Cloud', icon: Cloud, group: 'Network', isNew: true },
  { key: 'ai-marketplace', label: 'AI Marketplace', icon: Store, group: 'Network' },
  { key: 'digital-employees', label: 'Digital Employees', icon: Bot, group: 'Network', isNew: true },
  { key: 'guest-network', label: 'Guest Network', icon: Globe2, group: 'Network' },

  // Intelligence — digital twin & analytics
  { key: 'digital-twin', label: 'Digital Twin', icon: Box, group: 'Intelligence' },
  { key: 'knowledge-graph', label: 'Knowledge Graph', icon: Share2, group: 'Intelligence' },
  { key: 'predictions', label: 'Predictions', icon: TrendingUp, group: 'Intelligence' },
  { key: 'segmentation', label: 'Segmentation', icon: Filter, group: 'Intelligence' },
  { key: 'funnel', label: 'Booking Funnel', icon: Layers, group: 'Intelligence' },
  { key: 'reputation-intel', label: 'Reputation Intel', icon: Star, group: 'Intelligence' },
  { key: 'property-brain', label: 'Property Brain', icon: Brain, group: 'Intelligence' },
  { key: 'events', label: 'Event Platform', icon: Webhook, group: 'Intelligence' },
  { key: 'predictive-ops', label: 'Predictive Ops', icon: TrendingUp, group: 'Intelligence', isNew: true },

  // Staff — role workspaces
  { key: 'staff-os', label: 'Staff OS', icon: Users, group: 'Staff' },

  // Operations
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, group: 'Operations' },
  { key: 'reservations', label: 'Reservations', icon: BookOpen, group: 'Operations' },
  { key: 'housekeeping', label: 'Housekeeping', icon: Sparkles, group: 'Operations' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, group: 'Operations' },

  // Guests
  { key: 'guests', label: 'Guest CRM', icon: Users, group: 'Guests' },
  { key: 'loyalty', label: 'Loyalty Program', icon: Crown, group: 'Guests' },
  { key: 'concierge', label: 'AI Concierge', icon: MessageCircle, group: 'Guests', badge: 'Live' },

  // Growth
  { key: 'marketing', label: 'Marketing Engine', icon: Megaphone, group: 'Growth' },
  { key: 'experiments', label: 'Experiments', icon: FlaskConical, group: 'Growth', badge: 'A/B' },
  { key: 'booking-engine', label: 'Booking Engine', icon: Globe2, group: 'Growth' },
  { key: 'reputation', label: 'Reputation', icon: Star, group: 'Growth' },
  { key: 'corporate', label: 'Corporate Sales', icon: Building2, group: 'Growth' },
  { key: 'experiences', label: 'Experiences', icon: Package, group: 'Growth' },
  { key: 'supplier-network', label: 'Supplier Network', icon: Package, group: 'Growth', isNew: true },

  // Revenue
  { key: 'revenue', label: 'Revenue Manager', icon: TrendingUp, group: 'Revenue' },
  { key: 'competitors', label: 'Competitors', icon: Crosshair, group: 'Revenue' },
  { key: 'channels', label: 'Channels & OTA', icon: Radio, group: 'Revenue' },
  { key: 'direct-intel', label: 'Direct Booking Intel', icon: Wallet, group: 'Revenue' },
  { key: 'payments', label: 'Payments (PaySwap)', icon: Wallet, group: 'Revenue' },
  { key: 'treasury', label: 'Treasury', icon: Wallet, group: 'Revenue', isNew: true },
  { key: 'finance', label: 'Finance', icon: Wallet, group: 'Revenue' },

  // Platform
  { key: 'api-platform', label: 'API Platform', icon: Plug, group: 'Platform', isNew: true },
  { key: 'multi-property', label: 'Multi-Property', icon: Map, group: 'Platform' },
  { key: 'website-builder', label: 'Website Builder', icon: Globe2, group: 'Platform' },
  { key: 'marketplace', label: 'Service Marketplace', icon: Store, group: 'Platform' },
]

export const NAV_GROUPS = ['Outcomes', 'Network', 'Intelligence', 'Staff', 'Operations', 'Guests', 'Growth', 'Revenue', 'Platform']
