'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip, TooltipTrigger, TooltipContent,
} from '@/components/ui/tooltip'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { StatCard, SectionHeader } from '@/components/shared'
import { SUPPLIERS, SUPPLIER_CATEGORIES } from '@/lib/data-v4'
import type { Supplier } from '@/lib/data-v4'
import { fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import {
  Package, Store, Star, Check, Zap, TrendingUp, Truck,
  ArrowRight, Plus, Link2, ThumbsUp, ShieldCheck,
  ShoppingCart, Clock, Users, Filter, Handshake, Wrench,
  Wifi, Sofa, Utensils, Shirt, SprayCan, SunMedium, AlertTriangle,
  ArrowLeftRight, Network,
} from 'lucide-react'

// ============================================================
//  Supplier Network — vetted suppliers + AI recommendations +
//  auto-reordering + network-negotiated bulk rates
// ============================================================

// ---------- helpers ----------

const PRICE_LEVELS: Record<number, string> = { 1: '₵', 2: '₵₵', 3: '₵₵₵' }

function Stars({ rating, size = 'h-3 w-3' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

function fmtUsedBy(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return `${n}`
}

// ---------- category icons ----------

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Laundry': Shirt,
  'Food Wholesaler': Utensils,
  'Cleaning Supplies': SprayCan,
  'Maintenance Contractor': Wrench,
  'Furniture': Sofa,
  'Security': ShieldCheck,
  'Internet Provider': Wifi,
  'Utilities': SunMedium,
}

interface CategoryDef {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  match: (s: Supplier) => boolean
}

const CATEGORIES: CategoryDef[] = [
  { key: 'all', label: 'All Categories', icon: Package, match: () => true },
  ...SUPPLIER_CATEGORIES.map(label => ({
    key: label,
    label,
    icon: CATEGORY_ICONS[label] ?? Store,
    match: (s: Supplier) => s.category === label,
  })),
]

// ---------- status helpers ----------

type StatusKey = 'preferred' | 'connected' | 'available'

const STATUS_STYLE: Record<StatusKey, { label: string; cls: string }> = {
  preferred: { label: 'Preferred', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  connected: { label: 'Connected', cls: 'bg-teal-500/15 text-teal-600 dark:text-teal-400' },
  available: { label: 'Available', cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-300' },
}

// ---------- sort ----------

type SortMode = 'reliability' | 'rating' | 'network'

function sortSuppliers(list: Supplier[], mode: SortMode): Supplier[] {
  const sorted = [...list]
  if (mode === 'reliability') sorted.sort((a, b) => b.reliability - a.reliability)
  else if (mode === 'rating') sorted.sort((a, b) => b.rating - a.rating)
  else if (mode === 'network') sorted.sort((a, b) => b.networkUsedBy - a.networkUsedBy)
  // preferred → connected → available
  const rank: Record<StatusKey, number> = { preferred: 0, connected: 1, available: 2 }
  return sorted.sort((a, b) => rank[a.yourStatus] - rank[b.yourStatus])
}

// ---------- Supplier Card ----------

function SupplierCard({
  sup,
  status,
  onConnect,
  onPrefer,
  index,
}: {
  sup: Supplier
  status: StatusKey
  onConnect: (s: Supplier) => void
  onPrefer: (s: Supplier) => void
  index: number
}) {
  const connected = status !== 'available'
  const preferred = status === 'preferred'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card
        className={`p-0 gap-0 overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 ${
          preferred ? 'ring-1 ring-emerald-500/40' : connected ? 'ring-1 ring-teal-500/30' : ''
        }`}
      >
        {/* Gradient header tile */}
        <div
          className="relative h-20 flex items-center justify-between px-4"
          style={{ background: `linear-gradient(135deg, ${sup.color}, ${sup.color}cc 55%, ${sup.color}77)` }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.45), transparent 60%)' }}
          />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 backdrop-blur text-2xl shadow-sm">
            {sup.emoji}
          </div>
          <div className="relative flex flex-col items-end gap-1">
            <Badge className="bg-white/25 text-white border-0 backdrop-blur text-[9px] font-medium">
              {sup.category}
            </Badge>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_STYLE[status].cls}`}
            >
              {preferred && <Check className="h-2.5 w-2.5" />}
              {STATUS_STYLE[status].label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{sup.name}</p>
              <p className="text-[10.5px] text-muted-foreground truncate inline-flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> {sup.deliveryTime}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground shrink-0">
                  {PRICE_LEVELS[sup.priceLevel]}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Price level: {'₵'.repeat(sup.priceLevel)}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Stars rating={sup.rating} />
            <span className="text-[11px] font-semibold tabular-nums">{sup.rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{sup.reviews} reviews</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 line-clamp-2 flex-1">
            {sup.description}
          </p>

          {/* reliability progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" /> Reliability
              </span>
              <span
                className={`font-bold tabular-nums ${
                  sup.reliability >= 95
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : sup.reliability >= 90
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {sup.reliability}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${sup.reliability}%`,
                  backgroundColor:
                    sup.reliability >= 95 ? '#10b981' : sup.reliability >= 90 ? '#0d9488' : '#f59e0b',
                }}
              />
            </div>
          </div>

          {/* network effect */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-violet-500/8 px-2 py-1.5 text-[10.5px] text-violet-600 dark:text-violet-400 font-medium">
            <Users className="h-3 w-3" />
            Used by <span className="font-bold tabular-nums">{fmtUsedBy(sup.networkUsedBy)}</span> properties on the network
          </div>

          <Separator className="my-3" />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className={`h-9 flex-1 text-xs transition-all ${
                connected
                  ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 hover:bg-teal-500/25 border border-teal-500/30'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-md shadow-orange-500/20'
              }`}
              onClick={() => onConnect(sup)}
            >
              {connected ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Connected ✓
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5 mr-1.5" />
                  Connect
                </>
              )}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-9 px-3 text-xs ${
                    preferred
                      ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                      : 'hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                  onClick={() => onPrefer(sup)}
                  disabled={!connected && !preferred}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="sr-only">Set as preferred</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {preferred ? 'Remove preferred status' : connected ? 'Set as preferred supplier' : 'Connect first to mark preferred'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ---------- Category filter ----------

function CategoryFilter({
  active,
  setActive,
  counts,
}: {
  active: string
  setActive: (k: string) => void
  counts: Record<string, number>
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
      {CATEGORIES.map(c => {
        const Icon = c.icon
        const isActive = active === c.key
        return (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {c.label}
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold ${
                isActive ? 'bg-white/25 text-white' : 'bg-foreground/10 text-foreground'
              }`}
            >
              {counts[c.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------- AI recommendation card ----------

function AIRecommendationCard() {
  return (
    <Card className="relative overflow-hidden p-5 border-orange-500/25">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/30">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">AI recommendation</h3>
            <p className="text-[11px] text-muted-foreground">Based on your usage & recent reviews</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed my-3">
          Based on your usage patterns and recent reviews, AI recommends:{' '}
          <span className="font-semibold text-foreground">
            switch laundry to FreshLine
          </span>{' '}
          (96% reliability vs your 89%) — saves{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">~₵1,200/mo</span> and{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">3 complaints/qtr</span>.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <CompareCell label="Current" name="Your vendor" value="89%" tone="muted" />
          <CompareCell label="Recommended" name="FreshLine" value="96%" tone="emerald" highlight />
          <CompareCell label="Savings" name="Per month" value="₵1,200" tone="amber" />
        </div>

        <Button
          size="sm"
          className="mt-3 w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-md shadow-orange-500/20"
          onClick={() =>
            toast.success('Switch initiated', {
              description: 'StayPilot will migrate your laundry contract to FreshLine and notify the current vendor.',
            })
          }
        >
          <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" /> Switch to FreshLine
        </Button>
      </div>
    </Card>
  )
}

function CompareCell({
  label,
  name,
  value,
  tone,
  highlight,
}: {
  label: string
  name: string
  value: string
  tone: 'muted' | 'emerald' | 'amber'
  highlight?: boolean
}) {
  const toneCls =
    tone === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'amber'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground'
  return (
    <div
      className={`rounded-lg border p-2.5 text-center ${
        highlight ? 'border-emerald-500/40 bg-emerald-500/8' : 'border-border bg-muted/20'
      }`}
    >
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-base font-bold tabular-nums ${toneCls}`}>{value}</p>
      <p className="text-[9.5px] text-muted-foreground truncate">{name}</p>
    </div>
  )
}

// ---------- Auto-reorder card ----------

const AUTO_REORDERS = [
  { id: 'ar-1', name: 'Linen', icon: '🛏️', days: 4, level: 35, color: '#9333ea' },
  { id: 'ar-2', name: 'Cleaning supplies', icon: '🧴', days: 8, level: 58, color: '#0d9488' },
  { id: 'ar-3', name: 'Breakfast food', icon: '🍳', days: 0, level: 22, color: '#b45309' },
]

function AutoReorderCard() {
  return (
    <Card className="relative overflow-hidden p-5 border-teal-500/20">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-teal-500/15 to-emerald-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/25">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Auto-reorder</h3>
            <p className="text-[11px] text-muted-foreground">AI monitors stock and reorders for you</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed my-3">
          AI monitors your stock and auto-reorders when levels drop.
        </p>

        <div className="space-y-2">
          {AUTO_REORDERS.map(ar => (
            <div
              key={ar.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-2.5"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg shrink-0"
                style={{ backgroundColor: ar.color + '22' }}
              >
                {ar.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate">{ar.name}</p>
                  <span
                    className={`text-[10px] font-semibold shrink-0 ${
                      ar.days === 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : ar.days <= 5
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {ar.days === 0 ? 'Daily · reorder today' : `Reorder in ${ar.days} days`}
                  </span>
                </div>
                <Progress value={ar.level} className="h-1 mt-1" />
              </div>
            </div>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full border-teal-500/40 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10"
          onClick={() =>
            toast.info('Auto-reorder preferences', {
              description: 'Thresholds, vendor preferences, and approval routing sent to settings.',
            })
          }
        >
          <Zap className="h-3.5 w-3.5 mr-1.5" /> Manage auto-reorder rules
        </Button>
      </div>
    </Card>
  )
}

// ---------- Network-negotiated rates card ----------

function NetworkRatesCard() {
  return (
    <Card className="relative overflow-hidden p-5 border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-fuchsia-500/4 to-transparent">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/25">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Network-negotiated rates</h3>
            <p className="text-[11px] text-muted-foreground">Bulk buying power of 5,247 properties</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed my-3">
          StayPilot negotiates bulk rates across{' '}
          <span className="font-semibold text-foreground">5,247 properties</span>. Your network savings:{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">₵4,800/mo</span> vs going direct.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-background/60 p-2.5 text-center">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Going direct</p>
            <p className="text-base font-bold text-muted-foreground line-through tabular-nums">₵18,400/mo</p>
          </div>
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/8 p-2.5 text-center">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Network rate</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">₵13,600/mo</p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
          <TrendingUp className="h-3 w-3" /> 26% network discount applied automatically at checkout
        </div>
      </div>
    </Card>
  )
}

// ---------- Become a supplier ----------

function BecomeSupplierCard() {
  return (
    <Card className="p-5 h-full bg-gradient-to-br from-amber-500/8 via-orange-500/4 to-rose-500/5 border-amber-500/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25">
          <Handshake className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Become a supplier</h3>
          <p className="text-[11px] text-muted-foreground">Reach 5,247 properties in one integration</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        List your business on the StayPilot Supplier Network. Get{' '}
        <span className="font-semibold text-foreground">auto-reorder orders</span>,{' '}
        <span className="font-semibold text-foreground">network-negotiated rates</span> paid weekly, and
        exposure to <span className="font-semibold text-foreground">184K guests</span> per year.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { v: '5,247', l: 'Properties' },
          { v: 'Weekly', l: 'Payouts' },
          { v: '0%', l: 'Listing fee' },
        ].map(s => (
          <div key={s.l} className="rounded-lg bg-background/60 border border-border p-2 text-center">
            <p className="text-sm font-bold text-foreground">{s.v}</p>
            <p className="text-[9.5px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <Button
        size="sm"
        className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20"
        onClick={() =>
          toast.success('Supplier onboarding opening', {
            description: 'Business verification, catalog import, and rate cards sent to your email.',
          })
        }
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Apply to list
      </Button>
    </Card>
  )
}

// ---------- Stats row ----------

function StatsRow({
  preferredCount,
  connectedCount,
  networkCount,
  avgReliability,
}: {
  preferredCount: number
  connectedCount: number
  networkCount: number
  avgReliability: number
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Preferred"
        value={`${preferredCount}`}
        sub="your top-rated vendors"
        icon={<ThumbsUp className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="Connected"
        value={`${connectedCount}`}
        sub="vendors you actively use"
        icon={<Link2 className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Available on network"
        value={`${networkCount}`}
        sub="vetted suppliers ready to connect"
        icon={<Package className="h-5 w-5" />}
        accent="violet"
      />
      <StatCard
        label="Avg reliability"
        value={fmtPct(avgReliability)}
        sub="across connected vendors"
        icon={<ShieldCheck className="h-5 w-5" />}
        accent="gold"
      />
    </div>
  )
}

// ---------- Module ----------

export function SupplierNetworkModule() {
  // Status is mutable: connect / disconnect + toggle preferred
  const [statusMap, setStatusMap] = React.useState<Record<string, StatusKey>>(() =>
    Object.fromEntries(SUPPLIERS.map(s => [s.id, s.yourStatus])),
  )
  const [activeCat, setActiveCat] = React.useState<string>('all')
  const [sort, setSort] = React.useState<SortMode>('reliability')

  const counts = React.useMemo(() => {
    const out: Record<string, number> = { all: SUPPLIERS.length }
    for (const s of SUPPLIERS) out[s.category] = (out[s.category] ?? 0) + 1
    return out
  }, [])

  const filtered = React.useMemo(() => {
    const cat = CATEGORIES.find(c => c.key === activeCat)!
    const list = SUPPLIERS.filter(cat.match).map(s => ({ ...s, yourStatus: statusMap[s.id] ?? s.yourStatus }))
    return sortSuppliers(list, sort)
  }, [activeCat, sort, statusMap])

  const preferredCount = Object.values(statusMap).filter(s => s === 'preferred').length
  const connectedCount = Object.values(statusMap).filter(s => s !== 'available').length
  const networkCount = SUPPLIERS.length
  const connectedIds = Object.entries(statusMap).filter(([, v]) => v !== 'available').map(([k]) => k)
  const avgReliability =
    connectedIds.length > 0
      ? SUPPLIERS.filter(s => connectedIds.includes(s.id)).reduce((acc, s) => acc + s.reliability, 0) /
        connectedIds.length
      : SUPPLIERS.reduce((acc, s) => acc + s.reliability, 0) / SUPPLIERS.length

  const handleConnect = (s: Supplier) => {
    setStatusMap(prev => {
      const current = prev[s.id] ?? s.yourStatus
      const next: StatusKey = current === 'available' ? 'connected' : 'available'
      if (next === 'connected') {
        toast.success(`Connected to ${s.name}`, {
          description: `${s.category} · ${s.reliability}% reliability · ${s.deliveryTime}`,
        })
      } else {
        toast.info(`Disconnected from ${s.name}`, {
          description: 'You can reconnect anytime — auto-reorder rules paused.',
        })
      }
      return { ...prev, [s.id]: next }
    })
  }

  const handlePrefer = (s: Supplier) => {
    setStatusMap(prev => {
      const current = prev[s.id] ?? s.yourStatus
      if (current === 'available') return prev // shouldn't happen (button disabled)
      const next: StatusKey = current === 'preferred' ? 'connected' : 'preferred'
      if (next === 'preferred') {
        toast.success(`${s.name} set as preferred ${s.category} supplier`, {
          description: 'Auto-reorders will route here first when stock runs low.',
        })
      } else {
        toast.info(`${s.name} removed as preferred`, {
          description: 'Stays connected — just no longer prioritized.',
        })
      }
      return { ...prev, [s.id]: next }
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Supplier Network"
        description="Connect with vetted suppliers across the StayPilot network. AI recommends vendors based on price, reliability, and delivery performance — and auto-reorders when stock runs low."
        action={
          <Badge variant="outline" className="text-[10px] bg-background/60">
            <Store className="h-3 w-3 text-orange-500" /> {SUPPLIERS.length} suppliers · 8 categories
          </Badge>
        }
      />

      {/* Stats */}
      <StatsRow
        preferredCount={preferredCount}
        connectedCount={connectedCount}
        networkCount={networkCount}
        avgReliability={avgReliability}
      />

      {/* Category filter + sort */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CategoryFilter active={activeCat} setActive={setActiveCat} counts={counts} />
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger size="sm" className="h-8 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reliability">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> By reliability
                </span>
              </SelectItem>
              <SelectItem value="rating">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-amber-500" /> By rating
                </span>
              </SelectItem>
              <SelectItem value="network">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-violet-500" /> Most used on network
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Supplier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((s, i) => (
            <SupplierCard
              key={s.id}
              sup={s}
              status={statusMap[s.id] ?? s.yourStatus}
              onConnect={handleConnect}
              onPrefer={handlePrefer}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No suppliers in this category yet.</p>
        </Card>
      )}

      {/* AI recommendation + Auto-reorder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIRecommendationCard />
        <AutoReorderCard />
      </div>

      {/* Network rates + Become a supplier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetworkRatesCard />
        <BecomeSupplierCard />
      </div>

      {/* Footer callout */}
      <Card className="p-4 border-dashed border-border bg-muted/20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">
              Every supplier is{' '}
              <span className="font-semibold text-foreground">StayPilot-vetted</span> with background-checked
              personnel, verified reliability metrics, and network-negotiated rates applied automatically.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              toast.info('Supplier roster', {
                description: `You are connected to ${connectedCount} suppliers (${preferredCount} preferred) across ${networkCount} vetted vendors.`,
              })
            }
          >
            <Truck className="h-3.5 w-3.5 mr-1.5" /> View my supplier roster
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
