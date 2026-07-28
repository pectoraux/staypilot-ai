'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatCard, SectionHeader } from '@/components/shared'
import { EXPERIENCES } from '@/lib/data'
import type { Experience } from '@/lib/types'
import { fmtMoney, fmtMoneyShort } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import {
  Sparkles, Star, TrendingUp, Plus, Megaphone, CalendarPlus, Compass, Award, Lightbulb, ArrowUpRight,
} from 'lucide-react'

const CATEGORY_COLORS: Record<Experience['category'], string> = {
  'Airport Pickup': '#0d9488',
  Tour: '#b45309',
  Laundry: '#9333ea',
  Meal: '#be123c',
  Spa: '#15803d',
  'Car Rental': '#a16207',
  Event: '#0e7490',
  Conference: '#c2410c',
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
      <span className="ml-1 text-[11px] font-medium text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="overflow-hidden p-0 gap-0 group transition-shadow hover:shadow-lg">
        {/* Gradient header */}
        <div
          className="relative h-24 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${exp.imageColor}, ${exp.imageColor}cc 50%, ${exp.imageColor}88)` }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4), transparent 60%)' }} />
          <div className="absolute top-2.5 left-3">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-[10px] font-medium">
              {exp.category}
            </Badge>
          </div>
          <div className="absolute top-2.5 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
            <p className="text-white font-bold text-sm drop-shadow truncate">{exp.name}</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight">{fmtMoney(exp.price)}</p>
              <p className="text-[10px] text-muted-foreground">per booking</p>
            </div>
            <Stars rating={exp.rating} />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-sm font-bold">{exp.bookingsThisMonth}</p>
              <p className="text-[10px] text-muted-foreground">bookings · mo</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(exp.revenueThisMonth)}</p>
              <p className="text-[10px] text-muted-foreground">revenue · mo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={() => toast.success('Promotion scheduled', { description: `${exp.name} featured in next guest email` })}
            >
              <Megaphone className="h-3 w-3" /> Promote
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => toast.success('Booking created', { description: `${exp.name} added to guest folio` })}
            >
              <CalendarPlus className="h-3 w-3" /> Book
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function RevenueByCategory() {
  const data = React.useMemo(() => {
    const map: Record<string, number> = {}
    EXPERIENCES.forEach(e => { map[e.category] = (map[e.category] ?? 0) + e.revenueThisMonth })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [])
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="p-5 col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">Revenue by Category</h3>
          <p className="text-xs text-muted-foreground">This month · {fmtMoneyShort(total)} total</p>
        </div>
        <Badge variant="outline" className="text-[10px]">{data.length} categories</Badge>
      </div>
      <div className="h-64 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoneyShort(v)} />
            <Tooltip
              cursor={{ fill: 'var(--accent)', opacity: 0.3 }}
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [fmtMoney(v), 'Revenue']}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={CATEGORY_COLORS[d.name as Experience['category']] ?? '#6b7280'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function TopPerformer() {
  const top = [...EXPERIENCES].sort((a, b) => b.revenueThisMonth - a.revenueThisMonth)[0]
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Top Performer</h3>
            <p className="text-xs text-muted-foreground">Highest revenue this month</p>
          </div>
        </div>
        <div className="rounded-xl border border-border p-4" style={{ background: `linear-gradient(135deg, ${top.imageColor}15, transparent)` }}>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-[10px] border-0" style={{ backgroundColor: top.imageColor + '20', color: top.imageColor }}>{top.category}</Badge>
            <Stars rating={top.rating} />
          </div>
          <p className="font-bold text-base">{top.name}</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(top.revenueThisMonth)}</p>
              <p className="text-[10px] text-muted-foreground">{top.bookingsThisMonth} bookings</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs"
              onClick={() => toast.success('Promotion scheduled', { description: `${top.name} featured on guest welcome screen` })}>
              <Megaphone className="h-3 w-3" /> Boost
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function UpsellNote() {
  return (
    <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-teal-500/10">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">Upsell Intelligence</h3>
            <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-600 dark:text-orange-400">AI insight</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Experiences increase revenue per guest by <span className="font-bold text-foreground">34% on average</span>.
            Guests who book at least one experience have a <span className="font-bold text-foreground">2.4× higher return rate</span>.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3 w-3" /> +₵412 avg upsell per guest
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Suggest experiences at booking confirmation</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ExperiencesModule() {
  const total = EXPERIENCES.length
  const monthlyRevenue = EXPERIENCES.reduce((s, e) => s + e.revenueThisMonth, 0)
  const top = [...EXPERIENCES].sort((a, b) => b.revenueThisMonth - a.revenueThisMonth)[0]
  const avgRating = (EXPERIENCES.reduce((s, e) => s + e.rating, 0) / EXPERIENCES.length).toFixed(1)
  const totalBookings = EXPERIENCES.reduce((s, e) => s + e.bookingsThisMonth, 0)

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Local Experience Marketplace"
        description="Curated upsells that grow revenue beyond the room night."
        action={
          <Button size="sm" onClick={() => toast.success('Experience added', { description: 'New experience published to marketplace' })}>
            <Plus className="h-3.5 w-3.5" /> Add experience
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Experiences" value={`${total}`} sub={`${totalBookings} bookings · mo`} icon={<Compass className="h-5 w-5" />} accent="brand" />
        <StatCard label="Monthly Revenue" value={fmtMoneyShort(monthlyRevenue)} sub="from experiences" icon={<TrendingUp className="h-5 w-5" />} accent="teal" trend={14} />
        <StatCard label="Top Performer" value={top.name.split(' ').slice(0, 2).join(' ')} sub={fmtMoneyShort(top.revenueThisMonth) + ' this mo'} icon={<Award className="h-5 w-5" />} accent="gold" />
        <StatCard label="Avg Rating" value={`${avgRating}★`} sub={`${totalBookings} bookings rated`} icon={<Star className="h-5 w-5" />} accent="violet" />
      </div>

      <UpsellNote />

      <RevenueByCategory />

      <SectionHeader
        title="Experience Catalog"
        description="Tap Promote to feature, or Book to add to a guest folio."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {EXPERIENCES.map((exp, i) => <ExperienceCard key={exp.id} exp={exp} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopPerformer />
        <Card className="p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">AI Curation Tips</h3>
              <p className="text-xs text-muted-foreground">Personalize offers to your guests</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Pair Airport Pickup + Spa', detail: 'Arrival-stressed guests convert 3.2× higher on relaxation upsells.', tag: 'Bundle' },
              { title: 'Tour for International Guests', detail: 'Tourism category is 68% booked by international segment.', tag: 'Segment' },
              { title: 'Conference Room → Weekday', detail: 'Conference upsells convert best Mon–Wed; promote to corporate accounts.', tag: 'Timing' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/40 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{s.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">{s.tag}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
