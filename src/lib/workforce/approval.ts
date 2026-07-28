// StayPilot V5 — Approval Gate
// Every action has a trust level. Level 4 (financial) ALWAYS requires approval.
import type { ApprovalGate, Task, TrustLevel } from './types'
import { TrustLevel as TL } from './types'

class ApprovalGateImpl implements ApprovalGate {
  // Autopilot setting per category — owner can enable autopilot for Business (L3) decisions
  private autopilot: Record<string, boolean> = {
    occupancy: false,
    direct: false,
    revenue: false,
    pricing: false,
    marketing: true, // marketing is lower-risk, autopilot on by default
    reputation: true,
  }

  setAutopilot(category: string, enabled: boolean) {
    this.autopilot[category] = enabled
  }

  isAutopilot(category: string): boolean {
    return this.autopilot[category] ?? false
  }

  getTrustLevel(task: Task): TrustLevel {
    return task.trustLevel
  }

  requiresApproval(task: Task): boolean {
    // Level 4 (Financial): ALWAYS approval, no exceptions
    if (task.trustLevel === TL.Financial) return true
    // Level 0 (Observe): no action at all — shouldn't execute
    if (task.trustLevel === TL.Observe) return true
    // Level 1 (Recommend): always approval
    if (task.trustLevel === TL.Recommend) return true
    // Level 2 (LowRisk): auto-executes, no approval
    if (task.trustLevel === TL.LowRisk) return false
    // Level 3 (Business): approval unless autopilot enabled for this category
    if (task.trustLevel === TL.Business) {
      // derive category from tool or mission
      const category = (task.toolInput?.category as string) ?? 'business'
      return !this.isAutopilot(category)
    }
    return true
  }
}

export const approvalGate: ApprovalGate & {
  setAutopilot(c: string, e: boolean): void
  isAutopilot(c: string): boolean
} = new ApprovalGateImpl()

export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  [TL.Observe]: 'Observe',
  [TL.Recommend]: 'Recommend',
  [TL.LowRisk]: 'Low-risk auto',
  [TL.Business]: 'Business decision',
  [TL.Financial]: 'Financial — always approval',
}

export const TRUST_LEVEL_COLORS: Record<TrustLevel, string> = {
  [TL.Observe]: 'bg-slate-500/15 text-slate-500',
  [TL.Recommend]: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  [TL.LowRisk]: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  [TL.Business]: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  [TL.Financial]: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}
