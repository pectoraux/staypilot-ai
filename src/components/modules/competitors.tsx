'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { COMPETITORS, PROPERTY } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Star, MapPin, TrendingUp, Sparkles, Trophy, Building2,
  Gauge, Shield, Plug, Crown, Target,
  Navigation, Eye, Zap,
} from 'lucide-react'
import {
  BarChart, Bar, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
  CartesianGrid, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ScatterChart, Scatter, ZAxis, Legend,
} from 'recharts'

// Your property benchmark row
const YOU = {
  id: 'you',
  name: PROPERTY.name,
  distance: 0,
  avgRate: 850,
  occupancy: 78,
  rating: 4.4,
  reviewCount: 412,
  amenities: ['Pool', 'WiFi', 'Breakfast', 'Bar', 'Airport Pickup'],
  rank: 0,
}

const PALETTE = ['#ea580c', '#0d9488', '#b45309', '#9333ea', '#be123c', '#15803d']
const BAR_YOU = '#ea580c'
const BAR_COMP = '#0d9488'

// ---------- Stars ----------
function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-semibold tabular-nums">{value.toFixed(1)}</span>
    </span>
  )
}

// ---------- AI Recommendations (derived from data) ----------
const RECS: Array<{
  id: string
  title: string
  detail: string
  impact: string
  action: string
  tone: 'up' | 'down' | 'warning' | 'opportunity'
  icon: React.ReactNode
}> = [
  {
    id: 'rec-1',
    title: 'Raise Deluxe rates — 18% below Golden Tulip',
    detail: 'Your Deluxe rooms at ₵850 sit 13% under Golden Tulip (₵980) while matching or beating them on rating. Margin is being left on the table on peak nights.',
    impact: '+₵2,300 / night',
    action: 'Apply +12% peak weekend rate',
    tone: 'up',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    id: 'rec-2',
    title: 'Kempinski outscores you on reviews — invest in service recovery',
    detail: 'Kempinski (4.7★, 1,850 reviews) leads the market. You trail at 4.4★ with only 412 reviews. A proactive review-request flow + 24h reply SLA will close the gap.',
    impact: '+0.2 rating · +30% review volume',
    action: 'Launch review-request automation',
    tone: 'warning',
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: 'rec-3',
    title: 'Vrbo not connected — competitors list there',
    detail: 'Golden Tulip, Accra City and Ibis Styles all list on Vrbo. You\u2019re absent. Adding Vrbo expands distribution with only 10% commission — lower than Booking.com\u2019s 15%.',
    impact: '+6 bookings / month',
    action: 'Connect Vrbo channel',
    tone: 'opportunity',
    icon: <Plug className="h-4 w-4" />,
  },
  {
    id: 'rec-4',
    title: 'Labadi Beach commands 71% premium — Suite & Penthouse underpriced',
    detail: 'Labadi Beach (₵1,450) earns 71% more per night than you with comparable occupancy. Your Penthouse at ₵2,200 is 48% below Kempinski\u2019s entry suite. Test ₵2,600 next weekend.',
    impact: '+₵400 / suite night',
    action: 'Test +18% on Penthouse',
    tone: 'up',
    icon: <Crown className="h-4 w-4" />,
  },
]

// ---------- Comparison Table ----------
function ComparisonTable() {
  // Combine you + competitors, sort by rank (you = 0)
  const rows = [YOU, ...COMPETITORS].sort((a, b) => a.distance - b.distance)
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-5 pb-3">
        <div>
          <h3 className="font-semibold">Competitor comparison</h3>
          <p className="text-xs text-muted-foreground">5 nearby properties · live rate & occupancy scan</p>
        </div>
        <Badge className="bg-teal-500/15 text-teal-600 dark:text-teal-400">
          <Navigation className="mr-1 h-3 w-3" /> within 5 km
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[180px]">Property</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Avg rate</TableHead>
              <TableHead className="text-right">Occupancy</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Reviews</TableHead>
              <TableHead>Amenities</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c, i) => {
              const isYou = c.id === 'you'
              return (
                <TableRow
                  key={c.id}
                  className={isYou ? 'bg-orange-500/5 hover:bg-orange-500/10' : 'group'}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isYou ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white text-xs font-bold">
                          <Trophy className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                          {i}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold flex items-center gap-1.5">
                          {c.name}
                          {isYou && <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400">You</Badge>}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{isYou ? 'East Legon, Accra' : `${c.distance} km away`}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {isYou ? '—' : `${c.distance} km`}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold tabular-nums">{fmtMoney(c.avgRate)}</span>
                    {!isYou && c.avgRate > YOU.avgRate && (
                      <span className="ml-1 text-[10px] text-rose-500">+{fmtPct(((c.avgRate - YOU.avgRate) / YOU.avgRate) * 100)}</span>
                    )}
                    {!isYou && c.avgRate < YOU.avgRate && (
                      <span className="ml-1 text-[10px] text-emerald-500">-{fmtPct(((YOU.avgRate - c.avgRate) / YOU.avgRate) * 100)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden sm:block h-2 w-12 overflow-hidden rounded-full bg-muted">
                        <div
                          className={c.occupancy >= 80 ? 'bg-emerald-500 h-full' : c.occupancy >= 70 ? 'bg-amber-500 h-full' : 'bg-rose-500 h-full'}
                          style={{ width: `${c.occupancy}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-sm font-medium">{c.occupancy}%</span>
                    </div>
                  </TableCell>
                  <TableCell><Stars value={c.rating} /></TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-muted-foreground">{c.reviewCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {c.amenities.slice(0, 4).map((a) => (
                        <span key={a} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{a}</span>
                      ))}
                      {c.amenities.length > 4 && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">+{c.amenities.length - 4}</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

// ---------- Rate comparison bar chart ----------
function RateComparisonChart() {
  const data = [YOU, ...COMPETITORS].map((c, i) => ({
    name: c.id === 'you' ? 'You' : c.name.split(' ')[0],
    fullName: c.name,
    rate: c.avgRate,
    fill: c.id === 'you' ? BAR_YOU : BAR_COMP,
  }))
  return (
    <Card className="p-5">
      <div className="mb-1">
        <h3 className="font-semibold">Average nightly rate</h3>
        <p className="text-xs text-muted-foreground">You vs 5 nearby competitors</p>
      </div>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} unit="₵" />
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [fmtMoney(v), 'Avg rate']}
              labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ''}
            />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={28}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// ---------- Occupancy comparison bar chart ----------
function OccupancyComparisonChart() {
  const data = [YOU, ...COMPETITORS].map((c) => ({
    name: c.id === 'you' ? 'You' : c.name.split(' ')[0],
    fullName: c.name,
    occ: c.occupancy,
    fill: c.id === 'you' ? BAR_YOU : BAR_COMP,
  }))
  return (
    <Card className="p-5">
      <div className="mb-1">
        <h3 className="font-semibold">Occupancy rate</h3>
        <p className="text-xs text-muted-foreground">Higher = stronger demand capture</p>
      </div>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [`${v}%`, 'Occupancy']}
              labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ''}
            />
            <Bar dataKey="occ" radius={[6, 6, 0, 0]} barSize={28}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// ---------- Rating vs Price scatter ----------
function RatingPriceScatter() {
  const data = [YOU, ...COMPETITORS].map((c) => ({
    name: c.id === 'you' ? 'You' : c.name,
    rating: c.rating,
    price: c.avgRate,
    reviews: c.reviewCount,
    fill: c.id === 'you' ? BAR_YOU : BAR_COMP,
  }))
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">Rating vs Price</h3>
          <p className="text-xs text-muted-foreground">Top-left = value leader · top-right = premium tier</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: BAR_YOU }} /> You</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: BAR_COMP }} /> Competitors</span>
        </div>
      </div>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 16, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
            <XAxis
              type="number"
              dataKey="rating"
              domain={[3.5, 5]}
              name="Rating"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}★`}
            />
            <YAxis
              type="number"
              dataKey="price"
              name="Price"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₵${v}`}
            />
            <ZAxis type="number" dataKey="reviews" range={[60, 320]} name="Reviews" />
            <RTooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name: string) => {
                if (name === 'Price') return [fmtMoney(v), name]
                if (name === 'Rating') return [`${v}★`, name]
                return [v.toLocaleString(), name]
              }}
              labelFormatter={(_, p) => p?.[0]?.payload?.name ?? ''}
            />
            <Scatter data={data}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// ---------- Competitor map placeholder ----------
function CompetitorMap() {
  // Position competitors around a center "you" marker using their distance + a fixed bearing
  const bearings = [-30, 60, 130, 200, 290] // degrees
  const placed = COMPETITORS.map((c, i) => {
    const b = bearings[i] * Math.PI / 180
    // scale distance to 0-45% radius
    const r = Math.min(45, c.distance * 8)
    const x = 50 + r * Math.cos(b)
    const y = 50 + r * Math.sin(b)
    return { ...c, x, y, color: PALETTE[i % PALETTE.length] }
  })
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">Competitor map</h3>
          <p className="text-xs text-muted-foreground">Relative locations around {PROPERTY.name}</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3 text-orange-500" /> East Legon
        </Badge>
      </div>
      <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted/40 via-background to-muted/30">
        {/* grid rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0.25, 0.5, 0.75].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border border-dashed border-border"
              style={{ width: `${r * 100}%`, height: `${r * 100}%` }}
            />
          ))}
          {/* crosshair lines */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border/50" />
          <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-border/50" />
        </div>
        {/* you marker (center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative flex flex-col items-center">
            <div className="absolute -inset-3 rounded-full bg-orange-500/20 animate-ping" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="mt-1 rounded-md bg-background/80 glass px-1.5 py-0.5 text-[10px] font-semibold">{PROPERTY.name.split(' ')[0]}</span>
          </div>
        </div>
        {/* competitor markers */}
        {placed.map((c) => (
          <TooltipProvider key={c.id} delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform hover:scale-110"
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  onClick={() => toast.info(c.name, { description: `${c.distance} km · ${fmtMoney(c.avgRate)}/night · ${c.occupancy}% occ` })}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md" style={{ backgroundColor: c.color }}>
                    <Building2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="mt-0.5 hidden sm:block rounded bg-background/80 glass px-1 py-0.5 text-[9px] font-medium">{c.name.split(' ')[0]}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.distance} km · {fmtMoney(c.avgRate)}/night · {c.occupancy}% occ</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {/* legend */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-background/80 glass px-2 py-1 text-[10px] text-muted-foreground">
          <span>0 km</span><span>·</span><span>5 km radius</span>
        </div>
      </div>
    </Card>
  )
}

// ---------- AI recommendations ----------
function AIRecs() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-semibold">AI recommendations</h3>
            <p className="text-xs text-muted-foreground">Derived from live competitor scan</p>
          </div>
        </div>
        <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400">
          <Zap className="mr-1 h-3 w-3" /> {RECS.length} actions
        </Badge>
      </div>
      <Separator className="my-3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {RECS.map((r, i) => {
          const toneCls =
            r.tone === 'up' ? 'border-emerald-500/30 bg-emerald-500/5' :
            r.tone === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
            r.tone === 'opportunity' ? 'border-teal-500/30 bg-teal-500/5' :
            'border-rose-500/30 bg-rose-500/5'
          const iconCls =
            r.tone === 'up' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
            r.tone === 'warning' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
            r.tone === 'opportunity' ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400' :
            'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border ${toneCls} p-3.5 flex flex-col gap-2`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconCls}`}>{r.icon}</span>
                <p className="text-sm font-semibold leading-tight">{r.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.detail}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Target className="h-3 w-3" /> {r.impact}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() => toast.success('Action queued', { description: r.action })}
                >
                  {r.action}
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

// ---------- Position summary radar ----------
function PositionRadar() {
  // normalise each axis 0-100, higher = better position
  const maxRate = Math.max(...[YOU, ...COMPETITORS].map((c) => c.avgRate))
  const maxReviews = Math.max(...[YOU, ...COMPETITORS].map((c) => c.reviewCount))
  const youScores = {
    name: 'You',
    Rate: Math.round((YOU.avgRate / maxRate) * 100),
    Occupancy: YOU.occupancy,
    Rating: Math.round((YOU.rating / 5) * 100),
    Reviews: Math.round((YOU.reviewCount / maxReviews) * 100),
    Amenities: Math.round((YOU.amenities.length / 6) * 100),
  }
  // market averages
  const avg = (k: 'avgRate' | 'occupancy' | 'rating' | 'reviewCount') =>
    COMPETITORS.reduce((s, c) => s + c[k], 0) / COMPETITORS.length
  const marketScores = {
    name: 'Market avg',
    Rate: Math.round((avg('avgRate') / maxRate) * 100),
    Occupancy: Math.round(avg('occupancy')),
    Rating: Math.round((avg('rating') / 5) * 100),
    Reviews: Math.round((avg('reviewCount') / maxReviews) * 100),
    Amenities: Math.round((COMPETITORS.reduce((s, c) => s + c.amenities.length, 0) / COMPETITORS.length / 6) * 100),
  }
  const data = [
    { axis: 'Rate', You: youScores.Rate, Market: marketScores.Rate },
    { axis: 'Occupancy', You: youScores.Occupancy, Market: marketScores.Occupancy },
    { axis: 'Rating', You: youScores.Rating, Market: marketScores.Rating },
    { axis: 'Reviews', You: youScores.Reviews, Market: marketScores.Reviews },
    { axis: 'Amenities', You: youScores.Amenities, Market: marketScores.Amenities },
  ]
  return (
    <Card className="p-5">
      <div className="mb-1">
        <h3 className="font-semibold">Market position</h3>
        <p className="text-xs text-muted-foreground">You vs competitor average across 5 dimensions</p>
      </div>
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="currentColor" className="text-border" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => `${Math.round(v)}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Radar name="Market avg" dataKey="Market" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} strokeWidth={1.5} />
            <Radar name="You" dataKey="You" stroke="#ea580c" fill="#ea580c" fillOpacity={0.35} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// ---------- main ----------
export function CompetitorsModule() {
  const marketAvgRate = Math.round(COMPETITORS.reduce((s, c) => s + c.avgRate, 0) / COMPETITORS.length)
  const marketAvgOcc = Math.round(COMPETITORS.reduce((s, c) => s + c.occupancy, 0) / COMPETITORS.length)
  const rateGap = Math.round(((YOU.avgRate - marketAvgRate) / marketAvgRate) * 100)
  const occGap = YOU.occupancy - marketAvgOcc
  const topRated = [...COMPETITORS].sort((a, b) => b.rating - a.rating)[0]
  const ratingGap = +(topRated.rating - YOU.rating).toFixed(1)

  return (
    <div className="space-y-5">
      {/* hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-teal-500/10 via-amber-500/5 to-orange-500/10 p-5 md:p-6">
        <div className="absolute right-3 top-3 hidden md:flex items-center gap-1.5 rounded-full bg-background/60 glass px-3 py-1 text-xs font-medium">
          <Eye className="h-3 w-3 text-teal-500" /> Live rate scan · refreshed 8 min ago
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
            <Building2 className="h-3 w-3" /> Competitor Intelligence
          </span>
          <StatusPill status="Active" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Know your market. <span className="text-gradient-brand">Win every night.</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
          StayPilot scans 5 nearby properties every hour for rates, occupancy, reviews and amenities. Your rate is{' '}
          <span className={rateGap < 0 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-orange-600 dark:text-orange-400'}>
            {rateGap < 0 ? `${fmtPct(Math.abs(rateGap))} below` : `${fmtPct(rateGap)} above`}
          </span>{' '}
          market average ({fmtMoney(marketAvgRate)}), and your occupancy is{' '}
          <span className={occGap >= 0 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-rose-600 dark:text-rose-400'}>
            {occGap >= 0 ? `+${occGap}pts above` : `${Math.abs(occGap)}pts below`}
          </span>{' '}
          market ({marketAvgOcc}%).
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Your rate vs market"
          value={fmtPct(rateGap)}
          sub={`market avg ${fmtMoney(marketAvgRate)}`}
          trend={rateGap}
          icon={<TrendingUp className="h-5 w-5" />}
          accent={rateGap < 0 ? 'teal' : 'brand'}
        />
        <StatCard
          label="Your occupancy"
          value={`${YOU.occupancy}%`}
          sub={`${occGap >= 0 ? '+' : ''}${occGap}pts vs market`}
          trend={occGap}
          icon={<Gauge className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Rating gap to leader"
          value={`-${ratingGap}★`}
          sub={`${topRated.name} leads at ${topRated.rating}★`}
          icon={<Star className="h-5 w-5" />}
          accent="gold"
        />
        <StatCard
          label="Competitors tracked"
          value={`${COMPETITORS.length}`}
          sub={`within 5 km of ${PROPERTY.name.split(' ')[0]}`}
          icon={<Navigation className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      <ComparisonTable />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RateComparisonChart />
        <OccupancyComparisonChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RatingPriceScatter />
        <CompetitorMap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIRecs />
        <PositionRadar />
      </div>
    </div>
  )
}
