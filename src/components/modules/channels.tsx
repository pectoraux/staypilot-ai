'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { CHANNELS, PROPERTY } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Sparkles, Radio, RefreshCw, Plug, Zap, Wifi, CheckCircle2,
  TrendingUp, Percent, DollarSign, Layers, CalendarClock, UserCheck,
  Activity, ArrowRight,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

type ChannelType = 'OTA' | 'Direct' | 'Social'
// CHANNELS is inferred without `as const`, so `type` widens to string.
// We keep the local interface permissive and cast to ChannelType at use-sites.
type ChannelRow = typeof CHANNELS[number]

const TYPE_COLORS: Record<ChannelType, string> = {
  OTA: '#ea580c',
  Direct: '#0d9488',
  Social: '#be123c',
}

// Per-OTA mock analytics (cancellation rate + repeat guest rate)
const OTA_EXTRA: Record<string, { cancelRate: number; repeatRate: number }> = {
  Airbnb: { cancelRate: 11, repeatRate: 22 },
  'Booking.com': { cancelRate: 14, repeatRate: 18 },
  Expedia: { cancelRate: 9, repeatRate: 14 },
  Agoda: { cancelRate: 7, repeatRate: 12 },
  Vrbo: { cancelRate: 6, repeatRate: 28 },
}

// ---------- Sync health banner ----------
function SyncHealthBanner() {
  const connectedCount = CHANNELS.filter((c) => c.connected).length
  const totalChannels = CHANNELS.length
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <RefreshCw className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Sync health
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> All systems go
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">{PROPERTY.roomsTotal} rooms</span> synced across{' '}
              <span className="font-semibold text-foreground">{connectedCount} channels</span> ·{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">0 conflicts</span> · last sync{' '}
              <span className="font-medium text-foreground">2 min ago</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-muted-foreground">Calendars aligned</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs">
            <Wifi className="h-3.5 w-3.5 text-teal-500" />
            <span className="text-muted-foreground">API healthy</span>
          </div>
          <Button
            onClick={() =>
              toast.success('Manual sync started', {
                description: `${PROPERTY.roomsTotal} rooms × ${connectedCount} channels · ETA 30s`,
              })
            }
          >
            <RefreshCw className="h-4 w-4" /> Sync now
          </Button>
        </div>
      </div>
      {/* per-channel sync strip */}
      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {CHANNELS.filter((c) => c.connected).map((c) => (
          <TooltipProvider key={c.id} delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-2 py-1 text-[10px] font-medium"
                  style={{ color: c.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.syncStatus} · {c.bookingsThisMonth} bookings MTD</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </Card>
  )
}

// ---------- Channel card ----------
function ChannelCard({ c, idx }: { c: ChannelRow; idx: number }) {
  const [on, setOn] = React.useState(c.connected)
  React.useEffect(() => setOn(c.connected), [c.connected])
  const commissionPaid = Math.round((c.revenueThisMonth * c.commission) / 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
    >
      <Card className="relative overflow-hidden p-4 transition-shadow hover:shadow-md">
        {/* color accent stripe */}
        <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: c.color }} />
        <div className="pl-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
                style={{ backgroundColor: c.color }}
              >
                {c.name.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{c.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                    style={{
                      backgroundColor: TYPE_COLORS[c.type] + '1a',
                      color: TYPE_COLORS[c.type],
                    }}
                  >
                    {c.type}
                  </Badge>
                  {c.commission > 0 && (
                    <span className="text-[10px] text-muted-foreground">{c.commission}% commission</span>
                  )}
                </div>
              </div>
            </div>
            <Switch
              checked={on}
              onCheckedChange={(v) => {
                setOn(v)
                toast.success(v ? 'Channel connected' : 'Channel paused', {
                  description: `${c.name} ${v ? 'is now live and syncing' : 'paused — calendars frozen'}`,
                })
              }}
              aria-label={`Toggle ${c.name}`}
            />
          </div>

          {/* sync status pill */}
          <div className="mt-3 flex items-center justify-between">
            <StatusPill status={on ? c.syncStatus : 'Disconnected'} />
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Activity className="h-3 w-3" />
              {on ? 'Live sync' : 'Off'}
            </span>
          </div>

          {/* metrics */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Bookings</p>
              <p className="text-sm font-bold tabular-nums">{c.bookingsThisMonth}</p>
              <p className="text-[10px] text-muted-foreground">this month</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Revenue</p>
              <p className="text-sm font-bold tabular-nums">{fmtMoneyShort(c.revenueThisMonth)}</p>
              <p className="text-[10px] text-muted-foreground">
                {c.commission > 0 ? `-${fmtMoneyShort(commissionPaid)} comm.` : '0% commission'}
              </p>
            </div>
          </div>

          {/* CTA for unconnected */}
          {!on && (
            <Button
              size="sm"
              className="mt-3 w-full"
              style={{ backgroundColor: c.color, borderColor: c.color }}
              onClick={() => {
                setOn(true)
                toast.success(`${c.name} connected`, {
                  description: `Syncing ${PROPERTY.roomsTotal} rooms · ${c.commission}% commission`,
                })
              }}
            >
              <Plug className="h-3.5 w-3.5" /> Connect {c.name}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ---------- Channel grid ----------
function ChannelGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {CHANNELS.map((c, i) => (
        <ChannelCard key={c.id} c={c} idx={i} />
      ))}
    </div>
  )
}

// ---------- OTA analytics table ----------
function OtaAnalytics() {
  const otas = CHANNELS.filter((c) => c.type === 'OTA')
  const rows = otas.map((c) => {
    const commissionPaid = Math.round((c.revenueThisMonth * c.commission) / 100)
    const netRevenue = c.revenueThisMonth - commissionPaid
    const avgBookingValue = c.bookingsThisMonth > 0 ? Math.round(c.revenueThisMonth / c.bookingsThisMonth) : 0
    const extra = OTA_EXTRA[c.name] ?? { cancelRate: 10, repeatRate: 15 }
    return { ...c, commissionPaid, netRevenue, avgBookingValue, cancelRate: extra.cancelRate, repeatRate: extra.repeatRate }
  })
  const totals = {
    name: 'Total',
    commissionPaid: rows.reduce((s, r) => s + r.commissionPaid, 0),
    netRevenue: rows.reduce((s, r) => s + r.netRevenue, 0),
    revenueThisMonth: rows.reduce((s, r) => s + r.revenueThisMonth, 0),
    bookingsThisMonth: rows.reduce((s, r) => s + r.bookingsThisMonth, 0),
  }
  const totalAvgBooking = totals.bookingsThisMonth > 0 ? Math.round(totals.revenueThisMonth / totals.bookingsThisMonth) : 0
  const totalCancel = Math.round(rows.reduce((s, r) => s + r.cancelRate, 0) / rows.length)
  const totalRepeat = Math.round(rows.reduce((s, r) => s + r.repeatRate, 0) / rows.length)

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-5 pb-3">
        <div>
          <h3 className="font-semibold">OTA analytics</h3>
          <p className="text-xs text-muted-foreground">Commission, net revenue, and quality signals per OTA</p>
        </div>
        <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400">
          <Layers className="mr-1 h-3 w-3" /> {otas.length} OTAs
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[140px]">Channel</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Gross revenue</TableHead>
              <TableHead className="text-right">Commission paid</TableHead>
              <TableHead className="text-right">Net revenue</TableHead>
              <TableHead className="text-right">Avg booking</TableHead>
              <TableHead className="text-right">Cancel rate</TableHead>
              <TableHead className="text-right">Repeat guest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: r.color }}>
                      {r.name.slice(0, 2)}
                    </span>
                    <span className="font-medium">{r.name}</span>
                    {r.commission > 0 && <span className="text-[10px] text-muted-foreground">· {r.commission}%</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">{r.bookingsThisMonth}</TableCell>
                <TableCell className="text-right tabular-nums text-sm">{fmtMoneyShort(r.revenueThisMonth)}</TableCell>
                <TableCell className="text-right tabular-nums text-sm text-rose-600 dark:text-rose-400">
                  -{fmtMoneyShort(r.commissionPaid)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">{fmtMoneyShort(r.netRevenue)}</TableCell>
                <TableCell className="text-right tabular-nums text-sm">{r.avgBookingValue > 0 ? fmtMoney(r.avgBookingValue) : '—'}</TableCell>
                <TableCell className="text-right">
                  <span className={r.cancelRate >= 12 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {r.bookingsThisMonth > 0 ? `${r.cancelRate}%` : '—'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1 text-sm tabular-nums">
                    <UserCheck className="h-3 w-3 text-teal-500" />
                    {r.bookingsThisMonth > 0 ? `${r.repeatRate}%` : '—'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-border bg-muted/30 font-semibold">
              <TableCell>Total OTAs</TableCell>
              <TableCell className="text-right tabular-nums">{totals.bookingsThisMonth}</TableCell>
              <TableCell className="text-right tabular-nums">{fmtMoneyShort(totals.revenueThisMonth)}</TableCell>
              <TableCell className="text-right tabular-nums text-rose-600 dark:text-rose-400">-{fmtMoneyShort(totals.commissionPaid)}</TableCell>
              <TableCell className="text-right tabular-nums">{fmtMoneyShort(totals.netRevenue)}</TableCell>
              <TableCell className="text-right tabular-nums">{fmtMoney(totalAvgBooking)}</TableCell>
              <TableCell className="text-right tabular-nums">{totalCancel}%</TableCell>
              <TableCell className="text-right tabular-nums">{totalRepeat}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

// ---------- Revenue by type donut ----------
function RevenueByTypeChart() {
  const data = React.useMemo(() => {
    const groups: Record<ChannelType, number> = { OTA: 0, Direct: 0, Social: 0 }
    CHANNELS.forEach((c) => {
      if (c.connected) groups[c.type] += c.revenueThisMonth
    })
    return (Object.entries(groups) as Array<[ChannelType, number]>)
      .map(([type, value]) => ({ name: type, value, fill: TYPE_COLORS[type] }))
      .filter((d) => d.value > 0)
  }, [])
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="p-5">
      <div className="mb-1">
        <h3 className="font-semibold">Revenue by channel type</h3>
        <p className="text-xs text-muted-foreground">Direct channels earn 0% commission — push more here</p>
      </div>
      <div className="h-52 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={74} paddingAngle={3}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, n: string) => [fmtMoney(v), n]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
              <span className="text-muted-foreground">{d.name}</span>
            </span>
            <span className="font-medium">
              {fmtMoneyShort(d.value)} · {fmtPct((d.value / total) * 100)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ---------- Commission by OTA bar ----------
function CommissionByOtaChart() {
  const data = React.useMemo(() => {
    return CHANNELS
      .filter((c) => c.type === 'OTA' && c.connected)
      .map((c) => ({
        name: c.name.split('.')[0].split(' ')[0],
        fullName: c.name,
        commission: Math.round((c.revenueThisMonth * c.commission) / 100),
        color: c.color,
      }))
      .sort((a, b) => b.commission - a.commission)
  }, [])
  return (
    <Card className="p-5">
      <div className="mb-1">
        <h3 className="font-semibold">Commission paid by OTA</h3>
        <p className="text-xs text-muted-foreground">Largest OTA cost centers this month</p>
      </div>
      <div className="h-52 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `₵${(v / 1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} width={70} />
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [fmtMoney(v), 'Commission']}
              labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ''}
            />
            <Bar dataKey="commission" radius={[0, 6, 6, 0]} barSize={20}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// ---------- main ----------
export function ChannelsModule() {
  const connected = CHANNELS.filter((c) => c.connected)
  const connectedCount = connected.length

  const totalRevenue = connected.reduce((s, c) => s + c.revenueThisMonth, 0)
  const otaRevenue = connected.filter((c) => c.type === 'OTA').reduce((s, c) => s + c.revenueThisMonth, 0)
  const directRevenue = connected.filter((c) => c.type === 'Direct').reduce((s, c) => s + c.revenueThisMonth, 0)
  const socialRevenue = connected.filter((c) => c.type === 'Social').reduce((s, c) => s + c.revenueThisMonth, 0)
  const totalCommission = connected
    .filter((c) => c.type === 'OTA')
    .reduce((s, c) => s + Math.round((c.revenueThisMonth * c.commission) / 100), 0)
  const directPct = totalRevenue > 0 ? Math.round((directRevenue / totalRevenue) * 100) : 0
  const otaPct = totalRevenue > 0 ? Math.round((otaRevenue / totalRevenue) * 100) : 0
  const conflicts = 0

  return (
    <div className="space-y-5">
      {/* hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-teal-500/10 via-orange-500/5 to-amber-500/10 p-5 md:p-6">
        <div className="absolute right-3 top-3 hidden md:flex items-center gap-1.5 rounded-full bg-background/60 glass px-3 py-1 text-xs font-medium">
          <Radio className="h-3 w-3 text-teal-500" /> {connectedCount} of {CHANNELS.length} channels live
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
            <Radio className="h-3 w-3" /> Multi-Channel Manager
          </span>
          <StatusPill status="Active" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Connect every channel. <span className="text-gradient-brand">No double bookings.</span> AI syncs calendars 24/7.
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
          Kwabena (your OTA Manager AI) reconciles inventory across {connectedCount} channels every 60 seconds.{' '}
          {conflicts === 0 ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Zero conflicts detected</span>
          ) : (
            <span className="font-medium text-rose-600 dark:text-rose-400">{conflicts} conflicts need attention</span>
          )}{' '}
          · {fmtMoneyShort(totalRevenue)} gross revenue this month · {fmtMoneyShort(totalCommission)} paid in OTA commissions.
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Channels connected"
          value={`${connectedCount}/${CHANNELS.length}`}
          sub={`${CHANNELS.length - connectedCount} available to connect`}
          icon={<Plug className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Commission paid (MTD)"
          value={fmtMoneyShort(totalCommission)}
          sub={`${fmtPct((totalCommission / Math.max(otaRevenue, 1)) * 100)} of OTA revenue`}
          icon={<Percent className="h-5 w-5" />}
          accent="rose"
        />
        <StatCard
          label="Direct revenue %"
          value={`${directPct}%`}
          sub={`${fmtMoneyShort(directRevenue)} · 0% commission`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="OTA revenue %"
          value={`${otaPct}%`}
          sub={`${fmtMoneyShort(otaRevenue)} · ${socialRevenue > 0 ? `${fmtPct((socialRevenue / totalRevenue) * 100)} social` : 'high commission cost'}`}
          icon={<DollarSign className="h-5 w-5" />}
          accent="gold"
        />
      </div>

      <SyncHealthBanner />

      <SectionHeader
        title="Channel manager"
        description="Toggle channels live, monitor sync, and connect new distribution."
        action={
          <Badge variant="outline" className="gap-1">
            <CalendarClock className="h-3 w-3 text-orange-500" /> {PROPERTY.roomsTotal} rooms · auto-sync 60s
          </Badge>
        }
      />

      <ChannelGrid />

      <OtaAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueByTypeChart />
        <CommissionByOtaChart />
      </div>

      {/* Insight strip */}
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">OTA dependency is {otaPct}% — push more direct to lift margin</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Converting 10% of OTA bookings to direct saves{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {fmtMoneyShort(Math.round(totalCommission * 0.1))}
                </span>{' '}
                in commission next month. Vrbo (10% commission) is the cheapest OTA to add.
              </p>
            </div>
          </div>
          <Button className="shrink-0" onClick={() => toast.success('Direct conversion campaign queued', { description: 'Loyalty invites sent to 12 eligible OTA guests' })}>
            <Zap className="h-4 w-4" /> Run direct-conversion <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
