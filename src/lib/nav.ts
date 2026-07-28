import type { ModuleKey } from '@/lib/store'
import {
  Rocket, Target, Sparkles, Bot, FileText, Box, Share2, TrendingUp,
  Users, Filter, CalendarDays, BookOpen, Crown, MessageCircle, Megaphone,
  FlaskConical, Globe, Star, Building2, Package, Wallet, Crosshair,
  Radio, Layers, Map, Store, LayoutDashboard,
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
  { key: 'missions', label: 'Active Missions', icon: Target, group: 'Command', badge: '5', isNew: true },
  { key: 'opportunities', label: 'Opportunity Feed', icon: Sparkles, group: 'Command', badge: '10', isNew: true },
  { key: 'agents', label: 'AI Workforce', icon: Bot, group: 'Command', badge: '10' },
  { key: 'insights', label: 'Daily Brief', icon: FileText, group: 'Command', badge: 'CEO' },

  // Intelligence — the digital twin & analytics
  { key: 'digital-twin', label: 'Digital Twin', icon: Box, group: 'Intelligence', isNew: true },
  { key: 'knowledge-graph', label: 'Knowledge Graph', icon: Share2, group: 'Intelligence', isNew: true },
  { key: 'predictions', label: 'Predictions', icon: TrendingUp, group: 'Intelligence', isNew: true },
  { key: 'segmentation', label: 'Segmentation', icon: Filter, group: 'Intelligence', isNew: true },
  { key: 'funnel', label: 'Booking Funnel', icon: Layers, group: 'Intelligence', isNew: true },

  // Operations
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, group: 'Operations' },
  { key: 'reservations', label: 'Reservations', icon: BookOpen, group: 'Operations' },
  { key: 'housekeeping', label: 'Housekeeping', icon: Sparkles, group: 'Operations' },
  { key: 'maintenance', label: 'Maintenance', icon: Bot, group: 'Operations' },

  // Guests
  { key: 'guests', label: 'Guest CRM', icon: Users, group: 'Guests' },
  { key: 'loyalty', label: 'Loyalty Program', icon: Crown, group: 'Guests' },
  { key: 'concierge', label: 'AI Concierge', icon: MessageCircle, group: 'Guests', badge: 'Live' },

  // Growth
  { key: 'marketing', label: 'Marketing Engine', icon: Megaphone, group: 'Growth' },
  { key: 'experiments', label: 'Experiments', icon: FlaskConical, group: 'Growth', badge: 'A/B', isNew: true },
  { key: 'booking-engine', label: 'Booking Engine', icon: Globe, group: 'Growth' },
  { key: 'reputation', label: 'Reputation', icon: Star, group: 'Growth' },
  { key: 'corporate', label: 'Corporate Sales', icon: Building2, group: 'Growth' },
  { key: 'experiences', label: 'Experiences', icon: Package, group: 'Growth' },

  // Revenue
  { key: 'revenue', label: 'Revenue Manager', icon: TrendingUp, group: 'Revenue' },
  { key: 'competitors', label: 'Competitors', icon: Crosshair, group: 'Revenue' },
  { key: 'channels', label: 'Channels & OTA', icon: Radio, group: 'Revenue' },
  { key: 'direct-intel', label: 'Direct Booking Intel', icon: Wallet, group: 'Revenue', isNew: true },
  { key: 'finance', label: 'Finance', icon: Wallet, group: 'Revenue' },

  // Platform
  { key: 'multi-property', label: 'Multi-Property', icon: Map, group: 'Platform', isNew: true },
  { key: 'website-builder', label: 'Website Builder', icon: Globe, group: 'Platform', isNew: true },
  { key: 'marketplace', label: 'Marketplace', icon: Store, group: 'Platform', isNew: true },
]

export const NAV_GROUPS = ['Command', 'Intelligence', 'Operations', 'Guests', 'Growth', 'Revenue', 'Platform']
