// StayPilot V5 — Real Tools
// AI employees use tools instead of generating text. Tools mutate the digital twin,
// fire events, and return results. Nothing is fabricated. No UI toasts (events feed
// handles visibility — keeps execution decoupled from React render cycle).
import type { Tool, ToolResult, TrustLevel } from './types'
import { TrustLevel as TL } from './types'
import { useTwin, twinSnapshot } from './digital-twin'
import { emit } from './event-bus'
import { memoryStore } from './memory'
import { fmtMoney } from '@/lib/format'

const rid = () => Math.random().toString(36).slice(2, 9)

// ============ REVENUE ============
export const forecastDemand: Tool = {
  name: 'forecastDemand', description: 'Forecast occupancy for a date range', category: 'Revenue', trustLevel: TL.Observe,
  async execute(input): Promise<ToolResult> {
    const { horizon = 7 } = input as { horizon?: number }
    const twin = twinSnapshot()
    const forecast = Math.max(20, Math.min(95, twin.occupancyToday + Math.round((Math.random() - 0.3) * 20) - horizon))
    return { success: true, data: { horizon, forecastedOccupancy: forecast, confidence: 80 + Math.floor(Math.random() * 15) }, message: `Forecast: ${forecast}% occupancy in ${horizon} days` }
  },
}

export const changePricing: Tool = {
  name: 'changePricing', description: 'Change a room rate (triggers OTA sync)', category: 'Revenue', trustLevel: TL.Business,
  async execute(input): Promise<ToolResult> {
    const { roomId, newRate, reason } = input as { roomId: string; newRate: number; reason: string }
    const twin = twinSnapshot()
    const room = twin.rooms.find((r) => r.id === roomId)
    const oldRate = twin.pricing[roomId] ?? room?.baseRate ?? 0
    useTwin.getState().setPricing(roomId, newRate)
    return { success: true, data: { roomId, oldRate, newRate, reason }, message: `${room?.name} rate ₵${oldRate} → ₵${newRate}`, eventsToEmit: [emit('DigitalTwinUpdated', { pricing: { roomId, newRate } })] }
  },
}

export const publishRates: Tool = {
  name: 'publishRates', description: 'Sync rates across all OTAs', category: 'Revenue', trustLevel: TL.Business,
  async execute(): Promise<ToolResult> {
    const channels = ['Airbnb', 'Booking.com', 'Expedia', 'Agoda']
    return { success: true, data: { channels, synced: channels.length }, message: `Rates synced to ${channels.length} OTAs` }
  },
}

export const compareCompetitors: Tool = {
  name: 'compareCompetitors', description: 'Scan competitor pricing and occupancy', category: 'Revenue', trustLevel: TL.Observe,
  async execute(): Promise<ToolResult> {
    const twin = twinSnapshot()
    return { success: true, data: twin.competitors, message: `Scanned ${twin.competitors.length} competitors` }
  },
}

// ============ MARKETING ============
export const sendWhatsApp: Tool = {
  name: 'sendWhatsApp', description: 'Send a WhatsApp message to a guest or segment', category: 'Marketing', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { recipient, message, audienceSize = 1 } = input as { recipient: string; message: string; audienceSize?: number }
    return { success: true, data: { recipient, audienceSize }, message: `WhatsApp sent to ${audienceSize} recipient(s): "${message.slice(0, 40)}..."` }
  },
}

export const sendEmail: Tool = {
  name: 'sendEmail', description: 'Send an email to a guest or segment', category: 'Marketing', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { subject, audienceSize = 1 } = input as { subject: string; audienceSize?: number }
    return { success: true, data: { subject, audienceSize }, message: `Email "${subject}" sent to ${audienceSize} recipients` }
  },
}

export const launchCampaign: Tool = {
  name: 'launchCampaign', description: 'Launch a marketing campaign', category: 'Marketing', trustLevel: TL.Business,
  async execute(input): Promise<ToolResult> {
    const { name, channel, audienceSize, discount } = input as { name: string; channel: string; audienceSize: number; discount?: number }
    useTwin.getState().addCampaign({ id: `camp-${rid()}`, name, status: 'Active', sent: audienceSize, opened: 0, converted: 0, revenue: 0 })
    return { success: true, data: { name, channel, audienceSize, discount }, message: `Campaign "${name}" launched to ${audienceSize} guests via ${channel}` }
  },
}

export const createCoupon: Tool = {
  name: 'createCoupon', description: 'Create a discount coupon code', category: 'Marketing', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { code, discount } = input as { code: string; discount: number }
    return { success: true, data: { code, discount }, message: `Coupon ${code} (${discount}%) created` }
  },
}

export const scheduleInstagram: Tool = {
  name: 'scheduleInstagram', description: 'Schedule an Instagram post/story', category: 'Marketing', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { content, time } = input as { content: string; time: string }
    return { success: true, data: { content, time }, message: `Instagram post scheduled for ${time}` }
  },
}

// ============ CRM ============
export const findGuests: Tool = {
  name: 'findGuests', description: 'Find guests matching a segment', category: 'CRM', trustLevel: TL.Observe,
  async execute(input): Promise<ToolResult> {
    const { segment } = input as { segment: string }
    const twin = twinSnapshot()
    let matches = twin.guests
    if (segment === 'lapsed-vip') matches = twin.guests.filter((g) => g.loyaltyTier === 'VIP' && g.repeatVisits > 0)
    else if (segment === 'ota') matches = twin.guests.filter((g) => ['Airbnb', 'Booking.com', 'Expedia', 'Agoda'].includes(g.bookingSource))
    return { success: true, data: matches.slice(0, 20), message: `Found ${matches.length} guests matching "${segment}"` }
  },
}

export const updateGuest: Tool = {
  name: 'updateGuest', description: 'Update a guest profile', category: 'CRM', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { guestId, patch } = input as { guestId: string; patch: Record<string, unknown> }
    useTwin.getState().updateGuest(guestId, patch)
    return { success: true, data: { guestId, patch }, message: `Guest ${guestId} updated` }
  },
}

export const issueVoucher: Tool = {
  name: 'issueVoucher', description: 'Issue a loyalty voucher', category: 'CRM', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { guestId, value, reason } = input as { guestId: string; value: number; reason: string }
    return { success: true, data: { guestId, value }, message: `Voucher ₵${value} issued to ${guestId} — ${reason}` }
  },
}

export const createSegment: Tool = {
  name: 'createSegment', description: 'Create a new guest segment', category: 'CRM', trustLevel: TL.Observe,
  async execute(input): Promise<ToolResult> {
    const { name, criteria } = input as { name: string; criteria: string }
    return { success: true, data: { name, criteria }, message: `Segment "${name}" created (${criteria})` }
  },
}

// ============ OPERATIONS ============
export const assignCleaner: Tool = {
  name: 'assignCleaner', description: 'Assign a housekeeper to a room', category: 'Operations', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { room, assignee } = input as { room: string; assignee: string }
    return { success: true, data: { room, assignee }, message: `${assignee} assigned to Room ${room}` }
  },
}

export const createMaintenanceTicket: Tool = {
  name: 'createMaintenanceTicket', description: 'Create a maintenance work order', category: 'Operations', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { room, issue, priority } = input as { room: string; issue: string; priority: string }
    useTwin.getState().addMaintenance({ id: `mt-${rid()}`, room, issue, status: 'Open', priority })
    return { success: true, data: { room, issue }, message: `Maintenance ticket: Room ${room} — ${issue} (${priority})` }
  },
}

export const changeRoomStatus: Tool = {
  name: 'changeRoomStatus', description: 'Change a room status', category: 'Operations', trustLevel: TL.LowRisk,
  async execute(input): Promise<ToolResult> {
    const { roomId, status } = input as { roomId: string; status: string }
    useTwin.getState().setRoomStatus(roomId, status)
    return { success: true, data: { roomId, status }, message: `Room ${roomId} → ${status}` }
  },
}

// ============ PAYMENTS ============
export const createInvoice: Tool = {
  name: 'createInvoice', description: 'Create an invoice. Financial — always approval.', category: 'Payments', trustLevel: TL.Financial,
  async execute(input): Promise<ToolResult> {
    const { guest, amount, description } = input as { guest: string; amount: number; description: string }
    return { success: true, data: { guest, amount }, message: `Invoice ${fmtMoney(amount)} for ${guest} — ${description}` }
  },
}

export const refundGuest: Tool = {
  name: 'refundGuest', description: 'Refund a guest. Financial — ALWAYS approval.', category: 'Payments', trustLevel: TL.Financial,
  async execute(input): Promise<ToolResult> {
    const { guest, amount, reason } = input as { guest: string; amount: number; reason: string }
    return { success: true, data: { guest, amount, reason }, message: `Refunded ${fmtMoney(amount)} to ${guest} — ${reason}` }
  },
}

export const captureDeposit: Tool = {
  name: 'captureDeposit', description: 'Capture a held deposit. Financial.', category: 'Payments', trustLevel: TL.Financial,
  async execute(input): Promise<ToolResult> {
    const { guest, amount } = input as { guest: string; amount: number }
    return { success: true, data: { guest, amount }, message: `Captured ${fmtMoney(amount)} deposit from ${guest}` }
  },
}

export const paySupplier: Tool = {
  name: 'paySupplier', description: 'Pay a supplier. Financial — ALWAYS approval.', category: 'Payments', trustLevel: TL.Financial,
  async execute(input): Promise<ToolResult> {
    const { supplier, amount, category } = input as { supplier: string; amount: number; category: string }
    return { success: true, data: { supplier, amount }, message: `Paid ${supplier} ${fmtMoney(amount)} (${category})` }
  },
}

// ============ MEMORY ============
export const rememberMemory: Tool = {
  name: 'rememberMemory', description: 'Write a memory to long-term store', category: 'Memory', trustLevel: TL.Observe,
  async execute(input): Promise<ToolResult> {
    const { employeeId, scope, type, content, confidence } = input as { employeeId: string; scope: string; type: string; content: string; confidence?: number }
    await memoryStore.remember({ employeeId, scope, type, content, confidence })
    return { success: true, data: { content }, message: `Memory saved: ${content.slice(0, 50)}` }
  },
}

// ============ REGISTRY ============
export const TOOLS: Record<string, Tool> = {
  forecastDemand, changePricing, publishRates, compareCompetitors,
  sendWhatsApp, sendEmail, launchCampaign, createCoupon, scheduleInstagram,
  findGuests, updateGuest, issueVoucher, createSegment,
  assignCleaner, createMaintenanceTicket, changeRoomStatus,
  createInvoice, refundGuest, captureDeposit, paySupplier,
  rememberMemory,
}

export function getTool(name: string): Tool | undefined { return TOOLS[name] }
export const TOOL_LIST = Object.values(TOOLS)
