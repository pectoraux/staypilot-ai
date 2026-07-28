import type { ModuleKey } from '@/lib/store'
import {
  Rocket, Target, Sparkles, Bot, FileText, Command, Network, BarChart3,
  Store, Globe2, Box, Share2, TrendingUp, Users, Filter, Layers,
  Star, Brain, Webhook, Wallet,
  CalendarDays, BookOpen, Crown, MessageCircle, Megaphone, FlaskConical,
  Building2, Package, Crosshair, Radio, Wrench,
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
  // Command — the autonomous core
  { key: 'mission-control', label: 'Mission Control', icon: Rocket, group: 'Command', badge: '5' },
  { key: 'missions', label: 'Active Missions', icon: Target, group: 'Command', badge: '5' },
  { key: 'opportunities', label: 'Opportunity Feed', icon: Sparkles, group: 'Command', badge: '10' },
  { key: 'copilot', label: 'Hospitality Copilot', icon: Command, group: 'Command', badge: '⌘K', isNew: true },
  { key: 'agents', label: 'AI Workforce', icon: Bot, group: 'Command', badge: '12' },
  { key: 'insights', label: 'Daily Brief', icon: FileText, group: 'Command', badge: 'CEO' },

  // Network — the network effects story (V3)
  { key: 'network-intelligence', label: 'Network Intelligence', icon: Network, group: 'Network', badge: '5K', isNew: true },
  { key: 'benchmarking', label: 'AI Benchmarking', icon: BarChart3, group: 'Network', isNew: true },
  { key: 'ai-marketplace', label: 'AI Marketplace', icon: Store, group: 'Network', isNew: true },
  { key: 'guest-network', label: 'Guest Network', icon: Globe2, group: 'Network', isNew: true },

  // Intelligence — the digital twin & analytics
  { key: 'digital-twin', label: 'Digital Twin', icon: Box, group: 'Intelligence' },
  { key: 'knowledge-graph', label: 'Knowledge Graph', icon: Share2, group: 'Intelligence' },
  { key: 'predictions', label: 'Predictions', icon: TrendingUp, group: 'Intelligence' },
  { key: 'segmentation', label: 'Segmentation', icon: Filter, group: 'Intelligence' },
  { key: 'funnel', label: 'Booking Funnel', icon: Layers, group: 'Intelligence' },
  { key: 'reputation-intel', label: 'Reputation Intel', icon: Star, group: 'Intelligence', isNew: true },
  { key: 'property-brain', label: 'Property Brain', icon: Brain, group: 'Intelligence', isNew: true },
  { key: 'events', label: 'Event Platform', icon: Webhook, group: 'Intelligence', isNew: true },

  // Staff — role-based AI workspaces (V3)
  { key: 'staff-os', label: 'Staff OS', icon: Users, group: 'Staff', isNew: true },

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

  // Revenue
  { key: 'revenue', label: 'Revenue Manager', icon: TrendingUp, group: 'Revenue' },
  { key: 'competitors', label: 'Competitors', icon: Crosshair, group: 'Revenue' },
  { key: 'channels', label: 'Channels & OTA', icon: Radio, group: 'Revenue' },
  { key: 'direct-intel', label: 'Direct Booking Intel', icon: Wallet, group: 'Revenue' },
  { key: 'payments', label: 'Payments (PaySwap)', icon: Wallet, group: 'Revenue', isNew: true },
  { key: 'finance', label: 'Finance', icon: Wallet, group: 'Revenue' },

  // Platform
  { key: 'multi-property', label: 'Multi-Property', icon: Map, group: 'Platform' },
  { key: 'website-builder', label: 'Website Builder', icon: Globe2, group: 'Platform' },
  { key: 'marketplace', label: 'Service Marketplace', icon: Store, group: 'Platform' },
]

export const NAV_GROUPS = ['Command', 'Network', 'Intelligence', 'Staff', 'Operations', 'Guests', 'Growth', 'Revenue', 'Platform']
