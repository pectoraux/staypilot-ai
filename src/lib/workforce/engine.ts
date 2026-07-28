// StayPilot V5 — Workforce Engine (decoupled from React)
// The engine maintains its own internal state and notifies via a lightweight
// subscription. React components poll via useSyncExternalStore (cached snapshot).
// This prevents "Maximum update depth" from rapid Zustand updates.
import type { Task, Mission, WorkforceEvent, LearningRecord, Goal, TaskResult, TrustLevel } from './types'
import { TrustLevel as TL } from './types'
import { GOALS } from '@/lib/data-v4'
import { planner, createAdHocMission } from './planner'
import { approvalGate } from './approval'
import { getWorker, getEmployee, EMPLOYEES } from './workers'
import { emit } from './event-bus'
import { memoryStore } from './memory'
import { useTwin, twinSnapshot } from './digital-twin'

const TICK_INTERVAL = 5000

interface EngineState {
  goals: Goal[]
  missions: Mission[]
  tasks: Task[]
  events: WorkforceEvent[]
  learning: LearningRecord[]
  running: boolean
  tickCount: number
  lastTick: number
}

const initialState: EngineState = {
  goals: GOALS.map((g) => ({ ...g, assignedEmployees: g.assignedAgents })),
  missions: [
    { id: 'mis-seed-1', goalId: 'goal-1', title: 'Recover weak weekend occupancy', status: 'Active', progress: 40, expectedRevenue: 12500, leadEmployee: 'emp-revenue', taskIds: [], createdAt: Date.now() - 3600000 },
    { id: 'mis-seed-2', goalId: 'goal-2', title: 'Convert OTA guests to direct', status: 'Active', progress: 42, expectedRevenue: 8700, leadEmployee: 'emp-crm', taskIds: [], createdAt: Date.now() - 7200000 },
  ],
  tasks: [],
  events: [],
  learning: [],
  running: false,
  tickCount: 0,
  lastTick: Date.now(),
}

// Internal state — NOT Zustand. Direct mutation, cached snapshot for React.
let state: EngineState = { ...initialState }
let listeners: Set<() => void> = new Set()
let snapshotVersion = 0

function setState(patch: Partial<EngineState>) {
  state = { ...state, ...patch }
  snapshotVersion++
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): EngineState {
  return state
}

// Batch updates: collect patches and flush once
let pendingPatch: Partial<EngineState> = {}
let flushScheduled = false
function batchUpdate(patch: Partial<EngineState>) {
  pendingPatch = { ...pendingPatch, ...patch }
  if (!flushScheduled) {
    flushScheduled = true
    setTimeout(() => {
      flushScheduled = false
      const patch = pendingPatch
      pendingPatch = {}
      setState(patch)
    }, 0)
  }
}

// Capture events (batched)
const eventBuffer: WorkforceEvent[] = []
import { eventBus } from './event-bus'
eventBus.subscribe('*', (event) => {
  eventBuffer.push(event)
  // batch event updates
  if (!flushScheduled) {
    flushScheduled = true
    setTimeout(() => {
      flushScheduled = false
      if (eventBuffer.length === 0) {
        if (Object.keys(pendingPatch).length > 0) { setState(pendingPatch); pendingPatch = {} }
        return
      }
      const batch = eventBuffer.splice(0)
      pendingPatch.events = [...batch.reverse(), ...state.events].slice(0, 100)
      const patch = pendingPatch
      pendingPatch = {}
      setState(patch)
    }, 0)
  }
})

let intervalId: ReturnType<typeof setInterval> | null = null
let bootstrapped = false

async function executeTask(task: Task): Promise<TaskResult> {
  const worker = getWorker(task.employeeId)
  batchUpdate({
    tasks: state.tasks.map((t) => t.id === task.id ? { ...t, status: 'Executing' as const, executedAt: Date.now() } : t),
  })
  emit('TaskExecuting', { title: task.title, message: `${task.title}` }, { taskId: task.id, employeeId: task.employeeId })
  const emp = getEmployee(task.employeeId)
  if (emp) { emp.status = 'Working'; emp.currentWorkload++ }

  const result = await worker.execute(task)

  const learning: LearningRecord = {
    id: `lr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    taskId: task.id,
    employeeId: task.employeeId,
    expectedOutcome: task.expectedOutcome ?? '—',
    actualOutcome: result.success ? result.message : `Failed: ${result.error}`,
    revenueGenerated: task.estimatedRevenue ?? 0,
    costIncurred: task.expectedCost ?? 0,
    durationMs: result.durationMs,
    lesson: result.lesson ?? (result.success ? 'Task executed as expected.' : 'Investigate failure.'),
    futureRecommendation: result.success ? `Continue using ${task.toolName}.` : `Review ${task.toolName}.`,
    createdAt: Date.now(),
  }

  // Single batched update
  batchUpdate({
    tasks: state.tasks.map((t) => t.id === task.id ? { ...t, status: (result.success ? 'Completed' : 'Failed') as const, result } : t),
    learning: [learning, ...state.learning].slice(0, 100),
  })

  if (emp) { emp.status = 'Active'; emp.currentWorkload = Math.max(0, emp.currentWorkload - 1) }

  // Twin updates (Zustand — but twin subscriptions are minimal in the dashboard)
  const twinPatch: Record<string, number> = {
    tasksCompletedToday: useTwin.getState().tasksCompletedToday + 1,
    revenueRecoveredToday: useTwin.getState().revenueRecoveredToday + (task.estimatedRevenue ?? 0),
  }
  if (task.autopilotEnabled) twinPatch.autoActionsToday = useTwin.getState().autoActionsToday + 1
  if (task.estimatedRevenue) twinPatch.revenueToday = useTwin.getState().revenueToday + task.estimatedRevenue
  useTwin.setState(twinPatch)

  emit(result.success ? 'TaskCompleted' : 'TaskFailed', { title: task.title, revenue: task.estimatedRevenue, message: result.message }, { taskId: task.id, employeeId: task.employeeId })
  emit('LearningRecorded', { lesson: learning.lesson, message: learning.lesson }, { taskId: task.id, employeeId: task.employeeId })

  return result
}

async function tick() {
  batchUpdate({ lastTick: Date.now(), tickCount: state.tickCount + 1 })
  useTwin.getState().tick()

  // Planner: generate tasks if queue is low
  if (state.tasks.filter((t) => t.status === 'Queued' || t.status === 'Awaiting Approval').length < 4) {
    try {
      const goals = state.goals.filter((g) => g.status !== 'Achieved').slice(0, 1)
      const newMissions = await planner.createMissions(goals)
      for (const mission of newMissions) {
        const tasks = planner.decomposeMission(mission)
        for (const task of tasks) {
          const needsApproval = approvalGate.requiresApproval(task)
          task.status = needsApproval ? 'Awaiting Approval' : 'Queued'
        }
        batchUpdate({
          missions: [mission, ...state.missions],
          tasks: [...state.tasks, ...tasks],
        })
      }
    } catch { /* swallow */ }
  }

  // Execute next queued task
  const executable = state.tasks.find((t) => t.status === 'Queued')
  if (executable) {
    try { await executeTask(executable) } catch { /* swallow */ }
  }
}

export function startOrchestrator() {
  if (intervalId) return
  if (typeof window === 'undefined') return

  if (!bootstrapped) {
    bootstrapped = true
    setTimeout(async () => {
      const { mission, tasks } = createAdHocMission('goal-1', 'Fill empty weekend', 'occupancy')
      for (const task of tasks) {
        const needsApproval = approvalGate.requiresApproval(task)
        task.status = needsApproval ? 'Awaiting Approval' : 'Queued'
      }
      batchUpdate({ missions: [mission, ...state.missions], tasks: [...state.tasks, ...tasks], running: true })
      const firstAuto = tasks.find((t) => !approvalGate.requiresApproval(t))
      if (firstAuto) setTimeout(() => executeTask(firstAuto).catch(() => {}), 1500)
    }, 2000)
  }

  batchUpdate({ running: true })
  intervalId = setInterval(tick, TICK_INTERVAL)
}

export function stopOrchestrator() {
  if (intervalId) { clearInterval(intervalId); intervalId = null }
  batchUpdate({ running: false })
}

export function approveTask(taskId: string) {
  const task = state.tasks.find((t) => t.id === taskId)
  if (!task) return
  emit('ApprovalGranted', { title: task.title }, { taskId })
  batchUpdate({ tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status: 'Approved' as const } : t) })
  setTimeout(() => executeTask({ ...task, status: 'Approved' }).catch(() => {}), 100)
}

export function rejectTask(taskId: string) {
  emit('ApprovalDenied', { title: 'task rejected' }, { taskId })
  batchUpdate({ tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status: 'Rejected' as const } : t) })
}

export function copilotCommand(command: string): { mission: string; tasks: number; message: string } {
  const q = command.toLowerCase()
  let category: 'occupancy' | 'commission' | 'direct' | 'repeat' = 'occupancy'
  let goalId = 'goal-1'
  let title = 'Fill empty weekend'
  if (/commission|ota.*direct|convert.*ota/.test(q)) { category = 'commission'; goalId = 'goal-2'; title = 'Convert OTA guests to direct' }
  else if (/direct|website/.test(q)) { category = 'direct'; goalId = 'goal-3'; title = 'Grow direct bookings' }
  else if (/repeat|lapsed|return/.test(q)) { category = 'repeat'; goalId = 'goal-6'; title = 'Re-engage lapsed guests' }
  const { mission, tasks } = createAdHocMission(goalId, title, category)
  for (const task of tasks) {
    const needsApproval = approvalGate.requiresApproval(task)
    task.status = needsApproval ? 'Awaiting Approval' : 'Queued'
  }
  batchUpdate({ missions: [mission, ...state.missions], tasks: [...state.tasks, ...tasks] })
  emit('MissionCreated', { title: mission.title, via: 'copilot', taskCount: tasks.length, message: `Mission: ${mission.title}` }, { missionId: mission.id, goalId })
  return {
    mission: mission.title,
    tasks: tasks.length,
    message: `Engaged the workforce. Created mission "${mission.title}" with ${tasks.length} tasks. ${tasks.filter((t) => t.status === 'Queued').length} auto-executing, ${tasks.filter((t) => t.status === 'Awaiting Approval').length} need your approval.`,
  }
}

// React binding — useSyncExternalStore with cached snapshot
export { subscribe, getSnapshot }
export { EMPLOYEES, getEmployee }
