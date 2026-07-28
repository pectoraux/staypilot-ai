// StayPilot V5 — Workforce Store (the live state the UI observes)
// Holds tasks, missions, events, learning records. The orchestrator mutates it.
// The UI subscribes via Zustand selectors and updates in real-time.
import { create } from 'zustand'
import type { Task, Mission, WorkforceEvent, LearningRecord, Goal, QueueStats } from './types'
import { GOALS } from '@/lib/data-v4'

export interface WorkforceState {
  goals: Goal[]
  missions: Mission[]
  tasks: Task[]
  events: WorkforceEvent[]
  learning: LearningRecord[]
  running: boolean
  lastTick: number

  // actions
  addMission: (m: Mission) => void
  addTasks: (t: Task[]) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  approveTask: (id: string) => void
  rejectTask: (id: string) => void
  addEvent: (e: WorkforceEvent) => void
  addLearning: (l: LearningRecord) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  setRunning: (r: boolean) => void
  setLastTick: (t: number) => void
  queueStats: () => QueueStats
  reset: () => void
}

const seedMissions: Mission[] = [
  { id: 'mis-seed-1', goalId: 'goal-1', title: 'Recover weak weekend occupancy', status: 'Active', progress: 40, expectedRevenue: 12500, leadEmployee: 'emp-revenue', taskIds: [], createdAt: Date.now() - 3600000 },
  { id: 'mis-seed-2', goalId: 'goal-2', title: 'Convert OTA guests to direct', status: 'Active', progress: 42, expectedRevenue: 8700, leadEmployee: 'emp-crm', taskIds: [], createdAt: Date.now() - 7200000 },
]

export const useWorkforce = create<WorkforceState>((set, get) => ({
  goals: GOALS.map((g) => ({ ...g, assignedEmployees: g.assignedAgents })),
  missions: seedMissions,
  tasks: [],
  events: [],
  learning: [],
  running: false,
  lastTick: Date.now(),

  addMission: (m) => set((s) => ({ missions: [m, ...s.missions] })),
  addTasks: (t) => set((s) => ({ tasks: [...s.tasks, ...t] })),
  updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) })),
  approveTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, status: 'Approved' } : t) })),
  rejectTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, status: 'Rejected' } : t) })),
  addEvent: (e) => set((s) => ({ events: [e, ...s.events].slice(0, 100) })),
  addLearning: (l) => set((s) => ({ learning: [l, ...s.learning].slice(0, 100) })),
  updateGoal: (id, patch) => set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...patch } : g) })),
  setRunning: (r) => set({ running: r }),
  setLastTick: (t) => set({ lastTick: t }),

  queueStats: (): QueueStats => {
    const tasks = get().tasks
    return {
      total: tasks.length,
      awaitingApproval: tasks.filter((t) => t.status === 'Awaiting Approval').length,
      executing: tasks.filter((t) => t.status === 'Executing').length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      rejected: tasks.filter((t) => t.status === 'Rejected').length,
      failed: tasks.filter((t) => t.status === 'Failed').length,
      autoExecuted: tasks.filter((t) => t.status === 'Completed' && t.autopilotEnabled).length,
      manualApproved: tasks.filter((t) => t.status === 'Completed' && !t.autopilotEnabled).length,
    }
  },

  reset: () => set({ tasks: [], events: [], learning: [], missions: seedMissions, goals: GOALS.map((g) => ({ ...g, assignedEmployees: g.assignedAgents })) }),
}))
