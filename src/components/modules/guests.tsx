'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Search, Calendar, MessageCircle, Mail, Phone, CreditCard, Star,
  AlertTriangle, Sparkles, Megaphone, Lightbulb, LogIn, LogOut,
  ArrowLeft, MapPin, Languages, Cake, Heart, Users, UtensilsCrossed,
  Gift, Clock, Bookmark, Zap, PlusCircle, Globe, Repeat,
  Wallet, BedDouble, BadgeCheck, NotebookPen,
  Compass, CalendarCheck, Award, HeartHandshake, Activity,
  ShieldAlert, Route, Brain, LayoutDashboard, TrendingUp, TrendingDown,
  Check, X, Plus,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip,
} from 'recharts'
import { toast } from 'sonner'

import { GUESTS, RESERVATIONS, timelineForGuest, SOURCE_COLORS } from '@/lib/data'
import { journeyForGuest, memoriesForGuest } from '@/lib/data-v2'
import { fmtMoney, fmtMoneyShort, fmtDate, relativeDate, initials } from '@/lib/format'
import { useApp } from '@/lib/store'
import {
  StatCard, SectionHeader, SourceBadge, StatusPill, TierBadge, PriorityPill,
} from '@/components/shared'
import { cn } from '@/lib/utils'
import type { Guest, TimelineEntry, TimelineEntryType, BookingSource } from '@/lib/types'
import type { JourneyStep, GuestMemory } from '@/lib/data-v2'

// =================================================================
// helpers
// =================================================================

const OTAS: BookingSource[] = ['Airbnb', 'Booking.com', 'Expedia', 'Agoda', 'Vrbo']
const isOta = (s: BookingSource) => OTAS.includes(s)

/** Convert a 2-letter ISO country code to a flag emoji via regional indicator symbols. */
function flagEmoji(code?: string): string {
  if (!code || code.length !== 2) return '🏳️'
  const cc = code.toUpperCase()
  if (!/^[A-Z]{2}$/.test(cc)) return '🏳️'
  return String.fromCodePoint(
    ...[...cc].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)),
  )
}

// =================================================================
// journey stage & status config
// =================================================================

const STAGE_CONFIG: Record<JourneyStep['stage'], { icon: LucideIcon; label: string }> = {
  discovery:   { icon: Compass,        label: 'Discovery' },
  inquiry:     { icon: MessageCircle,  label: 'Inquiry' },
  reservation: { icon: CalendarCheck,  label: 'Reservation' },
  arrival:     { icon: LogIn,          label: 'Arrival' },
  stay:        { icon: BedDouble,      label: 'Stay' },
  experiences: { icon: MapPin,         label: 'Experiences' },
  review:      { icon: Star,           label: 'Review' },
  loyalty:     { icon: Award,          label: 'Loyalty' },
  repeat:      { icon: Repeat,         label: 'Repeat' },
  referral:    { icon: HeartHandshake, label: 'Referral' },
}

const STATUS_CONFIG: Record<
  JourneyStep['status'],
  { color: string; bg: string; border: string; text: string; label: string }
> = {
  complete: {
    color: '#10b981',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/45',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Complete',
  },
  current: {
    color: '#ea580c',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/55',
    text: 'text-orange-600 dark:text-orange-400',
    label: 'Current',
  },
  upcoming: {
    color: '#94a3b8',
    bg: 'bg-muted/50',
    border: 'border-border',
    text: 'text-muted-foreground',
    label: 'Upcoming',
  },
  lost: {
    color: '#f43f5e',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/45',
    text: 'text-rose-600 dark:text-rose-400',
    label: 'Lost',
  },
}

// =================================================================
// memory category config
// =================================================================

const MEMORY_CATEGORIES: Record<
  GuestMemory['category'],
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  preference:   { label: 'Preferences',   icon: Heart,       color: '#be123c', bg: 'rgba(190,18,60,0.12)' },
  behavior:     { label: 'Behaviors',     icon: Activity,    color: '#9333ea', bg: 'rgba(147,51,234,0.12)' },
  occasion:     { label: 'Occasions',     icon: Cake,        color: '#d97706', bg: 'rgba(217,119,7,0.12)' },
  sensitivity:  { label: 'Sensitivities', icon: ShieldAlert, color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
  relationship: { label: 'Relationships', icon: Users,       color: '#0d9488', bg: 'rgba(13,148,136,0.12)' },
  history:      { label: 'History',       icon: Clock,       color: '#b45309', bg: 'rgba(180,83,9,0.12)' },
}

const MEMORY_CATEGORY_ORDER: GuestMemory['category'][] = [
  'preference', 'sensitivity', 'behavior', 'occasion', 'relationship', 'history',
]

// =================================================================
// timeline config (kept from V1)
// =================================================================

interface TimelineIconCfg { icon: LucideIcon; color: string; bg: string }

const TIMELINE_ICONS: Record<TimelineEntryType, TimelineIconCfg> = {
  'Reservation':       { icon: Calendar,       color: '#ea580c', bg: 'rgba(234,88,12,0.14)' },
  'WhatsApp':          { icon: MessageCircle,  color: '#16a34a', bg: 'rgba(22,163,74,0.14)' },
  'Email':             { icon: Mail,           color: '#a16207', bg: 'rgba(161,98,7,0.14)' },
  'Phone Call':        { icon: Phone,          color: '#9333ea', bg: 'rgba(147,51,234,0.14)' },
  'Payment':           { icon: CreditCard,     color: '#0d9488', bg: 'rgba(13,148,136,0.14)' },
  'Review':            { icon: Star,           color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  'Complaint':         { icon: AlertTriangle,  color: '#be123c', bg: 'rgba(190,18,60,0.14)' },
  'Special Request':   { icon: Sparkles,       color: '#0e7490', bg: 'rgba(14,116,144,0.14)' },
  'Campaign':          { icon: Megaphone,      color: '#be123c', bg: 'rgba(190,18,60,0.14)' },
  'Recommendation':    { icon: Lightbulb,      color: '#b45309', bg: 'rgba(180,83,9,0.14)' },
  'Check-in':          { icon: LogIn,          color: '#15803d', bg: 'rgba(21,128,61,0.14)' },
  'Check-out':         { icon: LogOut,         color: '#a16207', bg: 'rgba(161,98,7,0.14)' },
}

const SENTIMENT_COLORS: Record<NonNullable<TimelineEntry['sentiment']>, string> = {
  positive: '#10b981',
  neutral: '#94a3b8',
  negative: '#f43f5e',
}

const TIERS = ['Bronze', 'Silver', 'Gold', 'VIP'] as const
const SEGMENTS = [
  'Corporate Traveler', 'Leisure', 'Family', 'International Tourist',
  'Weekend Traveler', 'Long-stay Guest', 'High Spender', 'Birthday', 'Anniversary',
] as const

// =================================================================
// small subcomponents
// =================================================================

function InfoItem({
  icon: Icon, label, value, accent = 'text-muted-foreground',
}: {
  icon: LucideIcon
  label: string
  value?: string | number | null
  accent?: string
}) {
  const display = value === undefined || value === null || value === '' ? '—' : String(value)
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/40 p-2.5 transition-colors hover:bg-accent/30">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent/40 text-muted-foreground">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn('text-xs font-medium truncate', accent)} title={display}>{display}</p>
      </div>
    </div>
  )
}

function Chip({
  children, tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'brand' | 'teal' | 'gold' | 'rose' | 'violet'
}) {
  const map: Record<string, string> = {
    default: 'bg-muted/60 text-foreground/80 border-border',
    brand: 'bg-orange-500/12 text-orange-700 dark:text-orange-300 border-orange-500/25',
    teal: 'bg-teal-500/12 text-teal-700 dark:text-teal-300 border-teal-500/25',
    gold: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25',
    rose: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25',
    violet: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium', map[tone])}>
      {children}
    </span>
  )
}

// =================================================================
// guest list item (left panel)
// =================================================================

function GuestListItem({
  guest, selected, onSelect,
}: {
  guest: Guest
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all',
        'hover:bg-accent/50 hover:shadow-sm',
        selected
          ? 'border-orange-500/40 bg-orange-500/5 shadow-sm ring-1 ring-orange-500/20'
          : 'border-border',
      )}
    >
      {selected && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-gradient-to-b from-orange-500 to-amber-500" />
      )}
      <Avatar className="size-10 shrink-0 border border-border/50">
        <AvatarFallback
          className="font-semibold"
          style={{ backgroundColor: guest.avatarColor + '22', color: guest.avatarColor }}
        >
          {initials(guest.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{guest.name}</p>
          <span className="text-base leading-none shrink-0" title={guest.country}>
            {flagEmoji(guest.countryCode)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <TierBadge tier={guest.loyaltyTier} />
          <span className="text-xs font-semibold text-foreground/80">
            {fmtMoneyShort(guest.lifetimeSpend)}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Last stay {guest.lastStay ? relativeDate(guest.lastStay) : '—'}
        </p>
      </div>
    </button>
  )
}

// =================================================================
// spend chart (overview tab)
// =================================================================

function SpendChart({ guestId, accent }: { guestId: string; accent: string }) {
  const data = React.useMemo(() => {
    return RESERVATIONS
      .filter((r) => r.guestId === guestId)
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
      .map((r, i) => ({
        name: `#${i + 1}`,
        value: r.grossRevenue,
        date: r.checkIn,
        source: r.source,
      }))
  }, [guestId])

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
        No reservation history yet
      </div>
    )
  }

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.95} />
              <stop offset="100%" stopColor={accent} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="currentColor"
            className="text-muted-foreground"
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => fmtMoneyShort(v)}
          />
          <RTooltip
            cursor={{ fill: 'rgba(234,88,12,0.06)' }}
            contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
            formatter={(v: number) => [fmtMoney(v), 'Spend']}
            labelFormatter={(_, p) => p?.[0]?.payload?.date ? fmtDate(p[0].payload.date) : ''}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#spendGrad)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// =================================================================
// journey map (V2 centerpiece)
// =================================================================

function JourneyMap({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="overflow-x-auto scroll-area-fancy pb-2">
      <div className="flex min-w-max items-start px-1">
        {steps.map((step, i) => {
          const cfg = STAGE_CONFIG[step.stage]
          const st = STATUS_CONFIG[step.status]
          const Icon = cfg.icon
          const isLast = i === steps.length - 1
          return (
            <React.Fragment key={step.stage}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5) }}
                className="flex flex-col items-center"
                style={{ minWidth: 138, maxWidth: 152 }}
              >
                {/* icon node */}
                <div className="relative flex size-12 items-center justify-center">
                  {step.status === 'current' && (
                    <span className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping" />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex size-12 items-center justify-center rounded-full border-2 bg-card shadow-sm transition-transform hover:scale-105',
                      st.bg, st.border,
                    )}
                  >
                    <Icon className={cn('size-5', st.text)} />
                    {step.status === 'complete' && (
                      <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                    {step.status === 'lost' && (
                      <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
                        <X className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </div>
                {/* label + meta */}
                <div className="mt-3 w-full text-center px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {cfg.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-tight text-foreground">
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{fmtDate(step.date)}</p>
                  )}
                  {typeof step.value === 'number' && step.value > 0 && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="size-2.5" /> {fmtMoneyShort(step.value)}
                    </span>
                  )}
                  {step.status === 'lost' && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      <TrendingDown className="size-2.5" /> Revenue lost
                    </span>
                  )}
                  {step.note && (
                    <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{step.note}</p>
                  )}
                </div>
              </motion.div>
              {!isLast && (
                <div className="flex items-start" style={{ paddingTop: 23 }}>
                  <div
                    className="h-0.5 w-8 sm:w-10 rounded-full"
                    style={{
                      backgroundColor: st.color,
                      opacity: step.status === 'upcoming' ? 0.25 : step.status === 'lost' ? 0.5 : 0.65,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// =================================================================
// journey insights (AI observations)
// =================================================================

interface JourneyInsight {
  type: 'win' | 'risk' | 'opportunity'
  priority: 'High' | 'Medium' | 'Low'
  icon: LucideIcon
  text: string
  action?: string
}

function buildJourneyInsights(guest: Guest, steps: JourneyStep[]): JourneyInsight[] {
  const out: JourneyInsight[] = []
  const ota = isOta(guest.bookingSource)

  const byStage = (s: JourneyStep['stage']) => steps.find((x) => x.stage === s)

  // Discovery
  if (ota) {
    out.push({
      type: 'risk',
      priority: 'High',
      icon: AlertTriangle,
      text: `Discovered via ${guest.bookingSource} — commission paid on every booking. Converting to direct saves 15-18% per stay.`,
      action: 'Send direct-booking incentive',
    })
  } else {
    out.push({
      type: 'win',
      priority: 'Low',
      icon: BadgeCheck,
      text: `Discovered via ${guest.bookingSource} — direct channel, no commission, full margin retained.`,
    })
  }

  // Experiences
  const exp = byStage('experiences')
  if (exp?.status === 'lost') {
    out.push({
      type: 'opportunity',
      priority: 'Medium',
      icon: Sparkles,
      text: 'No experiences booked on last stay — upsell opportunity lost. Airport pickup + tour average ₵630 extra per guest.',
      action: 'Offer tour at next stay',
    })
  } else if (exp?.status === 'complete') {
    out.push({
      type: 'win',
      priority: 'Low',
      icon: Sparkles,
      text: 'Experiences booked — high-engagement guest, likely to add upsells again.',
    })
  }

  // Repeat
  if (guest.repeatVisits > 0) {
    const rate = Math.round((guest.repeatVisits / Math.max(1, guest.totalStays)) * 100)
    out.push({
      type: rate >= 50 ? 'win' : 'opportunity',
      priority: rate >= 50 ? 'Low' : 'Medium',
      icon: Repeat,
      text: `Repeat rate ${rate}% — ${rate >= 50 ? 'strong loyalty potential, prime for referral program.' : 'room to grow loyalty, consider a win-back offer.'}`,
      action: rate < 50 ? 'Send win-back offer' : undefined,
    })
  } else {
    out.push({
      type: 'opportunity',
      priority: 'Medium',
      icon: Repeat,
      text: 'First-time guest — convert to repeat with a personalized return incentive.',
      action: 'Send return incentive',
    })
  }

  // Review
  if (guest.avgRatingGiven && guest.avgRatingGiven >= 4.5) {
    out.push({
      type: 'win',
      priority: 'Low',
      icon: Star,
      text: `Left a ${guest.avgRatingGiven}★ review — brand advocate. Ideal candidate for referral outreach.`,
      action: 'Request referral',
    })
  } else if (guest.avgRatingGiven && guest.avgRatingGiven < 4) {
    out.push({
      type: 'risk',
      priority: 'High',
      icon: AlertTriangle,
      text: `Left a ${guest.avgRatingGiven}★ review — service recovery needed before next outreach.`,
      action: 'Trigger service recovery',
    })
  }

  // Loyalty
  if (guest.loyaltyTier === 'Bronze') {
    out.push({
      type: 'opportunity',
      priority: 'Medium',
      icon: Gift,
      text: 'Still in Bronze tier — upgrade path available via loyalty enrollment.',
      action: 'Enroll in loyalty',
    })
  } else if (guest.loyaltyTier === 'VIP' || guest.loyaltyTier === 'Gold') {
    out.push({
      type: 'win',
      priority: 'Low',
      icon: Award,
      text: `${guest.loyaltyTier} member — recognize on next stay to deepen retention.`,
    })
  }

  // Referral
  const ref = byStage('referral')
  if (ref?.status === 'upcoming') {
    out.push({
      type: 'opportunity',
      priority: 'Medium',
      icon: HeartHandshake,
      text: 'Has not referred yet — a single nudge could unlock 2-3 new bookings.',
      action: 'Send referral reward',
    })
  } else if (ref?.status === 'complete') {
    out.push({
      type: 'win',
      priority: 'Low',
      icon: HeartHandshake,
      text: 'Active referrer — protect this relationship with VIP perks.',
    })
  }

  return out
}

function JourneyInsights({ insights }: { insights: JourneyInsight[] }) {
  if (insights.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No journey insights available.</p>
    )
  }
  return (
    <div className="space-y-2">
      {insights.map((ins, i) => {
        const Icon = ins.icon
        const toneCfg = ins.type === 'win'
          ? { bg: 'bg-emerald-500/12', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' }
          : ins.type === 'risk'
          ? { bg: 'bg-rose-500/12', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/20' }
          : { bg: 'bg-amber-500/12', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/20' }
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.4) }}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3 ring-1 transition-colors hover:bg-accent/30',
              toneCfg.ring,
            )}
          >
            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', toneCfg.bg, toneCfg.text)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-snug text-foreground/90">{ins.text}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PriorityPill priority={ins.priority} />
                <span className={cn('text-[10px] font-semibold uppercase tracking-wide', toneCfg.text)}>
                  {ins.type}
                </span>
                {ins.action && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => toast.success(ins.action!, { description: 'AI agent notified' })}
                  >
                    <Zap className="size-3" /> {ins.action}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// =================================================================
// memory card
// =================================================================

function MemoryCard({ memory }: { memory: GuestMemory }) {
  const cat = MEMORY_CATEGORIES[memory.category]
  const Icon = cat.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-xl border bg-card/60 p-3.5 transition-all hover:shadow-md"
      style={{ borderColor: cat.color + '40' }}
    >
      <div
        className="absolute -right-5 -top-5 size-20 rounded-full blur-2xl"
        style={{ backgroundColor: cat.color + '22' }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: cat.bg, color: cat.color }}
          >
            <Icon className="size-4" />
          </div>
          {memory.auto && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
              <Sparkles className="size-2.5" /> AI-learned
            </span>
          )}
        </div>
        <p className="mt-2.5 text-sm leading-snug text-foreground/90">{memory.content}</p>
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Zap className="size-2.5" /> Used {memory.timesUsed}×
          </span>
          {memory.lastUsed && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-2.5" /> {memory.lastUsed}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// =================================================================
// add memory dialog
// =================================================================

function AddMemoryDialog({ guestName }: { guestName: string }) {
  const [open, setOpen] = React.useState(false)
  const [category, setCategory] = React.useState<GuestMemory['category']>('preference')
  const [content, setContent] = React.useState('')

  const handleSave = () => {
    const trimmed = content.trim()
    if (!trimmed) {
      toast.error('Memory content cannot be empty')
      return
    }
    toast.success('Memory saved — AI will use it proactively', {
      description: `${MEMORY_CATEGORIES[category].label} · "${trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed}"`,
    })
    setContent('')
    setCategory('preference')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)} className="shrink-0">
        <Plus className="size-3.5" /> Add memory
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="size-4 text-violet-500" /> Add guest memory
          </DialogTitle>
          <DialogDescription>
            The AI will use this memory proactively for {guestName} — e.g. pre-assigning rooms, pre-notifying the kitchen, or personalizing outreach.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as GuestMemory['category'])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMORY_CATEGORY_ORDER.map((c) => {
                  const cfg = MEMORY_CATEGORIES[c]
                  const Icon = cfg.icon
                  return (
                    <SelectItem key={c} value={c}>
                      <span className="inline-flex items-center gap-2">
                        <Icon className="size-3.5" style={{ color: cfg.color }} />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Memory content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Prefers a quiet room away from the elevator — sensitive to noise."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            <Sparkles className="size-3.5" /> Save memory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =================================================================
// timeline (kept from V1)
// =================================================================

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No timeline activity yet
      </div>
    )
  }

  return (
    <div className="relative pl-9">
      {/* vertical line */}
      <div className="absolute left-[18px] top-3 bottom-3 w-px bg-gradient-to-b from-orange-500/50 via-border to-transparent" />
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {entries.map((entry, i) => {
            const cfg = TIMELINE_ICONS[entry.type] ?? TIMELINE_ICONS['Reservation']
            const Icon = cfg.icon
            const sentimentColor = entry.sentiment ? SENTIMENT_COLORS[entry.sentiment] : undefined
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
                className="relative"
              >
                {/* node */}
                <div
                  className="absolute -left-9 top-2.5 flex size-7 items-center justify-center rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  <Icon className="size-3.5" />
                  {sentimentColor && (
                    <span
                      className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border border-background"
                      style={{ backgroundColor: sentimentColor }}
                    />
                  )}
                </div>
                {/* card */}
                <Card className="p-3 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-tight">{entry.title}</p>
                        <span className="shrink-0 rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                          {entry.type}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="mt-1 text-xs text-muted-foreground leading-snug">{entry.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                      {relativeDate(entry.date)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {entry.channel && (
                      <SourceBadge
                        source={entry.channel}
                        color={SOURCE_COLORS[entry.channel as BookingSource] ?? '#6b7280'}
                      />
                    )}
                    {entry.sentiment && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: sentimentColor + '1f',
                          color: sentimentColor,
                        }}
                      >
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: sentimentColor }} />
                        {entry.sentiment}
                      </span>
                    )}
                    {typeof entry.value === 'number' && entry.value > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Wallet className="size-3" /> {fmtMoney(entry.value)}
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// =================================================================
// tab: overview
// =================================================================

function OverviewTab({ guest }: { guest: Guest }) {
  const ota = isOta(guest.bookingSource)
  const reservations = React.useMemo(
    () => RESERVATIONS.filter((r) => r.guestId === guest.id),
    [guest.id],
  )

  const aiSuggestedTags = React.useMemo(() => {
    const tags: string[] = []
    if (ota) tags.push('OTA conversion opportunity')
    if (guest.loyaltyTier === 'VIP' || guest.loyaltyTier === 'Gold') tags.push('High-value retention')
    if (guest.lastStay) {
      const days = Math.round((Date.now() - new Date(guest.lastStay + 'T00:00:00').getTime()) / 86400000)
      if (days > 180) tags.push('Lapsed — win-back')
      else if (days < 60) tags.push('Recent guest')
    }
    if (guest.travelReason === 'Business') tags.push('Business traveler')
    if (guest.countryCode !== 'GH') tags.push('International outreach')
    if (guest.birthday) {
      const [m, d] = guest.birthday.split('-')
      const today = new Date()
      const bm = Number(m), bd = Number(d)
      const next = new Date(today.getFullYear(), bm - 1, bd)
      if (next < today) next.setFullYear(today.getFullYear() + 1)
      const daysToBday = Math.round((next.getTime() - today.getTime()) / 86400000)
      if (daysToBday <= 45) tags.push('Birthday soon 🎂')
    }
    if (guest.avgRatingGiven && guest.avgRatingGiven >= 4.5) tags.push('Brand advocate')
    return tags.slice(0, 4)
  }, [guest, ota])

  const doToast = (label: string) => toast.success(label, {
    description: `${guest.name} · ${fmtDate(new Date().toISOString().slice(0, 10))}`,
  })

  return (
    <div className="space-y-4">
      {/* stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Lifetime Spend"
          value={fmtMoneyShort(guest.lifetimeSpend)}
          accent="brand"
          icon={<Wallet className="size-5" />}
        />
        <StatCard
          label="Total Stays"
          value={String(guest.totalStays)}
          accent="teal"
          icon={<Calendar className="size-5" />}
        />
        <StatCard
          label="Repeat Visits"
          value={String(guest.repeatVisits)}
          accent="gold"
          icon={<Repeat className="size-5" />}
        />
        <StatCard
          label="Loyalty Points"
          value={guest.loyaltyPoints.toLocaleString()}
          accent="violet"
          icon={<Gift className="size-5" />}
        />
        <StatCard
          label="Avg Rating"
          value={guest.avgRatingGiven ? `${guest.avgRatingGiven}★` : '—'}
          accent="rose"
          icon={<Star className="size-5" />}
        />
      </div>

      {/* action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => doToast('WhatsApp drafted to guest')}>
          <MessageCircle className="size-3.5" /> Send WhatsApp
        </Button>
        <Button size="sm" variant="outline" onClick={() => doToast('Guest added to campaign')}>
          <PlusCircle className="size-3.5" /> Add to Campaign
        </Button>
        <Button size="sm" variant="outline" onClick={() => doToast('Direct-booking link sent')}>
          <Zap className="size-3.5" /> Book Direct
        </Button>
        <Button size="sm" variant="outline" onClick={() => doToast(`Opened ${reservations.length} reservations`)}>
          <Calendar className="size-3.5" /> View Reservations
        </Button>
      </div>

      {/* spend chart */}
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Spend per Stay</h3>
            <p className="text-xs text-muted-foreground">
              {reservations.length} reservations · {fmtMoney(guest.lifetimeSpend)} lifetime
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600 dark:text-orange-400">
            <Sparkles className="size-3" /> AI insight
          </span>
        </div>
        <SpendChart guestId={guest.id} accent={guest.avatarColor} />
      </Card>

      {/* info grid */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Profile Details</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <InfoItem icon={Phone} label="Phone" value={guest.phone} />
          <InfoItem icon={Mail} label="Email" value={guest.email} />
          <InfoItem icon={BedDouble} label="Favorite Room" value={guest.favoriteRoom} />
          <InfoItem icon={Globe} label="Travel Reason" value={guest.travelReason} />
          <InfoItem icon={UtensilsCrossed} label="Dietary Preferences" value={guest.dietaryPreferences} />
          <InfoItem icon={Cake} label="Birthday" value={guest.birthday ? `${guest.birthday} (MM-DD)` : undefined} />
          <InfoItem icon={Heart} label="Anniversary" value={guest.anniversary ? `${guest.anniversary} (MM-DD)` : undefined} />
          <InfoItem icon={Users} label="Family Members" value={guest.familyMembers ? String(guest.familyMembers) : undefined} />
          <InfoItem icon={Bookmark} label="Referral Source" value={guest.referralSource} />
          <InfoItem icon={NotebookPen} label="Special Requests" value={guest.specialRequests} />
          <InfoItem icon={Clock} label="First Seen" value={fmtDate(guest.firstSeen)} />
          <InfoItem icon={Calendar} label="Last Stay" value={guest.lastStay ? fmtDate(guest.lastStay) : undefined} />
        </div>
      </Card>

      {/* segments & tags */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Segments &amp; Tags</h3>
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Segments</p>
            <div className="flex flex-wrap gap-1.5">
              {guest.segments.length > 0 ? (
                guest.segments.map((s) => (
                  <Chip key={s} tone="brand"><Users className="size-3" /> {s}</Chip>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No segments assigned</span>
              )}
            </div>
          </div>
          <Separator />
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {guest.tags.length > 0 ? (
                guest.tags.map((t) => (
                  <Chip key={t} tone="teal"><Bookmark className="size-3" /> {t}</Chip>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No tags yet</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* AI enrichment banner */}
      <Card className="relative overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-teal-500/8 p-4">
        <div className="absolute right-3 top-3 size-2 rounded-full bg-emerald-500 ai-pulse" />
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">AI continuously enriches this profile</p>
            <p className="text-xs text-muted-foreground">
              Last enriched 2h ago · Yaw (Guest Success Manager) is monitoring signals
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {aiSuggestedTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/8 px-2 py-0.5 text-[11px] font-medium text-orange-700 dark:text-orange-300"
                >
                  <Lightbulb className="size-3" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// =================================================================
// tab: journey (V2 centerpiece)
// =================================================================

function JourneyTab({ guest }: { guest: Guest }) {
  const steps = React.useMemo(() => journeyForGuest(guest.id), [guest.id])
  const insights = React.useMemo(() => buildJourneyInsights(guest, steps), [guest, steps])

  const gained = React.useMemo(
    () => steps
      .filter((s) => s.status === 'complete' && typeof s.value === 'number')
      .reduce((sum, s) => sum + (s.value ?? 0), 0),
    [steps],
  )
  const lost = React.useMemo(() => {
    const exp = steps.find((s) => s.stage === 'experiences')
    return exp?.status === 'lost' ? 630 : 0
  }, [steps])

  const completeCount = steps.filter((s) => s.status === 'complete').length
  const currentCount = steps.filter((s) => s.status === 'current').length
  const lostCount = steps.filter((s) => s.status === 'lost').length

  return (
    <div className="space-y-4">
      {/* journey map card */}
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br from-orange-500/12 to-amber-500/4 blur-3xl" />
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Route className="size-4 text-orange-500" /> Guest Journey Map
              </h3>
              <p className="text-xs text-muted-foreground">
                {completeCount} complete · {currentCount} current · {lostCount} lost · 10 stages
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {gained > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-3" /> {fmtMoneyShort(gained)} gained
                </span>
              )}
              {lost > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <TrendingDown className="size-3" /> {fmtMoneyShort(lost)} lost
                </span>
              )}
            </div>
          </div>

          {/* legend */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" /> Complete
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-orange-500" /> Current
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-muted-foreground/40" /> Upcoming
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-500" /> Lost
            </span>
          </div>

          <JourneyMap steps={steps} />
        </div>
      </Card>

      {/* journey insights card */}
      <Card className="relative overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-500/6 via-orange-500/4 to-amber-500/6 p-5">
        <div className="absolute right-3 top-3 size-2 rounded-full bg-violet-500 ai-pulse" />
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
            <Brain className="size-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Journey insights</h3>
            <p className="text-xs text-muted-foreground">
              AI observations on revenue gained, opportunities lost, and next-best actions
            </p>
          </div>
        </div>
        <JourneyInsights insights={insights} />
      </Card>
    </div>
  )
}

// =================================================================
// tab: memory (V2)
// =================================================================

function MemoryTab({ guest }: { guest: Guest }) {
  const memories = React.useMemo(() => memoriesForGuest(guest.id), [guest.id])

  const grouped = React.useMemo(() => {
    const map = new Map<GuestMemory['category'], GuestMemory[]>()
    for (const m of memories) {
      if (!map.has(m.category)) map.set(m.category, [])
      map.get(m.category)!.push(m)
    }
    return map
  }, [memories])

  return (
    <div className="space-y-4">
      {/* AI proactive banner */}
      <Card className="relative overflow-hidden border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-orange-500/6 to-teal-500/8 p-4">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-2xl" />
        <div className="absolute right-3 top-3 size-2 rounded-full bg-emerald-500 ai-pulse" />
        <div className="relative flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
            <Brain className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">The AI proactively uses these memories</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
              e.g. pre-assigning Room 101 before check-in, pre-notifying the kitchen of allergies, or
              personalizing a birthday reward — automatically, no staff action required.
            </p>
          </div>
        </div>
      </Card>

      {/* header + add button */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-violet-500" /> AI Memory
          </h3>
          <p className="text-xs text-muted-foreground">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} across {grouped.size} {grouped.size === 1 ? 'category' : 'categories'}
          </p>
        </div>
        <AddMemoryDialog guestName={guest.name} />
      </div>

      {/* memory groups or empty state */}
      {memories.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-500">
            <Brain className="size-7" />
          </div>
          <div>
            <p className="text-sm font-semibold">The AI is still learning about this guest</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              As {guest.name.split(' ')[0]} interacts with the lodge — bookings, WhatsApp messages,
              special requests — the AI will build a memory profile to personalize every future stay.
            </p>
          </div>
          <AddMemoryDialog guestName={guest.name} />
        </Card>
      ) : (
        <div className="space-y-5">
          {MEMORY_CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat)
            if (!items || items.length === 0) return null
            const cfg = MEMORY_CATEGORIES[cat]
            const Icon = cfg.icon
            return (
              <div key={cat}>
                <div className="mb-2.5 flex items-center gap-2">
                  <div
                    className="flex size-6 items-center justify-center rounded-md"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
                    {cfg.label}
                  </h4>
                  <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {items.length}
                  </span>
                  <Separator className="flex-1" />
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((m) => (
                    <MemoryCard key={m.id} memory={m} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// =================================================================
// tab: timeline (kept from V1)
// =================================================================

function TimelineTab({ guest }: { guest: Guest }) {
  const timeline = React.useMemo(() => timelineForGuest(guest.id), [guest.id])
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Customer Timeline</h3>
          <p className="text-xs text-muted-foreground">
            {timeline.length} interactions across all channels · newest first
          </p>
        </div>
        <StatusPill status="Live" />
      </div>
      <Timeline entries={timeline} />
    </Card>
  )
}

// =================================================================
// profile panel (tabbed)
// =================================================================

function GuestProfile({ guest, onBack }: { guest: Guest; onBack: () => void }) {
  const [tab, setTab] = React.useState('overview')
  const ota = isOta(guest.bookingSource)

  return (
    <div className="lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto scroll-area-fancy lg:pr-1">
      {/* Mobile back button */}
      <Button variant="outline" size="sm" onClick={onBack} className="mb-3 lg:hidden">
        <ArrowLeft className="size-4" /> Back to list
      </Button>

      {/* Header */}
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-3xl" />
        <div className="absolute -left-8 -bottom-12 size-32 rounded-full bg-gradient-to-br from-teal-500/10 to-transparent blur-3xl" />
        <div className="relative flex items-start gap-4">
          <Avatar className="size-16 shrink-0 border-2 border-background shadow-md">
            <AvatarFallback
              className="text-xl font-bold text-white"
              style={{ backgroundColor: guest.avatarColor }}
            >
              {initials(guest.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{guest.name}</h2>
              <TierBadge tier={guest.loyaltyTier} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="text-base leading-none">{flagEmoji(guest.countryCode)}</span>
                <span>{guest.country}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Languages className="size-3" /> {guest.language}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> Last stay {guest.lastStay ? relativeDate(guest.lastStay) : '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Repeat className="size-3" /> {guest.repeatVisits} repeat visits
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {ota ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3" /> OTA — convert to direct
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Booked via {guest.bookingSource}. Send a direct-booking incentive.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
                  <BadgeCheck className="size-3" /> Direct guest
                </span>
              )}
              <SourceBadge
                source={guest.bookingSource}
                color={SOURCE_COLORS[guest.bookingSource] ?? '#6b7280'}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabbed panel */}
      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <div className="sticky top-0 z-20 -mx-1 px-1 py-1">
          <TabsList className="grid w-full grid-cols-4 bg-background/90 backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <LayoutDashboard className="size-3.5" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="journey" className="gap-1.5 text-xs sm:text-sm">
              <Route className="size-3.5 text-orange-500" />
              <span>Journey</span>
            </TabsTrigger>
            <TabsTrigger value="memory" className="gap-1.5 text-xs sm:text-sm">
              <Brain className="size-3.5 text-violet-500" />
              <span>Memory</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5 text-xs sm:text-sm">
              <Clock className="size-3.5" />
              <span>Timeline</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab guest={guest} />
        </TabsContent>
        <TabsContent value="journey" className="mt-4">
          <JourneyTab guest={guest} />
        </TabsContent>
        <TabsContent value="memory" className="mt-4">
          <MemoryTab guest={guest} />
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          <TimelineTab guest={guest} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// =================================================================
// main module
// =================================================================

export function GuestsModule() {
  const { selectedGuestId, openGuest } = useApp()
  const [search, setSearch] = React.useState('')
  const [tierFilter, setTierFilter] = React.useState<string>('all')
  const [segmentFilter, setSegmentFilter] = React.useState<string>('all')
  const [mobileView, setMobileView] = React.useState<'list' | 'detail'>(
    selectedGuestId ? 'detail' : 'list',
  )

  // Default to highest lifetimeSpend guest when nothing selected (desktop auto-pick)
  const defaultGuestId = React.useMemo(
    () => [...GUESTS].sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)[0]?.id,
    [],
  )
  const effectiveId = selectedGuestId ?? defaultGuestId

  // If a guest was opened externally (e.g. from dashboard), switch mobile to detail
  React.useEffect(() => {
    if (selectedGuestId) setMobileView('detail')
  }, [selectedGuestId])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return GUESTS.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false
      if (tierFilter !== 'all' && g.loyaltyTier !== tierFilter) return false
      if (segmentFilter !== 'all' && !g.segments.includes(segmentFilter as Guest['segments'][number])) return false
      return true
    }).sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
  }, [search, tierFilter, segmentFilter])

  const selectedGuest = React.useMemo(
    () => GUESTS.find((g) => g.id === effectiveId) ?? null,
    [effectiveId],
  )

  const handleSelect = (id: string) => {
    openGuest(id)
    setMobileView('detail')
  }

  const handleBack = () => setMobileView('list')

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Guests CRM"
        description="AI-enriched guest profiles · journey maps · AI memory"
        action={
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex">
            <Users className="size-3.5 text-orange-500" />
            <span className="font-medium text-foreground">{GUESTS.length}</span> total guests
            <span className="text-border">·</span>
            <span className="font-medium text-foreground">{GUESTS.filter((g) => g.loyaltyTier === 'VIP').length}</span> VIP
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        {/* LEFT: guest list */}
        <Card
          className={cn(
            'flex flex-col p-3 lg:max-h-[calc(100vh-12rem)]',
            mobileView === 'detail' ? 'hidden lg:flex' : 'flex',
          )}
        >
          {/* filters */}
          <div className="space-y-2 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guests by name…"
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  {TIERS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All segments</SelectItem>
                  {SEGMENTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="px-1 text-[11px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {GUESTS.length}
            </p>
          </div>
          <Separator className="mb-2" />
          {/* list */}
          <div className="min-h-0 flex-1 overflow-y-auto scroll-area-fancy pr-1">
            <div className="space-y-1.5">
              {filtered.map((g) => (
                <GuestListItem
                  key={g.id}
                  guest={g}
                  selected={g.id === effectiveId}
                  onSelect={() => handleSelect(g.id)}
                />
              ))}
              {filtered.length === 0 && (
                <div className="flex h-32 flex-col items-center justify-center gap-1 text-center">
                  <Search className="size-5 text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground">No guests match your filters</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setSearch(''); setTierFilter('all'); setSegmentFilter('all') }}
                  >
                    Reset filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* RIGHT: profile panel */}
        <div className={cn(mobileView === 'list' ? 'hidden lg:block' : 'block')}>
          <AnimatePresence mode="wait">
            {selectedGuest ? (
              <motion.div
                key={selectedGuest.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <GuestProfile guest={selectedGuest} onBack={handleBack} />
              </motion.div>
            ) : (
              <Card className="p-10 text-center text-muted-foreground">
                <Users className="mx-auto mb-2 size-6 text-muted-foreground/60" />
                <p className="text-sm">Select a guest to view their profile</p>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
