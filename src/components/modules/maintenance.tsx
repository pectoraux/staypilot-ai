'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { StatCard, SectionHeader, PriorityPill } from '@/components/shared'
import { MAINTENANCE, ROOMS } from '@/lib/data'
import type { MaintenanceIssue } from '@/lib/types'
import { fmtMoney, fmtMoneyShort, fmtDate, relativeDate } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Wrench, AlertTriangle, Clock, DollarSign, Plus, Search, UserCog, CheckCircle2, Zap, TrendingDown,
} from 'lucide-react'

const TECHS = ['Tech Kojo', 'Tech Yaw', 'Tech Kwame', 'Tech Akosua']

function StatGrid() {
  const open = MAINTENANCE.filter(m => m.status === 'Open').length
  const critical = MAINTENANCE.filter(m => m.priority === 'Critical').length
  const resolved = MAINTENANCE.filter(m => m.status === 'Resolved')
  const avgResolution = resolved.length
    ? Math.round(resolved.reduce((s, m) => {
        const r = m.resolvedAt ? new Date(m.resolvedAt).getTime() : Date.now()
        const c = new Date(m.createdAt).getTime()
        return s + Math.max(1, Math.round((r - c) / 86400000))
      }, 0) / resolved.length)
    : 0
  const downtimeCost = MAINTENANCE
    .filter(m => m.status !== 'Resolved')
    .reduce((s, m) => s + m.estimatedCost, 0)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Open Issues" value={`${open + MAINTENANCE.filter(m => m.status === 'In Progress').length}`} sub={`${open} open · in progress`} icon={<Wrench className="h-5 w-5" />} accent="brand" />
      <StatCard label="Critical Issues" value={`${critical}`} sub="need immediate attention" icon={<AlertTriangle className="h-5 w-5" />} accent="rose" />
      <StatCard label="Avg Resolution Time" value={`${avgResolution}d`} sub="across resolved items" icon={<Clock className="h-5 w-5" />} accent="teal" trend={-12} />
      <StatCard label="Est. Downtime Cost" value={fmtMoneyShort(downtimeCost)} sub="across open issues" icon={<DollarSign className="h-5 w-5" />} accent="gold" />
    </div>
  )
}

function ReportIssueDialog() {
  const [open, setOpen] = React.useState(false)
  const [room, setRoom] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [priority, setPriority] = React.useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium')
  const [desc, setDesc] = React.useState('')
  const submit = () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    toast.success('Issue reported', { description: `${priority} · ${room || 'General'} · ${title}` })
    setOpen(false)
    setRoom(''); setTitle(''); setDesc(''); setPriority('Medium')
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-3.5 w-3.5" /> Report issue</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report a maintenance issue</DialogTitle>
          <DialogDescription>Log a new issue. The ops team will be notified instantly.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Room</label>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {ROOMS.map(r => <SelectItem key={r.id} value={r.number}>Room {r.number} · {r.name}</SelectItem>)}
                  <SelectItem value="general">General / Common area</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AC not cooling" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the issue, when it started, any guest impact…" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Submit issue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function IssueRow({ issue }: { issue: MaintenanceIssue }) {
  const [status, setStatus] = React.useState(issue.status)
  const [assigned, setAssigned] = React.useState(issue.assignedTo ?? '')
  const room = ROOMS.find(r => r.number === issue.roomNumber)
  const revenueAtRisk = room ? room.baseRate : 0
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group transition-colors hover:bg-accent/40"
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/50 text-[11px] font-bold">{issue.roomNumber}</span>
          <div className="min-w-0">
            <p className="truncate">{issue.title}</p>
            <p className="text-[10px] text-muted-foreground">{room?.name ?? 'Common area'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell><PriorityPill priority={issue.priority} /></TableCell>
      <TableCell>
        <Select value={status} onValueChange={(v) => {
          setStatus(v as MaintenanceIssue['status'])
          toast.success(`Status → ${v}`, { description: `${issue.title} (Room ${issue.roomNumber})` })
        }}>
          <SelectTrigger size="sm" className="h-7 w-[8.5rem] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['Open', 'In Progress', 'Resolved'] as const).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={assigned} onValueChange={(v) => {
          setAssigned(v)
          toast.success('Tech assigned', { description: `${v} → ${issue.title}` })
        }}>
          <SelectTrigger size="sm" className="h-7 w-[8.5rem] text-xs"><SelectValue placeholder="Unassigned" /></SelectTrigger>
          <SelectContent>
            {TECHS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right font-medium">{fmtMoney(issue.estimatedCost)}</TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        <div>{fmtDate(issue.createdAt)}</div>
        <div className="text-[10px]">{relativeDate(issue.createdAt)}</div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          {status !== 'Resolved' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => {
                if (!assigned) {
                  toast.error('Assign a tech first', { description: 'Pick a technician before resolving' })
                  return
                }
                setStatus('Resolved')
                toast.success('Issue resolved', { description: `${issue.title}` })
              }}
            >
              <CheckCircle2 className="h-3 w-3" /> Resolve
            </Button>
          )}
          {status === 'Resolved' && (
            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
            </Badge>
          )}
        </div>
      </TableCell>
    </motion.tr>
  )
}

function IssuesTable() {
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All')
  const [priorityFilter, setPriorityFilter] = React.useState<'All' | 'Low' | 'Medium' | 'High' | 'Critical'>('All')
  const [q, setQ] = React.useState('')
  const filtered = MAINTENANCE.filter(m => {
    if (statusFilter !== 'All' && m.status !== statusFilter) return false
    if (priorityFilter !== 'All' && m.priority !== priorityFilter) return false
    if (q && !`${m.title} ${m.roomNumber} ${m.description}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold">Open Issues</h3>
          <p className="text-xs text-muted-foreground">{filtered.length} of {MAINTENANCE.length} issues shown</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-8 w-40 pl-8 text-xs" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger size="sm" className="h-8 w-[7rem] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
            <SelectTrigger size="sm" className="h-8 w-[8rem] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['All', 'Low', 'Medium', 'High', 'Critical'] as const).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs">Issue</TableHead>
              <TableHead className="text-xs">Priority</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Assigned</TableHead>
              <TableHead className="text-xs text-right">Est. cost</TableHead>
              <TableHead className="text-xs text-right">Created</TableHead>
              <TableHead className="text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => <IssueRow key={m.id} issue={m} />)}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                  No issues match your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function DowntimeWarning() {
  // Rooms in Maintenance status — compute revenue at risk (baseRate * estimated days)
  const downRooms = ROOMS.filter(r => r.status === 'Maintenance')
  const totalRisk = downRooms.reduce((s, r) => s + r.baseRate * 3, 0) // assume 3-day avg downtime
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <TrendingDown className="h-4 w-4" />
          </div>
          <h3 className="font-semibold">Room Downtime Warning</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Rooms in Maintenance block revenue. Each night offline = lost base rate.</p>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 mb-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{fmtMoneyShort(totalRisk)}</p>
              <p className="text-[11px] text-muted-foreground">est. revenue at risk · next 3 nights</p>
            </div>
            <Badge variant="outline" className="border-rose-500/30 text-rose-600 dark:text-rose-400">{downRooms.length} rooms offline</Badge>
          </div>
        </div>
        <div className="space-y-2">
          {downRooms.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No rooms currently in maintenance. 🎉</p>
          )}
          {downRooms.map(r => {
            const issue = MAINTENANCE.find(m => m.roomNumber === r.number && m.status !== 'Resolved')
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-[11px] font-bold text-rose-600 dark:text-rose-400">{r.number}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{issue?.title ?? 'No active issue'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{fmtMoney(r.baseRate * 3)}</p>
                  <p className="text-[10px] text-muted-foreground">3-night risk</p>
                </div>
              </div>
            )
          })}
        </div>
        <Separator className="my-3" />
        <div className="flex items-start gap-2 rounded-lg bg-orange-500/5 p-2.5 text-xs">
          <Zap className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">AI suggestion:</span> Move Room {downRooms[0]?.number ?? '102'} to lower-priority queue — projected occupancy next 3 nights is 44%, so 1 night of downtime is recoverable.
          </p>
        </div>
      </div>
    </Card>
  )
}

function QuickActions() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-600 dark:text-orange-400">
          <UserCog className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Preventive Schedule</h3>
          <p className="text-xs text-muted-foreground">Upcoming routine checks</p>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { task: 'AC filter cleaning', scope: 'All rooms', due: 'In 4 days', freq: 'Monthly' },
          { task: 'Boiler descale', scope: 'Floors 2–3', due: 'In 9 days', freq: 'Quarterly' },
          { task: 'Generator test run', scope: 'Building', due: 'In 2 days', freq: 'Weekly' },
          { task: 'Pool pump service', scope: 'Pool', due: 'In 14 days', freq: 'Bi-monthly' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card/30 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wrench className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.task}</p>
              <p className="text-[11px] text-muted-foreground">{s.scope} · {s.freq}</p>
            </div>
            <Badge variant="outline" className="text-[10px]">{s.due}</Badge>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full mt-3" size="sm" onClick={() => toast.info('Schedule opened')}>
        View full maintenance calendar
      </Button>
    </Card>
  )
}

export function MaintenanceModule() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Maintenance & Repairs"
        description="Track issues, assign technicians, and protect revenue from room downtime."
        action={<ReportIssueDialog />}
      />
      <StatGrid />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-2">
          <IssuesTable />
        </div>
        <DowntimeWarning />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <QuickActions />
        <Card className="p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-600 dark:text-violet-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">Recently Resolved</h3>
              <p className="text-xs text-muted-foreground">Last 30 days of completed work</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MAINTENANCE.filter(m => m.status === 'Resolved').map(m => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  <p className="text-[11px] text-muted-foreground">Room {m.roomNumber} · {m.assignedTo} · {fmtMoney(m.estimatedCost)}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{m.resolvedAt ? relativeDate(m.resolvedAt) : ''}</span>
              </div>
            ))}
            {MAINTENANCE.filter(m => m.status === 'Resolved').length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6 col-span-2">No resolved issues yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
