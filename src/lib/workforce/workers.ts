// StayPilot V5 — AI Employees (Workers)
// Each employee is a real Worker with a persona, KPIs, memory, skills, tool permissions,
// working hours, confidence, supervisor. They own measurable outcomes.
import type { Employee, Task, TaskResult, Worker } from './types'
import { getTool } from './tools'
import { emit } from './event-bus'
import { memoryStore } from './memory'
import { twinSnapshot } from './digital-twin'

export const EMPLOYEES: Employee[] = [
  {
    id: 'emp-revenue', name: 'Kofi', role: 'Revenue Director',
    responsibilities: ['Own occupancy & RevPAR targets', 'Approve pricing changes', 'Lead weekend-fill missions'],
    kpis: ['Occupancy ≥ 90%', 'RevPAR growth +10% YoY', 'OTA commission < 15%'],
    memoryScope: 'pricing', skills: ['Pricing optimization', 'Demand forecasting', 'Competitor analysis'],
    toolPermissions: ['forecastDemand', 'changePricing', 'publishRates', 'compareCompetitors'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 88, supervisor: 'GM',
    avatar: '💰', color: '#b45309', status: 'Active', tasksCompleted: 142,
  },
  {
    id: 'emp-marketing', name: 'Ama', role: 'Marketing Director',
    responsibilities: ['Generate & run campaigns', 'Grow direct bookings', 'Manage social + email + WhatsApp'],
    kpis: ['Direct bookings ≥ 60%', 'Campaign conversion ≥ 5%', 'Direct share +7pp YoY'],
    memoryScope: 'campaign', skills: ['Campaign generation', 'Audience segmentation', 'Multi-channel orchestration'],
    toolPermissions: ['sendWhatsApp', 'sendEmail', 'launchCampaign', 'createCoupon', 'scheduleInstagram'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 85, supervisor: 'GM',
    avatar: '📣', color: '#be123c', status: 'Active', tasksCompleted: 98,
  },
  {
    id: 'emp-crm', name: 'Yaw', role: 'CRM Director',
    responsibilities: ['Own guest relationships', 'Convert OTA guests to direct', 'Grow repeat bookings'],
    kpis: ['Repeat rate ≥ 50%', 'OTA→direct conversion 30%', 'Guest LTV +15%'],
    memoryScope: 'guest', skills: ['Guest segmentation', 'Loyalty programs', 'Personalization'],
    toolPermissions: ['findGuests', 'updateGuest', 'issueVoucher', 'createSegment', 'sendWhatsApp'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 86, supervisor: 'GM',
    avatar: '🤝', color: '#15803d', status: 'Active', tasksCompleted: 210,
  },
  {
    id: 'emp-guest-success', name: 'Akosua', role: 'Guest Success Manager',
    responsibilities: ['Guest satisfaction', 'Service recovery', 'Loyalty enrollment'],
    kpis: ['Avg rating ≥ 4.5★', 'Complaint resolution < 1hr', 'Loyalty enrollment 80%'],
    memoryScope: 'guest', skills: ['Service recovery', 'Review management', 'Personalization'],
    toolPermissions: ['sendWhatsApp', 'sendEmail', 'issueVoucher', 'updateGuest'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 84, supervisor: 'CRM Director',
    avatar: '🌟', color: '#0d9488', status: 'Active', tasksCompleted: 134,
  },
  {
    id: 'emp-ops', name: 'Adwoa', role: 'Operations Manager',
    responsibilities: ['Housekeeping coordination', 'Maintenance scheduling', 'Room readiness'],
    kpis: ['Turnover time < 30min', 'Maintenance resolution < 24hr', 'Room readiness 100%'],
    memoryScope: 'maintenance', skills: ['Route optimization', 'Preventive maintenance', 'Staff coordination'],
    toolPermissions: ['assignCleaner', 'createMaintenanceTicket', 'changeRoomStatus'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 82, supervisor: 'GM',
    avatar: '⚙️', color: '#c2410c', status: 'Active', tasksCompleted: 188,
  },
  {
    id: 'emp-finance', name: 'Efua', role: 'Finance Director',
    responsibilities: ['Revenue tracking', 'Commission reconciliation', 'Cash flow + treasury'],
    kpis: ['Commission < 15%', 'Cash flow positive', 'Reconciliation 100%'],
    memoryScope: 'finance', skills: ['Financial analysis', 'Commission reconciliation', 'Forecasting'],
    toolPermissions: ['createInvoice', 'refundGuest', 'captureDeposit', 'paySupplier'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 89, supervisor: 'GM',
    avatar: '🏦', color: '#9333ea', status: 'Active', tasksCompleted: 92,
  },
  {
    id: 'emp-pricing', name: 'Abena', role: 'Pricing Analyst',
    responsibilities: ['Daily rate recommendations', 'Competitor monitoring', 'Pace analysis'],
    kpis: ['ADR growth +8%', 'Competitor parity', 'Pricing confidence ≥ 85%'],
    memoryScope: 'pricing', skills: ['Rate optimization', 'Competitor analysis', 'Demand modeling'],
    toolPermissions: ['forecastDemand', 'compareCompetitors', 'changePricing'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 87, supervisor: 'Revenue Director',
    avatar: '📊', color: '#9333ea', status: 'Active', tasksCompleted: 76,
  },
  {
    id: 'emp-ota', name: 'Kwabena', role: 'OTA Specialist',
    responsibilities: ['OTA calendar sync', 'Listing optimization', 'Commission tracking'],
    kpis: ['Sync conflicts = 0', 'OTA visibility top 3', 'Commission < 15%'],
    memoryScope: 'ota', skills: ['Channel management', 'Listing SEO', 'Rate parity'],
    toolPermissions: ['publishRates', 'compareCompetitors'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 90, supervisor: 'Revenue Director',
    avatar: '🔌', color: '#0d9488', status: 'Active', tasksCompleted: 540,
  },
  {
    id: 'emp-housekeeping', name: 'Akua', role: 'Housekeeping Manager',
    responsibilities: ['Cleaning schedules', 'Room turnover', 'Inspections'],
    kpis: ['Turnover < 30min', 'Inspection pass 98%', 'Lost & found logged'],
    memoryScope: 'housekeeping', skills: ['Route optimization', 'Quality control', 'Staff scheduling'],
    toolPermissions: ['assignCleaner', 'changeRoomStatus'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 83, supervisor: 'Operations Manager',
    avatar: '🧹', color: '#15803d', status: 'Active', tasksCompleted: 312,
  },
  {
    id: 'emp-maintenance', name: 'Kojo', role: 'Maintenance Manager',
    responsibilities: ['Issue resolution', 'Preventive maintenance', 'Vendor coordination'],
    kpis: ['Resolution < 24hr', 'Preventive 90%', 'Downtime < 2%'],
    memoryScope: 'maintenance', skills: ['HVAC', 'Plumbing', 'Electrical', 'Predictive maintenance'],
    toolPermissions: ['createMaintenanceTicket', 'changeRoomStatus'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 81, supervisor: 'Operations Manager',
    avatar: '🔧', color: '#a16207', status: 'Active', tasksCompleted: 64,
  },
  {
    id: 'emp-sales', name: 'Kofi Jr.', role: 'Sales Director',
    responsibilities: ['Corporate accounts', 'Group bookings', 'Contract renewals'],
    kpis: ['Corporate revenue +20%', 'Renewal rate 90%', 'New accounts 5/qtr'],
    memoryScope: 'sales', skills: ['B2B sales', 'Contract negotiation', 'Account management'],
    toolPermissions: ['sendEmail', 'sendWhatsApp', 'createInvoice'],
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 80, supervisor: 'GM',
    avatar: '💼', color: '#0e7490', status: 'Active', tasksCompleted: 61,
  },
  {
    id: 'emp-gm', name: 'Nana', role: 'General Manager',
    responsibilities: ['Synthesize daily brief', 'Strategic recommendations', 'Coordinate workforce'],
    kpis: ['Owner time saved 20hr/wk', 'Goal achievement 80%', 'Revenue growth +15%'],
    memoryScope: 'strategy', skills: ['Strategy', 'Synthesis', 'Prioritization'],
    toolPermissions: [], // GM coordinates, doesn't execute tools directly
    workingHours: '24/7 (autonomous)', currentWorkload: 0, confidenceScore: 91, supervisor: 'Owner',
    avatar: '👑', color: '#be123c', status: 'Active', tasksCompleted: 320,
  },
]

export function getEmployee(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id)
}

// Real Worker implementation — executes a task via its tool
class EmployeeWorker implements Worker {
  constructor(public readonly employeeId: string) {}

  async execute(task: Task): Promise<TaskResult> {
    const employee = getEmployee(this.employeeId)!
    const tool = getTool(task.toolName)
    const start = Date.now()

    if (!tool) {
      return { success: false, output: null, durationMs: 0, eventsEmitted: [], error: `Tool ${task.toolName} not found` }
    }
    if (!employee.toolPermissions.includes(task.toolName) && task.toolName !== 'rememberMemory') {
      return { success: false, output: null, durationMs: 0, eventsEmitted: [], error: `${employee.name} lacks permission for ${task.toolName}` }
    }

    // recall relevant memory
    await memoryStore.recall({ employeeId: this.employeeId, scope: employee.memoryScope, limit: 3 })

    // execute the tool
    const result = await tool.execute(task.toolInput)
    const durationMs = Date.now() - start

    // emit tool-executed event
    const evt = emit('ToolExecuted', { toolName: task.toolName, success: result.success, message: result.message }, { employeeId: this.employeeId, taskId: task.id, toolName: task.toolName })

    // record a memory of what happened (for learning)
    if (result.success) {
      await memoryStore.remember({
        employeeId: this.employeeId,
        scope: employee.memoryScope,
        type: 'action',
        content: `${task.title}: ${result.message}`,
        confidence: task.confidence,
      })
    }

    // update employee stats
    employee.tasksCompleted++
    employee.currentWorkload = Math.max(0, employee.currentWorkload - 1)
    employee.lastAction = result.message

    return {
      success: result.success,
      output: result.data,
      revenueGenerated: task.estimatedRevenue,
      costIncurred: task.expectedCost,
      durationMs,
      eventsEmitted: [evt.id],
      lesson: result.success ? undefined : result.message,
      error: result.success ? undefined : result.message,
    }
  }
}

const workerCache: Record<string, EmployeeWorker> = {}
export function getWorker(employeeId: string): Worker {
  if (!workerCache[employeeId]) workerCache[employeeId] = new EmployeeWorker(employeeId)
  return workerCache[employeeId]
}
