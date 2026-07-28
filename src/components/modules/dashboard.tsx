'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard, SectionHeader, SourceBadge } from '@/components/shared'
import {
  PROPERTY, RESERVATIONS, ROOMS, AI_RECOMMENDATIONS, AI_AGENTS, CHANNELS, GUESTS,
  occupancyForDate, SOURCE_COLORS,
} from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct, fmtDate, relativeDate, initials } from '@/lib/format'
import { useApp } from '@/lib/store'
import {
  Bed, Wallet, TrendingUp, Users, Radio, Sparkles, ArrowRight, AlertTriangle,
  Zap, CalendarPlus, LogOut, Phone, MessageCircle,
} from 'lucide-react'
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'

function useToday() {
  return React.useMemo(() => new Date().toISOString().slice(0, 10), [])
}

function OccupancyForecast() {
  const data = React.useMemo(() => {
    const arr: Array<{ date: string; label: string; occupancy: number }> = []
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      arr.push({ date: iso, label: i % 5 === 0 ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '', occupancy: occupancyForDate(iso) })
    }
    return arr
  }, [])
  const avg = Math.round(data.reduce((s, d) => s + d.occupancy, 0) / data.length)
  return (
    <Card className="p-5 col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">Next 30 Days Occupancy Forecast</h3>
          <p className="text-xs text-muted-foreground">Avg projected occupancy <span className="font-semibold text-foreground">{avg}%</span></p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
          <Sparkles className="h-3 w-3" /> AI predicted
        </span>
      </div>
      <div className="h-56 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [`${v}%`, 'Occupancy']}
              labelFormatter={(_, p) => p?.[0]?.payload?.date ? fmtDate(p[0].payload.date) : ''}
            />
            <Area type="monotone" dataKey="occupancy" stroke="#ea580c" strokeWidth={2.5} fill="url(#occGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function RevenueBySource() {
  const data = React.useMemo(() => {
    const bySrc: Record<string, number> = {}
    RESERVATIONS.forEach((r) => { bySrc[r.source] = (bySrc[r.source] ?? 0) + r.netRevenue })
    return Object.entries(bySrc).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 7)
  }, [])
  const total = data.reduce((s, d) => s + d.value, 0)
  const colors = ['#ea580c', '#0d9488', '#b45309', '#9333ea', '#be123c', '#15803d', '#a16207']
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-1">Revenue by Source</h3>
      <p className="text-xs text-muted-foreground mb-2">Net revenue this period · {fmtMoneyShort(total)}</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => fmtMoney(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1.5">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
              <span className="text-muted-foreground">{d.name}</span>
            </span>
            <span className="font-medium">{fmtPct((d.value / total) * 100)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SourceBreakdown() {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {}
    RESERVATIONS.forEach((r) => { counts[r.source] = (counts[r.source] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [])
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-1">Booking Source Breakdown</h3>
      <p className="text-xs text-muted-foreground mb-3">Where every booking came from</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} width={88} />
            <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} bookings`, 'Count']} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {data.map((d, i) => <Cell key={i} fill={SOURCE_COLORS[d.name as keyof typeof SOURCE_COLORS] ?? '#6b7280'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function OtaDependencyGauge() {
  const otaCount = RESERVATIONS.filter(r => ['Airbnb', 'Booking.com', 'Expedia', 'Agoda', 'Vrbo'].includes(r.source)).length
  const directCount = RESERVATIONS.length - otaCount
  const otaPct = Math.round((otaCount / RESERVATIONS.length) * 100)
  const directPct = 100 - otaPct
  const score = Math.max(0, 100 - otaPct)
  const data = [{ name: 'direct', value: directPct, fill: '#0d9488' }]
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-1">OTA Dependency Score</h3>
      <p className="text-xs text-muted-foreground mb-2">Lower OTA share = healthier margins</p>
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="68%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={20} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{score}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Direct health</span>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-500" /> Direct / own channels</span>
          <span className="font-semibold">{directPct}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> OTA (commission)</span>
          <span className="font-semibold">{otaPct}%</span>
        </div>
      </div>
    </Card>
  )
}

function RecommendationsPanel() {
  const { setModule } = useApp()
  return (
    <Card className="p-5 col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">AI Recommendations</h3>
            <p className="text-xs text-muted-foreground">Your AI Chief Revenue Officer is working 24/7</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setModule('agents')}>View all agents <ArrowRight className="h-3.5 w-3.5" /></Button>
      </div>
      <div className="space-y-2.5">
        {AI_RECOMMENDATIONS.map((rec) => {
          const agent = AI_AGENTS.find(a => a.id === rec.agentId)
          return (
            <div key={rec.id} className="group flex items-start gap-3 rounded-xl border border-border bg-card/50 p-3 transition-colors hover:bg-accent/40">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: agent?.color + '1a' }}>
                {agent?.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{rec.title}</p>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${rec.priority === 'High' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : rec.priority === 'Medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-slate-500/15 text-slate-500'}`}>{rec.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.detail}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{rec.impact}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{agent?.name} · {agent?.role}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">{rec.action}</Button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function UpcomingArrivals() {
  const today = useToday()
  const horizon = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
  const checkIns = RESERVATIONS.filter(r => r.checkIn >= today && r.checkIn <= horizon && (r.status === 'Confirmed' || r.status === 'Checked-in')).slice(0, 5)
  const checkOuts = RESERVATIONS.filter(r => r.checkOut >= today && r.checkOut <= horizon && (r.status === 'Checked-in' || r.status === 'Checked-out')).slice(0, 5)
  return (
    <Card className="p-5">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl bg-teal-500/10 p-3">
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400"><CalendarPlus className="h-3.5 w-3.5" /><span className="text-xs font-medium">Check-ins</span></div>
          <p className="text-2xl font-bold mt-1">{checkIns.length}</p>
          <p className="text-[10px] text-muted-foreground">next 3 days</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><LogOut className="h-3.5 w-3.5" /><span className="text-xs font-medium">Check-outs</span></div>
          <p className="text-2xl font-bold mt-1">{checkOuts.length}</p>
          <p className="text-[10px] text-muted-foreground">next 3 days</p>
        </div>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto scroll-area-fancy pr-1">
        {checkIns.map((r) => {
          const guest = GUESTS.find(g => g.id === r.guestId)
          return (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: guest?.avatarColor }}>{guest ? initials(guest.name) : '?'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.guestName}</p>
                <p className="text-[11px] text-muted-foreground">{ROOMS.find(rm => rm.id === r.roomIds[0])?.name} · {relativeDate(r.checkIn)}</p>
              </div>
              <SourceBadge source={r.source} color={SOURCE_COLORS[r.source]} />
            </div>
          )
        })}
        {checkIns.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No arrivals scheduled</p>}
      </div>
    </Card>
  )
}

function VacancyAlert() {
  const today = useToday()
  const fri = new Date(); fri.setDate(fri.getDate() + ((5 - fri.getDay() + 7) % 7 || 7))
  const friOcc = occupancyForDate(fri.toISOString().slice(0, 10))
  const emptyTonight = PROPERTY.roomsTotal - Math.round(occupancyForDate(today) / 100 * PROPERTY.roomsTotal)
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="font-semibold">AI Vacancy Engine</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Empty rooms are lost revenue. The AI is already working on it.</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{emptyTonight}</p>
            <p className="text-[11px] text-muted-foreground">rooms empty tonight</p>
            <p className="text-[11px] font-medium mt-1">{fmtMoney(emptyTonight * 850)} at risk</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{friOcc}%</p>
            <p className="text-[11px] text-muted-foreground">Friday occupancy</p>
            <p className="text-[11px] font-medium mt-1">Flash sale suggested</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {['Launched WhatsApp flash sale to 48 lapsed guests', 'Raised Booking.com visibility for empty rooms', 'Notified 3 corporate accounts of availability'].map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <Zap className="h-3 w-3 text-orange-500 shrink-0" />
              <span className="text-muted-foreground">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function DashboardModule() {
  const today = useToday()
  const occToday = occupancyForDate(today)
  const availableTonight = PROPERTY.roomsTotal - Math.round(occToday / 100 * PROPERTY.roomsTotal)
  const mtdRevenue = RESERVATIONS.filter(r => r.status !== 'Cancelled').reduce((s, r) => s + r.netRevenue, 0)
  const activeRes = RESERVATIONS.filter(r => r.status !== 'Cancelled' && r.status !== 'No-show')
  const adr = Math.round(activeRes.reduce((s, r) => s + r.grossRevenue, 0) / activeRes.length)
  const revpar = Math.round(mtdRevenue / (PROPERTY.roomsTotal * 30))
  const repeatGuests = GUESTS.filter(g => g.repeatVisits > 0).length
  const repeatPct = Math.round((repeatGuests / GUESTS.length) * 100)
  const directPct = Math.round(RESERVATIONS.filter(r => !['Airbnb', 'Booking.com', 'Expedia', 'Agoda', 'Vrbo'].includes(r.source)).length / RESERVATIONS.length * 100)
  const cancelRate = Math.round(RESERVATIONS.filter(r => r.status === 'Cancelled').length / RESERVATIONS.length * 100)

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-teal-500/10 p-5 md:p-6">
        <div className="absolute right-4 top-4 hidden md:flex items-center gap-1.5 rounded-full bg-background/60 glass px-3 py-1 text-xs font-medium">
          <Phone className="h-3 w-3 text-orange-500" /> {relativeDate(today)} · Good morning, Kwesi
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
            <Sparkles className="h-3 w-3" /> AI Chief Revenue Officer · Active
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Akwaaba 👋 {occToday}% occupied today — <span className="text-gradient-brand">let&apos;s fill the other {availableTonight}.</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          Your 10 AI agents have already worked overnight: synced calendars across 5 OTAs, drafted 2 campaigns, and flagged Friday&apos;s soft occupancy. Here&apos;s where you stand.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Occupancy" value={`${occToday}%`} sub={`${availableTonight} rooms available tonight`} trend={4} icon={<Bed className="h-5 w-5" />} accent="brand" />
        <StatCard label="Revenue (MTD)" value={fmtMoneyShort(mtdRevenue)} sub={`${fmtMoney(adr)} ADR`} trend={9} icon={<Wallet className="h-5 w-5" />} accent="teal" />
        <StatCard label="Direct Booking %" value={`${directPct}%`} sub={`${100 - directPct}% via OTA`} trend={7} icon={<Radio className="h-5 w-5" />} accent="gold" />
        <StatCard label="RevPAR" value={fmtMoney(revpar)} sub={`${cancelRate}% cancellation rate`} trend={-2} icon={<TrendingUp className="h-5 w-5" />} accent="violet" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Repeat Guest %" value={`${repeatPct}%`} sub={`${repeatGuests} returning guests`} accent="teal" />
        <StatCard label="Available Tonight" value={`${availableTonight}`} sub={`${fmtMoney(availableTonight * 850)} revenue at risk`} accent="rose" />
        <StatCard label="Active Guests" value={`${GUESTS.length}`} sub={`${GUESTS.filter(g => g.loyaltyTier === 'VIP').length} VIP members`} accent="gold" />
        <StatCard label="Avg Daily Rate" value={fmtMoney(adr)} sub={`RevPAR ${fmtMoney(revpar)}`} accent="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OccupancyForecast />
        <RevenueBySource />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecommendationsPanel />
        <UpcomingArrivals />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SourceBreakdown />
        <VacancyAlert />
        <OtaDependencyGauge />
      </div>
    </div>
  )
}
