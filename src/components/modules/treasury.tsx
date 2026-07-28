'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import {
  TREASURY_ACCOUNTS, PAYOUT_ORCHESTRATION, FINANCING_OFFERS, TREASURY_FLOWS,
} from '@/lib/data-v4'
import type { TreasuryAccount } from '@/lib/data-v4'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
  CartesianGrid, ReferenceLine,
  BarChart, Bar, Cell, LabelList,
} from 'recharts'
import {
  Wallet, Banknote, CreditCard, ArrowRight, ArrowLeftRight, Landmark, PiggyBank,
  Shield, Sparkles, TrendingUp, CheckCircle2, Clock, Building2, Coins, Zap,
  Lock, Layers, HandCoins, Plus,
  ArrowDownToLine, Building, ShieldCheck, Gauge,
} from 'lucide-react'

// ============================================================
// Account type tokens
// ============================================================
type AcctType = TreasuryAccount['type']

const TYPE_TOKEN: Record<AcctType, { label: string; cls: string; hex: string; icon: React.ReactNode }> = {
  operating: {
    label: 'Operating',
    cls: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30',
    hex: '#0d9488',
    icon: <Wallet className="h-4 w-4" />,
  },
  escrow: {
    label: 'Escrow',
    cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    hex: '#b45309',
    icon: <Lock className="h-4 w-4" />,
  },
  savings: {
    label: 'Savings',
    cls: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30',
    hex: '#9333ea',
    icon: <PiggyBank className="h-4 w-4" />,
  },
  financing: {
    label: 'Financing',
    cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    hex: '#be123c',
    icon: <CreditCard className="h-4 w-4" />,
  },
}

function AccountTypeBadge({ type }: { type: AcctType }) {
  const t = TYPE_TOKEN[type]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium', t.cls)}>
      {t.icon}
      {t.label}
    </span>
  )
}

// ============================================================
// Header
// ============================================================
function PaySwapBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-rose-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-300">
      <Sparkles className="h-3.5 w-3.5" />
      Powered by PaySwap
    </span>
  )
}

function TreasuryHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-rose-500/5 p-6">
      <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-rose-500/15 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <PaySwapBadge />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Treasury · Portfolio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Treasury <span className="text-muted-foreground">·</span>{' '}
            <span className="text-gradient-brand">Powered by PaySwap</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The financial backbone across your portfolio. Multi-property accounts, escrow, savings,
            credit lines, payout orchestration, and embedded financing.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live · Cash flowing
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => toast.success('Treasury report exported', { description: '90-day cash position PDF is ready.' })}
          >
            <Banknote className="h-4 w-4 mr-1.5" /> Export
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Portfolio balance hero — total + breakdown by type
// ============================================================
function portfolioTotals() {
  const total = TREASURY_ACCOUNTS.reduce((s, a) => s + a.balance, 0)
  const byType: Record<AcctType, { sum: number; count: number }> = {
    operating: { sum: 0, count: 0 },
    escrow: { sum: 0, count: 0 },
    savings: { sum: 0, count: 0 },
    financing: { sum: 0, count: 0 },
  }
  TREASURY_ACCOUNTS.forEach(a => {
    byType[a.type].sum += a.balance
    byType[a.type].count += 1
  })
  // net position excludes credit line drawdown
  const creditLine = byType.financing.sum
  const netAssets = total - creditLine
  return { total, byType, creditLine, netAssets }
}

function PortfolioBalanceHero() {
  const { total, byType, creditLine, netAssets } = portfolioTotals()
  const types: AcctType[] = ['operating', 'escrow', 'savings', 'financing']
  const positiveSum = types.filter(t => t !== 'financing').reduce((s, t) => s + byType[t].sum, 0)

  return (
    <Card className="relative overflow-hidden p-6">
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-3xl" />
      <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-orange-600 dark:text-orange-400">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio balance</p>
              <p className="text-[11px] text-muted-foreground">All accounts · {TREASURY_ACCOUNTS.length} holdings</p>
            </div>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold tracking-tight">
              {fmtMoney(total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Net position ·{' '}
              <span className="font-semibold text-foreground">{fmtMoney(netAssets)}</span> assets{' '}
              <span className="text-rose-500">− {fmtMoney(Math.abs(creditLine))}</span> credit drawn
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +8.2% MoM
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              <Shield className="h-3 w-3" /> PaySwap-insured
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              <Building2 className="h-3 w-3" /> 3 properties
            </span>
          </div>
        </div>
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Breakdown by type</p>
          {types.map(t => {
            const tok = TYPE_TOKEN[t]
            const v = byType[t].sum
            const share = positiveSum > 0 && t !== 'financing'
              ? Math.max(0, (v / positiveSum) * 100)
              : 0
            return (
              <div key={t} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tok.hex }} />
                    <span className="text-muted-foreground">{tok.label}</span>
                    <span className="text-[10px] text-muted-foreground">· {byType[t].count}</span>
                  </span>
                  <span className={cn('font-mono font-semibold', v < 0 ? 'text-rose-500' : 'text-foreground')}>
                    {fmtMoney(v)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${t === 'financing' ? 100 : Math.min(100, share)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: tok.hex }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// ============================================================
// Accounts grid — cards per account
// ============================================================
function AccountsGrid() {
  const [transferOpen, setTransferOpen] = React.useState<string | null>(null)
  const [from, setFrom] = React.useState<string>('')
  const [to, setTo] = React.useState<string>('')
  const [amount, setAmount] = React.useState<string>('')

  const openTransfer = (acctId: string) => {
    setFrom(acctId)
    setTo('')
    setAmount('')
    setTransferOpen(acctId)
  }

  const submitTransfer = () => {
    const amt = parseFloat(amount)
    if (!to) {
      toast.error('Select destination', { description: 'Choose where to send the funds.' })
      return
    }
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount', { description: 'Amount must be greater than zero.' })
      return
    }
    const src = TREASURY_ACCOUNTS.find(a => a.id === from)
    const dst = TREASURY_ACCOUNTS.find(a => a.id === to)
    toast.success('Transfer initiated', {
      description: `${fmtMoney(amt)} from ${src?.name} → ${dst?.name}. Settles instantly via PaySwap.`,
    })
    setTransferOpen(null)
  }

  return (
    <Card className="p-5">
      <SectionHeader
        title="Accounts"
        description="Multi-property cash, escrow, savings, and credit — all in one console."
        action={
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {TREASURY_ACCOUNTS.length} accounts
          </Badge>
        }
      />
      <Separator className="my-4" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TREASURY_ACCOUNTS.map(acct => {
          const tok = TYPE_TOKEN[acct.type]
          return (
            <motion.div
              key={acct.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
              whileHover={{ y: -2 }}
            >
              <Card className="relative overflow-hidden h-full p-4 flex flex-col gap-3 hover:border-orange-500/30 transition-colors">
                <div
                  className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-50"
                  style={{ backgroundColor: tok.hex + '20' }}
                />
                <div className="relative flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm leading-tight truncate">{acct.name}</h4>
                    <p className="text-[11px] text-muted-foreground truncate">{acct.property}</p>
                  </div>
                  <AccountTypeBadge type={acct.type} />
                </div>
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Balance</p>
                  <p className={cn('text-2xl font-bold tracking-tight font-mono', acct.balance < 0 ? 'text-rose-500' : 'text-foreground')}>
                    {fmtMoney(acct.balance)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{acct.currency} · {acct.property}</p>
                </div>
                <div className="relative flex items-center justify-between pt-1">
                  {acct.apy !== undefined ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      {acct.type === 'financing' ? `${fmtPct(acct.apy)} APR` : `${fmtPct(acct.apy)} APY`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Gauge className="h-3 w-3" /> Demand deposit
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => openTransfer(acct.id)}
                  >
                    <ArrowLeftRight className="h-3 w-3 mr-1" /> Transfer
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Dialog open={transferOpen !== null} onOpenChange={(o) => !o && setTransferOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer funds</DialogTitle>
            <DialogDescription>Move money between accounts instantly via PaySwap.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TREASURY_ACCOUNTS.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name} · {fmtMoney(a.balance)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center">
              <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>
                  {TREASURY_ACCOUNTS.filter(a => a.id !== from).map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name} · {fmtMoney(a.balance)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amt">Amount (GHS)</Label>
              <Input
                id="amt"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                inputMode="decimal"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(null)}>Cancel</Button>
            <Button onClick={submitTransfer}>
              <Zap className="h-4 w-4 mr-1.5" /> Transfer now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ============================================================
// Treasury flows — bar visualization with volumes + shares
// ============================================================
const FLOW_HEX = ['#ea580c', '#b45309', '#9333ea', '#0d9488', '#15803d', '#be123c']

function TreasuryFlowsCard() {
  const totalVolume = TREASURY_FLOWS.reduce((s, f) => s + f.volume, 0)
  const data = TREASURY_FLOWS.map((f, i) => ({ ...f, hex: FLOW_HEX[i % FLOW_HEX.length] }))

  return (
    <Card className="p-5">
      <SectionHeader
        title="Treasury flows"
        description="Money moving through your accounts · 30-day volume"
        action={
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Layers className="h-3 w-3 mr-1" /> {fmtMoneyShort(totalVolume)} total
          </Badge>
        }
      />
      <Separator className="my-4" />
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtMoneyShort(v as number)}
            />
            <YAxis
              type="category"
              dataKey="flow"
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              width={170}
            />
            <RTooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [fmtMoney(v), 'Volume']}
            />
            <Bar dataKey="volume" radius={[0, 6, 6, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.hex} />
              ))}
              <LabelList
                dataKey="share"
                position="right"
                formatter={(v: number) => `${v}%`}
                style={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {data.map(f => (
          <div key={f.id} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{f.icon}</span>
              <span className="text-muted-foreground truncate">{f.flow}</span>
            </span>
            <span className="font-mono font-semibold shrink-0">{fmtMoneyShort(f.volume)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ============================================================
// Payout orchestration table
// ============================================================
function PayoutOrchestrationCard() {
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [recipient, setRecipient] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [method, setMethod] = React.useState('PaySwap')
  const [type, setType] = React.useState('Supplier')

  const pendingApprovals = PAYOUT_ORCHESTRATION.filter(p => p.status === 'Pending approval')

  const submitSchedule = () => {
    const amt = parseFloat(amount)
    if (!recipient.trim()) {
      toast.error('Enter a recipient', { description: 'Who should receive the payout?' })
      return
    }
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount', { description: 'Amount must be greater than zero.' })
      return
    }
    toast.success('Payout scheduled', {
      description: `${fmtMoney(amt)} → ${recipient} · ${type} · via ${method}. Scheduled for tomorrow.`,
    })
    setRecipient('')
    setAmount('')
    setMethod('PaySwap')
    setType('Supplier')
    setScheduleOpen(false)
  }

  return (
    <Card className="p-5">
      <SectionHeader
        title="Payout orchestration"
        description="Scheduled payouts to suppliers, staff, and partners — all routed through PaySwap."
        action={
          <div className="flex items-center gap-2">
            {pendingApprovals.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() =>
                  toast.success(`${pendingApprovals.length} payout(s) approved`, {
                    description: 'Funds will be released within 60 seconds.',
                  })
                }
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve all ({pendingApprovals.length})
              </Button>
            )}
            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-1.5" /> Schedule payout
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule a payout</DialogTitle>
                  <DialogDescription>PaySwap routes to mobile money, bank, or PaySwap wallet.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="p-recipient">Recipient</Label>
                    <Input
                      id="p-recipient"
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      placeholder="e.g. SparkleClean Pro"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="p-type">Type</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Supplier">Supplier</SelectItem>
                          <SelectItem value="Staff payroll">Staff payroll</SelectItem>
                          <SelectItem value="Corporate rebate">Corporate rebate</SelectItem>
                          <SelectItem value="OTA commission">OTA commission</SelectItem>
                          <SelectItem value="Refund">Refund</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-method">Method</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PaySwap">PaySwap</SelectItem>
                          <SelectItem value="Bank">Bank</SelectItem>
                          <SelectItem value="Mobile money">Mobile money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-amount">Amount (GHS)</Label>
                    <Input
                      id="p-amount"
                      value={amount}
                      onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0.00"
                      inputMode="decimal"
                      className="font-mono"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                  <Button onClick={submitSchedule}>
                    <Clock className="h-4 w-4 mr-1.5" /> Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <Separator className="my-4" />
      <div className="overflow-x-auto scroll-area-fancy rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead>Recipient</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden lg:table-cell">Scheduled</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAYOUT_ORCHESTRATION.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-sm">{p.recipient}</TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{p.type}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-sm">
                  {fmtMoney(p.amount)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{p.scheduled}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {p.method}
                  </span>
                </TableCell>
                <TableCell><StatusPill status={p.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        <ShieldCheck className="inline h-3 w-3 mr-1 text-emerald-500" />
        All payouts are reconciliation-matched and audited in real time.
      </p>
    </Card>
  )
}

// ============================================================
// Embedded financing offers
// ============================================================
function FinancingOffersCard() {
  const differentiated = new Set(['fo-3', 'fo-5']) // revenue-based advance + new acquisition

  return (
    <Card className="p-5">
      <SectionHeader
        title="Embedded financing offers"
        description="Pre-approved capital, powered by your portfolio's cash flow."
        action={
          <Badge variant="outline" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30">
            <HandCoins className="h-3 w-3 mr-1" /> {FINANCING_OFFERS.length} offers
          </Badge>
        }
      />
      <Separator className="my-4" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FINANCING_OFFERS.map(offer => {
          const highlight = differentiated.has(offer.id)
          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
              whileHover={{ y: -2 }}
            >
              <Card
                className={cn(
                  'relative overflow-hidden h-full p-4 flex flex-col gap-3',
                  highlight
                    ? 'border-orange-500/40 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-rose-500/5'
                    : 'hover:border-orange-500/30 transition-colors',
                )}
              >
                {highlight && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-300">
                    <Sparkles className="h-3 w-3" /> StayPilot exclusive
                  </span>
                )}
                <div className="flex items-start gap-2 pr-16">
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl shrink-0',
                      highlight
                        ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-600 dark:text-orange-400'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm leading-tight">{offer.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{offer.basedOn}</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold tracking-tight font-mono">{fmtMoney(offer.amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">APR</p>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{fmtPct(offer.apr)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-muted/50 px-2 py-1.5">
                    <p className="text-[10px] uppercase text-muted-foreground">Term</p>
                    <p className="font-medium">{offer.term}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 px-2 py-1.5">
                    <p className="text-[10px] uppercase text-muted-foreground">Monthly</p>
                    <p className="font-mono font-medium">
                      {typeof offer.payment === 'number' ? fmtMoney(offer.payment) : offer.payment}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{offer.useCase}</p>
                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Approval chance</span>
                    <span className={cn(
                      'font-semibold',
                      offer.chance >= 90 ? 'text-emerald-600 dark:text-emerald-400'
                        : offer.chance >= 75 ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-500',
                    )}>
                      {offer.chance}%
                    </span>
                  </div>
                  <Progress
                    value={offer.chance}
                    className="h-1.5"
                  />
                  <Button
                    size="sm"
                    variant={highlight ? 'default' : 'outline'}
                    className="w-full h-8 mt-1 text-xs"
                    onClick={() =>
                      toast.success(`Applied: ${offer.name}`, {
                        description: `${fmtMoney(offer.amount)} · Decision in 2 minutes.`,
                      })
                    }
                  >
                    <HandCoins className="h-3 w-3 mr-1" /> Apply
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

// ============================================================
// Treasury dashboard — 90-day cash position area chart
// ============================================================
function generate90DaySeries() {
  // Mock deterministic 90-day series with upward trend + a credit-line drawdown around day 32
  const series: Array<{ day: number; label: string; cash: number; drawn: number }> = []
  let cash = 360000
  let drawn = 0
  const today = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const label = i % 15 === 0 ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
    // Daily revenue inflow + small operating outflow
    const inflow = 9000 + Math.sin(i / 6) * 1800
    const outflow = 6200 + Math.cos(i / 9) * 900
    cash += inflow - outflow
    // Drawdown event around day 58 (i.e. 32 days ago)
    if (i === 58) {
      drawn = 120000
      cash += drawn
    }
    series.push({ day: 90 - i, label, cash: Math.round(cash), drawn: i <= 58 ? drawn : 0 })
  }
  return series
}

const CASH_SERIES = generate90DaySeries()

function CashPositionChart() {
  return (
    <Card className="p-5">
      <SectionHeader
        title="Cash position"
        description="90-day portfolio cash · credit-line drawdown marked"
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-500/10 px-2 py-1 text-[11px] font-medium text-orange-600 dark:text-orange-400">
              <span className="h-2 w-2 rounded-full bg-orange-500" /> Cash
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Credit drawdown
            </span>
          </div>
        }
      />
      <Separator className="my-4" />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CASH_SERIES} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="drawnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#be123c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#be123c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtMoneyShort(v as number)}
              width={64}
            />
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name: string) => [
                fmtMoney(v),
                name === 'cash' ? 'Cash position' : 'Credit drawn',
              ]}
              labelFormatter={(_, p) => {
                const day = p?.[0]?.payload?.day
                return day ? `Day ${day}` : ''
              }}
            />
            <ReferenceLine
              y={120000}
              stroke="#be123c"
              strokeDasharray="4 4"
              strokeWidth={1.2}
              label={{ value: 'Credit limit', position: 'insideTopLeft', fontSize: 10, fill: '#be123c' }}
            />
            <Area
              type="monotone"
              dataKey="cash"
              stroke="#ea580c"
              strokeWidth={2.5}
              fill="url(#cashGrad)"
            />
            <Area
              type="monotone"
              dataKey="drawn"
              stroke="#be123c"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="url(#drawnGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">90-day high</p>
          <p className="text-sm font-bold font-mono">{fmtMoney(Math.max(...CASH_SERIES.map(d => d.cash)))}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">90-day low</p>
          <p className="text-sm font-bold font-mono">{fmtMoney(Math.min(...CASH_SERIES.map(d => d.cash)))}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Today</p>
          <p className="text-sm font-bold font-mono text-orange-600 dark:text-orange-400">
            {fmtMoney(CASH_SERIES[CASH_SERIES.length - 1].cash)}
          </p>
        </div>
      </div>
    </Card>
  )
}

// ============================================================
// PaySwap ecosystem footer
// ============================================================
function PaySwapEcosystemCard() {
  return (
    <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-500/12 via-amber-500/6 to-rose-500/5 border-orange-500/30">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-300">
              PaySwap ecosystem
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight max-w-2xl leading-tight">
            StayPilot + PaySwap = the operating system + the financial backbone.
            <br className="hidden md:block" />
            <span className="text-muted-foreground">Every dollar flows through one stack.</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
              <Building className="h-3.5 w-3.5 text-orange-500" /> StayPilot OS
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
              <Wallet className="h-3.5 w-3.5 text-teal-500" /> PaySwap
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-300">
              <Coins className="h-3.5 w-3.5" /> One stack
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:items-end">
          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            <div className="rounded-lg border border-border bg-card px-3 py-2 text-center min-w-[80px]">
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{fmtMoneyShort(184200)}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Operating</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-2 text-center min-w-[80px]">
              <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{fmtMoneyShort(320000)}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Savings</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-2 text-center min-w-[80px]">
              <p className="text-lg font-bold text-rose-500">{fmtMoneyShort(120000)}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Drawn</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => toast.info('Opening PaySwap console', { description: 'Full treasury, lending, and payouts suite.' })}
          >
            Open PaySwap <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ============================================================
// Top stats strip
// ============================================================
function TreasuryStats() {
  const { total, netAssets } = portfolioTotals()
  const savings = TREASURY_ACCOUNTS.filter(a => a.type === 'savings').reduce((s, a) => s + a.balance, 0)
  const drawn = Math.abs(TREASURY_ACCOUNTS.filter(a => a.type === 'financing').reduce((s, a) => s + a.balance, 0))
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total balance"
        value={fmtMoneyShort(total)}
        sub="across all accounts"
        trend={8}
        icon={<Landmark className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Net assets"
        value={fmtMoneyShort(netAssets)}
        sub="excludes credit drawn"
        trend={6}
        icon={<Wallet className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="Reserve savings"
        value={fmtMoneyShort(savings)}
        sub="8.5% APY · auto-sweep"
        trend={4}
        icon={<PiggyBank className="h-5 w-5" />}
        accent="violet"
      />
      <StatCard
        label="Credit available"
        value={fmtMoneyShort(500000 - drawn)}
        sub={`${fmtMoneyShort(drawn)} drawn of ${fmtMoneyShort(500000)}`}
        icon={<CreditCard className="h-5 w-5" />}
        accent="rose"
      />
    </div>
  )
}

// ============================================================
// Main module
// ============================================================
export function TreasuryModule() {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <TreasuryHeader />
        <TreasuryStats />
        <PortfolioBalanceHero />
        <div className="grid gap-4 lg:grid-cols-2">
          <AccountsGrid />
          <TreasuryFlowsCard />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CashPositionChart />
          <PayoutOrchestrationCard />
        </div>
        <FinancingOffersCard />
        <PaySwapEcosystemCard />
      </div>
    </TooltipProvider>
  )
}

export default TreasuryModule
