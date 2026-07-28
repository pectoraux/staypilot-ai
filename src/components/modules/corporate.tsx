'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { CORPORATE } from '@/lib/data'
import type { CorporateAccount } from '@/lib/types'
import { fmtMoney, fmtMoneyShort, relativeDate, initials } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Building2, Briefcase, Phone, FileText, Send, Plus, Search, TrendingUp, CalendarClock, Users, Handshake,
} from 'lucide-react'

const TYPE_ICON: Record<CorporateAccount['type'], React.ReactNode> = {
  Company: <Building2 className="h-4 w-4" />,
  'Travel Agency': <Briefcase className="h-4 w-4" />,
  Government: <Building2 className="h-4 w-4" />,
  NGO: <Handshake className="h-4 w-4" />,
  School: <Users className="h-4 w-4" />,
  'Event Organizer': <CalendarClock className="h-4 w-4" />,
}

function daysUntil(iso: string): number {
  const d = new Date(iso + 'T00:00:00')
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

function Pipeline() {
  const stages: Array<{ key: CorporateAccount['status'] | 'Renewing'; label: string; cls: string }> = [
    { key: 'Negotiating', label: 'Negotiating', cls: 'from-slate-500/20 to-slate-500/5 text-slate-600 dark:text-slate-300' },
    { key: 'Active', label: 'Active', cls: 'from-emerald-500/20 to-teal-500/5 text-emerald-600 dark:text-emerald-400' },
    { key: 'Renewing', label: 'Renewing', cls: 'from-amber-500/20 to-orange-500/5 text-amber-600 dark:text-amber-400' },
    { key: 'Expired', label: 'Expired', cls: 'from-rose-500/20 to-red-500/5 text-rose-600 dark:text-rose-400' },
  ]
  const counts = {
    Negotiating: CORPORATE.filter(c => c.status === 'Negotiating').length,
    Active: CORPORATE.filter(c => c.status === 'Active' && daysUntil(c.contractEnd) > 60).length,
    Renewing: CORPORATE.filter(c => c.status === 'Active' && daysUntil(c.contractEnd) <= 60).length,
    Expired: CORPORATE.filter(c => c.status === 'Expired').length,
  } as const
  const total = CORPORATE.length
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">Sales Pipeline</h3>
          <p className="text-xs text-muted-foreground">Lifecycle of all {total} corporate accounts</p>
        </div>
        <Badge variant="outline" className="text-[10px]">{total} total</Badge>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {stages.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative"
          >
            <div className={`rounded-xl border border-border bg-gradient-to-br ${s.cls} p-3`}>
              <p className="text-[10px] uppercase tracking-wide opacity-80">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5">{counts[s.key as keyof typeof counts]}</p>
            </div>
            {i < stages.length - 1 && (
              <div className="hidden md:block absolute right-[-6px] top-1/2 -translate-y-1/2 text-muted-foreground/40 text-xs">→</div>
            )}
          </motion.div>
        ))}
      </div>
      <Separator className="my-4" />
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Conversion rate</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {Math.round((counts.Active / total) * 100)}% active
        </span>
      </div>
    </Card>
  )
}

function AccountRow({ acct }: { acct: CorporateAccount }) {
  const days = daysUntil(acct.contractEnd)
  const expiringSoon = acct.status === 'Active' && days <= 60
  const expired = acct.status === 'Expired' || days < 0
  return (
    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group transition-colors hover:bg-accent/40">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${expired ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : expiringSoon ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
            {TYPE_ICON[acct.type]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate flex items-center gap-2">
              {acct.name}
              {expiringSoon && <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-600 dark:text-amber-400">Expiring</Badge>}
              {expired && <Badge variant="outline" className="text-[9px] border-rose-500/40 text-rose-600 dark:text-rose-400">Expired</Badge>}
            </p>
            <p className="text-[11px] text-muted-foreground">{acct.type} · {acct.contact}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        <a href={`tel:${acct.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
          <Phone className="h-3 w-3" /> {acct.phone}
        </a>
      </TableCell>
      <TableCell className="font-medium">{fmtMoney(acct.negotiatedRate)}<span className="text-[10px] text-muted-foreground">/night</span></TableCell>
      <TableCell>
        <span className={`text-xs ${expiringSoon ? 'text-amber-600 dark:text-amber-400 font-medium' : expired ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
          {relativeDate(acct.contractEnd)}
        </span>
        <p className="text-[10px] text-muted-foreground">{days >= 0 ? `${days} days` : `${Math.abs(days)} days ago`}</p>
      </TableCell>
      <TableCell className="text-right">{acct.totalBookings}</TableCell>
      <TableCell className="text-right font-semibold">{fmtMoneyShort(acct.totalRevenue)}</TableCell>
      <TableCell><StatusPill status={acct.status} /></TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => toast.info('Contract preview', { description: `${acct.name} contract opened` })}
          >
            <FileText className="h-3 w-3" /> View
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => toast.success('Renewal sent', { description: `Renewal proposal emailed to ${acct.contact}` })}
          >
            <Send className="h-3 w-3" /> Renew
          </Button>
        </div>
      </TableCell>
    </motion.tr>
  )
}

function AccountsTable() {
  const [q, setQ] = React.useState('')
  const [type, setType] = React.useState<'All' | CorporateAccount['type']>('All')
  const filtered = CORPORATE.filter(c => {
    if (type !== 'All' && c.type !== type) return false
    if (q && !`${c.name} ${c.contact} ${c.phone}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const types = ['All', 'Company', 'Travel Agency', 'Government', 'NGO', 'School', 'Event Organizer'] as const
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold">Corporate Accounts</h3>
          <p className="text-xs text-muted-foreground">Manage contracts, negotiated rates, and renewals</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search accounts…" className="h-8 w-44 pl-8 text-xs" />
          </div>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger size="sm" className="h-8 w-[8.5rem] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs">Account</TableHead>
              <TableHead className="text-xs">Phone</TableHead>
              <TableHead className="text-xs">Rate</TableHead>
              <TableHead className="text-xs">Contract end</TableHead>
              <TableHead className="text-xs text-right">Bookings</TableHead>
              <TableHead className="text-xs text-right">Revenue</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => <AccountRow key={a.id} acct={a} />)}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">
                  No accounts match your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function AddAccountButton() {
  return (
    <Button size="sm" onClick={() => toast.success('Account created', { description: 'New corporate account added to pipeline' })}>
      <Plus className="h-3.5 w-3.5" /> Add account
    </Button>
  )
}

function ExpiringSoon() {
  const expiring = CORPORATE.filter(c => c.status === 'Active' && daysUntil(c.contractEnd) <= 60)
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <CalendarClock className="h-4 w-4" />
          </div>
          <h3 className="font-semibold">Expiring Soon</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Contracts ending within 60 days — reach out now.</p>
        <div className="space-y-2">
          {expiring.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No renewals due. 🎉</p>}
          {expiring.map(c => (
            <div key={c.id} className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.contact} · ends in {daysUntil(c.contractEnd)}d</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                onClick={() => toast.success('Renewal sent', { description: `Proposal emailed to ${c.contact}` })}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function TopAccounts() {
  const top = [...CORPORATE].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5)
  const max = top[0]?.totalRevenue ?? 1
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Top Accounts by Revenue</h3>
          <p className="text-xs text-muted-foreground">All-time contribution</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {top.map((c, i) => (
          <div key={c.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
                <span className="font-medium truncate">{c.name}</span>
              </span>
              <span className="font-semibold">{fmtMoneyShort(c.totalRevenue)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                style={{ width: `${(c.totalRevenue / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function CorporateModule() {
  const active = CORPORATE.filter(c => c.status === 'Active').length
  const totalRev = CORPORATE.reduce((s, c) => s + c.totalRevenue, 0)
  const avgRate = Math.round(CORPORATE.reduce((s, c) => s + c.negotiatedRate, 0) / CORPORATE.length)
  const renewals = CORPORATE.filter(c => c.status === 'Active' && daysUntil(c.contractEnd) <= 60).length

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Corporate Sales CRM"
        description="Manage B2B accounts, negotiated rates, and contract renewals in one place."
        action={<AddAccountButton />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Accounts" value={`${active}`} sub={`${CORPORATE.length} total in pipeline`} icon={<Building2 className="h-5 w-5" />} accent="teal" />
        <StatCard label="Corporate Revenue" value={fmtMoneyShort(totalRev)} sub="all-time" icon={<TrendingUp className="h-5 w-5" />} accent="brand" trend={11} />
        <StatCard label="Avg Negotiated Rate" value={fmtMoney(avgRate)} sub="per night" icon={<Briefcase className="h-5 w-5" />} accent="gold" />
        <StatCard label="Pending Renewals" value={`${renewals}`} sub="due in ≤60 days" icon={<CalendarClock className="h-5 w-5" />} accent="rose" />
      </div>

      <Pipeline />

      <AccountsTable />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ExpiringSoon />
        <TopAccounts />
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-600 dark:text-orange-400">
                <Handshake className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">Account Health</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Engagement signals across all accounts</p>
            <div className="space-y-3">
              {[
                { label: 'On-time payments', pct: 92, cls: 'from-emerald-500 to-teal-500' },
                { label: 'Contract utilization', pct: 74, cls: 'from-orange-500 to-amber-500' },
                { label: 'Renewal likelihood', pct: 68, cls: 'from-violet-500 to-purple-500' },
                { label: 'Booking frequency', pct: 81, cls: 'from-amber-500 to-orange-500' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full bg-gradient-to-r ${s.cls}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
