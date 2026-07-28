// StayPilot V5 — Orchestrator (the continuous-operation loop)
// This is what makes the workforce REAL and not simulated. It wakes every few seconds,
// generates missions/tasks from goals, runs the execution queue, and records learning.
// Subscribes to the event bus to capture all events into the workforce store.
import type { Task, TaskResult, LearningRecord } from './types'
import { useWorkforce } from './store'
import { useTwin, twinSnapshot } from './digital-twin'
import { planner, createAdHocMission } from './planner'
import { approvalGate } from './approval'
import { getWorker, getEmployee, EMPLOYEES } from './workers'
import { getTool } from './tools'
import { eventBus, emit } from './event-bus'
import { memoryStore } from './memory'

const TICK_INTERVAL = 5000 // 5 seconds — feels live without hammering

let intervalId: ReturnType<typeof setInterval> | null = null
let bootstrapped = false

// V5: Batch events to avoid "Maximum update depth" — Zustand v5 bypasses React batching.
// Collect events in a buffer and flush once per tick (coalesced).
let eventBuffer: WorkforceEvent[] = []
let flushScheduled = false
function scheduleEventFlush() {
  if (flushScheduled) return
  flushScheduled = true
  // Use setTimeout(0) to coalesce all synchronous events into one store update
  setTimeout(() => {
    flushScheduled = false
    if (eventBuffer.length === 0) return
    const batch = eventBuffer
    eventBuffer = []
    useWorkforce.setState((s) => ({ events: [...batch.reverse(), ...s.events].slice(0, 100) }))
  }, 0)
}

// Capture all events into the store (batched)
eventBus.subscribe('*', (event) => {
  eventBuffer.push(event)
  scheduleEventFlush()
})

async function executeTask(task: Task): Promise<TaskResult> {
  const worker = getWorker(task.employeeId)
  // V5: batch the "Executing" status update + event
  useWorkforce.getState().updateTask(task.id, { status: 'Executing', executedAt: Date.now() })
  emit('TaskExecuting', { title: task.title }, { taskId: task.id, employeeId: task.employeeId })
  const emp = getEmployee(task.employeeId)
  if (emp) { emp.status = 'Working'; emp.currentWorkload++ }

  const result = await worker.execute(task)

  // V5: coalesce all post-execution updates into ONE workforce set + ONE twin set
  const learning: LearningRecord = {
    id: `lr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    taskId: task.id,
    employeeId: task.employeeId,
    expectedOutcome: task.expectedOutcome ?? '—',
    actualOutcome: result.success ? (typeof result.output === 'object' && result.output ? (result.output as { message?: string }).message ?? result.message : result.message) : `Failed: ${result.error}`,
    revenueGenerated: task.estimatedRevenue ?? 0,
    costIncurred: result.costIncurred ?? 0,
    durationMs: result.durationMs,
    lesson: result.lesson ?? (result.success ? 'Task executed as expected.' : 'Investigate tool failure.'),
    futureRecommendation: result.success ? `Continue using ${task.toolName} for similar tasks.` : `Review ${task.toolName} inputs before retrying.`,
    createdAt: Date.now(),
  }

  // Single batched workforce update (task status + learning in one set)
  useWorkforce.setState((s) => ({
    tasks: s.tasks.map((t) => t.id === task.id ? { ...t, status: result.success ? 'Completed' : 'Failed', result, executedAt: Date.now() } : t),
    learning: [learning, ...s.learning].slice(0, 100),
  }))

  if (emp) { emp.status = 'Active'; emp.currentWorkload = Math.max(0, emp.currentWorkload - 1) }

  // Single batched twin update (all counters at once)
  const twinPatch: Record<string, number> = {
    tasksCompletedToday: useTwin.getState().tasksCompletedToday + 1,
    revenueRecoveredToday: useTwin.getState().revenueRecoveredToday + (task.estimatedRevenue ?? 0),
  }
  if (task.autopilotEnabled) twinPatch.autoActionsToday = useTwin.getState().autoActionsToday + 1
  if (task.estimatedRevenue) twinPatch.revenueToday = useTwin.getState().revenueToday + task.estimatedRevenue
  useTwin.setState(twinPatch)

  emit(result.success ? 'TaskCompleted' : 'TaskFailed', { title: task.title, revenue: task.estimatedRevenue, duration: result.durationMs, message: result.message }, { taskId: task.id, employeeId: task.employeeId })
  emit('LearningRecorded', { lesson: learning.lesson, message: learning.lesson }, { taskId: task.id, employeeId: task.employeeId })

  return result
}

async function tick() {
  const wf = useWorkforce.getState()
  const twin = twinSnapshot()
  wf.setLastTick(Date.now())
  useTwin.getState().tick()

  // 1. Planner: generate new missions/tasks for at-risk goals (every few ticks)
  if (useWorkforce.getState().tasks.filter((t) => t.status === 'Queued' || t.status === 'Awaiting Approval').length < 4) {
    try {
      const goals = useWorkforce.getState().goals.filter((g) => g.status !== 'Achieved')
      const newMissions = await planner.createMissions(goals.slice(0, 1)) // one goal per tick
      for (const mission of newMissions) {
        // decompose into tasks
        const tasks = planner.decomposeMission(mission)
        useWorkforce.getState().addMission(mission)
        // route through approval gate
        for (const task of tasks) {
          const needsApproval = approvalGate.requiresApproval(task)
          task.status = needsApproval ? 'Awaiting Approval' : 'Queued'
        }
        useWorkforce.getState().addTasks(tasks)
      }
    } catch (e) { /* swallow planning errors */ }
  }

  // 2. Execution queue: run the next executable task (one per tick to feel paced)
  const executable = useWorkforce.getState().tasks.find((t) => t.status === 'Queued')
  if (executable) {
    try { await executeTask(executable) } catch (e) { /* swallow */ }
  }
}

export function startOrchestrator() {
  if (intervalId) return
  if (typeof window === 'undefined') return

  // Bootstrap: create an initial mission so there's immediate activity
  if (!bootstrapped) {
    bootstrapped = true
    setTimeout(async () => {
      // initial ad-hoc mission from the Copilot-style "fill this weekend"
      const { mission, tasks } = createAdHocMission('goal-1', 'Fill empty weekend', 'occupancy')
      useWorkforce.getState().addMission(mission)
      for (const task of tasks) {
        const needsApproval = approvalGate.requiresApproval(task)
        task.status = needsApproval ? 'Awaiting Approval' : 'Queued'
      }
      useWorkforce.getState().addTasks(tasks)
      // mark workforce running
      useWorkforce.getState().setRunning(true)
      // auto-approve a LowRisk task immediately to show live activity
      const firstAuto = tasks.find((t) => !approvalGate.requiresApproval(t))
      if (firstAuto) {
        setTimeout(() => executeTask(firstAuto).catch(() => {}), 1200)
      }
    }, 1500)
  }

  useWorkforce.getState().setRunning(true)
  intervalId = setInterval(tick, TICK_INTERVAL)
}

export function stopOrchestrator() {
  if (intervalId) { clearInterval(intervalId); intervalId = null }
  useWorkforce.getState().setRunning(false)
}

export function isRunning() { return intervalId !== null }

// Manual approve/reject (owner action)
export async function approveTask(taskId: string) {
  const task = useWorkforce.getState().tasks.find((t) => t.id === taskId)
  if (!task) return
  emit('ApprovalGranted', { title: task.title }, { taskId })
  useWorkforce.getState().updateTask(taskId, { status: 'Approved' })
  // execute immediately
  await executeTask({ ...task, status: 'Approved' })
}

export function rejectTask(taskId: string) {
  const task = useWorkforce.getState().tasks.find((t) => t.id === taskId)
  if (!task) return
  emit('ApprovalDenied', { title: task.title }, { taskId })
  useWorkforce.getState().updateTask(taskId, { status: 'Rejected' })
}

// Copilot → creates a real mission via the planner
export function copilotCommand(command: string): { mission: string; tasks: number; message: string } {
  const q = command.toLowerCase()
  let category: 'occupancy' | 'commission' | 'direct' | 'repeat' = 'occupancy'
  let goalId = 'goal-1'
  let title = 'Fill empty weekend'
  if (/commission|ota.*direct|convert.*ota/.test(q)) { category = 'commission'; goalId = 'goal-2'; title = 'Convert OTA guests to direct' }
  else if (/direct|website/.test(q)) { category = 'direct'; goalId = 'goal-3'; title = 'Grow direct bookings' }
  else if (/repeat|lapsed|return/.test(q)) { category = 'repeat'; goalId = 'goal-6'; title = 'Re-engage lapsed guests' }
  const { mission, tasks } = createAdHocMission(goalId, title, category)
  useWorkforce.getState().addMission(mission)
  for (const task of tasks) {
    const needsApproval = approvalGate.requiresApproval(task)
    task.status = needsApproval ? 'Awaiting Approval' : 'Queued'
  }
  useWorkforce.getState().addTasks(tasks)
  emit('MissionCreated', { title: mission.title, via: 'copilot', taskCount: tasks.length }, { missionId: mission.id, goalId })
  return {
    mission: mission.title,
    tasks: tasks.length,
    message: `Engaged the workforce. Created mission "${mission.title}" with ${tasks.length} tasks. ${tasks.filter((t) => t.status === 'Queued').length} auto-executing, ${tasks.filter((t) => t.status === 'Awaiting Approval').length} need your approval.`,
  }
}

export { EMPLOYEES, getEmployee, getTool, memoryStore }
