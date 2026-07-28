import type { ModuleKey } from '@/lib/store'
import {
  LayoutDashboard, CalendarDays, BookOpen, Users, Radio, Megaphone,
  Globe, Crown, Star, TrendingUp, Crosshair, MessageCircle, Bot,
  Sparkles, Wrench, Building2, Package, Wallet, Lightbulb,
} from 'lucide-react'

export interface NavItem {
  key: ModuleKey
  label: string
  icon: typeof LayoutDashboard
  group: string
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { key: 'insights', label: 'AI Insights', icon: Lightbulb, group: 'Overview', badge: '6' },
  { key: 'agents', label: 'AI Agents', icon: Bot, group: 'Overview', badge: '10' },

  { key: 'calendar', label: 'Calendar', icon: CalendarDays, group: 'Operations' },
  { key: 'reservations', label: 'Reservations', icon: BookOpen, group: 'Operations' },
  { key: 'housekeeping', label: 'Housekeeping', icon: Sparkles, group: 'Operations' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, group: 'Operations' },

  { key: 'guests', label: 'Guest CRM', icon: Users, group: 'Guests' },
  { key: 'loyalty', label: 'Loyalty Program', icon: Crown, group: 'Guests' },
  { key: 'concierge', label: 'AI Concierge', icon: MessageCircle, group: 'Guests', badge: 'Live' },

  { key: 'marketing', label: 'Marketing Engine', icon: Megaphone, group: 'Growth' },
  { key: 'booking-engine', label: 'Booking Engine', icon: Globe, group: 'Growth' },
  { key: 'reputation', label: 'Reputation', icon: Star, group: 'Growth' },
  { key: 'corporate', label: 'Corporate Sales', icon: Building2, group: 'Growth' },
  { key: 'experiences', label: 'Experiences', icon: Package, group: 'Growth' },

  { key: 'revenue', label: 'Revenue Manager', icon: TrendingUp, group: 'Revenue' },
  { key: 'competitors', label: 'Competitors', icon: Crosshair, group: 'Revenue' },
  { key: 'channels', label: 'Channels & OTA', icon: Radio, group: 'Revenue' },
  { key: 'finance', label: 'Finance', icon: Wallet, group: 'Revenue' },
]

export const NAV_GROUPS = ['Overview', 'Operations', 'Guests', 'Growth', 'Revenue']
