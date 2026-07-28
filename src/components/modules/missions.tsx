'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MISSIONS } from '@/lib/data-v2'
import type { Mission, MissionAction, MissionStatus, MissionType } from '@/lib/data-v2'
import { AI_AGENTS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct, relativeDate, initials } from '@/lib/format'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Sparkles, Zap, Check, Clock, Brain, ChevronDown, Play, Pause,
  Plus, Bot, AlertTriangle, Activity, ArrowRight, CheckCircle2, Loader2,
  Rocket, TrendingUp, Hand, Eye, Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------- constants ----------

const STATUS_STYLES: Record<MissionStatus, string> = {
  'Active': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  'On Track': 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  'At Risk': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Completed': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Paused': 'bg-slate-500/15 text-slate-500 dark:text-slate-400',
  'Awaiting Approval': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
}

const TYPE_ICON: Record<MissionType, string> = {
  occupancy: '🛏️',
  conversion: '🔄',
  retention: '🔁',
  pricing: '💰',
  reputation: '⭐',
  direct: '🌐',
}

const TYPE_ACCENT: Record<MissionType, string> = {
  occupancy: 'from-orange-500/20 to-amber-500/5 text-orange-600 dark:text-orange-400',
  conversion: 'from-teal-500/20 to-emerald-500/5 text-teal-600 dark:text-teal-400',
  retention: 'from-violet-500/20 to-purple-500/5 text-violet-600 dark:text-violet-400',
  pricing: 'from-amber-500/20 to-yellow-500/5 text-amber-600 dark:text-amber-400',
  reputation: 'from-rose-500/20 to-red-500/5 text-rose-600 dark:text-rose-400',
  direct: 'from-emerald-500/20 to-teal-500/5 text-emerald-600 dark:text-emerald-400',
}

type FilterKey = 'all' | 'active' | 'at-risk' | 'awaiting' | 'completed'

const FILTERS: { key: FilterKey; label: string; match: (m: Mission) => boolean }[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'active', label: 'Active', match: m => m.status === 'Active' || m.status === 'On Track' },
  { key: 'at-risk', label: 'At Risk', match: m => m.status === 'At Risk' },
  { key: 'awaiting', label: 'Awaiting Approval', match: m => m.status === 'Awaiting Approval' },
  { key: 'completed', label: 'Completed', match: m => m.status === 'Completed' },
]

// ---------- helpers ----------

function agentById(id: string) {
  return AI_AGENTS.find(a => a.id === id)
}

function agentByName(name: string) {
  return AI_AGENTS.find(a => a.name === name)
}

// ---------- sub-components ----------

function LeadAgentChip({ agentId }: { agentId: string }) {
  const agent = agentById(agentId)
  if (!agent) return null
  return (
    <div className="flex items-center gap-1.5">
      <Avatar className="h-5 w-5 border border-border">
        <AvatarFallback
          className="text-[9px] font-semibold"
          style={{ backgroundColor: (agent.color ?? '#ea580c') + '22', color: agent.color ?? '#ea580c' }}
        >
          {agent.avatar ?? initials(agent.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">{agent.name}</span> · {agent.role}
      </span>
    </div>
  )
}

function ChainNode({
  step, isLast,
}: {
  step: Mission['agentChain'][number]
  isLast: boolean
}) {
  return (
    <div className="flex items-stretch gap-0 shrink-0">
      <div className="flex w-[120px] shrink-0 flex-col items-center text-center sm:w-[140px]">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                step.status === 'done' && 'border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                step.status === 'active' && 'border-orange-500/60 bg-orange-500/15 text-orange-600 dark:text-orange-400 ai-pulse',
                step.status === 'pending' && 'border-border bg-muted text-muted-foreground',
              )}
            >
              {step.status === 'done' ? <Check className="h-4 w-4" /> : step.status === 'active' ? <Activity className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px] text-xs">
            <p className="font-semibold">{step.role}</p>
            <p className="text-muted-foreground">{step.action}</p>
          </TooltipContent>
        </Tooltip>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {step.role}
        </p>
        <p className="text-[11px] font-medium leading-tight">{step.agent}</p>
        <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">{step.action}</p>
      </div>
      {!isLast && (
        <div className="flex items-center pt-4">
          <div
            className={cn(
              'h-0.5 w-6 rounded-full sm:w-8',
              step.status === 'done' ? 'bg-emerald-500/40' : 'bg-border',
            )}
          />
        </div>
      )}
    </div>
  )
}

function AgentChain({ chain }: { chain: Mission['agentChain'] }) {
  if (!chain.length) return null
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Bot className="h-3.5 w-3.5 text-orange-500" />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Agent Chain · AI workforce collaboration
        </p>
      </div>
      <div className="overflow-x-auto scroll-area-fancy pb-2">
        <div className="flex min-w-max items-stretch pr-2">
          {chain.map((step, i) => (
            <ChainNode key={i} step={step} isLast={i === chain.length - 1} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionStatusBadge({ status }: { status: MissionAction['status'] }) {
  switch (status) {
    case 'done':
      return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"><Check className="h-2.5 w-2.5" /> Done</span>
    case 'in-progress':
      return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400"><Loader2 className="h-2.5 w-2.5 animate-spin" /> In progress</span>
    case 'pending':
      return <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400"><Clock className="h-2.5 w-2.5" /> Pending</span>
    case 'approved':
      return <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-teal-600 dark:text-teal-400"><CheckCircle2 className="h-2.5 w-2.5" /> Approved</span>
    case 'auto':
      return <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400 ai-pulse"><Zap className="h-2.5 w-2.5" /> Auto</span>
    default:
      return null
  }
}

function ActionsTimeline({ actions }: { actions: MissionAction[] }) {
  if (!actions.length) return null
  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-teal-500" />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Actions Timeline
        </p>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {actions.filter(a => a.auto).length} auto · {actions.filter(a => a.status === 'pending').length} pending
        </span>
      </div>
      <div className="relative pl-7">
        {/* vertical rail */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-3">
          {actions.map((a) => {
            const agent = agentByName(a.agent)
            const color = agent?.color ?? '#ea580c'
            return (
              <li key={a.id} className="relative">
                {/* node */}
                <div
                  className={cn(
                    'absolute -left-7 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-card',
                    a.status === 'auto' && 'border-orange-500/60 text-orange-500 ai-pulse',
                    a.status === 'done' && 'border-emerald-500/60 text-emerald-500',
                    a.status === 'in-progress' && 'border-amber-500/60 text-amber-500',
                    a.status === 'pending' && 'border-border text-muted-foreground',
                    a.status === 'approved' && 'border-teal-500/60 text-teal-500',
                  )}
                >
                  {a.status === 'auto' ? <Zap className="h-3 w-3" /> : a.status === 'done' ? <Check className="h-3 w-3" /> : a.status === 'in-progress' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: color + '1f', color }}
                    >
                      {a.agent} · {a.agentRole}
                    </span>
                    {a.auto && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 ai-pulse">
                        <Zap className="h-2.5 w-2.5" /> AUTO
                      </span>
                    )}
                    <span className="ml-auto"><ActionStatusBadge status={a.status} /></span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed">{a.description}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{a.timestamp}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function MissionCard({ mission }: { mission: Mission }) {
  const [expanded, setExpanded] = React.useState(false)
  const [paused, setPaused] = React.useState(mission.status === 'Paused')
  const lead = agentById(mission.leadAgent)
  const pendingActions = mission.actions.filter(a => a.status === 'pending')
  const autoActions = mission.actions.filter(a => a.auto)

  const handlePause = () => {
    setPaused(p => !p)
    toast.success(paused ? 'Mission resumed' : 'Mission paused', {
      description: paused
        ? `"${mission.name}" is running again — agents will continue.`
        : `"${mission.name}" paused — agents stand down until you resume.`,
    })
  }

  const handleApprove = () => {
    const next = pendingActions[0]
    if (!next) {
      toast.info('Nothing to approve', { description: 'No pending actions on this mission.' })
      return
    }
    toast.success('Next action approved', {
      description: `${next.agent} (${next.agentRole}) will execute: "${next.description.slice(0, 80)}${next.description.length > 80 ? '…' : ''}"`,
      icon: <Hand className="h-4 w-4" />,
    })
  }

  const handleView = () => {
    toast('Mission details', {
      description: `Opening full report for "${mission.name}" — lead ${lead?.name ?? 'AI'} · ETA ${mission.estimatedCompletion}.`,
      icon: <Eye className="h-4 w-4" />,
    })
  }

  return (
    <Card className={cn('relative overflow-hidden transition-colors', expanded ? 'border-orange-500/40' : 'hover:border-orange-500/30')}>
      <div className={cn('absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r', TYPE_ACCENT[mission.type])} />
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full p-4 text-left sm:p-5"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl', TYPE_ACCENT[mission.type])}>
            {TYPE_ICON[mission.type]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold leading-tight">{mission.name}</h3>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLES[mission.status])}>
                {paused ? 'Paused' : mission.status}
              </span>
              {mission.autoExecuting && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400 ai-pulse">
                  <Sparkles className="h-2.5 w-2.5" /> Auto-executing
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <LeadAgentChip agentId={mission.leadAgent} />
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="text-[11px] text-muted-foreground">ETA <span className="font-medium text-foreground">{mission.estimatedCompletion}</span></span>
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="text-[11px] text-muted-foreground">Deadline <span className="font-medium text-foreground">{relativeDate(mission.deadline)}</span></span>
            </div>
          </div>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
        </div>

        {/* progress + metric */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{mission.currentMetric}</span>
            <span className="font-semibold tabular-nums">
              {mission.currentValue.toLocaleString()}{mission.unit} <ArrowRight className="inline h-3 w-3 text-muted-foreground" /> {mission.targetValue.toLocaleString()}{mission.unit}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={mission.progress} className="h-2 flex-1" />
            <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums">{mission.progress}%</span>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-4 pb-5 sm:px-5">
              <Separator />

              {/* revenue / savings tiles */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-emerald-500/10 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Expected revenue</p>
                  <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(mission.expectedRevenue)}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtMoney(mission.expectedRevenue)}</p>
                </div>
                {mission.expectedSavings ? (
                  <div className="rounded-xl bg-teal-500/10 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Commission saved</p>
                    <p className="mt-0.5 text-lg font-bold text-teal-600 dark:text-teal-400">{fmtMoneyShort(mission.expectedSavings)}</p>
                    <p className="text-[10px] text-muted-foreground">{fmtMoney(mission.expectedSavings)}</p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-violet-500/10 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">North star</p>
                    <p className="mt-0.5 text-sm font-bold text-violet-600 dark:text-violet-400">{mission.northStar}</p>
                  </div>
                )}
                <div className="col-span-2 rounded-xl bg-orange-500/10 p-3 sm:col-span-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Progress</p>
                  <p className="mt-0.5 text-lg font-bold text-orange-600 dark:text-orange-400">{fmtPct(mission.progress)}</p>
                  <p className="text-[10px] text-muted-foreground">to {mission.targetMetric}</p>
                </div>
              </div>

              {/* agent chain */}
              <AgentChain chain={mission.agentChain} />

              {/* actions timeline */}
              <ActionsTimeline actions={mission.actions} />

              {/* action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant={paused ? 'default' : 'outline'}
                  onClick={handlePause}
                  className="gap-1.5"
                >
                  {paused ? <><Play className="h-3.5 w-3.5" /> Resume mission</> : <><Pause className="h-3.5 w-3.5" /> Pause mission</>}
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleApprove}
                  disabled={pendingActions.length === 0}
                  className="gap-1.5 bg-orange-600 hover:bg-orange-700"
                >
                  <Check className="h-3.5 w-3.5" /> Approve next action
                  {pendingActions.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{pendingActions.length}</Badge>
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleView} className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> View details
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

function CreateMissionDialog() {
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<MissionType>('occupancy')
  const [goal, setGoal] = React.useState('')

  const submit = () => {
    if (!goal.trim()) {
      toast.error('Goal required', { description: 'Tell the AI workforce what success looks like.' })
      return
    }
    toast.success('Mission created', {
      description: 'AI workforce engaged — agents are cascading now. Track progress in Active Missions.',
      icon: <Rocket className="h-4 w-4" />,
    })
    setGoal('')
    setType('occupancy')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4" /> Create Mission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15">
              <Rocket className="h-4 w-4 text-orange-500" />
            </div>
            Create a new mission
          </DialogTitle>
          <DialogDescription>
            Describe the outcome you want. The AI workforce will self-organize — Revenue Director cascades to Pricing, Marketing, CRM, Guest Relations, and back to reporting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mission type</label>
            <Select value={type} onValueChange={(v) => setType(v as MissionType)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="occupancy">🛏️ Occupancy — fill empty rooms</SelectItem>
                <SelectItem value="conversion">🔄 Conversion — move OTA guests to direct</SelectItem>
                <SelectItem value="retention">🔁 Retention — drive repeat bookings</SelectItem>
                <SelectItem value="pricing">💰 Pricing — optimize RevPAR</SelectItem>
                <SelectItem value="reputation">⭐ Reputation — recover rating</SelectItem>
                <SelectItem value="direct">🌐 Direct — grow direct share</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Goal</label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Fill at least 14 of 18 rooms this Friday without dropping rate below ₵420"
              rows={4}
              className="resize-none"
            />
            <p className="text-[11px] text-muted-foreground">The AI will decompose this into an agent chain and execute autonomously.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} className="gap-1.5 bg-orange-600 hover:bg-orange-700">
            <Sparkles className="h-4 w-4" /> Engage AI workforce
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- main module ----------

export function MissionsModule() {
  const [filter, setFilter] = React.useState<FilterKey>('all')

  const activeCount = MISSIONS.filter(m => m.status === 'Active' || m.status === 'On Track').length
  const totalExpectedRevenue = MISSIONS.reduce((s, m) => s + m.expectedRevenue, 0)
  const avgProgress = Math.round(MISSIONS.reduce((s, m) => s + m.progress, 0) / MISSIONS.length)
  const approvalsPending = MISSIONS.reduce((s, m) => s + m.actions.filter(a => a.status === 'pending').length, 0)

  const activeFilter = FILTERS.find(f => f.key === filter)!
  const filtered = MISSIONS.filter(activeFilter.match)

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        <SectionHeader
          title="Active Missions"
          description="The AI runs these continuously — you approve, it executes."
          action={<CreateMissionDialog />}
        />

        {/* autonomous hero strip */}
        <Card className="relative overflow-hidden p-4 sm:p-5">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-teal-500/10" />
          <div className="relative flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Autonomous workforce online · 24/7</p>
              <p className="text-xs text-muted-foreground">
                {MISSIONS.filter(m => m.autoExecuting).length} missions auto-executing · {approvalsPending} actions awaiting your approval
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              All agents active
            </div>
          </div>
        </Card>

        {/* stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Active missions"
            value={String(activeCount)}
            sub={`${MISSIONS.length} total in pipeline`}
            icon={<Target className="h-5 w-5" />}
            accent="brand"
          />
          <StatCard
            label="Expected revenue"
            value={fmtMoneyShort(totalExpectedRevenue)}
            sub={fmtMoney(totalExpectedRevenue)}
            icon={<TrendingUp className="h-5 w-5" />}
            accent="teal"
          />
          <StatCard
            label="Avg progress"
            value={fmtPct(avgProgress)}
            sub="across all missions"
            icon={<Activity className="h-5 w-5" />}
            accent="gold"
          />
          <StatCard
            label="Approvals pending"
            value={String(approvalsPending)}
            sub="actions awaiting owner"
            icon={<Hand className="h-5 w-5" />}
            accent="violet"
          />
        </div>

        {/* filter row */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList className="h-9 flex-wrap">
              {FILTERS.map(f => (
                <TabsTrigger key={f.key} value={f.key} className="text-xs">
                  {f.label}
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {MISSIONS.filter(f.match).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        {/* mission cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-10 text-center text-muted-foreground">
                  <Target className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">No missions in this view.</p>
                </Card>
              </motion.div>
            ) : (
              filtered.map(m => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <MissionCard mission={m} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* footer explainer */}
        <Card className="p-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
              <Brain className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">How autonomous missions work</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Each mission has a <span className="font-medium text-foreground">lead agent</span> who cascades work to specialized agents — Pricing → Marketing → CRM → Guest Relations → Finance.
                Actions marked <span className="inline-flex items-center gap-0.5 font-medium text-orange-600 dark:text-orange-400"><Zap className="h-3 w-3" /> AUTO</span> are executed by the AI without your input.
                You only approve high-impact decisions; everything else runs itself.
              </p>
            </div>
          </div>
        </Card>

      </div>
    </TooltipProvider>
  )
}
