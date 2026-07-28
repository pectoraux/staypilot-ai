'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader, StatusPill, TierBadge } from '@/components/shared'
import { PROPERTIES, HOSPITALITY_TYPES } from '@/lib/data-v2'
import type { PropertySummary } from '@/lib/data-v2'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Cell,
} from 'recharts'
import {
  Building2, MapPin, BedDouble, Star, Wallet, Percent, Globe, Sparkles,
  ArrowRight, Crown, Layers, Network, Award, Plus, Target, Users, Hotel,
  TrendingUp, Briefcase, Compass, Rocket, CheckCircle2, Zap,
} from 'lucide-react'

// ---------- helpers ----------

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className ?? ''}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
      <span className="ml-1 text-[11px] font-semibold text-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

const activeProperties = PROPERTIES.filter(p => p.status === 'Active')

const portfolio = {
  totalActive: activeProperties.length,
  totalProperties: PROPERTIES.length,
  totalRooms: PROPERTIES.reduce((s, p) => s + p.rooms, 0),
  activeRooms: activeProperties.reduce((s, p) => s + p.rooms, 0),
  avgOccupancy: Math.round(activeProperties.reduce((s, p) => s + p.occupancy, 0) / activeProperties.length),
  revenueMTD: activeProperties.reduce((s, p) => s + p.revenueMTD, 0),
  avgRating: activeProperties.reduce((s, p) => s + p.rating, 0) / activeProperties.length,
  avgDirectShare: Math.round(activeProperties.reduce((s, p) => s + p.directShare, 0) / activeProperties.length),
}

const occupancyData = activeProperties
  .map(p => ({ name: p.name.split(' ')[0], full: p.name, value: p.occupancy, color: p.emoji }))
  .sort((a, b) => b.value - a.value)

const revparData = activeProperties
  .map(p => ({ name: p.name.split(' ')[0], full: p.name, value: p.revpar }))
  .sort((a, b) => b.value - a.value)

const BAR_COLORS = ['#ea580c', '#0d9488', '#b45309', '#9333ea', '#be123c']

// ---------- PropertyCard ----------

function PropertyCard({ p, index }: { p: PropertySummary; index: number }) {
  const isActive = p.status === 'Active'
  const cta =
    p.status === 'Onboarding' ? 'Complete setup'
    : p.status === 'Lead' ? 'Convert lead'
    : null

  const handleClick = () => {
    if (isActive) toast.success(`Opening ${p.name}`, { description: `${p.location} · ${p.rooms} rooms · ${p.occupancy}% occupancy` })
    else if (p.status === 'Onboarding') toast.info(`Resuming onboarding for ${p.name}`, { description: '3 setup steps remaining' })
    else toast.info(`Converting ${p.name} from lead`, { description: 'Sales sequence will be triggered' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`p-0 gap-0 overflow-hidden group transition-all ${isActive ? 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5' : 'opacity-95'}`}
        onClick={isActive ? handleClick : undefined}
      >
        {/* Header band */}
        <div className="relative h-20 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-teal-500/10 dark:from-orange-500/20 dark:via-amber-500/15 dark:to-teal-500/15 flex items-center justify-between px-4">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(234,88,12,0.18), transparent 55%)' }} />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card/80 backdrop-blur text-2xl shadow-sm ring-1 ring-border/60">
              {p.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold leading-tight">{p.name}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{p.location}</span>
              </div>
            </div>
          </div>
          <StatusPill status={p.status} />
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* type + rooms */}
          <div className="flex items-center justify-between text-xs">
            <Badge variant="secondary" className="font-medium">{p.type}</Badge>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5" />
              {p.rooms} rooms
            </span>
          </div>

          {isActive ? (
            <>
              {/* Occupancy progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-semibold">{fmtPct(p.occupancy)}</span>
                </div>
                <Progress value={p.occupancy} className="h-1.5" />
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-[10px] text-muted-foreground">RevPAR</p>
                  <p className="text-sm font-bold">{fmtMoneyShort(p.revpar)}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-[10px] text-muted-foreground">ADR</p>
                  <p className="text-sm font-bold">{fmtMoneyShort(p.adr)}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-[10px] text-muted-foreground">Direct</p>
                  <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{fmtPct(p.directShare)}</p>
                </div>
              </div>

              <Separator />

              {/* Rating + Revenue */}
              <div className="flex items-center justify-between">
                <Stars rating={p.rating} />
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Revenue MTD</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(p.revenueMTD)}</p>
                </div>
              </div>

              <div className="flex items-center justify-end text-[11px] font-medium text-orange-600 dark:text-orange-400 group-hover:gap-2 transition-all">
                <span>View dashboard</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </>
          ) : (
            <div className="space-y-3 py-1">
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {p.status === 'Onboarding'
                    ? 'Onboarding in progress — finish setup to start syncing inventory & rates.'
                    : 'Lead captured — convert to onboard this property into your portfolio.'}
                </p>
              </div>
              <Button
                size="sm"
                className="w-full h-9 text-xs bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600"
                onClick={(e) => { e.stopPropagation(); handleClick() }}
              >
                {cta}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ---------- ComparisonCharts ----------

function ChartTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold mb-0.5">{payload[0].payload.full}</p>
      <p className="text-muted-foreground">
        {suffix === '%' ? `${payload[0].value}%` : fmtMoney(payload[0].value)}
      </p>
    </div>
  )
}

function ComparisonCharts() {
  const topOcc = occupancyData[0]
  const topRev = revparData[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Occupancy chart */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-semibold">Occupancy by Property</h3>
            <p className="text-xs text-muted-foreground">Current month · live across portfolio</p>
          </div>
          <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300">
            <Crown className="h-3 w-3" /> Top: {topOcc.full}
          </Badge>
        </div>
        <div className="h-56 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 60 / 0.18)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 60 / 0.6)" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 60 / 0.6)" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <RTooltip cursor={{ fill: 'oklch(0.5 0.02 60 / 0.08)' }} content={<ChartTooltip suffix="%" />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {occupancyData.map((d, i) => (
                  <Cell key={i} fill={i === 0 ? '#ea580c' : BAR_COLORS[(i + 1) % BAR_COLORS.length] + 'cc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* RevPAR chart */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-semibold">RevPAR by Property</h3>
            <p className="text-xs text-muted-foreground">Revenue per available room · MTD</p>
          </div>
          <Badge variant="secondary" className="gap-1 bg-teal-500/10 text-teal-700 dark:text-teal-300">
            <Crown className="h-3 w-3" /> Top: {topRev.full}
          </Badge>
        </div>
        <div className="h-56 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revparData} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 60 / 0.18)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 60 / 0.6)" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 60 / 0.6)" tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoneyShort(v)} />
              <RTooltip cursor={{ fill: 'oklch(0.5 0.02 60 / 0.08)' }} content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {revparData.map((d, i) => (
                  <Cell key={i} fill={i === 0 ? '#0d9488' : BAR_COLORS[(i + 2) % BAR_COLORS.length] + 'cc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

// ---------- SharedAssetsCard ----------

const SHARED_ASSETS = [
  { icon: Users, label: 'Shared guest database', value: '64 guests', sub: 'across portfolio', color: '#ea580c' },
  { icon: Crown, label: 'Shared loyalty program', value: '9 VIPs', sub: 'cross-property rewards', color: '#b45309' },
  { icon: Network, label: 'Cross-property benchmarking', value: 'Live', sub: 'occupancy · ADR · RevPAR', color: '#0d9488' },
]

function SharedAssetsCard() {
  return (
    <Card className="p-5 h-full">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-orange-600 dark:text-orange-400">
          <Layers className="h-4 w-4" />
        </div>
        <h3 className="font-semibold">Shared assets across portfolio</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">One unified guest & loyalty graph powering every property.</p>
      <div className="space-y-3">
        {SHARED_ASSETS.map(a => {
          const Icon = a.icon
          return (
            <div key={a.label} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: a.color + '1a', color: a.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{a.label}</p>
                <p className="text-[11px] text-muted-foreground">{a.sub}</p>
              </div>
              <span className="text-sm font-bold text-foreground">{a.value}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ---------- AIRecommendationCard ----------

function AIRecommendationCard() {
  return (
    <Card className="relative overflow-hidden p-5 h-full border-orange-500/30">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 to-amber-500 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">AI portfolio recommendation</h3>
            <p className="text-[11px] text-muted-foreground">Generated 12 min ago · auto-running</p>
          </div>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-3">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-orange-600 dark:text-orange-400">Coconut Bay Boutique</span> has the highest rating
            (<span className="font-semibold">4.5★</span>) but lowest direct share (<span className="font-semibold">38%</span>) — replicate
            <span className="font-semibold"> Akwaaba's</span> direct-conversion playbook there.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-card/60 p-2">
              <p className="text-[10px] text-muted-foreground">Direct share</p>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">38% → 60%</p>
            </div>
            <div className="rounded-lg bg-card/60 p-2">
              <p className="text-[10px] text-muted-foreground">Timeline</p>
              <p className="text-sm font-bold">90 days</p>
            </div>
            <div className="rounded-lg bg-card/60 p-2">
              <p className="text-[10px] text-muted-foreground">Projected</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+₵42K/yr</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            className="h-9 flex-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600"
            onClick={() => toast.success('Playbook replication started', { description: 'Akwaaba → Coconut Bay · ETA 90 days · +₵42K projected' })}
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Replicate playbook
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => toast.info('Full analysis opened', { description: '12-step playbook with weekly milestones' })}
          >
            View plan
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ---------- HospitalityOSExpansion ----------

const POTENTIAL_STYLES: Record<string, string> = {
  High: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  Medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Low: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
}

function HospitalityOSExpansion() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/15 to-emerald-500/5 text-teal-600 dark:text-teal-400">
              <Compass className="h-4 w-4" />
            </div>
            <h3 className="font-semibold">Hospitality OS expansion</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Same AI core. 10 hospitality verticals. Guest houses are the wedge into a <span className="font-semibold text-foreground">$180B</span> hospitality platform.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="hidden sm:inline-flex shrink-0"
          onClick={() => toast.info('Expansion roadmap opened', { description: 'Vertical rollout plan · 18 months' })}
        >
          <Rocket className="h-3.5 w-3.5 mr-1.5" />
          View roadmap
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {HOSPITALITY_TYPES.map((t, i) => (
          <motion.div
            key={t.type}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`relative rounded-xl border p-3 transition-all hover:shadow-md ${t.wedge ? 'border-orange-500/40 bg-orange-500/5' : 'border-border bg-muted/20 hover:bg-muted/40'}`}
          >
            {t.wedge && (
              <span className="absolute -top-2 left-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                <Target className="h-2.5 w-2.5" /> Wedge
              </span>
            )}
            <div className="text-2xl mb-1.5">{t.icon}</div>
            <p className="text-xs font-semibold leading-tight mb-2">{t.type}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {t.count > 0 ? `${t.count} in portfolio` : 'Not yet'}
              </span>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${POTENTIAL_STYLES[t.potential]}`}>
                {t.potential}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

// ---------- PortfolioStats ----------

function PortfolioStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatCard
        label="Active Properties"
        value={`${portfolio.totalActive}`}
        sub={`of ${portfolio.totalProperties} in portfolio`}
        icon={<Building2 className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Total Rooms"
        value={`${portfolio.activeRooms}`}
        sub={`${portfolio.totalRooms} portfolio-wide`}
        icon={<BedDouble className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="Portfolio Occupancy"
        value={fmtPct(portfolio.avgOccupancy)}
        sub="weighted avg · active"
        icon={<TrendingUp className="h-5 w-5" />}
        accent="gold"
      />
      <StatCard
        label="Revenue MTD"
        value={fmtMoneyShort(portfolio.revenueMTD)}
        sub="across active properties"
        icon={<Wallet className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Avg Rating"
        value={`${portfolio.avgRating.toFixed(1)}★`}
        sub="Google · Booking · Airbnb"
        icon={<Star className="h-5 w-5" />}
        accent="violet"
      />
      <StatCard
        label="Direct Share"
        value={fmtPct(portfolio.avgDirectShare)}
        sub="vs OTA commission"
        icon={<Percent className="h-5 w-5" />}
        accent="teal"
      />
    </div>
  )
}

// ---------- Module ----------

export function MultiPropertyModule() {
  return (
    <div className="space-y-6">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden p-0 border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.45) 0, transparent 45%), radial-gradient(circle at 85% 75%, rgba(13,148,136,0.4) 0, transparent 50%)' }} />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">Multi-Property Mode</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Multi-Property Portfolio
                </h1>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  One AI workforce managing your entire hospitality portfolio — shared guests, shared loyalty, cross-property benchmarking.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  className="bg-white/95 text-orange-700 hover:bg-white"
                  onClick={() => toast.success('New property wizard opened', { description: 'Add another property to your portfolio' })}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add property
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                  onClick={() => toast.info('Portfolio report generated', { description: 'Cross-property benchmark PDF ready' })}
                >
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  Export report
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <PortfolioStats />

      {/* Property cards */}
      <div className="space-y-3">
        <SectionHeader
          title="Your properties"
          description="Each property runs on the same AI core, with its own data and brand."
          action={
            <Badge variant="secondary" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {portfolio.totalActive} active · {portfolio.totalProperties - portfolio.totalActive} pipeline
            </Badge>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PROPERTIES.map((p, i) => (
            <PropertyCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>

      {/* Comparison charts */}
      <div className="space-y-3">
        <SectionHeader
          title="Cross-property benchmarking"
          description="Spot top performers and replicate their playbook across the portfolio."
        />
        <ComparisonCharts />
      </div>

      {/* Shared assets + AI recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SharedAssetsCard />
        <AIRecommendationCard />
      </div>

      {/* Hospitality OS expansion */}
      <HospitalityOSExpansion />
    </div>
  )
}
