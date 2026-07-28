'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard, SectionHeader, SourceBadge } from '@/components/shared'
import { FINANCIALS, RESERVATIONS, SOURCE_COLORS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import {
  ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, Percent, RefreshCcw, Download, AlertCircle,
  ArrowUpRight, ArrowDownRight, Banknote, Receipt,
} from 'lucide-react'

const OTA_LIST = ['Airbnb', 'Booking.com', 'Expedia', 'Agoda', 'Vrbo'] as const

const EXPENSE_BREAKDOWN = [
  { name: 'Staffing', pct: 38, color: '#ea580c' },
  { name: 'Utilities', pct: 14, color: '#0d9488' },
  { name: 'Maintenance', pct: 9, color: '#b45309' },
  { name: 'Marketing', pct: 7, color: '#9333ea' },
  { name: 'Supplies', pct: 6, color: '#be123c' },
  { name: 'Other', pct: 4, color: '#a16207' },
]

const OUTSTANDING_BALANCES = [
  { id: 'ob-1', entity: 'MTN Ghana', desc: 'Corporate invoice · Sept', amount: 18400, due: 'in 5 days', severity: 'warning' as const },
  { id: 'ob-2', entity: 'Booking.com', desc: 'Commission settlement · Oct', amount: 12350, due: 'in 2 days', severity: 'critical' as const },
  { id: 'ob-3', entity: 'Zenith Travels', desc: 'Group booking balance', amount: 8600, due: 'in 12 days', severity: 'info' as const },
  { id: 'ob-4', entity: 'UNICEF West Africa', desc: 'PO #4471 outstanding', amount: 6200, due: 'in 18 days', severity: 'info' as const },
]

const RECENT_REFUNDS = [
  { id: 'rf-1', guest: 'Linda Martinez', reason: 'Cancelled within window', amount: 1350, date: '2 days ago' },
  { id: 'rf-2', guest: 'James Okoro', reason: 'AC complaint resolution', amount: 450, date: '5 days ago' },
  { id: 'rf-3', guest: 'Sarah Patel', reason: 'Double-charged folio', amount: 920, date: '1 week ago' },
]

function StatGrid() {
  const latest = FINANCIALS[FINANCIALS.length - 1]
  const prev = FINANCIALS[FINANCIALS.length - 2]
  const profitMargin = Math.round((latest.profit / latest.revenue) * 100)
  const prevMargin = Math.round((prev.profit / prev.revenue) * 100)
  const otaCommissionTotal = FINANCIALS.reduce((s, f) => s + f.otaCommission, 0)
  const outstanding = OUTSTANDING_BALANCES.reduce((s, o) => s + o.amount, 0)
  const refundsTotal = RECENT_REFUNDS.reduce((s, r) => s + r.amount, 0)
  const cashFlow = latest.profit - 9800 // mock operating capex
  const revTrend = Math.round(((latest.revenue - prev.revenue) / prev.revenue) * 100)

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmtMoneyShort(latest.revenue)} sub="this month" icon={<Wallet className="h-5 w-5" />} accent="brand" trend={revTrend} />
        <StatCard label="Total Expenses" value={fmtMoneyShort(latest.expenses)} sub={`incl. ${fmtMoneyShort(latest.otaCommission)} OTA`} icon={<TrendingDown className="h-5 w-5" />} accent="rose" trend={-3} />
        <StatCard label="OTA Commissions Paid" value={fmtMoneyShort(latest.otaCommission)} sub={`${Math.round((latest.otaCommission / latest.revenue) * 100)}% of revenue`} icon={<DollarSign className="h-5 w-5" />} accent="gold" />
        <StatCard label="Net Profit" value={fmtMoneyShort(latest.profit)} sub="after expenses & commissions" icon={<TrendingUp className="h-5 w-5" />} accent="teal" trend={Math.round(((latest.profit - prev.profit) / prev.profit) * 100)} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Profit Margin" value={fmtPct(profitMargin)} sub={`was ${fmtPct(prevMargin)} last mo`} icon={<Percent className="h-5 w-5" />} accent="violet" trend={profitMargin - prevMargin} />
        <StatCard label="Outstanding Balances" value={fmtMoneyShort(outstanding)} sub={`${OUTSTANDING_BALANCES.length} receivables`} icon={<AlertCircle className="h-5 w-5" />} accent="gold" />
        <StatCard label="Refunds (30d)" value={fmtMoneyShort(refundsTotal)} sub={`${RECENT_REFUNDS.length} refunds processed`} icon={<RefreshCcw className="h-5 w-5" />} accent="rose" />
        <StatCard label="Cash Flow" value={fmtMoneyShort(cashFlow)} sub="after operating capex" icon={<Banknote className="h-5 w-5" />} accent="teal" trend={6} />
      </div>
    </>
  )
}

function ComposedTrendChart() {
  const data = FINANCIALS.map(f => ({
    month: f.month,
    Revenue: f.revenue,
    Expenses: f.expenses,
    Commission: f.otaCommission,
    Profit: f.profit,
  }))
  return (
    <Card className="p-5 col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold">Revenue vs Expenses vs Commission</h3>
          <p className="text-xs text-muted-foreground">Last {FINANCIALS.length} months · profit overlaid</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /> Revenue</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Expenses</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Commission</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500" /> Profit</span>
        </div>
      </div>
      <div className="h-72 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#be123c" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#be123c" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoneyShort(v)} />
            <Tooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name) => [fmtMoney(v), name]}
            />
            <Bar dataKey="Revenue" fill="url(#revGrad)" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="Expenses" fill="url(#expGrad)" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="Commission" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
            <Line type="monotone" dataKey="Profit" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3, fill: '#0d9488' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function RevenueBySource() {
  const data = React.useMemo(() => {
    const map: Record<string, number> = {}
    RESERVATIONS.forEach(r => { map[r.source] = (map[r.source] ?? 0) + r.netRevenue })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [])
  const total = data.reduce((s, d) => s + d.value, 0)
  const palette = ['#ea580c', '#0d9488', '#b45309', '#9333ea', '#be123c', '#15803d']
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-1">Revenue by Source</h3>
      <p className="text-xs text-muted-foreground mb-2">Net · {fmtMoneyShort(total)} total</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
              {data.map((d, i) => <Cell key={i} fill={SOURCE_COLORS[d.name as keyof typeof SOURCE_COLORS] ?? palette[i]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => fmtMoney(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SOURCE_COLORS[d.name as keyof typeof SOURCE_COLORS] ?? palette[i] }} />
              <span className="text-muted-foreground">{d.name}</span>
            </span>
            <span className="font-medium">{fmtPct((d.value / total) * 100)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ExpenseBreakdown() {
  const latest = FINANCIALS[FINANCIALS.length - 1]
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-1">Top Expenses</h3>
      <p className="text-xs text-muted-foreground mb-3">Share of {fmtMoneyShort(latest.expenses)} this month</p>
      <div className="space-y-3">
        {EXPENSE_BREAKDOWN.map(e => (
          <div key={e.name}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                <span className="font-medium">{e.name}</span>
              </span>
              <span className="font-semibold">{fmtPct(e.pct)} <span className="text-muted-foreground font-normal">· {fmtMoneyShort(latest.expenses * e.pct / 100)}</span></span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${e.pct}%`, backgroundColor: e.color }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CommissionByOta() {
  const data = React.useMemo(() => {
    const map: Record<string, number> = {}
    RESERVATIONS.forEach(r => {
      if (OTA_LIST.includes(r.source as typeof OTA_LIST[number])) {
        map[r.source] = (map[r.source] ?? 0) + r.commission
      }
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [])
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-1">Commission by OTA</h3>
      <p className="text-xs text-muted-foreground mb-3">{fmtMoneyShort(total)} paid across {data.length} channels</p>
      <div className="space-y-2">
        {data.map(d => {
          const pct = Math.round((d.value / total) * 100)
          const color = SOURCE_COLORS[d.name as keyof typeof SOURCE_COLORS] ?? '#6b7280'
          return (
            <div key={d.name} className="flex items-center gap-3">
              <SourceBadge source={d.name} color={color} />
              <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
              <span className="text-xs font-semibold w-16 text-right">{fmtMoneyShort(d.value)}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function CashFlowForecast() {
  const latest = FINANCIALS[FINANCIALS.length - 1]
  const projected = Math.round(latest.revenue * 1.08)
  // Build a small forecast series (last 3 actual + 1 projected)
  const recent = FINANCIALS.slice(-3)
  const data = [
    ...recent.map(f => ({ month: f.month, Revenue: f.revenue, type: 'actual' })),
    { month: 'Next', Revenue: projected, type: 'forecast' as const },
  ]
  return (
    <Card className="p-5 col-span-1 lg:col-span-2 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div>
            <h3 className="font-semibold">Cash Flow & Forecast</h3>
            <p className="text-xs text-muted-foreground">Projected next-month revenue · trend</p>
          </div>
          <Badge variant="outline" className="border-teal-500/30 text-teal-600 dark:text-teal-400">
            <ArrowUpRight className="h-3 w-3" /> +8% projected
          </Badge>
        </div>
        <div className="flex items-end gap-4 mt-3">
          <div>
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{fmtMoneyShort(projected)}</p>
            <p className="text-[11px] text-muted-foreground">projected next-month revenue</p>
          </div>
        </div>
        <div className="h-32 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoneyShort(v)} />
              <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [fmtMoney(v), 'Revenue']} />
              <Area type="monotone" dataKey="Revenue" stroke="#0d9488" strokeWidth={2.5} fill="url(#cfGrad)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

function OutstandingCard() {
  const total = OUTSTANDING_BALANCES.reduce((s, o) => s + o.amount, 0)
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Outstanding Balances</h3>
            <p className="text-xs text-muted-foreground">{fmtMoneyShort(total)} to collect</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => toast.info('Reminders sent', { description: `${OUTSTANDING_BALANCES.length} statements emailed` })}>
          <RefreshCcw className="h-3.5 w-3.5" /> Remind
        </Button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto scroll-area-fancy pr-1">
        {OUTSTANDING_BALANCES.map(o => (
          <div key={o.id} className={`flex items-center gap-3 rounded-lg border p-2.5 ${o.severity === 'critical' ? 'border-rose-500/30 bg-rose-500/5' : o.severity === 'warning' ? 'border-amber-500/25 bg-amber-500/5' : 'border-border bg-card/40'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${o.severity === 'critical' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{o.entity}</p>
              <p className="text-[11px] text-muted-foreground truncate">{o.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{fmtMoneyShort(o.amount)}</p>
              <p className={`text-[10px] ${o.severity === 'critical' ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>{o.due}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RefundsCard() {
  const total = RECENT_REFUNDS.reduce((s, r) => s + r.amount, 0)
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
          <RefreshCcw className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Recent Refunds</h3>
          <p className="text-xs text-muted-foreground">{fmtMoneyShort(total)} · last 30 days</p>
        </div>
      </div>
      <div className="space-y-2">
        {RECENT_REFUNDS.map(r => (
          <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-2.5">
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.guest}</p>
              <p className="text-[11px] text-muted-foreground truncate">{r.reason}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">-{fmtMoneyShort(r.amount)}</p>
              <p className="text-[10px] text-muted-foreground">{r.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function FinanceModule() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Financial Dashboard"
        description="Revenue, expenses, commissions, and cash flow at a glance."
        action={
          <Button size="sm" onClick={() => toast.success('Report exported', { description: 'Financial summary downloaded as PDF' })}>
            <Download className="h-3.5 w-3.5" /> Export report
          </Button>
        }
      />

      <StatGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ComposedTrendChart />
        <RevenueBySource />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ExpenseBreakdown />
        <CommissionByOta />
        <CashFlowForecast />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OutstandingCard />
        <RefundsCard />
      </div>
    </div>
  )
}
