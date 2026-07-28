// StayPilot V5 — Planner
// Receives business goals, decomposes them into missions, then into tasks
// assigned to the right employee with the right tool. Rule-based + deterministic
// for reliability, with realistic mission/task templates per goal category.
import type { Planner as PlannerInterface, Goal, Mission, Task, GoalCategory, TrustLevel, TaskPriority } from './types'
import { TrustLevel as TL } from './types'
import { emit } from './event-bus'
import { twinSnapshot } from './digital-twin'
import { EMPLOYEES } from './workers'

const rid = () => `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

interface MissionTemplate {
  title: string
  leadEmployee: string
  tasks: Array<{
    title: string
    description: string
    employeeId: string
    toolName: string
    toolInput: Record<string, unknown>
    priority: TaskPriority
    trustLevel: TrustLevel
    estimatedRevenue: number
    expectedCost: number
    confidence: number
    expectedOutcome: string
  }>
}

const MISSION_TEMPLATES: Record<GoalCategory, MissionTemplate[]> = {
  occupancy: [
    {
      title: 'Recover weak weekend occupancy',
      leadEmployee: 'emp-revenue',
      tasks: [
        { title: 'Forecast weekend demand', description: 'Run demand forecast for the next 7-14 days', employeeId: 'emp-pricing', toolName: 'forecastDemand', toolInput: { horizon: 7 }, priority: 'High', trustLevel: TL.Observe, estimatedRevenue: 0, expectedCost: 0, confidence: 88, expectedOutcome: 'Identify the occupancy gap' },
        { title: 'Reduce weekend rates 7%', description: 'Cut OTA rates 7% for Fri-Sun to stimulate demand', employeeId: 'emp-pricing', toolName: 'changePricing', toolInput: { roomId: 'room-101', newRate: 418, reason: 'Weekend demand stimulus' }, priority: 'High', trustLevel: TL.Business, estimatedRevenue: 4200, expectedCost: 200, confidence: 82, expectedOutcome: '+4 bookings' },
        { title: 'Publish rates to OTAs', description: 'Sync the new rates across all connected OTAs', employeeId: 'emp-ota', toolName: 'publishRates', toolInput: {}, priority: 'High', trustLevel: TL.Business, estimatedRevenue: 0, expectedCost: 0, confidence: 95, expectedOutcome: '0 conflicts' },
        { title: 'Launch weekend flash sale', description: 'WhatsApp flash sale to 48 lapsed guests (20% off)', employeeId: 'emp-marketing', toolName: 'launchCampaign', toolInput: { name: 'Weekend Flash Sale', channel: 'WhatsApp', audienceSize: 48, discount: 20 }, priority: 'High', trustLevel: TL.Business, estimatedRevenue: 7400, expectedCost: 0, confidence: 78, expectedOutcome: '+6 bookings' },
        { title: 'Contact lapsed VIPs', description: 'Personal WhatsApp to 12 lapsed VIP guests', employeeId: 'emp-crm', toolName: 'sendWhatsApp', toolInput: { recipient: '12 VIP guests', message: 'Akwaaba! We miss you. 25% off this weekend + late checkout.', audienceSize: 12 }, priority: 'Medium', trustLevel: TL.LowRisk, estimatedRevenue: 3600, expectedCost: 0, confidence: 71, expectedOutcome: '+3 bookings' },
      ],
    },
    {
      title: 'Maximize conference-week demand',
      leadEmployee: 'emp-revenue',
      tasks: [
        { title: 'Scan competitor occupancy', description: 'Check if competitors are sold out for conference week', employeeId: 'emp-pricing', toolName: 'compareCompetitors', toolInput: {}, priority: 'Medium', trustLevel: TL.Observe, estimatedRevenue: 0, expectedCost: 0, confidence: 92, expectedOutcome: 'Competitor status' },
        { title: 'Raise rates for conference week', description: '+31% ADR premium for AICC conference week', employeeId: 'emp-revenue', toolName: 'changePricing', toolInput: { roomId: 'room-301', newRate: 1768, reason: 'AICC conference demand spike' }, priority: 'High', trustLevel: TL.Business, estimatedRevenue: 9600, expectedCost: 0, confidence: 88, expectedOutcome: '+₵9,600' },
      ],
    },
  ],
  commission: [
    {
      title: 'Convert OTA guests to direct',
      leadEmployee: 'emp-crm',
      tasks: [
        { title: 'Find OTA guests eligible for conversion', description: 'Identify OTA guests with high direct-conversion probability', employeeId: 'emp-crm', toolName: 'findGuests', toolInput: { segment: 'ota' }, priority: 'High', trustLevel: TL.Observe, estimatedRevenue: 0, expectedCost: 0, confidence: 90, expectedOutcome: '42 guests identified' },
        { title: 'Issue direct-booking coupons', description: 'Issue DIRECT15 coupons to 18 OTA guests', employeeId: 'emp-crm', toolName: 'issueVoucher', toolInput: { guestId: '18 OTA guests', value: 15, reason: 'Direct booking incentive' }, priority: 'Medium', trustLevel: TL.LowRisk, estimatedRevenue: 0, expectedCost: 0, confidence: 74, expectedOutcome: '6 will convert' },
        { title: 'Send loyalty invites', description: 'WhatsApp loyalty invite + welcome-back offer', employeeId: 'emp-guest-success', toolName: 'sendWhatsApp', toolInput: { recipient: '18 OTA guests', message: 'Join our loyalty program — 15% off your next direct booking + free upgrade.', audienceSize: 18 }, priority: 'Medium', trustLevel: TL.LowRisk, estimatedRevenue: 8700, expectedCost: 0, confidence: 68, expectedOutcome: 'Save ₵8,700 commission' },
      ],
    },
  ],
  direct: [
    {
      title: 'Grow direct bookings via website + WhatsApp',
      leadEmployee: 'emp-marketing',
      tasks: [
        { title: 'Schedule Instagram story for direct booking', description: 'Promote direct booking with 15% off via Instagram', employeeId: 'emp-marketing', toolName: 'scheduleInstagram', toolInput: { content: 'Book direct & save 15% — Akwaaba Boutique Lodge', time: '5:00 PM today' }, priority: 'Medium', trustLevel: TL.LowRisk, estimatedRevenue: 1800, expectedCost: 0, confidence: 72, expectedOutcome: '+2 direct bookings' },
        { title: 'Create DIRECT15 coupon', description: 'Fresh coupon code for direct booking campaign', employeeId: 'emp-marketing', toolName: 'createCoupon', toolInput: { code: 'DIRECT15', discount: 15 }, priority: 'Low', trustLevel: TL.LowRisk, estimatedRevenue: 0, expectedCost: 0, confidence: 95, expectedOutcome: 'Coupon live' },
      ],
    },
  ],
  repeat: [
    {
      title: 'Re-engage lapsed high-value guests',
      leadEmployee: 'emp-crm',
      tasks: [
        { title: 'Find lapsed VIP guests', description: 'VIP/Gold guests who haven\'t booked in 90+ days', employeeId: 'emp-crm', toolName: 'findGuests', toolInput: { segment: 'lapsed-vip' }, priority: 'High', trustLevel: TL.Observe, estimatedRevenue: 0, expectedCost: 0, confidence: 88, expectedOutcome: '18 lapsed VIPs' },
        { title: 'Send loyalty reboot campaign', description: '25% off + late checkout to 18 lapsed VIPs', employeeId: 'emp-marketing', toolName: 'launchCampaign', toolInput: { name: 'Loyalty Reboot', channel: 'WhatsApp', audienceSize: 18, discount: 25 }, priority: 'High', trustLevel: TL.Business, estimatedRevenue: 9600, expectedCost: 0, confidence: 76, expectedOutcome: '+5 repeat bookings' },
      ],
    },
  ],
  spend: [
    {
      title: 'Upsell experiences to upcoming arrivals',
      leadEmployee: 'emp-guest-success',
      tasks: [
        { title: 'Send experience offers to 9 arrivals', description: 'Offer Cape Coast tour + airport pickup to upcoming check-ins', employeeId: 'emp-guest-success', toolName: 'sendWhatsApp', toolInput: { recipient: '9 upcoming arrivals', message: 'Enhance your stay: Cape Coast Castle day tour (₵450) + airport pickup (₵180).', audienceSize: 9 }, priority: 'Medium', trustLevel: TL.LowRisk, estimatedRevenue: 2670, expectedCost: 0, confidence: 74, expectedOutcome: '+₵2,670 ancillary' },
      ],
    },
  ],
  rating: [
    {
      title: 'Recover dropped rating via service recovery',
      leadEmployee: 'emp-guest-success',
      tasks: [
        { title: 'Send service-recovery voucher', description: 'Apology + free-night voucher to 2 unhappy guests', employeeId: 'emp-guest-success', toolName: 'issueVoucher', toolInput: { guestId: 'Fatima + Linda', value: 1, reason: 'Service recovery — free night upgrade' }, priority: 'High', trustLevel: TL.LowRisk, estimatedRevenue: 0, expectedCost: 800, confidence: 70, expectedOutcome: 'Rating recovery +0.2★' },
      ],
    },
  ],
  satisfaction: [
    {
      title: 'Proactively engage guests during stay',
      leadEmployee: 'emp-guest-success',
      tasks: [
        { title: 'Mid-stay check-in message', description: 'WhatsApp all in-house guests to check satisfaction', employeeId: 'emp-guest-success', toolName: 'sendWhatsApp', toolInput: { recipient: '8 in-house guests', message: 'Akwaaba! How is your stay so far? Anything we can improve?', audienceSize: 8 }, priority: 'Medium', trustLevel: TL.LowRisk, estimatedRevenue: 0, expectedCost: 0, confidence: 92, expectedOutcome: 'Catch issues early' },
      ],
    },
  ],
  revenue: [
    {
      title: 'Optimize pricing for revenue',
      leadEmployee: 'emp-revenue',
      tasks: [
        { title: 'Raise penthouse rate', description: 'Penthouse 48% below Kempinski — raise to ₵2,600', employeeId: 'emp-revenue', toolName: 'changePricing', toolInput: { roomId: 'room-303', newRate: 2600, reason: 'Underpriced vs Kempinski by 48%' }, priority: 'High', trustLevel: TL.Business, estimatedRevenue: 9600, expectedCost: 0, confidence: 86, expectedOutcome: '+₵9,600' },
      ],
    },
  ],
}

class PlannerImpl implements PlannerInterface {
  async createMissions(goals: Goal[]): Promise<Mission[]> {
    const missions: Mission[] = []
    for (const goal of goals) {
      // Only generate missions for goals that are not Achieved
      if (goal.status === 'Achieved' || goal.progress >= 100) continue
      const templates = MISSION_TEMPLATES[goal.category] ?? []
      // Pick one template that's most relevant (rotate / pick first not already active)
      const template = templates[missions.length % templates.length]
      const missionId = `mis-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const tasks = this.decomposeMission({
        id: missionId, goalId: goal.id, title: template.title, status: 'Active', progress: 0,
        expectedRevenue: template.tasks.reduce((s, t) => s + t.estimatedRevenue, 0),
        leadEmployee: template.leadEmployee, taskIds: [], createdAt: Date.now(),
      })
      const mission: Mission = {
        id: missionId, goalId: goal.id, title: template.title, status: 'Active', progress: 0,
        expectedRevenue: template.tasks.reduce((s, t) => s + t.estimatedRevenue, 0),
        leadEmployee: template.leadEmployee, taskIds: tasks.map((t) => t.id), createdAt: Date.now(),
      }
      missions.push(mission)
      emit('MissionCreated', { title: mission.title, goalId: goal.id, taskCount: tasks.length }, { missionId, goalId: goal.id })
    }
    return missions
  }

  decomposeMission(mission: Mission): Task[] {
    const templates = this.findTemplates(mission)
    return templates.map((t) => ({
      id: rid(),
      missionId: mission.id,
      goalId: mission.goalId,
      title: t.title,
      description: t.description,
      employeeId: t.employeeId,
      toolName: t.toolName,
      toolInput: t.toolInput,
      priority: t.priority,
      trustLevel: t.trustLevel,
      status: 'Queued',
      estimatedRevenue: t.estimatedRevenue,
      expectedCost: t.expectedCost,
      confidence: t.confidence,
      dependencies: [],
      ownerApprovalRequired: t.trustLevel === TL.Financial || t.trustLevel === TL.Business,
      autopilotEnabled: t.trustLevel === TL.LowRisk,
      createdAt: Date.now(),
      expectedOutcome: t.expectedOutcome,
    }))
  }

  private findTemplates(mission: Mission): MissionTemplate['tasks'] {
    for (const cat of Object.keys(MISSION_TEMPLATES) as GoalCategory[]) {
      const found = MISSION_TEMPLATES[cat].find((m) => mission.title.includes(m.title.split(' ').slice(0, 2).join(' ')))
      if (found) return found.tasks
    }
    return MISSION_TEMPLATES.occupancy[0].tasks
  }
}

export const planner = new PlannerImpl()

// Also export a helper to create an ad-hoc mission from a Copilot command
export function createAdHocMission(goalId: string, title: string, category: GoalCategory): { mission: Mission; tasks: Task[] } {
  const templates = MISSION_TEMPLATES[category] ?? MISSION_TEMPLATES.occupancy
  const template = templates[0]
  const missionId = `mis-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const tasks: Task[] = template.tasks.map((t) => ({
    id: rid(), missionId, goalId, title: t.title, description: t.description,
    employeeId: t.employeeId, toolName: t.toolName, toolInput: t.toolInput,
    priority: t.priority, trustLevel: t.trustLevel, status: 'Queued',
    estimatedRevenue: t.estimatedRevenue, expectedCost: t.expectedCost, confidence: t.confidence,
    dependencies: [], ownerApprovalRequired: t.trustLevel === TL.Financial || t.trustLevel === TL.Business,
    autopilotEnabled: t.trustLevel === TL.LowRisk, createdAt: Date.now(), expectedOutcome: t.expectedOutcome,
  }))
  const mission: Mission = {
    id: missionId, goalId, title, status: 'Active', progress: 0,
    expectedRevenue: template.tasks.reduce((s, t) => s + t.estimatedRevenue, 0),
    leadEmployee: template.leadEmployee, taskIds: tasks.map((t) => t.id), createdAt: Date.now(),
  }
  return { mission, tasks }
}
