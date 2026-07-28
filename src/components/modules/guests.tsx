'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Search, Calendar, MessageCircle, Mail, Phone, CreditCard, Star,
  AlertTriangle, Sparkles, Megaphone, Lightbulb, LogIn, LogOut,
  ArrowLeft, MapPin, Languages, Cake, Heart, Users, UtensilsCrossed,
  Gift, Clock, Bookmark, Zap, Send, PlusCircle, Globe, Repeat,
  Wallet, BedDouble, ChevronRight, BadgeCheck, PhoneCall, NotebookPen,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Cell,
} from 'recharts'
import { toast } from 'sonner'

import { GUESTS, RESERVATIONS, timelineForGuest, SOURCE_COLORS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtDate, relativeDate, initials } from '@/lib/format'
import { useApp } from '@/lib/store'
import { SectionHeader, SourceBadge, TierBadge } from '@/components/shared'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Guest, TimelineEntry, TimelineEntryType, BookingSource } from '@/lib/types'

// ----------------- helpers -----------------

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

// ----------------- small subcomponents -----------------

function StatBox({
  label, value, sub, accent = 'brand', icon: Icon,
}: {
  label: string
  value: string
  sub?: string
  accent?: 'brand' | 'teal' | 'gold' | 'rose' | 'violet'
  icon?: LucideIcon
}) {
  const accentMap: Record<string, string> = {
    brand: 'text-orange-600 dark:text-orange-400',
    teal: 'text-teal-600 dark:text-teal-400',
    gold: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    violet: 'text-violet-600 dark:text-violet-400',
  }
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 transition-colors hover:bg-accent/30">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && <Icon className={cn('size-3.5', accentMap[accent])} />}
      </div>
      <p className={cn('text-lg font-bold tracking-tight mt-1', accentMap[accent])}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

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
    <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/40 p-2.5">
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

function Chip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'brand' | 'teal' | 'gold' | 'rose' | 'violet' }) {
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

// ----------------- guest list item -----------------

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

// ----------------- spend chart -----------------

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

// ----------------- timeline -----------------

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

// ----------------- profile panel -----------------

function GuestProfile({ guest, onBack }: { guest: Guest; onBack: () => void }) {
  const timeline = React.useMemo(() => timelineForGuest(guest.id), [guest.id])
  const ota = isOta(guest.bookingSource)
  const reservations = React.useMemo(
    () => RESERVATIONS.filter((r) => r.guestId === guest.id),
    [guest.id],
  )

  // AI-suggested auto tags based on guest signals
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
      {/* Mobile back button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="lg:hidden"
      >
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

        {/* Action buttons */}
        <div className="relative mt-4 flex flex-wrap gap-2">
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
      </Card>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatBox label="Lifetime Spend" value={fmtMoneyShort(guest.lifetimeSpend)} accent="brand" icon={Wallet} />
        <StatBox label="Total Stays" value={String(guest.totalStays)} accent="teal" icon={Calendar} />
        <StatBox label="Repeat Visits" value={String(guest.repeatVisits)} accent="gold" icon={Repeat} />
        <StatBox label="Loyalty Points" value={guest.loyaltyPoints.toLocaleString()} accent="violet" icon={Gift} />
        <StatBox
          label="Avg Rating"
          value={guest.avgRatingGiven ? `${guest.avgRatingGiven}★` : '—'}
          accent="rose"
          icon={Star}
        />
      </div>

      {/* Spend chart */}
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

      {/* Info grid */}
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

      {/* Segments & Tags */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Segments &amp; Tags</h3>
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Segments</p>
            <div className="flex flex-wrap gap-1.5">
              {guest.segments.length > 0 ? (
                guest.segments.map((s) => (
                  <Chip key={s} tone="brand">
                    <Users className="size-3" /> {s}
                  </Chip>
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
                  <Chip key={t} tone="teal">
                    <Bookmark className="size-3" /> {t}
                  </Chip>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No tags yet</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Enrichment banner */}
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

      {/* Timeline (centerpiece) */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Customer Timeline</h3>
            <p className="text-xs text-muted-foreground">
              {timeline.length} interactions across all channels · newest first
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400">
            <Clock className="size-3" /> Live
          </span>
        </div>
        <Timeline entries={timeline} />
      </Card>
    </div>
  )
}

// ----------------- main module -----------------

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
      <SonnerToaster position="top-right" richColors closeButton />
      <SectionHeader
        title="Guests CRM"
        description="AI-enriched guest profiles with full interaction timeline"
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
