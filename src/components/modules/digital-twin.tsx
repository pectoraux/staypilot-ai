'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipTrigger, TooltipContent,
} from '@/components/ui/tooltip'
import { SectionHeader, StatusPill } from '@/components/shared'
import { DIGITAL_TWIN } from '@/lib/data-v2'
import {
  ROOMS, RESERVATIONS, GUESTS, CAMPAIGNS, CHANNELS, REVIEWS, EXPERIENCES,
  CORPORATE, MAINTENANCE, AI_AGENTS, PROPERTY,
} from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtDate } from '@/lib/format'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Box, Activity, Brain, Sparkles, BedDouble, CalendarCheck, Users, Megaphone,
  Radio, UserCog, Wrench, Star, MapPin, Building2, TrendingUp, Zap, Clock,
  CheckCircle2, AlertCircle, ArrowRight, Cpu, Wifi, Eye, RefreshCw, Layers, Bot,
} from 'lucide-react'

// ----------------- entity category config -----------------
type CategoryKey =
  | 'rooms' | 'bookings' | 'guests' | 'campaigns' | 'channels'
  | 'staff' | 'maintenance' | 'reviews' | 'experiences' | 'corporate'

interface CategoryDef {
  key: CategoryKey
  label: string
  icon: React.ReactNode
  color: string // hex
  angle: number // degrees, where it sits in the orbit
  count: number
  trend: number
  subtitle: string
}

const STAFF_COUNT = AI_AGENTS.length

const CATEGORIES: CategoryDef[] = [
  { key: 'rooms',        label: 'Rooms',        icon: <BedDouble className="h-4 w-4" />,   color: '#ea580c', angle: -90, count: DIGITAL_TWIN.rooms,             trend: 0,  subtitle: `${ROOMS.filter(r => r.status === 'Occupied').length} occupied` },
  { key: 'bookings',     label: 'Bookings',     icon: <CalendarCheck className="h-4 w-4" />, color: '#b45309', angle: -54, count: DIGITAL_TWIN.activeBookings,    trend: 8,  subtitle: 'checked-in + confirmed' },
  { key: 'guests',       label: 'Guests',       icon: <Users className="h-4 w-4" />,       color: '#0d9488', angle: -18, count: DIGITAL_TWIN.totalGuests,       trend: 5,  subtitle: `${DIGITAL_TWIN.vipGuests} VIP` },
  { key: 'campaigns',    label: 'Campaigns',    icon: <Megaphone className="h-4 w-4" />,   color: '#be123c', angle: 18,  count: DIGITAL_TWIN.activeCampaigns,   trend: 12, subtitle: 'live marketing' },
  { key: 'channels',     label: 'Channels',     icon: <Radio className="h-4 w-4" />,       color: '#9333ea', angle: 54,  count: DIGITAL_TWIN.connectedChannels, trend: 0,  subtitle: 'synced & live' },
  { key: 'staff',        label: 'Staff',        icon: <UserCog className="h-4 w-4" />,     color: '#15803d', angle: 90,  count: STAFF_COUNT,                    trend: 0,  subtitle: `${DIGITAL_TWIN.activeAgents} AI active` },
  { key: 'maintenance',  label: 'Maintenance',  icon: <Wrench className="h-4 w-4" />,      color: '#a16207', angle: 126, count: DIGITAL_TWIN.openIssues,         trend: -3, subtitle: 'open issues' },
  { key: 'reviews',      label: 'Reviews',      icon: <Star className="h-4 w-4" />,        color: '#0e7490', angle: 162, count: DIGITAL_TWIN.activeReviews,      trend: 4,  subtitle: 'across platforms' },
  { key: 'experiences',  label: 'Experiences',  icon: <MapPin className="h-4 w-4" />,      color: '#c2410c', angle: 198, count: DIGITAL_TWIN.experiences,        trend: 6,  subtitle: 'bookable add-ons' },
  { key: 'corporate',    label: 'Corporate',    icon: <Building2 className="h-4 w-4" />,   color: '#6b7280', angle: 234, count: DIGITAL_TWIN.corporateAccounts,  trend: 2,  subtitle: 'B2B accounts' },
]

// ----------------- entity side-panel content -----------------
function useCategoryItems(key: CategoryKey) {
  switch (key) {
    case 'rooms': {
      return ROOMS.slice(0, 5).map(r => ({
        id: r.id,
        title: `Room ${r.number} · ${r.name}`,
        subtitle: `${r.type} · Floor ${r.floor} · ₵${r.baseRate}/night`,
        trail: r.status,
      }))
    }
    case 'bookings': {
      return RESERVATIONS
        .filter(r => r.status === 'Checked-in' || r.status === 'Confirmed')
        .slice(0, 5)
        .map(r => ({
          id: r.id,
          title: `${r.guestName} · ${r.source}`,
          subtitle: `${fmtDate(r.checkIn)} → ${fmtDate(r.checkOut)}`,
          trail: r.status,
        }))
    }
    case 'guests': {
      return GUESTS.slice(0, 5).map(g => ({
        id: g.id,
        title: g.name,
        subtitle: `${g.country} · ${g.totalStays} stays · ${g.loyaltyTier}`,
        trail: g.loyaltyTier,
      }))
    }
    case 'campaigns': {
      return CAMPAIGNS.filter(c => c.status === 'Active' || c.status === 'Scheduled').slice(0, 5).map(c => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.channel} · ${c.audienceSize} guests · ${c.discount}% off`,
        trail: c.status,
      }))
    }
    case 'channels': {
      return CHANNELS.filter(c => c.connected).slice(0, 5).map(c => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.type} · ${c.bookingsThisMonth} bookings · ${c.syncStatus}`,
        trail: c.syncStatus,
      }))
    }
    case 'staff': {
      return AI_AGENTS.slice(0, 5).map(a => ({
        id: a.id,
        title: `${a.avatar} ${a.name}`,
        subtitle: `${a.role} · ${a.tasksCompleted} tasks`,
        trail: a.status,
      }))
    }
    case 'maintenance': {
      return MAINTENANCE.slice(0, 5).map(m => ({
        id: m.id,
        title: `Room ${m.roomNumber} · ${m.title}`,
        subtitle: `${m.priority} · ${m.status} · ₵${m.estimatedCost}`,
        trail: m.status,
      }))
    }
    case 'reviews': {
      return REVIEWS.slice(0, 5).map(r => ({
        id: r.id,
        title: `${r.guestName} · ${r.platform} · ${r.rating}★`,
        subtitle: r.text.slice(0, 60) + (r.text.length > 60 ? '…' : ''),
        trail: r.responded ? 'Responded' : 'Pending',
      }))
    }
    case 'experiences': {
      return EXPERIENCES.slice(0, 5).map(e => ({
        id: e.id,
        title: e.name,
        subtitle: `${e.category} · ₵${e.price} · ${e.rating}★`,
        trail: `${e.bookingsThisMonth} bookings`,
      }))
    }
    case 'corporate': {
      return CORPORATE.slice(0, 5).map(c => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.type} · ${c.totalBookings} bookings · ₵${c.totalRevenue.toLocaleString()}`,
        trail: c.status,
      }))
    }
  }
}

// ----------------- tiny inline sparkline (SVG) -----------------
function Sparkline({ color, trend }: { color: string; trend: number }) {
  // deterministic 7-point shape derived from trend sign
  const pts = Array.from({ length: 7 }, (_, i) => {
    const seed = (i + 1) * 9301 + Math.abs(trend) * 49297
    const r = ((seed % 233280) / 233280) * 2 - 1
    return 50 + r * 18 + (trend >= 0 ? i * 2.5 : -i * 2.5)
  })
  const w = 56
  const h = 18
  const d = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w
    const y = h - (Math.max(20, Math.min(80, p)) / 100) * h
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const gid = `spark-${color.replace('#', '')}`
  return (
    <svg width={w} height={h} className="opacity-80">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ----------------- animated big number -----------------
function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [display, setDisplay] = React.useState(0)
  const ref = React.useRef<number | null>(null)
  React.useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = 0
    const to = value
    const dur = 900
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    ref.current = raf
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{format(display)}</>
}

// ----------------- Live metric tile -----------------
function LiveMetricTile({
  label, value, format, icon, color, sub,
}: { label: string; value: number; format: (n: number) => string; icon: React.ReactNode; color: string; sub: string }) {
  return (
    <Card className="p-4 relative overflow-hidden gap-0">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-50" style={{ backgroundColor: color + '22' }} />
      <div className="relative flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: color + '1a', color }}>
          {icon}
        </span>
      </div>
      <p className="relative mt-1 text-2xl font-bold tracking-tight tabular-nums">
        <AnimatedNumber value={value} format={format} />
      </p>
      <p className="relative text-[11px] text-muted-foreground">{sub}</p>
    </Card>
  )
}

// ----------------- Entity orbit (central visualization) -----------------
function EntityOrbit({
  selected, onSelect,
}: { selected: CategoryKey | null; onSelect: (k: CategoryKey | null) => void }) {
  // We render the orbit as an absolutely-positioned set of cards over a responsive square.
  // Center is the property.
  return (
    <Card className="relative overflow-hidden p-0 gap-0">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-teal-500/10" />
      <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-orange-500/15 sm:h-[360px] sm:w-[360px]" />
      <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-teal-500/10 sm:h-[260px] sm:w-[260px]" />

      {/* center property */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              type="button"
              onClick={() => onSelect(null)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="group flex h-24 w-24 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
            >
              <span className="text-2xl sm:text-3xl">🏡</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-90">Property</span>
              <span className="text-[9px] opacity-80 max-w-[80px] truncate">{PROPERTY.name}</span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="top">{PROPERTY.name} · {PROPERTY.location}</TooltipContent>
        </Tooltip>
        {/* pulse rings */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-orange-500/30"
          animate={{ scale: [1, 1.45], opacity: [0.45, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
      </div>

      {/* category cards around the orbit */}
      {CATEGORIES.map((cat, i) => {
        const radius = 140 // % offset from center (px equivalent in 360px square)
        const rad = (cat.angle * Math.PI) / 180
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius
        const isSelected = selected === cat.key
        return (
          <motion.button
            type="button"
            key={cat.key}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 220, damping: 18 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => onSelect(isSelected ? null : cat.key)}
            className={`absolute left-1/2 top-1/2 z-10 w-[120px] sm:w-[140px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-xl border bg-card/95 backdrop-blur-sm p-2.5 text-left transition-colors ${
              isSelected ? 'border-orange-500/60 shadow-lg shadow-orange-500/20' : 'border-border hover:border-orange-500/40'
            }`}
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: cat.color + '1a', color: cat.color }}>
                {cat.icon}
              </span>
              <Sparkline color={cat.color} trend={cat.trend} />
            </div>
            <p className="mt-1.5 text-lg font-bold leading-none tabular-nums">{cat.count}</p>
            <p className="text-[11px] font-medium leading-tight">{cat.label}</p>
            <p className="text-[9.5px] text-muted-foreground leading-tight truncate">{cat.subtitle}</p>
          </motion.button>
        )
      })}

      {/* overlay legend / instructions */}
      <div className="relative z-0 flex flex-col items-start justify-between gap-2 p-4 sm:p-5 h-[440px] sm:h-[520px]">
        <div className="flex items-center gap-2 self-end">
          <Badge variant="outline" className="bg-background/60 backdrop-blur-sm text-[10px]">
            <Eye className="h-2.5 w-2.5 mr-1 text-orange-500" /> Click an entity to inspect
          </Badge>
        </div>
        <div className="self-end text-[10px] text-muted-foreground">
          The AI reasons over this live twin — not isolated records.
        </div>
      </div>
    </Card>
  )
}

// ----------------- Side panel listing real items -----------------
function CategorySidePanel({ category, onClose }: { category: CategoryKey; onClose: () => void }) {
  const def = CATEGORIES.find(c => c.key === category)!
  const items = useCategoryItems(category)
  return (
    <Card className="p-5 gap-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: def.color + '1a', color: def.color }}>
            {def.icon}
          </span>
          <div>
            <p className="font-semibold leading-tight">{def.label}</p>
            <p className="text-[11px] text-muted-foreground">{def.count} live · {def.subtitle}</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onClose}>Close</Button>
      </div>
      <Separator className="my-3" />
      <ScrollArea className="max-h-80 pr-2">
        <div className="space-y-2">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-border bg-card/60 p-2.5 hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold leading-tight">{it.title}</p>
                <StatusPill status={it.trail} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{it.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
      <Button
        size="sm"
        variant="outline"
        className="mt-3 h-8 w-full text-xs"
        onClick={() => toast.info(`Opening ${def.label} module`, { description: 'Routing to the full live view…' })}
      >
        Open full {def.label} view <ArrowRight className="h-3 w-3" />
      </Button>
    </Card>
  )
}

// ----------------- 9-tile entity counts grid -----------------
function EntityCountsGrid() {
  const tiles = [
    { label: 'Rooms',           value: DIGITAL_TWIN.rooms,             icon: <BedDouble className="h-4 w-4" />,    color: '#ea580c' },
    { label: 'Active Bookings', value: DIGITAL_TWIN.activeBookings,    icon: <CalendarCheck className="h-4 w-4" />, color: '#b45309' },
    { label: 'Total Guests',    value: DIGITAL_TWIN.totalGuests,       icon: <Users className="h-4 w-4" />,        color: '#0d9488' },
    { label: 'VIP Guests',      value: DIGITAL_TWIN.vipGuests,         icon: <Sparkles className="h-4 w-4" />,     color: '#a16207' },
    { label: 'Active Campaigns',value: DIGITAL_TWIN.activeCampaigns,   icon: <Megaphone className="h-4 w-4" />,    color: '#be123c' },
    { label: 'Connected Channels', value: DIGITAL_TWIN.connectedChannels, icon: <Radio className="h-4 w-4" />,    color: '#9333ea' },
    { label: 'Open Issues',     value: DIGITAL_TWIN.openIssues,         icon: <AlertCircle className="h-4 w-4" />,  color: '#a16207' },
    { label: 'Cleaning Tasks',  value: DIGITAL_TWIN.cleaningTasks,      icon: <Wrench className="h-4 w-4" />,       color: '#c2410c' },
    { label: 'Active Agents',   value: DIGITAL_TWIN.activeAgents,       icon: <Cpu className="h-4 w-4" />,          color: '#15803d' },
  ]
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-orange-500" />
          <h3 className="font-semibold text-sm">Entity Inventory</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">9 entities tracked</Badge>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-card/50 p-3 text-center hover:border-orange-500/30 transition-colors">
            <span className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: t.color + '1a', color: t.color }}>
              {t.icon}
            </span>
            <p className="text-xl font-bold tabular-nums leading-none">{t.value}</p>
            <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{t.label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ----------------- "What the AI sees right now" narrative -----------------
function AiNarrativeCard() {
  const dt = DIGITAL_TWIN
  const occ = dt.liveMetrics.occupancyNow
  const todayRev = dt.liveMetrics.revenueToday
  const inquiries = dt.liveMetrics.inquiriesToday
  const aiActions = dt.liveMetrics.aiActionsToday
  const autoActions = dt.liveMetrics.autoActionsToday
  const pending = dt.liveMetrics.approvalsPending

  const narrative = `${dt.rooms} rooms, ${dt.activeBookings} active bookings, ${dt.totalGuests} guests (${dt.vipGuests} VIP), ${dt.activeCampaigns} campaigns running, ${dt.openIssues} open issues. The AI is tracking ${inquiries} inquiries and has taken ${aiActions} actions today (${autoActions} automatic). ${pending} approvals are awaiting your review.`

  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">What the AI sees right now</h3>
            <p className="text-[11px] text-muted-foreground">A synthesized twin-state narrative · auto-refreshed every 30s</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px] bg-background/60 backdrop-blur-sm">
            <Sparkles className="h-2.5 w-2.5 mr-1 text-orange-500" /> live
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          <span className="font-semibold text-orange-600 dark:text-orange-400">Akwaaba</span> is at{' '}
          <span className="font-semibold">{occ}%</span> occupancy with{' '}
          <span className="font-semibold text-teal-600 dark:text-teal-400">{fmtMoney(todayRev)}</span> booked today.{' '}
          {narrative}
        </p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-lg bg-orange-500/10 p-2">
            <p className="text-[10px] text-muted-foreground">Revenue Today</p>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{fmtMoney(todayRev)}</p>
          </div>
          <div className="rounded-lg bg-teal-500/10 p-2">
            <p className="text-[10px] text-muted-foreground">Inquiries Today</p>
            <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">{inquiries}</p>
          </div>
          <div className="rounded-lg bg-violet-500/10 p-2">
            <p className="text-[10px] text-muted-foreground">AI Actions Today</p>
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">{aiActions} <span className="text-[10px] font-normal text-muted-foreground">({autoActions} auto)</span></p>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-2">
            <p className="text-[10px] text-muted-foreground">Approvals Pending</p>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{pending}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ----------------- Module -----------------
export function DigitalTwinModule() {
  const [selected, setSelected] = React.useState<CategoryKey | null>(null)
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const lm = DIGITAL_TWIN.liveMetrics

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Digital Twin · Live Business Model"
        description="A live digital model of your entire business. The AI reasons over this twin instead of isolated records."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
            <Button size="sm" variant="outline" onClick={() => { setTick(t => t + 1); toast.success('Digital Twin re-synced', { description: 'All entity counts refreshed from live sources.' }) }}>
              <RefreshCw className="h-3.5 w-3.5" /> Re-sync
            </Button>
          </div>
        }
      />

      {/* Live metrics dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <LiveMetricTile label="Occupancy Now"     value={lm.occupancyNow}     format={(n) => `${n}%`}                 icon={<Activity className="h-4 w-4" />}    color="#ea580c" sub={`${Math.round(DIGITAL_TWIN.rooms * lm.occupancyNow / 100)}/${DIGITAL_TWIN.rooms} rooms`} />
        <LiveMetricTile label="Revenue Today"     value={lm.revenueToday}     format={(n) => fmtMoneyShort(n)}        icon={<TrendingUp className="h-4 w-4" />}  color="#0d9488" sub="booked so far" />
        <LiveMetricTile label="Inquiries Today"   value={lm.inquiriesToday}   format={(n) => `${n}`}                  icon={<Zap className="h-4 w-4" />}         color="#be123c" sub="across channels" />
        <LiveMetricTile label="AI Actions Today"  value={lm.aiActionsToday}   format={(n) => `${n}`}                  icon={<Cpu className="h-4 w-4" />}         color="#9333ea" sub={`${lm.autoActionsToday} automatic`} />
        <LiveMetricTile label="Auto Actions"      value={lm.autoActionsToday} format={(n) => `${n}`}                  icon={<Bot className="h-4 w-4" />}         color="#15803d" sub="no human needed" />
        <LiveMetricTile label="Approvals Pending" value={lm.approvalsPending} format={(n) => `${n}`}                  icon={<Clock className="h-4 w-4" />}       color="#a16207" sub="awaiting your review" />
      </div>

      {/* Central entity map + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EntityOrbit selected={selected} onSelect={setSelected} />
        </div>
        <div>
          {selected ? (
            <CategorySidePanel category={selected} onClose={() => setSelected(null)} />
          ) : (
            <Card className="p-5 h-full flex flex-col items-center justify-center text-center gap-3 border-dashed">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/15 to-teal-500/15">
                <Box className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Inspect an entity</p>
                <p className="text-xs text-muted-foreground max-w-[260px] mt-1">
                  Click any orbiting category to see live items pulled straight from your data layer.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                {CATEGORIES.slice(0, 6).map(c => (
                  <button
                    key={c.key}
                    onClick={() => setSelected(c.key)}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border hover:bg-accent/40 transition-colors"
                    style={{ color: c.color, borderColor: c.color + '40' }}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 9-tile entity inventory */}
      <EntityCountsGrid />

      {/* AI narrative + AI sync health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AiNarrativeCard />
        </div>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="h-4 w-4 text-teal-500" />
            <h3 className="font-semibold text-sm">Twin Sync Health</h3>
            <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Healthy
            </Badge>
          </div>
          <div className="space-y-2">
            {[
              { src: 'PMS / Reservations',    lag: '0.4s', status: 'synced' },
              { src: 'Channel Manager (11)',  lag: '1.2s', status: 'synced' },
              { src: 'Guest CRM',             lag: '0.9s', status: 'synced' },
              { src: 'Marketing Engine',      lag: '2.0s', status: 'synced' },
              { src: 'Reputation Aggregator', lag: '4.5s', status: 'degraded' },
              { src: 'Finance Ledger',        lag: '0.6s', status: 'synced' },
            ].map((row) => (
              <div key={row.src} className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-2.5 py-1.5">
                <span className="text-xs">{row.src}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground tabular-nums">{row.lag}</span>
                  {row.status === 'synced'
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-2.5 w-2.5" /> synced</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600 dark:text-amber-400"><AlertCircle className="h-2.5 w-2.5" /> {row.status}</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">Last full twin rebuild: just now · sync #{tick + 1284}</p>
        </Card>
      </div>
    </div>
  )
}
