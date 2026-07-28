'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader } from '@/components/shared'
import { MARKETPLACE } from '@/lib/data-v2'
import type { MarketplaceService } from '@/lib/data-v2'
import { toast } from 'sonner'
import {
  Store, Star, Check, Plus, Sparkles, Zap, ShoppingBag, Users, Wrench,
  Shirt, Plane, Map as MapIcon, Utensils, Camera, PartyPopper, Hammer,
  TrendingUp, ArrowRight, Wand2, Briefcase, Crown, Package,
} from 'lucide-react'

// ---------- helpers ----------

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
      <span className="ml-1 text-[11px] font-semibold">{rating.toFixed(1)}</span>
    </div>
  )
}

// ---------- categories ----------

interface CategoryDef {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  match: (svc: MarketplaceService) => boolean
}

const CATEGORIES: CategoryDef[] = [
  { key: 'all', label: 'All', icon: Package, match: () => true },
  { key: 'cleaning', label: 'Cleaning', icon: Sparkles, match: s => s.category === 'Cleaning Services' },
  { key: 'laundry', label: 'Laundry', icon: Shirt, match: s => s.category === 'Laundry' },
  { key: 'transfers', label: 'Airport Transfers', icon: Plane, match: s => s.category === 'Airport Transfers' },
  { key: 'tours', label: 'Tour Guides', icon: MapIcon, match: s => s.category === 'Tour Guides' },
  { key: 'restaurants', label: 'Restaurants', icon: Utensils, match: s => s.category === 'Restaurants' },
  { key: 'photographers', label: 'Photographers', icon: Camera, match: s => s.category === 'Photographers' },
  { key: 'events', label: 'Event Planners', icon: PartyPopper, match: s => s.category === 'Event Planners' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, match: s => s.category === 'Maintenance Companies' },
]

// ---------- ServiceCard ----------

function ServiceCard({
  svc,
  installed,
  onToggle,
  index,
}: {
  svc: MarketplaceService
  installed: boolean
  onToggle: (svc: MarketplaceService) => void
  index: number
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className={`p-0 gap-0 overflow-hidden h-full flex flex-col transition-all hover:shadow-lg ${installed ? 'ring-1 ring-emerald-500/30' : ''}`}>
        {/* Gradient header */}
        <div
          className="relative h-20 flex items-center justify-between px-4"
          style={{ background: `linear-gradient(135deg, ${svc.color}, ${svc.color}cc 50%, ${svc.color}88)` }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.45), transparent 60%)' }} />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-2xl shadow-sm">
            {svc.emoji}
          </div>
          <div className="relative flex flex-col items-end gap-1">
            <Badge className="bg-white/25 text-white border-0 backdrop-blur text-[9px] font-medium">
              {svc.category}
            </Badge>
            {installed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                <Check className="h-2.5 w-2.5" /> Installed
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{svc.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">by {svc.provider}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <Stars rating={svc.rating} />
            <span className="text-[10px] text-muted-foreground">({svc.reviews})</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 line-clamp-2 flex-1">
            {svc.description}
          </p>

          <Separator className="my-3" />

          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Price</p>
              <p className="text-sm font-bold text-foreground">{svc.price}</p>
            </div>
            <Button
              size="sm"
              className={`h-9 text-xs transition-all ${installed
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-md shadow-orange-500/20'
              }`}
              onClick={() => onToggle(svc)}
            >
              {installed ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Installed ✓
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Install
                </>
              )}
            </Button>
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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
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
            <span className={`ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-foreground/10 text-foreground'}`}>
              {counts[c.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------- AI Orchestration card ----------

const ORCHESTRATION_RULES = [
  {
    trigger: 'Guest checks out',
    icon: Sparkles,
    color: '#0d9488',
    actions: ['SparkleClean Pro', 'Wash & Fold Express'],
    note: 'Auto-triggered · zero manual coordination',
  },
  {
    trigger: 'Guest books airport pickup',
    icon: Plane,
    color: '#b45309',
    actions: ['AkwaabaTransfers'],
    note: 'Driver notified automatically with flight details',
  },
  {
    trigger: 'Maintenance issue reported',
    icon: Wrench,
    color: '#be123c',
    actions: ['FixIt Maintenance'],
    note: 'Tech dispatched · ETA tracked · auto-billed',
  },
  {
    trigger: 'Guest books a tour',
    icon: MapIcon,
    color: '#9333ea',
    actions: ['GoldCoast Tours'],
    note: 'Itinerary generated · pickup scheduled',
  },
]

function AIOrchestrationCard() {
  return (
    <Card className="relative overflow-hidden p-5 border-orange-500/20">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/30">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-semibold">AI orchestration</h3>
            <p className="text-[11px] text-muted-foreground">StayPilot auto-coordinates installed services</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed my-3">
          When a guest checks out, StayPilot auto-triggers <span className="font-semibold text-foreground">SparkleClean Pro + Wash & Fold Express</span>.
          When a guest books airport pickup, <span className="font-semibold text-foreground">AkwaabaTransfers</span> is notified automatically.
          No manual coordination.
        </p>

        <div className="space-y-2">
          {ORCHESTRATION_RULES.map(r => {
            const Icon = r.icon
            return (
              <div key={r.trigger} className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: r.color + '1a', color: r.color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{r.trigger}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {r.actions.map(a => (
                      <span key={a} className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium">
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                        {a}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{r.note}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// ---------- Become a provider card ----------

function BecomeProviderCard() {
  return (
    <Card className="p-5 h-full bg-gradient-to-br from-teal-500/8 via-emerald-500/5 to-amber-500/5 border-teal-500/20">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/25">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">Become a provider</h3>
          <p className="text-xs text-muted-foreground">List your hospitality service on StayPilot Marketplace</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {[
          { icon: Users, text: 'Reach 1,200+ properties across Ghana & West Africa' },
          { icon: Zap, text: 'Get auto-dispatched bookings via AI orchestration' },
          { icon: TrendingUp, text: 'Transparent pricing · no lead fees · weekly payouts' },
        ].map(b => {
          const Icon = b.icon
          return (
            <div key={b.text} className="flex items-center gap-2.5 text-xs">
              <Icon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-foreground/90">{b.text}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600"
          onClick={() => toast.success('Provider application started', { description: 'Approval in 24-48h · onboarding kit will be emailed' })}
        >
          <Wand2 className="h-3.5 w-3.5 mr-1.5" />
          Apply to list
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info('Provider docs opened', { description: 'Pricing · API · service level expectations' })}
        >
          Learn more
        </Button>
      </div>
    </Card>
  )
}

// ---------- Module ----------

export function MarketplaceModule() {
  const [active, setActive] = React.useState('all')
  const [installed, setInstalled] = React.useState<Record<string, boolean>>(
    Object.fromEntries(MARKETPLACE.map(s => [s.id, s.installed]))
  )

  const counts = React.useMemo(() => {
    const out: Record<string, number> = { all: MARKETPLACE.length }
    for (const c of CATEGORIES) {
      if (c.key === 'all') continue
      out[c.key] = MARKETPLACE.filter(c.match).length
    }
    return out
  }, [])

  const filtered = React.useMemo(() => {
    const cat = CATEGORIES.find(c => c.key === active) ?? CATEGORIES[0]
    return MARKETPLACE.filter(cat.match)
  }, [active])

  const handleToggle = (svc: MarketplaceService) => {
    setInstalled(s => {
      const next = { ...s, [svc.id]: !s[svc.id] }
      return next
    })
    const nowInstalled = !installed[svc.id]
    if (nowInstalled) {
      toast.success(`Installed — StayPilot will auto-orchestrate this service`, {
        description: `${svc.name} · ${svc.provider} · available immediately`,
      })
    } else {
      toast.info(`${svc.name} uninstalled`, { description: 'Orchestration rules using this service paused' })
    }
  }

  const installedCount = Object.values(installed).filter(Boolean).length
  const availableCount = MARKETPLACE.length - installedCount
  const avgRating = MARKETPLACE.reduce((s, x) => s + x.rating, 0) / MARKETPLACE.length
  const totalBookings = 1284 // mock

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden p-0 border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-500 to-purple-500" />
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 15% 30%, rgba(255,255,255,0.4) 0, transparent 45%), radial-gradient(circle at 85% 70%, rgba(234,88,12,0.45) 0, transparent 50%)' }} />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                  <Store className="h-3.5 w-3.5 text-white" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">Marketplace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Service Marketplace
                </h1>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  Install cleaning, laundry, transfers, tours, photographers, event planners, and maintenance — with one click. StayPilot orchestrates them automatically.
                </p>
              </div>
              <Button
                variant="secondary"
                className="bg-white/95 text-violet-700 hover:bg-white"
                onClick={() => toast.success('Provider application started', { description: 'Approval in 24-48h · onboarding kit will be emailed' })}
              >
                <Briefcase className="h-4 w-4 mr-1.5" />
                Become a provider
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Installed Services"
          value={`${installedCount}`}
          sub={`across ${MARKETPLACE.length} available`}
          icon={<Check className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Available Services"
          value={`${availableCount}`}
          sub="one-click install"
          icon={<Plus className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Avg Rating"
          value={`${avgRating.toFixed(1)}★`}
          sub={`${MARKETPLACE.reduce((s, x) => s + x.reviews, 0).toLocaleString()} reviews`}
          icon={<Star className="h-5 w-5" />}
          accent="gold"
        />
        <StatCard
          label="Bookings via Marketplace"
          value={totalBookings.toLocaleString()}
          sub="auto-orchestrated · 90 days"
          trend={14}
          icon={<ShoppingBag className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Category filter + grid */}
      <div className="space-y-4">
        <CategoryFilter active={active} setActive={setActive} counts={counts} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((svc, i) => (
              <ServiceCard
                key={svc.id}
                svc={svc}
                installed={installed[svc.id]}
                onToggle={handleToggle}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            <p className="text-sm">No services in this category yet.</p>
          </Card>
        )}
      </div>

      {/* AI orchestration + become a provider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIOrchestrationCard />
        <BecomeProviderCard />
      </div>
    </div>
  )
}
