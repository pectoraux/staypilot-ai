'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SectionHeader, StatCard } from '@/components/shared'
import { fmtMoney, fmtMoneyShort, fmtPct, initials } from '@/lib/format'
import {
  PAYMENT_TRANSACTIONS, PAYMENT_STATS, PAYMENT_FLOWS,
  EMBEDDED_FINANCING, COMMISSION_RECONCILIATION,
} from '@/lib/data-v3'
import type { PaymentTransaction } from '@/lib/data-v3'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip,
} from 'recharts'
import {
  Wallet, CreditCard, Shield, Banknote, Globe, Lock, Building2,
  ArrowUpRight, Search, Filter, RefreshCw, Sparkles,
  HandCoins, Landmark, Coins, TrendingUp, CheckCircle2, AlertTriangle,
  ShieldCheck, Gift, Building, Zap, ChevronRight, PiggyBank,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ----------------- type-coloured tokens -----------------
type TxType = PaymentTransaction['type']

const TYPE_TOKEN: Record<TxType, { label: string; cls: string; hex: string }> = {
  booking:     { label: 'Booking',     cls: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',     hex: '#0d9488' },
  ancillary:   { label: 'Ancillary',   cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-300', hex: '#b45309' },
  split:       { label: 'Split',       cls: 'bg-violet-500/15 text-violet-600 dark:text-violet-300', hex: '#9333ea' },
  escrow:      { label: 'Escrow',      cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-300', hex: '#6b7280' },
  payout:      { label: 'Payout',      cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-300', hex: '#ea580c' },
  refund:      { label: 'Refund',      cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',     hex: '#be123c' },
  commission:  { label: 'Commission',  cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300', hex: '#15803d' },
}

// Status pill bespoke styling (StatusPill handles most, but escrow-held is uncommon)
const STATUS_TOKEN: Record<string, string> = {
  completed:     'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  pending:       'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'escrow-held': 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  failed:        'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}

const REC_STATUS_TOKEN: Record<string, { label: string; cls: string }> = {
  matched:   { label: 'Matched',   cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  shortfall: { label: 'Shortfall', cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
  pending:   { label: 'Pending',   cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
}

// ----------------- chart data -----------------
const FLOW_DONUT_COLORS = ['#ea580c', '#0d9488', '#9333ea', '#b45309', '#15803d', '#be123c', '#a16207', '#6b7280']

// Mock 9-month processed-over-time series (₵) — fintech-flavoured upward trend
const PROCESSED_OVER_TIME = [
  { month: 'Jan', processed: 286000, payouts: 22800, refunds: 5400 },
  { month: 'Feb', processed: 312000, payouts: 24100, refunds: 4900 },
  { month: 'Mar', processed: 348000, payouts: 26300, refunds: 6200 },
  { month: 'Apr', processed: 372000, payouts: 27800, refunds: 5100 },
  { month: 'May', processed: 401000, payouts: 30200, refunds: 4700 },
  { month: 'Jun', processed: 418000, payouts: 32100, refunds: 5900 },
  { month: 'Jul', processed: 442000, payouts: 33800, refunds: 6300 },
  { month: 'Aug', processed: 463000, payouts: 35900, refunds: 5400 },
  { month: 'Sep', processed: 486000, payouts: 38600, refunds: 4200 },
]

// =============================== Sub-components ===============================

function PaySwapBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-rose-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-300">
      <Sparkles className="h-3.5 w-3.5" />
      PaySwap
    </span>
  )
}

function PaymentsHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-rose-500/5 p-6">
      <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <PaySwapBadge />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">StayPilot · Financial layer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Payments <span className="text-muted-foreground">·</span>{' '}
            <span className="text-gradient-brand">Powered by PaySwap</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The financial infrastructure layer for hospitality. Direct checkout, split payments,
            escrow, multi-currency, commission reconciliation, payouts, guest wallets, and embedded financing.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live · Payments flowing
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => toast.success('Settlement report exported', { description: 'Monthly PaySwap settlement PDF is ready to download.' })}
          >
            <Banknote className="h-4 w-4 mr-1.5" /> Export settlement
          </Button>
        </div>
      </div>
    </div>
  )
}

function PaymentStatsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Processed (MTD)"
        value={fmtMoneyShort(PAYMENT_STATS.processedMTD)}
        sub={`${PAYMENT_STATS.paySwapShare}% via PaySwap`}
        trend={8}
        icon={<CreditCard className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Commission Reconciled"
        value={fmtMoneyShort(PAYMENT_STATS.commissionReconciled)}
        sub="OTA payouts auto-matched"
        trend={5}
        icon={<Coins className="h-5 w-5" />}
        accent="gold"
      />
      <StatCard
        label="Escrow Held"
        value={fmtMoneyShort(PAYMENT_STATS.escrowHeld)}
        sub="long-stay protection"
        icon={<Lock className="h-5 w-5" />}
        accent="violet"
      />
      <StatCard
        label="Payouts (MTD)"
        value={fmtMoneyShort(PAYMENT_STATS.payoutsMTD)}
        sub="staff + suppliers"
        trend={6}
        icon={<Banknote className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="Refunds (MTD)"
        value={fmtMoneyShort(PAYMENT_STATS.refundsMTD)}
        sub="auto-processed"
        trend={-12}
        icon={<RefreshCw className="h-5 w-5" />}
        accent="rose"
      />
      <StatCard
        label="Fraud Blocked"
        value={`${PAYMENT_STATS.fraudBlocked} attempts`}
        sub="₵8,200 saved this month"
        icon={<Shield className="h-5 w-5" />}
        accent="gold"
      />
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-2xl opacity-60" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Multi-currency</p>
            <p className="text-2xl font-bold tracking-tight">{PAYMENT_STATS.currencies.length} currencies</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-orange-600 dark:text-orange-400">
            <Globe className="h-5 w-5" />
          </div>
        </div>
        <div className="relative mt-3 flex flex-wrap gap-1">
          {PAYMENT_STATS.currencies.map(c => (
            <span key={c} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      </Card>
      <StatCard
        label="PaySwap Share"
        value={fmtPct(PAYMENT_STATS.paySwapShare)}
        sub="of total volume processed"
        trend={3}
        icon={<TrendingUp className="h-5 w-5" />}
        accent="brand"
      />
    </div>
  )
}

function FlowIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
      style={{ backgroundColor: color + '1a', border: `1px solid ${color}33` }}
    >
      {icon}
    </span>
  )
}

function PaymentFlowCard({ flow }: { flow: typeof PAYMENT_FLOWS[number] }) {
  const isUpsell = flow.status === 'offered'
  const accent = isUpsell
    ? '#9333ea'
    : flow.id === 'pf-1' ? '#ea580c'
    : flow.id === 'pf-2' ? '#9333ea'
    : flow.id === 'pf-3' ? '#6b7280'
    : flow.id === 'pf-4' ? '#0d9488'
    : flow.id === 'pf-5' ? '#15803d'
    : flow.id === 'pf-6' ? '#ea580c'
    : '#b45309'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden p-5 h-full flex flex-col',
          isUpsell && 'border-violet-500/40 bg-gradient-to-br from-violet-500/10 via-orange-500/5 to-amber-500/5',
        )}
      >
        {isUpsell && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
            <Sparkles className="h-3 w-3" /> Upsell
          </span>
        )}
        <div className="flex items-start gap-3">
          <FlowIcon icon={flow.icon} color={accent} />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm leading-tight">{flow.name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{flow.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Volume MTD</p>
            <p className="text-lg font-bold tracking-tight">
              {flow.volume > 0 ? fmtMoneyShort(flow.volume) : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Share</p>
            <p className="text-sm font-semibold">{flow.share > 0 ? fmtPct(flow.share) : 'New'}</p>
          </div>
        </div>
        {flow.share > 0 && (
          <div className="mt-2">
            <Progress value={flow.share} className="h-1.5" />
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
              flow.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-violet-500/15 text-violet-600 dark:text-violet-300',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
            {flow.status}
          </span>
          <Button
            size="sm"
            variant={isUpsell ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() =>
              toast[isUpsell ? 'info' : 'success'](
                isUpsell ? 'Explore embedded financing' : `Managing ${flow.name}`,
                { description: isUpsell ? 'Apply for working capital below.' : 'PaySwap console opened for this flow.' },
              )
            }
          >
            {isUpsell ? 'Explore' : 'Manage'}
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

function PaymentFlowsGrid() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="Payment flows"
        description="Every financial motion in your property — direct checkout, splits, escrow, payouts — runs through one stack."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PAYMENT_FLOWS.map(flow => (
          <PaymentFlowCard key={flow.id} flow={flow} />
        ))}
      </div>
    </div>
  )
}

function EmbeddedFinancingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-violet-500/40 p-0">
        {/* Gradient banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/15 via-orange-500/10 to-amber-500/10 p-6">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3 max-w-xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-orange-500/20 text-violet-600 dark:text-violet-300">
                <Landmark className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold tracking-tight">Embedded financing offer</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                    <Sparkles className="h-3 w-3" /> Pre-qualified
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  PaySwap offers <span className="font-semibold text-foreground">{fmtMoney(EMBEDDED_FINANCING.offerAmount)}</span> working
                  capital based on your {EMBEDDED_FINANCING.basedOn}.
                </p>
              </div>
            </div>
            <Button
              className="h-10 bg-gradient-to-r from-violet-600 to-orange-500 text-white hover:opacity-90 shadow-lg shadow-violet-500/20"
              onClick={() =>
                toast.success('Working capital application submitted', {
                  description: `${fmtMoney(EMBEDDED_FINANCING.offerAmount)} · ${EMBEDDED_FINANCING.apr}% APR · ${EMBEDDED_FINANCING.termMonths} months. Approval in 2 hours.`,
                })
              }
            >
              <HandCoins className="h-4 w-4 mr-1.5" /> Apply now
            </Button>
          </div>
        </div>

        {/* Terms strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-b border-border">
          {[
            { label: 'Offer amount', value: fmtMoneyShort(EMBEDDED_FINANCING.offerAmount) },
            { label: 'APR', value: `${EMBEDDED_FINANCING.apr}%` },
            { label: 'Term', value: `${EMBEDDED_FINANCING.termMonths} months` },
            { label: 'Monthly payment', value: fmtMoneyShort(EMBEDDED_FINANCING.monthlyPayment) },
          ].map(t => (
            <div key={t.label} className="p-4">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.label}</p>
              <p className="text-lg font-bold tracking-tight">{t.value}</p>
            </div>
          ))}
        </div>

        {/* Use cases + approval */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Use cases</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EMBEDDED_FINANCING.useCases.map((u, i) => {
                const icons = [Building, ShieldCheck, Zap, Building2]
                const Icon = icons[i % icons.length]
                return (
                  <div
                    key={u}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card/60 p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-500/15 to-orange-500/10 text-violet-600 dark:text-violet-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{u}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Approval chance</span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
              {EMBEDDED_FINANCING.approvalChance}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">based on cash-flow signals</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function VolumeByFlowDonut() {
  const data = PAYMENT_FLOWS.filter(f => f.volume > 0).map(f => ({ name: f.name, value: f.volume }))
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="p-5 h-full">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">Volume by flow</h3>
          <p className="text-xs text-muted-foreground">MTD · {fmtMoneyShort(total)} total</p>
        </div>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">Live</Badge>
      </div>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={FLOW_DONUT_COLORS[i % FLOW_DONUT_COLORS.length]} />
              ))}
            </Pie>
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, n) => [fmtMoney(v), n]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto scroll-area-fancy pr-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: FLOW_DONUT_COLORS[i % FLOW_DONUT_COLORS.length] }} />
              <span className="text-muted-foreground truncate">{d.name}</span>
            </span>
            <span className="font-medium">{fmtPct((d.value / total) * 100)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ProcessedOverTimeChart() {
  return (
    <Card className="p-5 h-full">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold">Processed over time</h3>
          <p className="text-xs text-muted-foreground">Last 9 months · ₵ volume</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /> Processed</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500" /> Payouts</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Refunds</span>
        </div>
      </div>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={PROCESSED_OVER_TIME} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="processedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="payoutsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="refundsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#be123c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#be123c" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoneyShort(v)} />
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, n) => [fmtMoney(v), n]}
            />
            <Area type="monotone" dataKey="processed" stroke="#ea580c" strokeWidth={2.5} fill="url(#processedGrad)" />
            <Area type="monotone" dataKey="payouts" stroke="#0d9488" strokeWidth={2} fill="url(#payoutsGrad)" />
            <Area type="monotone" dataKey="refunds" stroke="#be123c" strokeWidth={2} fill="url(#refundsGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function GuestWalletsCard() {
  return (
    <Card className="relative overflow-hidden p-5 h-full">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-2xl opacity-70" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-300">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Guest wallets</h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
              Guests hold balances + loyalty points, redeemable across the StayPilot network.
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide shrink-0">Network-wide</Badge>
      </div>
      <div className="relative mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active wallets</p>
          <p className="text-xl font-bold tracking-tight">64</p>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total held</p>
          <p className="text-xl font-bold tracking-tight">{fmtMoneyShort(12400)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Redemptions</p>
          <p className="text-xl font-bold tracking-tight">312<span className="text-xs text-muted-foreground ml-1">/mo</span></p>
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-muted-foreground">Redeemable on:</span>
        {['Stays', 'Experiences', 'Dining', 'Spa', 'Transfers'].map(r => (
          <span key={r} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Gift className="inline h-2.5 w-2.5 mr-0.5" />{r}
          </span>
        ))}
      </div>
    </Card>
  )
}

function FraudPreventionCard() {
  const items = [
    { label: 'Card testing', desc: 'Brute-forcing stolen cards at checkout', count: 2, icon: CreditCard },
    { label: 'Chargeback risk', desc: 'Disputed transactions flagged pre-payout', count: 1, icon: AlertTriangle },
    { label: 'Fake reviews', desc: 'Coordinated 1★ campaigns from non-guests', count: 1, icon: ShieldCheck },
  ]
  return (
    <Card className="relative overflow-hidden p-5 h-full">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-rose-500/20 to-amber-500/10 blur-2xl opacity-70" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/10 text-rose-600 dark:text-rose-300">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Fraud prevention</h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
              FraudGuard blocked <span className="font-semibold text-foreground">{PAYMENT_STATS.fraudBlocked} attempts</span> this
              month — <span className="font-semibold text-emerald-600 dark:text-emerald-400">₵8,200 saved</span>.
            </p>
          </div>
        </div>
      </div>
      <div className="relative mt-4 space-y-2">
        {items.map(it => {
          const Icon = it.icon
          return (
            <div key={it.label} className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-300 shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{it.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{it.desc}</p>
                </div>
              </div>
              <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                {it.count}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function TransactionsTable() {
  const [typeFilter, setTypeFilter] = React.useState<'all' | TxType>('all')
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    return PAYMENT_TRANSACTIONS.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (query && !t.guest.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [typeFilter, query])

  const typeOptions: { value: 'all' | TxType; label: string }[] = [
    { value: 'all', label: 'All types' },
    { value: 'booking', label: 'Booking' },
    { value: 'ancillary', label: 'Ancillary' },
    { value: 'split', label: 'Split' },
    { value: 'escrow', label: 'Escrow' },
    { value: 'payout', label: 'Payout' },
    { value: 'refund', label: 'Refund' },
    { value: 'commission', label: 'Commission' },
  ]

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
        <div>
          <h3 className="font-semibold">Transactions</h3>
          <p className="text-xs text-muted-foreground">{filtered.length} of {PAYMENT_TRANSACTIONS.length} transactions · live ledger</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guest…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="h-9 w-44 pl-8 text-sm"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | TxType)}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="max-h-[28rem] overflow-y-auto scroll-area-fancy">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="pl-5">Guest / Entity</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="pr-5">Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => {
              const tok = TYPE_TOKEN[t.type]
              return (
                <TableRow key={t.id} className="hover:bg-muted/40">
                  <TableCell className="pl-5 font-medium py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                        style={{ backgroundColor: tok.hex }}
                      >
                        {initials(t.guest)}
                      </span>
                      <span className="truncate">{t.guest}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold py-3">
                    <span className={t.type === 'refund' ? 'text-rose-600 dark:text-rose-400' : ''}>
                      {t.type === 'refund' ? '−' : ''}{fmtMoney(t.amount)}
                    </span>
                    <span className="ml-1 text-[10px] text-muted-foreground">{t.currency}</span>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{t.method}</TableCell>
                  <TableCell className="py-3">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', tok.cls)}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tok.hex }} />
                      {tok.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize', STATUS_TOKEN[t.status])}>
                      {t.status.replace('-', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground whitespace-nowrap">{t.date}</TableCell>
                  <TableCell className="pr-5 py-3">
                    <span className="text-xs text-muted-foreground">{t.source}</span>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                  No transactions match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function CommissionReconciliationTable() {
  const totals = React.useMemo(() => {
    const expected = COMMISSION_RECONCILIATION.reduce((s, r) => s + r.expected, 0)
    const received = COMMISSION_RECONCILIATION.reduce((s, r) => s + r.received, 0)
    const shortfall = COMMISSION_RECONCILIATION.reduce((s, r) => s + (r.shortfall ?? 0), 0)
    return { expected, received, shortfall }
  }, [])

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold">Commission reconciliation</h3>
          <p className="text-xs text-muted-foreground">OTA payouts auto-matched to bookings · flags shortfalls instantly</p>
        </div>
        <Button
          size="sm"
          className="h-9 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90"
          onClick={() =>
            toast.success('Auto-reconcile complete', {
              description: `1 shortfall detected on Airbnb (₵40). PaySwap has filed a dispute claim automatically.`,
            })
          }
        >
          <RefreshCw className="h-4 w-4 mr-1.5" /> Auto-reconcile
        </Button>
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Expected</p>
          <p className="text-base font-bold tracking-tight">{fmtMoneyShort(totals.expected)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Received</p>
          <p className="text-base font-bold tracking-tight">{fmtMoneyShort(totals.received)}</p>
        </div>
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Shortfall</p>
          <p className="text-base font-bold tracking-tight text-rose-600 dark:text-rose-400">{fmtMoneyShort(totals.shortfall)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OTA</TableHead>
              <TableHead className="text-right">Expected</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Shortfall</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMMISSION_RECONCILIATION.map(r => {
              const tok = REC_STATUS_TOKEN[r.status]
              return (
                <TableRow
                  key={r.id}
                  className={cn(
                    'hover:bg-muted/40',
                    r.status === 'shortfall' && 'bg-rose-500/[0.04]',
                  )}
                >
                  <TableCell className="font-medium py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                      </span>
                      {r.ota}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono py-3">{fmtMoney(r.expected)}</TableCell>
                  <TableCell className="text-right font-mono py-3">{r.received > 0 ? fmtMoney(r.received) : '—'}</TableCell>
                  <TableCell className="text-right py-3 text-sm text-muted-foreground">{r.bookings}</TableCell>
                  <TableCell className="text-right font-mono py-3">
                    {r.shortfall ? (
                      <span className="font-semibold text-rose-600 dark:text-rose-400">−{fmtMoney(r.shortfall)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', tok.cls)}>
                      {r.status === 'matched' && <CheckCircle2 className="h-3 w-3" />}
                      {r.status === 'shortfall' && <AlertTriangle className="h-3 w-3" />}
                      {r.status === 'pending' && <RefreshCw className="h-3 w-3" />}
                      {tok.label}
                    </span>
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

function EcosystemFooter() {
  return (
    <Card className="relative overflow-hidden border-orange-500/30 p-6">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/25 to-teal-500/15 text-orange-600 dark:text-orange-300">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold tracking-tight">
              StayPilot <span className="text-muted-foreground">+</span> PaySwap <span className="text-muted-400">=</span>{' '}
              <span className="text-gradient-brand">the operating system + the financial layer</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every booking, every payout, every wallet — one integrated stack.
              Most hospitality platforms rely on third-party payment providers. Owning this financial
              layer gives StayPilot a defensible advantage.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-10 border-orange-500/40 text-orange-600 dark:text-orange-300 hover:bg-orange-500/10"
          onClick={() =>
            toast.info('PaySwap console', {
              description: 'Open the full PaySwap dashboard for settlements, payouts, and disputes.',
            })
          }
        >
          Open PaySwap console
          <ArrowUpRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </Card>
  )
}

// =============================== Main module ===============================

export function PaymentsModule() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 pb-2">
        <PaymentsHeader />
        <PaymentStatsGrid />
        <PaymentFlowsGrid />
        <EmbeddedFinancingCard />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VolumeByFlowDonut />
          <ProcessedOverTimeChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GuestWalletsCard />
          <FraudPreventionCard />
        </div>

        <TransactionsTable />

        <CommissionReconciliationTable />

        <EcosystemFooter />
      </div>
    </TooltipProvider>
  )
}
