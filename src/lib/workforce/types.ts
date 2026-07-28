// StayPilot V5 — Autonomous AI Workforce Architecture
// Core interfaces. Everything else is a plugin on top of these.
// The engine is REAL: it runs continuously, executes through tools,
// respects approvals, persists memory, and records learning.

// ============ CORE INTERFACES (the contract) ============

export interface Planner {
  createMissions(goals: Goal[]): Promise<Mission[]>
  decomposeMission(mission: Mission): Task[]
}

export interface Worker {
  readonly employeeId: string
  execute(task: Task): Promise<TaskResult>
}

export interface Tool {
  name: string
  description: string
  category: string
  trustLevel: TrustLevel
  execute(input: Record<string, unknown>): Promise<ToolResult>
}

export interface ApprovalGate {
  requiresApproval(task: Task): boolean
  getTrustLevel(task: Task): TrustLevel
}

export interface MemoryStore {
  remember(event: MemoryEvent): Promise<void>
  recall(query: MemoryQuery): Promise<Memory[]>
}

// ============ TRUST LEVELS ============

export enum TrustLevel {
  Observe = 0,    // observe only, no action
  Recommend = 1,  // recommendation, approval required
  LowRisk = 2,    // low-risk automation, optional approval (WhatsApp reminders, CRM updates, social scheduling)
  Business = 3,   // business decisions (pricing, promotions, OTA updates) — approval until autopilot
  Financial = 4,  // refunds, payments, supplier transfers — ALWAYS approval
}

// ============ DOMAIN TYPES ============

export interface Goal {
  id: string
  title: string
  category: GoalCategory
  target: number
  current: number
  unit: string
  baseline: number
  deadline: string
  progress: number
  status: 'On Track' | 'At Risk' | 'Behind' | 'Achieved'
  assignedEmployees: string[]
  autoExecuting: boolean
  northStar: string
}

export type GoalCategory = 'occupancy' | 'direct' | 'revenue' | 'satisfaction' | 'repeat' | 'spend' | 'commission' | 'rating'

export type MissionStatus = 'Active' | 'Proposed' | 'Completed' | 'Paused' | 'Awaiting Approval'

export interface Mission {
  id: string
  goalId: string
  title: string
  status: MissionStatus
  progress: number
  expectedRevenue: number
  leadEmployee: string
  taskIds: string[]
  createdAt: number
}

export type TaskStatus = 'Queued' | 'Approved' | 'Executing' | 'Completed' | 'Rejected' | 'Failed' | 'Awaiting Approval'

export interface Task {
  id: string
  missionId?: string
  goalId?: string
  title: string
  description: string
  employeeId: string
  toolName: string
  toolInput: Record<string, unknown>
  priority: TaskPriority
  trustLevel: TrustLevel
  status: TaskStatus
  estimatedRevenue: number
  expectedCost: number
  confidence: number
  dependencies: string[]
  deadline?: number
  ownerApprovalRequired: boolean
  autopilotEnabled: boolean
  createdAt: number
  executedAt?: number
  result?: TaskResult
  expectedOutcome?: string
}

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low'

export interface TaskResult {
  success: boolean
  output: unknown
  revenueGenerated?: number
  costIncurred?: number
  durationMs: number
  eventsEmitted: string[]
  lesson?: string
  error?: string
}

export interface ToolResult {
  success: boolean
  data?: unknown
  message: string
  eventsToEmit?: WorkforceEvent[]
}

// ============ EMPLOYEE ============

export interface Employee {
  id: string
  name: string
  role: string
  responsibilities: string[]
  kpis: string[]
  memoryScope: string
  skills: string[]
  toolPermissions: string[]
  workingHours: string
  currentWorkload: number
  confidenceScore: number
  supervisor: string
  avatar: string
  color: string
  status: 'Active' | 'Idle' | 'Working' | 'Off Duty'
  tasksCompleted: number
  lastAction?: string
}

// ============ MEMORY ============

export interface MemoryEvent {
  employeeId: string
  scope: string
  type: string
  content: string
  metadata?: Record<string, unknown>
  confidence?: number
}

export interface Memory {
  id: string
  employeeId: string
  scope: string
  type: string
  content: string
  metadata?: Record<string, unknown>
  confidence: number
  createdAt: number
  timesRecalled: number
}

export interface MemoryQuery {
  employeeId?: string
  scope?: string
  type?: string
  search?: string
  limit?: number
}

// ============ EVENTS ============

export type WorkforceEventType =
  | 'TaskCreated' | 'TaskApproved' | 'TaskExecuting' | 'TaskCompleted' | 'TaskRejected' | 'TaskFailed'
  | 'MissionCreated' | 'MissionCompleted'
  | 'ToolExecuted'
  | 'MemoryWritten' | 'MemoryRecalled'
  | 'GoalUpdated'
  | 'ApprovalRequested' | 'ApprovalGranted' | 'ApprovalDenied'
  | 'LearningRecorded'
  | 'EmployeeStatusChanged'
  | 'DigitalTwinUpdated'

export interface WorkforceEvent {
  id: string
  type: WorkforceEventType
  timestamp: number
  employeeId?: string
  taskId?: string
  missionId?: string
  goalId?: string
  toolName?: string
  payload: Record<string, unknown>
}

// ============ LEARNING ============

export interface LearningRecord {
  id: string
  taskId: string
  employeeId: string
  expectedOutcome: string
  actualOutcome: string
  revenueGenerated: number
  costIncurred: number
  durationMs: number
  customerSatisfaction?: number
  lesson: string
  futureRecommendation: string
  createdAt: number
}

// ============ EXECUTION QUEUE STATS ============

export interface QueueStats {
  total: number
  awaitingApproval: number
  executing: number
  completed: number
  rejected: number
  failed: number
  autoExecuted: number
  manualApproved: number
}
