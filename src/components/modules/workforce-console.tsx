'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useTwin, TRUST_LEVEL_COLORS, TRUST_LEVEL_LABELS, approveTask, rejectTask, startOrchestrator, stopOrchestrator, memoryStore, getEmployee, EMPLOYEES } from '@/lib/workforce'
import { subscribe, getSnapshot } from '@/lib/workforce/engine'
import { useApp } from '@/lib/store'
import { fmtMoney, fmtMoneyShort, relativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Activity, Bot, Zap, Check, X, Clock, Brain, Play, Pause, Wrench,
  Database, Cpu, GitBranch, ChevronRight, RefreshCw,
} from 'lucide-react'
import { TrustLevel } from '@/lib/workforce/types'

const STATUS_COLORS: Record<string, string> = {
  'Queued': 'bg-slate-500/15 text-slate-500',
  'Awaiting Approval': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  'Approved': 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  'Executing': 'bg-orange-500/15 text-orange-600 dark:text-orange-400 ai-pulse',
  'Completed': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Rejected': 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  'Failed': 'bg-red-500/15 text-red-600 dark:text-red-400',
}

function TaskRow({ task }: { task: { id: string; title: string; description: string; employeeId: string; toolName: string; trustLevel: number; status: string; priority: string; estimatedRevenue: number; confidence: number; autopilotEnabled: boolean; expectedOutcome?: string } }) {
  const emp = getEmployee(task.employeeId)
  return (
    <div className={cn('rounded-lg border p-2.5', task.status === 'Awaiting Approval' ? 'border-violet-500/30 bg-violet-500/5' : task.status === 'Executing' ? 'border-orange-500/30 bg-orange-500/5' : 'border-border bg-card/50')}>
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: (emp?.color ?? '#6b7280') + '1a' }}>{emp?.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold truncate">{task.title}</p>
            <div className="flex items-center gap-1 shrink-0">
              <span className={cn('text-[9px] font-medium rounded-full px-1.5 py-0.5', TRUST_LEVEL_COLORS[task.trustLevel as TrustLevel])}>L{task.trustLevel}</span>
              <span className={cn('text-[9px] font-medium rounded-full px-1.5 py-0.5', STATUS_COLORS[task.status])}>{task.status}</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] flex-wrap">
            <span className="text-muted-foreground">🔧 {task.toolName}</span>
            <span className="text-muted-foreground">· {emp?.name}</span>
            {task.estimatedRevenue > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-medium">{fmtMoneyShort(task.estimatedRevenue)}</span>}
            <span className="text-violet-600 dark:text-violet-400">{task.confidence}%</span>
            {task.autopilotEnabled && <span className="text-orange-600 dark:text-orange-400">⚡ auto</span>}
            <span className={cn('rounded px-1', task.priority === 'Critical' ? 'bg-rose-500/15 text-rose-600' : task.priority === 'High' ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground')}>{task.priority}</span>
          </div>
          {task.status === 'Awaiting Approval' && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <Button size="sm" className="h-6 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => approveTask(task.id)}><Check className="h-3 w-3" /> Approve</Button>
              <Button size="sm" variant="outline" className="h-6 text-[11px] text-rose-600 border-rose-500/30 hover:bg-rose-500/10" onClick={() => rejectTask(task.id)}><X className="h-3 w-3" /> Reject</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmployeeCard({ emp }: { emp: typeof EMPLOYEES[0] }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-base" style={{ backgroundColor: emp.color + '1a' }}>{emp.avatar}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{emp.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{emp.role}</p>
        </div>
        <span className={cn('h-2 w-2 rounded-full', emp.status === 'Working' ? 'bg-orange-500 ai-pulse' : emp.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground')} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div><span className="text-muted-foreground">Tasks:</span> <span className="font-medium">{emp.tasksCompleted}</span></div>
        <div><span className="text-muted-foreground">Confidence:</span> <span className="font-medium">{emp.confidenceScore}%</span></div>
        <div><span className="text-muted-foreground">Workload:</span> <span className="font-medium">{emp.currentWorkload}</span></div>
        <div><span className="text-muted-foreground">Supervisor:</span> <span className="font-medium">{emp.supervisor}</span></div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {emp.toolPermissions.slice(0, 3).map((t) => (
          <span key={t} className="text-[9px] rounded bg-muted/60 px-1.5 py-0.5 text-muted-foreground">{t}</span>
        ))}
        {emp.toolPermissions.length > 3 && <span className="text-[9px] text-muted-foreground">+{emp.toolPermissions.length - 3}</span>}
      </div>
      {emp.lastAction && <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2 italic">"{emp.lastAction}"</p>}
    </Card>
  )
}

export function WorkforceConsoleModule() {
  const engine = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const { tasks, events, learning, missions, running } = engine
  const tickCount = useTwin((s) => s.tickCount)
  const [memories, setMemories] = React.useState<{ id: string; content: string; scope: string; employeeId: string; confidence: number; createdAt: number }[]>([])
  const [tab, setTab] = React.useState('queue')

  React.useEffect(() => {
    // refresh memories when memory tab opens
    if (tab === 'memory') setMemories(memoryStore.getAll().slice(0, 30))
  }, [tab, events.length])

  const queue = tasks.filter((t) => t.status === 'Queued' || t.status === 'Executing')
  const approvals = tasks.filter((t) => t.status === 'Awaiting Approval')
  const completed = tasks.filter((t) => t.status === 'Completed')
  const stats = {
    total: tasks.length,
    awaitingApproval: tasks.filter((t) => t.status === 'Awaiting Approval').length,
    executing: tasks.filter((t) => t.status === 'Executing').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    rejected: tasks.filter((t) => t.status === 'Rejected').length,
    failed: tasks.filter((t) => t.status === 'Failed').length,
    autoExecuted: tasks.filter((t) => t.status === 'Completed' && t.autopilotEnabled).length,
    manualApproved: tasks.filter((t) => t.status === 'Completed' && !t.autopilotEnabled).length,
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-violet-500/10 p-5 md:p-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', running ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', running ? 'bg-emerald-500 ai-pulse' : 'bg-muted-foreground')} />
            {running ? 'Workforce running' : 'Workforce paused'}
          </span>
          <span className="text-[11px] text-muted-foreground">tick #{tickCount} · {tasks.length} tasks · {events.length} events · {learning.length} learnings</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Cpu className="h-6 w-6 text-orange-500" /> Workforce Console
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          A live window into the autonomous workforce. The planner decomposes goals into missions → tasks. The execution queue runs them through tools. Approvals gate business & financial decisions. Every action is recorded in memory and learning.
        </p>
        <div className="mt-3 flex items-center gap-2">
          {running ? (
            <Button size="sm" variant="outline" onClick={() => stopOrchestrator()}><Pause className="h-3.5 w-3.5" /> Pause workforce</Button>
          ) : (
            <Button size="sm" onClick={() => startOrchestrator()}><Play className="h-3.5 w-3.5" /> Resume workforce</Button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total tasks', value: stats.total },
          { label: 'Executing', value: stats.executing },
          { label: 'Awaiting approval', value: stats.awaitingApproval },
          { label: 'Completed', value: stats.completed },
          { label: 'Auto-executed', value: stats.autoExecuted },
          { label: 'Rejected', value: stats.rejected },
          { label: 'Failed', value: stats.failed },
        ].map((s) => (
          <Card key={s.label} className="p-3 gap-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="queue" className="text-xs"><Activity className="h-3 w-3 mr-1" /> Queue ({queue.length})</TabsTrigger>
          <TabsTrigger value="approvals" className="text-xs"><Zap className="h-3 w-3 mr-1" /> Approvals ({approvals.length})</TabsTrigger>
          <TabsTrigger value="workers" className="text-xs"><Bot className="h-3 w-3 mr-1" /> Workers ({EMPLOYEES.length})</TabsTrigger>
          <TabsTrigger value="events" className="text-xs"><GitBranch className="h-3 w-3 mr-1" /> Events ({events.length})</TabsTrigger>
          <TabsTrigger value="memory" className="text-xs"><Brain className="h-3 w-3 mr-1" /> Memory ({memories.length})</TabsTrigger>
          <TabsTrigger value="learning" className="text-xs"><Database className="h-3 w-3 mr-1" /> Learning ({learning.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-orange-500" /> Execution queue</h3>
            {queue.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Queue is empty — the planner will generate new tasks shortly.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto scroll-area-fancy pr-1">
                {queue.map((t) => <TaskRow key={t.id} task={t} />)}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-violet-500" /> Approval gate</h3>
              <span className="text-[11px] text-muted-foreground">L3 business · L4 financial always</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-[11px] font-medium mb-2">Trust levels</p>
                <div className="space-y-1">
                  {Object.entries(TRUST_LEVEL_LABELS).map(([lvl, label]) => (
                    <div key={lvl} className="flex items-center justify-between text-[11px]">
                      <span className={cn('rounded px-1.5 py-0.5', TRUST_LEVEL_COLORS[Number(lvl) as TrustLevel])}>L{lvl}</span>
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {approvals.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No approvals pending.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto scroll-area-fancy pr-1">
                    {approvals.map((t) => <TaskRow key={t.id} task={t} />)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="workers" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Bot className="h-4 w-4 text-teal-500" /> AI employees</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {EMPLOYEES.map((emp) => <EmployeeCard key={emp.id} emp={emp} />)}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><GitBranch className="h-4 w-4 text-violet-500" /> Event stream <span className="text-[10px] text-muted-foreground ml-1 ai-pulse">live</span></h3>
            {events.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No events yet.</p>
            ) : (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto scroll-area-fancy pr-1">
                {events.slice(0, 50).map((e) => {
                  const emp = e.employeeId ? getEmployee(e.employeeId) : null
                  const time = new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  return (
                    <div key={e.id} className="flex items-start gap-2 text-[11px] rounded bg-muted/30 px-2 py-1.5">
                      <span className="text-[9px] text-muted-foreground tabular-nums shrink-0 w-16">{time}</span>
                      <span className="font-mono text-[10px] text-violet-600 dark:text-violet-400 shrink-0">{e.type}</span>
                      <span className="text-muted-foreground flex-1 min-w-0">
                        {emp && <span className="text-foreground font-medium">{emp.name} </span>}
                        {e.payload.message ? String(e.payload.message).slice(0, 70) : e.payload.title ? String(e.payload.title).slice(0, 70) : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-violet-500" /> Long-term memory</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setMemories(memoryStore.getAll().slice(0, 30))}><RefreshCw className="h-3 w-3" /> Refresh</Button>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Persists to localStorage. Each employee has scoped memory. The planner shares organizational memory.</p>
            {memories.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No memories yet — the workforce will record them as it works.</p>
            ) : (
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto scroll-area-fancy pr-1">
                {memories.map((m) => {
                  const emp = getEmployee(m.employeeId)
                  return (
                    <div key={m.id} className="rounded-lg border border-border bg-card/50 p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{emp?.avatar}</span>
                        <span className="text-[10px] font-medium">{emp?.role}</span>
                        <span className="text-[9px] rounded bg-muted px-1 py-0.5 text-muted-foreground">{m.scope}.{m.type}</span>
                        <span className="text-[9px] text-violet-600 dark:text-violet-400 ml-auto">{m.confidence}%</span>
                        <span className="text-[9px] text-muted-foreground">×{m.timesRecalled}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{m.content}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-emerald-500" /> Learning loop</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Every completed task records expected vs actual outcome + a lesson. Future decisions improve using this feedback.</p>
            {learning.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No learnings yet — they appear as tasks complete.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto scroll-area-fancy pr-1">
                {learning.map((l) => {
                  const emp = getEmployee(l.employeeId)
                  return (
                    <div key={l.id} className="rounded-lg border border-border bg-card/50 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">{emp?.avatar}</span>
                        <span className="text-[11px] font-medium">{emp?.role}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{l.durationMs}ms · {l.revenueGenerated > 0 ? `+${fmtMoneyShort(l.revenueGenerated)}` : 'no revenue'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                        <p className="text-muted-foreground"><span className="font-medium text-foreground">Expected:</span> {l.expectedOutcome}</p>
                        <p className="text-muted-foreground"><span className="font-medium text-foreground">Actual:</span> {l.actualOutcome.slice(0, 70)}</p>
                      </div>
                      <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-1.5">💡 {l.lesson}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">→ {l.futureRecommendation}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
