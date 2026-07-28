// StayPilot AI V2 — Autonomous Revenue Operating System data layer.
// Reuses V1 data (RESERVATIONS, GUESTS, etc.) and adds autonomous concepts:
// Missions, Opportunities, AI Memory, Booking Funnel, Intelligent Segmentation,
// Predictive Revenue, AI Experiments, Direct Booking Intel, Knowledge Graph,
// Multi-Property, Marketplace, Workforce Cascade, CEO Daily Brief actions.
import { GUESTS, RESERVATIONS, ROOMS, PROPERTY, AI_AGENTS, REVIEWS, EXPERIENCES, CORPORATE, CHANNELS } from './data'
import type { BookingSource } from './types'

const today = new Date()
const iso = (d: Date) => d.toISOString().slice(0, 10)
const daysFromNow = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d) }

// ===================== MISSIONS =====================
export type MissionStatus = 'Active' | 'On Track' | 'At Risk' | 'Completed' | 'Paused' | 'Awaiting Approval'
export type MissionType = 'occupancy' | 'conversion' | 'retention' | 'pricing' | 'reputation' | 'direct'

export interface MissionAction {
  id: string
  agent: string
  agentRole: string
  description: string
  status: 'done' | 'in-progress' | 'pending' | 'approved' | 'auto'
  timestamp: string
  auto?: boolean
}

export interface Mission {
  id: string
  name: string
  type: MissionType
  status: MissionStatus
  progress: number
  currentMetric: string
  targetMetric: string
  currentValue: number
  targetValue: number
  unit: string
  expectedRevenue: number
  expectedSavings?: number
  estimatedCompletion: string
  deadline: string
  leadAgent: string
  agentChain: { role: string; agent: string; status: 'done' | 'active' | 'pending'; action: string }[]
  actions: MissionAction[]
  autoExecuting: boolean
  northStar: string
}

export const MISSIONS: Mission[] = [
  {
    id: 'mis-1',
    name: 'Fill Empty Weekend',
    type: 'occupancy',
    status: 'Active',
    progress: 40,
    currentMetric: 'Friday occupancy',
    targetMetric: 'Friday occupancy',
    currentValue: 42,
    targetValue: 85,
    unit: '%',
    expectedRevenue: 12500,
    estimatedCompletion: 'Fri 6:00 PM',
    deadline: daysFromNow(3),
    leadAgent: 'agent-1',
    autoExecuting: true,
    northStar: 'Occupancy',
    agentChain: [
      { role: 'Revenue Director', agent: 'Kofi', status: 'done', action: 'Detected 11 empty rooms Friday' },
      { role: 'Pricing Analyst', agent: 'Abena', status: 'done', action: 'Recommended 7% price cut on OTAs' },
      { role: 'Marketing Director', agent: 'Ama', status: 'active', action: 'Launched WhatsApp flash sale to 48 guests' },
      { role: 'CRM Manager', agent: 'Yaw', status: 'pending', action: 'Contacting lapsed VIP guests' },
      { role: 'Guest Relations', agent: 'Akosua', status: 'pending', action: 'Preparing free-breakfast perk' },
      { role: 'Revenue Director', agent: 'Kofi', status: 'pending', action: 'Will report impact Sat 9 AM' },
    ],
    actions: [
      { id: 'a1', agent: 'Abena', agentRole: 'Pricing Analyst', description: 'Reduced Booking.com & Airbnb rates by 7% for Fri-Sun', status: 'auto', timestamp: '2h ago', auto: true },
      { id: 'a2', agent: 'Ama', agentRole: 'Marketing Director', description: 'Sent WhatsApp flash sale to 48 lapsed guests (20% off)', status: 'done', timestamp: '1h ago' },
      { id: 'a3', agent: 'Ama', agentRole: 'Marketing Director', description: 'Published Google Business weekend promotion', status: 'done', timestamp: '50m ago' },
      { id: 'a4', agent: 'Ama', agentRole: 'Marketing Director', description: 'Scheduled Instagram story for 5 PM', status: 'in-progress', timestamp: '15m ago' },
      { id: 'a5', agent: 'Yaw', agentRole: 'CRM Manager', description: 'Contacting 12 lapsed VIP guests personally', status: 'in-progress', timestamp: 'now' },
      { id: 'a6', agent: 'Akosua', agentRole: 'Guest Relations', description: 'Awaiting approval: add free breakfast perk', status: 'pending', timestamp: '—' },
    ],
  },
  {
    id: 'mis-2',
    name: 'Convert OTA Guests to Direct',
    type: 'conversion',
    status: 'On Track',
    progress: 42,
    currentMetric: 'Airbnb/Booking guests contacted',
    targetMetric: 'Moved to direct bookings',
    currentValue: 18,
    targetValue: 50,
    unit: 'guests',
    expectedSavings: 8700,
    expectedRevenue: 31200,
    estimatedCompletion: '14 days',
    deadline: daysFromNow(14),
    leadAgent: 'agent-3',
    autoExecuting: true,
    northStar: 'Direct Booking %',
    agentChain: [
      { role: 'CRM Manager', agent: 'Yaw', status: 'done', action: 'Identified 42 OTA guests eligible for conversion' },
      { role: 'Guest Relations', agent: 'Akosua', status: 'active', action: 'Sending loyalty invites + welcome-back coupons' },
      { role: 'CRM Manager', agent: 'Yaw', status: 'pending', action: 'Tracking coupon redemptions' },
      { role: 'Finance Manager', agent: 'Efua', status: 'pending', action: 'Calculating commission saved' },
    ],
    actions: [
      { id: 'a1', agent: 'Yaw', agentRole: 'CRM Manager', description: 'Identified 42 OTA guests matching conversion profile', status: 'auto', timestamp: '3h ago', auto: true },
      { id: 'a2', agent: 'Akosua', agentRole: 'Guest Relations', description: 'Sent loyalty invites to 18 guests with DIRECT15 coupon', status: 'done', timestamp: '2h ago' },
      { id: 'a3', agent: 'Akosua', agentRole: 'Guest Relations', description: '6 coupons redeemed so far', status: 'in-progress', timestamp: '20m ago' },
      { id: 'a4', agent: 'Efua', agentRole: 'Finance Manager', description: 'Tracking ₵8,700 projected commission savings', status: 'in-progress', timestamp: '10m ago' },
    ],
  },
  {
    id: 'mis-3',
    name: 'Increase Repeat Guests Q4',
    type: 'retention',
    status: 'Active',
    progress: 28,
    currentMetric: 'Repeat guest rate',
    targetMetric: 'Repeat guest rate',
    currentValue: 38,
    targetValue: 50,
    unit: '%',
    expectedRevenue: 24500,
    estimatedCompletion: '90 days',
    deadline: daysFromNow(90),
    leadAgent: 'agent-3',
    autoExecuting: true,
    northStar: 'Repeat Guest %',
    agentChain: [
      { role: 'CRM Manager', agent: 'Yaw', status: 'done', action: 'Segmented 64 guests by repeat potential' },
      { role: 'Marketing Director', agent: 'Ama', status: 'active', action: 'Running "Loyalty Reboot" to 18 VIP/Gold lapsed' },
      { role: 'Guest Relations', agent: 'Akosua', status: 'pending', action: 'Birthday & anniversary rewards queue' },
    ],
    actions: [
      { id: 'a1', agent: 'Yaw', agentRole: 'CRM Manager', description: 'Segmented guests: 18 high-repeat-potential, 12 lapsed VIP', status: 'auto', timestamp: '5h ago', auto: true },
      { id: 'a2', agent: 'Ama', agentRole: 'Marketing Director', description: 'Scheduled Loyalty Reboot WhatsApp campaign (25% off)', status: 'in-progress', timestamp: '1h ago' },
      { id: 'a3', agent: 'Akosua', agentRole: 'Guest Relations', description: 'Queued 4 birthday rewards + 2 anniversary offers', status: 'pending', timestamp: '—' },
    ],
  },
  {
    id: 'mis-4',
    name: 'Recover Dropped Rating',
    type: 'reputation',
    status: 'At Risk',
    progress: 15,
    currentMetric: 'Google rating',
    targetMetric: 'Google rating',
    currentValue: 4.2,
    targetValue: 4.5,
    unit: '★',
    expectedRevenue: 18000,
    estimatedCompletion: '45 days',
    deadline: daysFromNow(45),
    leadAgent: 'agent-6',
    autoExecuting: false,
    northStar: 'Customer Satisfaction',
    agentChain: [
      { role: 'Reputation Manager', agent: 'Akosua', status: 'active', action: 'Drafting replies to 3 unanswered reviews' },
      { role: 'Operations Manager', agent: 'Adwoa', status: 'pending', action: 'Fixing AC noise (room 102) root cause' },
      { role: 'Guest Relations', agent: 'Akosua', status: 'pending', action: 'Service recovery outreach' },
    ],
    actions: [
      { id: 'a1', agent: 'Akosua', agentRole: 'Reputation Manager', description: 'Drafted AI replies for 3 pending reviews', status: 'in-progress', timestamp: '30m ago' },
      { id: 'a2', agent: 'Adwoa', agentRole: 'Operations Manager', description: 'Awaiting approval: expedite room 102 AC repair', status: 'pending', timestamp: '—' },
    ],
  },
  {
    id: 'mis-5',
    name: 'Optimize Penthouse Pricing',
    type: 'pricing',
    status: 'Awaiting Approval',
    progress: 0,
    currentMetric: 'Penthouse nightly rate',
    targetMetric: 'Penthouse nightly rate',
    currentValue: 2200,
    targetValue: 2600,
    unit: '₵',
    expectedRevenue: 9600,
    estimatedCompletion: 'After approval',
    deadline: daysFromNow(2),
    leadAgent: 'agent-4',
    autoExecuting: false,
    northStar: 'RevPAR',
    agentChain: [
      { role: 'Pricing Analyst', agent: 'Abena', status: 'done', action: 'Found penthouse 48% below Kempinski entry suite' },
      { role: 'Revenue Director', agent: 'Kofi', status: 'active', action: 'Recommending ₵2,600 test rate next weekend' },
    ],
    actions: [
      { id: 'a1', agent: 'Abena', agentRole: 'Pricing Analyst', description: 'Competitor scan: penthouse 48% underpriced vs Kempinski', status: 'auto', timestamp: '1h ago', auto: true },
      { id: 'a2', agent: 'Kofi', agentRole: 'Revenue Director', description: 'Proposed ₵2,600 test rate — awaiting owner approval', status: 'pending', timestamp: '—' },
    ],
  },
]

// ===================== OPPORTUNITY FEED =====================
export type OpportunityType = 'repeat-likelihood' | 'anniversary' | 'competitor' | 'abandonment' | 'lapsed-corporate' | 'weather' | 'event' | 'birthday' | 'upsell' | 'referral'

export interface Opportunity {
  id: string
  type: OpportunityType
  title: string
  detail: string
  potentialRevenue: number
  confidence: number
  deadline: string
  action: string
  executed: boolean
  autoExecutable: boolean
  agentId: string
  icon: string
}

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'opp-1', type: 'repeat-likelihood', title: '12 previous guests likely to book next weekend', detail: 'AI matched booking patterns: 12 guests historically book ~7 days before similar weekends. Average spend ₵1,850.', potentialRevenue: 22200, confidence: 87, deadline: daysFromNow(2), action: 'Send targeted WhatsApp offer', executed: false, autoExecutable: true, agentId: 'agent-3', icon: '🔁' },
  { id: 'opp-2', type: 'anniversary', title: '3 families visited exactly one year ago', detail: 'The Boateng, Mensah, and Owusu families all stayed this week last year. Anniversary re-engagement historically converts at 41%.', potentialRevenue: 9300, confidence: 78, deadline: daysFromNow(5), action: 'Send anniversary return offer', executed: false, autoExecutable: true, agentId: 'agent-3', icon: '🎉' },
  { id: 'opp-3', type: 'competitor', title: 'Competitors increased prices by 15%', detail: 'Golden Tulip & Labadi Beach raised weekend rates 12-15% in the last 24h. Your rates are now 22% below market — margin left on the table.', potentialRevenue: 4800, confidence: 92, deadline: daysFromNow(1), action: 'Raise weekend rates 8%', executed: false, autoExecutable: true, agentId: 'agent-1', icon: '📈' },
  { id: 'opp-4', type: 'abandonment', title: '7 guests abandoned booking widget', detail: '7 visitors reached the payment step on your direct site but didn\'t complete. Average cart value ₵1,420.', potentialRevenue: 9940, confidence: 64, deadline: daysFromNow(1), action: 'Send recovery email + 10% coupon', executed: false, autoExecutable: true, agentId: 'agent-2', icon: '🛒' },
  { id: 'opp-5', type: 'lapsed-corporate', title: 'MTN Ghana hasn\'t booked in 6 weeks', detail: 'Your top corporate account (42 bookings, ₵48,300 lifetime) last booked 42 days ago — 3x their usual gap. Contract renewal due in 120 days.', potentialRevenue: 11500, confidence: 81, deadline: daysFromNow(7), action: 'Sales Manager outreach call', executed: false, autoExecutable: false, agentId: 'agent-7', icon: '💼' },
  { id: 'opp-6', type: 'weather', title: 'Rain forecast increases staycation demand', detail: 'AccuWeather predicts heavy rain Fri-Sun across Accra. Staycation demand historically rises 23% on rainy weekends — locals escape to lodges.', potentialRevenue: 7600, confidence: 71, deadline: daysFromNow(2), action: 'Target Accra-based guests with rainy-weekend promo', executed: false, autoExecutable: true, agentId: 'agent-2', icon: '🌧️' },
  { id: 'opp-7', type: 'event', title: 'Conference at AICC next Thursday', detail: 'A 2,000-attendee tech conference at Accra International Conference Center next Thu-Fri. 8 nearby hotels already sold out.', potentialRevenue: 14400, confidence: 88, deadline: daysFromNow(4), action: 'Boost OTA visibility + corporate outreach', executed: false, autoExecutable: true, agentId: 'agent-1', icon: '🎤' },
  { id: 'opp-8', type: 'birthday', title: '4 guests have birthdays this month', detail: 'Sarah, David, Priya, and Marcus all have birthdays in the next 18 days. Birthday offers convert at 38%.', potentialRevenue: 5200, confidence: 69, deadline: daysFromNow(18), action: 'Send birthday reward + free upgrade', executed: false, autoExecutable: true, agentId: 'agent-3', icon: '🎂' },
  { id: 'opp-9', type: 'upsell', title: '9 check-ins eligible for experience upsell', detail: '9 guests checking in this week match the profile for the Cape Coast Castle tour (₵450). Historic uptake 33%.', potentialRevenue: 1336, confidence: 74, deadline: daysFromNow(3), action: 'Offer tour at check-in', executed: false, autoExecutable: true, agentId: 'agent-8', icon: '🗺️' },
  { id: 'opp-10', type: 'referral', title: '3 VIP guests are high-referral-potential', detail: 'Based on review scores (4.8+) and social activity, Akosua, Kwame, and Aisha are likely to refer 2+ friends each if nudged.', potentialRevenue: 16800, confidence: 66, deadline: daysFromNow(30), action: 'Send referral incentive (free night per booking)', executed: false, autoExecutable: false, agentId: 'agent-3', icon: '🤝' },
]

// ===================== AI MEMORY =====================
export interface GuestMemory {
  id: string
  guestId: string
  category: 'preference' | 'behavior' | 'occasion' | 'sensitivity' | 'relationship' | 'history'
  content: string
  auto: boolean
  lastUsed?: string
  timesUsed: number
}

export const GUEST_MEMORIES: GuestMemory[] = [
  { id: 'mem-1', guestId: GUESTS[0].id, category: 'preference', content: 'Always requests Room 101 (ground floor, near reception)', auto: true, lastUsed: '3 days ago', timesUsed: 5 },
  { id: 'mem-2', guestId: GUESTS[0].id, category: 'sensitivity', content: 'Allergic to feathers — needs synthetic pillows', auto: true, lastUsed: '3 days ago', timesUsed: 5 },
  { id: 'mem-3', guestId: GUESTS[1].id, category: 'behavior', content: 'Always books for Easter weekend (3 years running)', auto: true, lastUsed: '90 days ago', timesUsed: 3 },
  { id: 'mem-4', guestId: GUESTS[2].id, category: 'relationship', content: 'Travels with spouse for anniversary every November', auto: true, lastUsed: '120 days ago', timesUsed: 2 },
  { id: 'mem-5', guestId: GUESTS[3].id, category: 'preference', content: 'Prefers late checkout (2 PM) — business meetings run late', auto: true, lastUsed: '12 days ago', timesUsed: 4 },
  { id: 'mem-6', guestId: GUESTS[4].id, category: 'history', content: 'CEO of MTN Ghana — corporate VIP, always gets airport pickup', auto: false, lastUsed: '42 days ago', timesUsed: 8 },
  { id: 'mem-7', guestId: GUESTS[5].id, category: 'occasion', content: 'Birthday is March 14 — has celebrated at the lodge twice', auto: true, lastUsed: '200 days ago', timesUsed: 2 },
  { id: 'mem-8', guestId: GUESTS[6].id, category: 'behavior', content: 'Books spa package 80% of stays — high upsell potential', auto: true, lastUsed: '8 days ago', timesUsed: 6 },
  { id: 'mem-9', guestId: GUESTS[7].id, category: 'sensitivity', content: 'Vegetarian + gluten-free — kitchen pre-notified every stay', auto: true, lastUsed: '20 days ago', timesUsed: 4 },
  { id: 'mem-10', guestId: GUESTS[8].id, category: 'relationship', content: 'Refers 2-3 friends/year — top referrer, deserves VIP treatment', auto: true, lastUsed: '60 days ago', timesUsed: 9 },
]

export function memoriesForGuest(guestId: string): GuestMemory[] {
  return GUEST_MEMORIES.filter(m => m.guestId === guestId)
}

// ===================== BOOKING FUNNEL =====================
export interface FunnelStage {
  id: string
  name: string
  count: number
  conversionRate: number
  dropOff: number
  value: number
  icon: string
}

export const FUNNEL_STAGES: FunnelStage[] = [
  { id: 'f1', name: 'Website Visitors', count: 4820, conversionRate: 100, dropOff: 0, value: 0, icon: '👁️' },
  { id: 'f2', name: 'Booking Widget Opened', count: 1240, conversionRate: 25.7, dropOff: 74.3, value: 0, icon: '🧭' },
  { id: 'f3', name: 'Inquiry / Date Search', count: 680, conversionRate: 14.1, dropOff: 45.2, value: 0, icon: '🔍' },
  { id: 'f4', name: 'WhatsApp Contact', count: 320, conversionRate: 6.6, dropOff: 52.9, value: 0, icon: '💬' },
  { id: 'f5', name: 'Reservation', count: 142, conversionRate: 2.9, dropOff: 55.6, value: 168400, icon: '✅' },
  { id: 'f6', name: 'Check-in', count: 128, conversionRate: 2.7, dropOff: 9.9, value: 168400, icon: '🔑' },
  { id: 'f7', name: 'Repeat Stay', count: 48, conversionRate: 1.0, dropOff: 62.5, value: 89200, icon: '🔁' },
  { id: 'f8', name: 'Referral', count: 18, conversionRate: 0.37, dropOff: 62.5, value: 32400, icon: '🤝' },
]

// ===================== INTELLIGENT SEGMENTATION =====================
export interface Segment {
  id: string
  name: string
  icon: string
  count: number
  lifetimeValue: number
  retentionRate: number
  preferredChannels: string[]
  bestOffer: string
  recommendedCampaign: string
  avgSpend: number
  color: string
}

export const SEGMENTS: Segment[] = [
  { id: 'seg-1', name: 'Business Travelers', icon: '💼', count: 18, lifetimeValue: 18400, retentionRate: 64, preferredChannels: ['Direct Website', 'Corporate', 'Phone'], bestOffer: 'Corporate rate + late checkout', recommendedCampaign: 'Q4 corporate outreach', avgSpend: 1350, color: '#0d9488' },
  { id: 'seg-2', name: 'Digital Nomads', icon: '💻', count: 9, lifetimeValue: 22100, retentionRate: 71, preferredChannels: ['Instagram', 'Airbnb', 'Direct Website'], bestOffer: 'Long-stay discount + fast WiFi', recommendedCampaign: '30-day nomad package', avgSpend: 2100, color: '#9333ea' },
  { id: 'seg-3', name: 'Families', icon: '👨‍👩‍👧', count: 14, lifetimeValue: 14200, retentionRate: 48, preferredChannels: ['Booking.com', 'WhatsApp', 'Referral'], bestOffer: 'Family room + free kids breakfast', recommendedCampaign: 'School holiday promo', avgSpend: 1650, color: '#b45309' },
  { id: 'seg-4', name: 'Remote Workers', icon: '🏡', count: 7, lifetimeValue: 16800, retentionRate: 57, preferredChannels: ['Direct Website', 'Instagram'], bestOffer: 'Workspace + espresso bar access', recommendedCampaign: 'Work-from-lodge weekday', avgSpend: 980, color: '#15803d' },
  { id: 'seg-5', name: 'Couples', icon: '💑', count: 11, lifetimeValue: 12900, retentionRate: 52, preferredChannels: ['Airbnb', 'Instagram', 'Direct Website'], bestOffer: 'Suite upgrade + couples spa', recommendedCampaign: 'Anniversary/romance package', avgSpend: 1180, color: '#be123c' },
  { id: 'seg-6', name: 'Luxury Guests', icon: '✨', count: 6, lifetimeValue: 38600, retentionRate: 83, preferredChannels: ['Direct Website', 'Phone', 'Referral'], bestOffer: 'Penthouse + private chef', recommendedCampaign: 'VIP exclusive events', avgSpend: 3200, color: '#a16207' },
  { id: 'seg-7', name: 'Budget Guests', icon: '💰', count: 13, lifetimeValue: 4100, retentionRate: 22, preferredChannels: ['Booking.com', 'Agoda', 'Walk-in'], bestOffer: 'Standard room + free breakfast', recommendedCampaign: 'Last-minute weekday deal', avgSpend: 480, color: '#6b7280' },
  { id: 'seg-8', name: 'Corporate Clients', icon: '🏢', count: 5, lifetimeValue: 27440, retentionRate: 80, preferredChannels: ['Corporate', 'Phone', 'Email'], bestOffer: 'Negotiated rate + consolidated billing', recommendedCampaign: 'Contract renewal', avgSpend: 1150, color: '#0e7490' },
  { id: 'seg-9', name: 'Conference Guests', icon: '🎤', count: 8, lifetimeValue: 9200, retentionRate: 38, preferredChannels: ['Booking.com', 'Expedia', 'Direct Website'], bestOffer: 'Conference room + AV equipment', recommendedCampaign: 'Event-season push', avgSpend: 1150, color: '#c2410c' },
  { id: 'seg-10', name: 'International Tourists', icon: '🌍', count: 21, lifetimeValue: 15600, retentionRate: 34, preferredChannels: ['Airbnb', 'Booking.com', 'Instagram'], bestOffer: 'Airport pickup + city tour bundle', recommendedCampaign: 'Tourism partnership', avgSpend: 1480, color: '#0d9488' },
  { id: 'seg-11', name: 'Weekend Travelers', icon: '🌴', count: 19, lifetimeValue: 8800, retentionRate: 41, preferredChannels: ['WhatsApp', 'Instagram', 'Direct Website'], bestOffer: 'Weekend flash rate + late checkout', recommendedCampaign: 'Weekend flash sale', avgSpend: 920, color: '#ea580c' },
]

// ===================== PREDICTIVE REVENUE =====================
export interface Prediction {
  id: string
  metric: string
  horizon: string
  predicted: number
  lower: number
  upper: number
  confidence: number
  trend: number
  unit: string
  factors: string[]
}

export const PREDICTIONS: Prediction[] = [
  { id: 'pred-1', metric: 'Revenue next week', horizon: '7 days', predicted: 78400, lower: 68000, upper: 89000, confidence: 84, trend: 8, unit: '₵', factors: ['Current pace', 'Friday gap', 'Competitor pricing', 'Weather forecast'] },
  { id: 'pred-2', metric: 'Revenue next month', horizon: '30 days', predicted: 312000, lower: 268000, upper: 358000, confidence: 79, trend: 12, unit: '₵', factors: ['Seasonality', 'Booked pace', 'Corporate pipeline', 'Event calendar'] },
  { id: 'pred-3', metric: 'Occupancy by room (avg)', horizon: '14 days', predicted: 74, lower: 66, upper: 82, confidence: 88, trend: 4, unit: '%', factors: ['Booking pace', 'Day-of-week mix', 'Cancellation rate'] },
  { id: 'pred-4', metric: 'Expected cancellations', horizon: '14 days', predicted: 6, lower: 3, upper: 9, confidence: 72, trend: -3, unit: 'bookings', factors: ['OTA mix', 'Historical rate', 'Lead time'] },
  { id: 'pred-5', metric: 'Likely repeat bookings', horizon: '30 days', predicted: 11, lower: 7, upper: 15, confidence: 68, trend: 18, unit: 'bookings', factors: ['Loyalty tier mix', 'Campaign pipeline', 'Anniversary dates'] },
  { id: 'pred-6', metric: 'Demand spike (conf. week)', horizon: '6 days', predicted: 23, lower: 15, upper: 31, confidence: 81, trend: 35, unit: '% lift', factors: ['AICC conference', 'Sold-out competitors', 'Corporate outreach'] },
  { id: 'pred-7', metric: 'Staffing needed (housekeeping)', horizon: '7 days', predicted: 4, lower: 3, upper: 5, confidence: 90, trend: 0, unit: 'staff', factors: ['Turnover forecast', 'Check-in density', 'Inspection queue'] },
  { id: 'pred-8', metric: 'Cash flow (net)', horizon: '30 days', predicted: 142000, lower: 118000, upper: 168000, confidence: 83, trend: 9, unit: '₵', factors: ['Revenue forecast', 'Expense schedule', 'OTA payout lag'] },
]

// 30-day revenue forecast series with confidence band
export const REVENUE_FORECAST_SERIES: Array<{ day: number; date: string; actual: number | null; predicted: number; lower: number; upper: number }> = (() => {
  const arr = []
  let base = 9200
  for (let i = -7; i <= 23; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i)
    const weekend = d.getDay() === 5 || d.getDay() === 6 ? 1.35 : 1
    const noise = 1 + (Math.sin(i / 2) * 0.08)
    const predicted = Math.round(base * weekend * noise)
    const lower = Math.round(predicted * 0.86)
    const upper = Math.round(predicted * 1.16)
    arr.push({ day: i, date: iso(d), actual: i < 0 ? Math.round(predicted * (0.92 + Math.random() * 0.16)) : null, predicted, lower, upper })
  }
  return arr
})()

// ===================== AI EXPERIMENTS =====================
export interface ExperimentVariant {
  id: string
  name: string
  description: string
  allocation: number
  bookings: number
  revenue: number
  profit: number
  conversionRate: number
  reviews: number
  avgRating: number
}

export interface Experiment {
  id: string
  name: string
  question: string
  status: 'Running' | 'Scheduled' | 'Completed' | 'Analyzing'
  startDate: string
  endDate: string
  variants: ExperimentVariant[]
  winnerId?: string
  recommendation?: string
  confidence: number
  daysRun: number
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-1',
    name: 'Weekend Offer Type Test',
    question: 'Which weekend incentive drives more bookings: 10% discount, free breakfast, or late checkout?',
    status: 'Running',
    startDate: daysFromNow(-9),
    endDate: daysFromNow(5),
    daysRun: 9,
    confidence: 78,
    variants: [
      { id: 'v1', name: '10% Discount', description: 'Straight 10% off weekend rate', allocation: 34, bookings: 18, revenue: 28800, profit: 18200, conversionRate: 5.2, reviews: 6, avgRating: 4.3 },
      { id: 'v2', name: 'Free Breakfast', description: 'Complimentary breakfast for 2', allocation: 33, bookings: 24, revenue: 31200, profit: 22400, conversionRate: 6.8, reviews: 9, avgRating: 4.7 },
      { id: 'v3', name: 'Late Checkout', description: '2 PM checkout (vs 11 AM)', allocation: 33, bookings: 14, revenue: 18900, profit: 15100, conversionRate: 4.1, reviews: 5, avgRating: 4.5 },
    ],
    recommendation: 'Free Breakfast is winning on bookings (+33%), revenue, AND reviews. Recommend rolling out 100% next weekend.',
  },
  {
    id: 'exp-2',
    name: 'Direct vs OTA Pricing Gap',
    question: 'How much cheaper should direct be vs OTA to maximize direct share without losing total revenue?',
    status: 'Scheduled',
    startDate: daysFromNow(2),
    endDate: daysFromNow(23),
    daysRun: 0,
    confidence: 0,
    variants: [
      { id: 'v1', name: '5% direct discount', description: 'Direct 5% below OTA', allocation: 33, bookings: 0, revenue: 0, profit: 0, conversionRate: 0, reviews: 0, avgRating: 0 },
      { id: 'v2', name: '10% direct discount', description: 'Direct 10% below OTA', allocation: 33, bookings: 0, revenue: 0, profit: 0, conversionRate: 0, reviews: 0, avgRating: 0 },
      { id: 'v3', name: '15% direct discount', description: 'Direct 15% below OTA + free perk', allocation: 34, bookings: 0, revenue: 0, profit: 0, conversionRate: 0, reviews: 0, avgRating: 0 },
    ],
  },
  {
    id: 'exp-3',
    name: 'WhatsApp Send Time',
    question: 'What time of day gets the highest WhatsApp campaign conversion?',
    status: 'Completed',
    startDate: daysFromNow(-30),
    endDate: daysFromNow(-9),
    daysRun: 21,
    confidence: 91,
    variants: [
      { id: 'v1', name: '8 AM', description: 'Morning send', allocation: 33, bookings: 6, revenue: 7800, profit: 6200, conversionRate: 3.1, reviews: 3, avgRating: 4.4 },
      { id: 'v2', name: '1 PM', description: 'Afternoon send', allocation: 33, bookings: 11, revenue: 14600, profit: 11800, conversionRate: 5.8, reviews: 5, avgRating: 4.6 },
      { id: 'v3', name: '7 PM', description: 'Evening send', allocation: 34, bookings: 9, revenue: 11900, profit: 9400, conversionRate: 4.7, reviews: 4, avgRating: 4.5 },
    ],
    winnerId: 'v2',
    recommendation: '1 PM is the winner (5.8% conversion). All WhatsApp campaigns now default to 1 PM.',
  },
]

// ===================== DIRECT BOOKING INTELLIGENCE =====================
export interface OtaConversionRecord {
  guestId: string
  guestName: string
  source: BookingSource
  commissionPaid: number
  lifetimeBookings: number
  returnProbability: number
  potentialLifetimeValue: number
  estimatedFutureSavings: number
  converted: boolean
}

export const OTA_CONVERSION_RECORDS: OtaConversionRecord[] = GUESTS
  .filter(g => ['Airbnb', 'Booking.com', 'Expedia', 'Agoda'].includes(g.bookingSource))
  .slice(0, 16)
  .map((g, i) => {
    const bookings = g.totalStays
    const commission = Math.round(g.lifetimeSpend * 0.15)
    const returnProb = Math.min(95, 40 + g.repeatVisits * 8 + (g.loyaltyTier === 'VIP' ? 15 : g.loyaltyTier === 'Gold' ? 8 : 0))
    const futureLTV = Math.round(g.lifetimeSpend / Math.max(1, bookings) * 4)
    const savings = Math.round(futureLTV * 0.15)
    return {
      guestId: g.id,
      guestName: g.name,
      source: g.bookingSource,
      commissionPaid: commission,
      lifetimeBookings: bookings,
      returnProbability: returnProb,
      potentialLifetimeValue: futureLTV,
      estimatedFutureSavings: savings,
      converted: i < 6,
    }
  })

export const COMMISSION_SAVED_TIMELINE = [
  { month: 'Jul', saved: 4200, cumulative: 4200 },
  { month: 'Aug', saved: 6800, cumulative: 11000 },
  { month: 'Sep', saved: 9100, cumulative: 20100 },
  { month: 'Oct', saved: 12400, cumulative: 32500 },
  { month: 'Nov', saved: 15800, cumulative: 48300 },
  { month: 'Dec', saved: 19200, cumulative: 67500 },
]

// ===================== KNOWLEDGE GRAPH =====================
export interface GraphNode {
  id: string
  label: string
  type: 'guest' | 'company' | 'family' | 'booking' | 'campaign' | 'room' | 'review' | 'experience' | 'referral' | 'staff' | 'property'
  x: number
  y: number
  color: string
  size: number
}

export interface GraphEdge {
  from: string
  to: string
  label: string
  weight: number
}

export const GRAPH_NODES: GraphNode[] = [
  { id: 'p1', label: PROPERTY.name, type: 'property', x: 50, y: 50, color: '#ea580c', size: 32 },
  { id: 'g1', label: 'David Kumar', type: 'guest', x: 22, y: 28, color: '#0d9488', size: 18 },
  { id: 'g2', label: 'Aisha Mensah', type: 'guest', x: 78, y: 30, color: '#0d9488', size: 18 },
  { id: 'g3', label: 'Kwame Boateng', type: 'guest', x: 18, y: 58, color: '#0d9488', size: 16 },
  { id: 'g4', label: 'Fatima Schmidt', type: 'guest', x: 80, y: 64, color: '#0d9488', size: 16 },
  { id: 'c1', label: 'MTN Ghana', type: 'company', x: 50, y: 18, color: '#be123c', size: 20 },
  { id: 'c2', label: 'UNICEF W. Africa', type: 'company', x: 88, y: 50, color: '#be123c', size: 16 },
  { id: 'f1', label: 'Boateng Family', type: 'family', x: 30, y: 78, color: '#9333ea', size: 16 },
  { id: 'f2', label: 'Mensah Family', type: 'family', x: 70, y: 80, color: '#9332ea', size: 16 },
  { id: 'b1', label: 'Booking #1042', type: 'booking', x: 40, y: 42, color: '#b45309', size: 12 },
  { id: 'b2', label: 'Booking #1088', type: 'booking', x: 62, y: 44, color: '#b45309', size: 12 },
  { id: 'cmp1', label: 'Loyalty Reboot', type: 'campaign', x: 12, y: 44, color: '#15803d', size: 14 },
  { id: 'cmp2', label: 'Weekend Flash', type: 'campaign', x: 88, y: 36, color: '#15803d', size: 14 },
  { id: 'r1', label: 'Room 303 Penthouse', type: 'room', x: 50, y: 78, color: '#a16207', size: 14 },
  { id: 'r2', label: 'Room 201 Suite', type: 'room', x: 38, y: 88, color: '#a16207', size: 12 },
  { id: 'rev1', label: '5★ Google Review', type: 'review', x: 60, y: 22, color: '#0e7490', size: 12 },
  { id: 'exp1', label: 'Cape Coast Tour', type: 'experience', x: 22, y: 88, color: '#c2410c', size: 12 },
  { id: 'ref1', label: 'Referral: Ngozi', type: 'referral', x: 88, y: 72, color: '#6b7280', size: 11 },
  { id: 's1', label: 'Akua (Housekeeping)', type: 'staff', x: 12, y: 64, color: '#1f2937', size: 12 },
]

export const GRAPH_EDGES: GraphEdge[] = [
  { from: 'g1', to: 'p1', label: 'stayed at', weight: 5 },
  { from: 'g2', to: 'p1', label: 'stayed at', weight: 4 },
  { from: 'g3', to: 'p1', label: 'stayed at', weight: 3 },
  { from: 'g4', to: 'p1', label: 'stayed at', weight: 3 },
  { from: 'g1', to: 'c1', label: 'CEO of', weight: 5 },
  { from: 'g3', to: 'f1', label: 'head of', weight: 4 },
  { from: 'g2', to: 'f2', label: 'member', weight: 3 },
  { from: 'c1', to: 'p1', label: '42 bookings', weight: 6 },
  { from: 'c2', to: 'p1', label: '19 bookings', weight: 4 },
  { from: 'b1', to: 'g1', label: 'by', weight: 3 },
  { from: 'b2', to: 'g2', label: 'by', weight: 3 },
  { from: 'b1', to: 'r1', label: 'in', weight: 2 },
  { from: 'b2', to: 'r2', label: 'in', weight: 2 },
  { from: 'cmp1', to: 'g1', label: 'targeted', weight: 2 },
  { from: 'cmp2', to: 'g3', label: 'targeted', weight: 2 },
  { from: 'g2', to: 'rev1', label: 'wrote', weight: 3 },
  { from: 'g1', to: 'exp1', label: 'booked', weight: 2 },
  { from: 'g2', to: 'ref1', label: 'referred', weight: 3 },
  { from: 'ref1', to: 'p1', label: 'new guest', weight: 2 },
  { from: 's1', to: 'r2', label: 'cleans', weight: 2 },
]

// ===================== MULTI-PROPERTY =====================
export interface PropertySummary {
  id: string
  name: string
  type: string
  location: string
  rooms: number
  occupancy: number
  revpar: number
  adr: number
  rating: number
  directShare: number
  revenueMTD: number
  status: 'Active' | 'Onboarding' | 'Lead'
  emoji: string
}

export const PROPERTIES: PropertySummary[] = [
  { id: 'prop-1', name: PROPERTY.name, type: 'Guest House', location: 'East Legon, Accra', rooms: 18, occupancy: 72, revpar: 612, adr: 850, rating: 4.4, directShare: 41, revenueMTD: 312000, status: 'Active', emoji: '🏡' },
  { id: 'prop-2', name: 'Coconut Bay Boutique', type: 'Boutique Hotel', location: 'Cape Coast', rooms: 24, occupancy: 68, revpar: 540, adr: 790, rating: 4.5, directShare: 38, revenueMTD: 348000, status: 'Active', emoji: '🏨' },
  { id: 'prop-3', name: 'Volta Lakeside Lodge', type: 'Lodge', location: 'Akosombo', rooms: 12, occupancy: 61, revpar: 480, adr: 720, rating: 4.6, directShare: 52, revenueMTD: 168000, status: 'Active', emoji: '🏞️' },
  { id: 'prop-4', name: 'City Serviced Apartments', type: 'Serviced Apartments', location: 'Osu, Accra', rooms: 30, occupancy: 0, revpar: 0, adr: 0, rating: 0, directShare: 0, revenueMTD: 0, status: 'Onboarding', emoji: '🏢' },
  { id: 'prop-5', name: 'Sahara Desert Camp', type: 'Campground', location: 'Tamale', rooms: 16, occupancy: 0, revpar: 0, adr: 0, rating: 0, directShare: 0, revenueMTD: 0, status: 'Lead', emoji: '⛺' },
]

export const HOSPITALITY_TYPES = [
  { type: 'Guest Houses', icon: '🏡', count: 1, potential: 'High', wedge: true },
  { type: 'Boutique Hotels', icon: '🏨', count: 1, potential: 'High', wedge: false },
  { type: 'Serviced Apartments', icon: '🏢', count: 1, potential: 'High', wedge: false },
  { type: 'Vacation Rentals', icon: '🏠', count: 0, potential: 'High', wedge: false },
  { type: 'Lodges', icon: '🏞️', count: 1, potential: 'Medium', wedge: false },
  { type: 'Hostels', icon: '🛏️', count: 0, potential: 'Medium', wedge: false },
  { type: 'Resorts', icon: '🏝️', count: 0, potential: 'High', wedge: false },
  { type: 'Campgrounds', icon: '⛺', count: 0, potential: 'Medium', wedge: false },
  { type: 'Corporate Housing', icon: '🏬', count: 0, potential: 'Medium', wedge: false },
  { type: 'Student Accommodation', icon: '🎓', count: 0, potential: 'Low', wedge: false },
]

// ===================== MARKETPLACE =====================
export interface MarketplaceService {
  id: string
  name: string
  category: string
  provider: string
  rating: number
  reviews: number
  price: string
  installed: boolean
  description: string
  emoji: string
  color: string
}

export const MARKETPLACE: MarketplaceService[] = [
  { id: 'mkt-1', name: 'SparkleClean Pro', category: 'Cleaning Services', provider: 'SparkleClean Ltd', rating: 4.8, reviews: 320, price: '₵80/turnover', installed: true, description: 'On-demand deep cleaning & turnover teams with photo proof.', emoji: '🧹', color: '#0d9488' },
  { id: 'mkt-2', name: 'Wash & Fold Express', category: 'Laundry', provider: 'FreshLine', rating: 4.6, reviews: 180, price: '₵15/kg', installed: true, description: 'Same-day laundry pickup & delivery for guest linens and clothing.', emoji: '👕', color: '#9333ea' },
  { id: 'mkt-3', name: 'AkwaabaTransfers', category: 'Airport Transfers', provider: 'RideGH', rating: 4.9, reviews: 540, price: '₵180/trip', installed: true, description: 'Reliable airport pickups with flight tracking and meet-and-greet.', emoji: '🚗', color: '#b45309' },
  { id: 'mkt-4', name: 'GoldCoast Tours', category: 'Tour Guides', provider: 'Nana Adventures', rating: 4.9, reviews: 410, price: '₵450/day', installed: false, description: 'Curated day tours: Cape Coast, Kakum, Aburi Gardens, local markets.', emoji: '🗺️', color: '#15803d' },
  { id: 'mkt-5', name: 'AkwaabaEats', category: 'Restaurants', provider: 'FoodFleet', rating: 4.5, reviews: 260, price: 'Commission 10%', installed: false, description: 'In-room dining from 30+ partner restaurants, auto-billed to room.', emoji: '🍽️', color: '#be123c' },
  { id: 'mkt-6', name: 'LensMen Studios', category: 'Photographers', provider: 'LensMen', rating: 4.7, reviews: 95, price: '₵1,200/shoot', installed: false, description: 'Professional property & experience photography for listings.', emoji: '📷', color: '#0e7490' },
  { id: 'mkt-7', name: 'EventCraft GH', category: 'Event Planners', provider: 'EventCraft', rating: 4.8, reviews: 140, price: 'From ₵3,500', installed: false, description: 'Full-service event planning for weddings, conferences, retreats.', emoji: '🎉', color: '#c2410c' },
  { id: 'mkt-8', name: 'FixIt Maintenance', category: 'Maintenance Companies', provider: 'FixIt GH', rating: 4.4, reviews: 210, price: '₵120/visit', installed: false, description: 'Licensed HVAC, plumbing & electrical technicians on call.', emoji: '🔧', color: '#a16207' },
]

// ===================== GUEST JOURNEY =====================
export type JourneyStage = 'discovery' | 'inquiry' | 'reservation' | 'arrival' | 'stay' | 'experiences' | 'review' | 'loyalty' | 'repeat' | 'referral'

export interface JourneyStep {
  stage: JourneyStage
  label: string
  status: 'complete' | 'current' | 'upcoming' | 'lost'
  date?: string
  value?: number
  note?: string
}

export function journeyForGuest(guestId: string): JourneyStep[] {
  const guest = GUESTS.find(g => g.id === guestId)
  if (!guest) return []
  const isOta = ['Airbnb', 'Booking.com', 'Expedia', 'Agoda'].includes(guest.bookingSource)
  const lastRes = RESERVATIONS.filter(r => r.guestId === guestId).sort((a, b) => b.checkIn.localeCompare(a.checkIn))[0]
  return [
    { stage: 'discovery', label: isOta ? `Discovered via ${guest.bookingSource}` : 'Discovered your direct site', status: 'complete', date: guest.firstSeen, note: isOta ? 'Commission paid to OTA' : 'No commission — owned channel' },
    { stage: 'inquiry', label: 'Sent inquiry via WhatsApp', status: 'complete', date: lastRes?.createdAt, note: isOta ? 'OTA handled inquiry' : 'You owned the conversation' },
    { stage: 'reservation', label: `Reserved ${lastRes ? ROOMS.find(r => r.id === lastRes.roomIds[0])?.name : 'a room'}`, status: 'complete', date: lastRes?.checkIn, value: lastRes?.grossRevenue },
    { stage: 'arrival', label: 'Checked in', status: 'complete', date: lastRes?.checkIn },
    { stage: 'stay', label: `Stayed ${lastRes ? Math.ceil((new Date(lastRes.checkOut).getTime() - new Date(lastRes.checkIn).getTime()) / 86400000) : 2} nights`, status: 'complete', date: lastRes?.checkOut, note: guest.favoriteRoom ? `Favorite: ${guest.favoriteRoom}` : undefined },
    { stage: 'experiences', label: 'Experiences booked', status: guest.totalStays > 2 ? 'complete' : 'lost', note: guest.totalStays > 2 ? 'Airport pickup + tour' : 'No upsell — revenue lost' },
    { stage: 'review', label: `Left a ${guest.avgRatingGiven ?? '—'}★ review`, status: (guest.avgRatingGiven ?? 0) >= 4 ? 'complete' : 'upcoming' },
    { stage: 'loyalty', label: `Joined ${guest.loyaltyTier} tier`, status: guest.loyaltyTier !== 'Bronze' ? 'complete' : 'current', note: `${guest.loyaltyPoints} points` },
    { stage: 'repeat', label: `Returned ${guest.repeatVisits} times`, status: guest.repeatVisits > 0 ? 'complete' : 'upcoming', note: guest.repeatVisits > 0 ? `${fmtPctLocal(Math.round(guest.repeatVisits / Math.max(1, guest.totalStays) * 100))} repeat rate` : 'Opportunity: convert to repeat' },
    { stage: 'referral', label: 'Referred new guests', status: guest.tags.includes('referral') ? 'complete' : 'upcoming', note: guest.tags.includes('referral') ? 'Top referrer' : 'Incentivize referral' },
  ]
}

function fmtPctLocal(n: number) { return `${n}%` }

// ===================== CEO DAILY BRIEF ACTIONS =====================
export interface BriefAction {
  id: string
  title: string
  detail: string
  impact: string
  type: 'approve' | 'review' | 'info'
  status: 'pending' | 'approved' | 'rejected'
  agentId: string
}

export const BRIEF_ACTIONS: BriefAction[] = [
  { id: 'ba-1', title: 'Approve: raise penthouse rate to ₵2,600', detail: 'Pricing Analyst found your penthouse is 48% below Kempinski\'s entry suite. Test rate next weekend projected +₵9,600.', impact: '+₵9,600', type: 'approve', status: 'pending', agentId: 'agent-4' },
  { id: 'ba-2', title: 'Approve: add free breakfast perk for weekend', detail: 'Free breakfast historically lifts weekend conversions 18% at near-zero cost. Marketing Director ready to launch.', impact: '+4 bookings', type: 'approve', status: 'pending', agentId: 'agent-2' },
  { id: 'ba-3', title: 'Review: 3 unanswered negative reviews', detail: 'Reputation Manager drafted AI replies for Fatima (AC) and Linda (check-in wait). Send to protect rating.', impact: '+0.2★', type: 'review', status: 'pending', agentId: 'agent-6' },
  { id: 'ba-4', title: 'Review: expedite room 102 AC repair', detail: 'Operations flagged recurring AC noise complaint. ₵350 repair prevents further negative reviews.', impact: '-1 complaint/week', type: 'review', status: 'pending', agentId: 'agent-8' },
  { id: 'ba-5', title: 'Info: 7 booking widget abandonments today', detail: 'AI auto-sent recovery emails with 10% coupon. Will report conversions tomorrow.', impact: 'Auto-running', type: 'info', status: 'pending', agentId: 'agent-2' },
  { id: 'ba-6', title: 'Info: weekend flash sale sent to 48 guests', detail: '12 opens, 3 conversions so far. Projected +6 bookings by Friday.', impact: '+₵7,400', type: 'info', status: 'pending', agentId: 'agent-2' },
]

// ===================== DIGITAL TWIN SUMMARY =====================
export const DIGITAL_TWIN = {
  rooms: ROOMS.length,
  activeBookings: RESERVATIONS.filter(r => r.status === 'Checked-in' || r.status === 'Confirmed').length,
  totalGuests: GUESTS.length,
  vipGuests: GUESTS.filter(g => g.loyaltyTier === 'VIP').length,
  activeCampaigns: 4,
  openIssues: 3,
  cleaningTasks: 7,
  activeAgents: AI_AGENTS.filter(a => a.status !== 'Idle').length,
  connectedChannels: CHANNELS.filter(c => c.connected).length,
  activeReviews: REVIEWS.length,
  experiences: EXPERIENCES.length,
  corporateAccounts: CORPORATE.filter(c => c.status === 'Active').length,
  revenueStreams: 8,
  liveMetrics: {
    occupancyNow: 61,
    revenueToday: 12400,
    inquiriesToday: 14,
    aiActionsToday: 47,
    autoActionsToday: 31,
    approvalsPending: 4,
  },
}

// ===================== WORKFORCE COLLABORATION CASCADES =====================
export interface Cascade {
  id: string
  trigger: string
  steps: { agentId: string; role: string; agent: string; action: string; status: 'done' | 'active' | 'pending'; timestamp: string }[]
  outcome: string
  status: 'running' | 'complete'
  startedAt: string
}

export const CASCADES: Cascade[] = [
  {
    id: 'cas-1',
    trigger: 'Revenue Director detected Friday occupancy at 42%',
    status: 'running',
    startedAt: '2h ago',
    steps: [
      { agentId: 'agent-1', role: 'Revenue Director', agent: 'Kofi', action: 'Flagged low Friday occupancy (11 empty rooms)', status: 'done', timestamp: '2h ago' },
      { agentId: 'agent-4', role: 'Pricing Analyst', agent: 'Abena', action: 'Analyzed demand + competitors → recommended 7% price cut', status: 'done', timestamp: '1h 50m ago' },
      { agentId: 'agent-2', role: 'Marketing Director', agent: 'Ama', action: 'Launched WhatsApp flash sale to 48 lapsed guests', status: 'done', timestamp: '1h ago' },
      { agentId: 'agent-3', role: 'CRM Manager', agent: 'Yaw', action: 'Contacting 12 lapsed VIP guests personally', status: 'active', timestamp: 'now' },
      { agentId: 'agent-3', role: 'Guest Relations', agent: 'Akosua', action: 'Preparing free-breakfast perk (needs approval)', status: 'pending', timestamp: '—' },
      { agentId: 'agent-1', role: 'Revenue Director', agent: 'Kofi', action: 'Will report impact Sat 9 AM', status: 'pending', timestamp: '—' },
    ],
    outcome: 'Expected +6 rooms filled, +₵7,400 revenue',
  },
  {
    id: 'cas-2',
    trigger: 'Pricing Analyst found penthouse 48% underpriced',
    status: 'running',
    startedAt: '1h ago',
    steps: [
      { agentId: 'agent-4', role: 'Pricing Analyst', agent: 'Abena', action: 'Competitor scan: penthouse 48% below Kempinski', status: 'done', timestamp: '1h ago' },
      { agentId: 'agent-1', role: 'Revenue Director', agent: 'Kofi', action: 'Proposed ₵2,600 test rate → awaiting owner approval', status: 'active', timestamp: 'now' },
      { agentId: 'agent-5', role: 'OTA Manager', agent: 'Kwabena', action: 'Will sync new rate across 5 OTAs once approved', status: 'pending', timestamp: '—' },
      { agentId: 'agent-9', role: 'Finance Manager', agent: 'Efua', action: 'Will track RevPAR impact next 14 days', status: 'pending', timestamp: '—' },
    ],
    outcome: 'Projected +₵9,600 if approved',
  },
  {
    id: 'cas-3',
    trigger: 'Reputation Manager detected 2 unanswered negative reviews',
    status: 'running',
    startedAt: '30m ago',
    steps: [
      { agentId: 'agent-6', role: 'Reputation Manager', agent: 'Akosua', action: 'Drafted AI replies for Fatima & Linda reviews', status: 'active', timestamp: 'now' },
      { agentId: 'agent-8', role: 'Operations Manager', agent: 'Adwoa', action: 'Will expedite room 102 AC repair (needs approval)', status: 'pending', timestamp: '—' },
      { agentId: 'agent-3', role: 'Guest Relations', agent: 'Akosua', action: 'Will send service-recovery outreach to both guests', status: 'pending', timestamp: '—' },
    ],
    outcome: 'Projected rating recovery +0.2★',
  },
]

// ===================== WEBSITE BUILDER =====================
export const WEBSITE_SECTIONS = [
  { id: 'ws-1', name: 'Hero', type: 'hero', enabled: true, content: 'Akwaaba Boutique Lodge — Where every guest feels at home' },
  { id: 'ws-2', name: 'Room Gallery', type: 'rooms', enabled: true, content: '11 rooms across 6 types, from ₵450/night' },
  { id: 'ws-3', name: 'Booking Widget', type: 'booking', enabled: true, content: 'Direct booking engine — save 15% vs OTA' },
  { id: 'ws-4', name: 'Experiences', type: 'experiences', enabled: true, content: '8 local experiences from airport pickup to spa' },
  { id: 'ws-5', name: 'Reviews', type: 'reviews', enabled: true, content: '4.4★ across Google, Booking.com, Airbnb' },
  { id: 'ws-6', name: 'Google Maps', type: 'map', enabled: true, content: 'East Legon, Accra — 8 min from Kotoka Airport' },
  { id: 'ws-7', name: 'WhatsApp Chat', type: 'chat', enabled: true, content: 'Instant AI concierge on WhatsApp' },
  { id: 'ws-8', name: 'Blog', type: 'blog', enabled: false, content: 'AI-generated local guides & travel tips' },
  { id: 'ws-9', name: 'SEO Meta', type: 'seo', enabled: true, content: 'Auto-optimized for "guest house Accra", "boutique lodge East Legon"' },
  { id: 'ws-10', name: 'Online Payments', type: 'payments', enabled: true, content: 'Stripe, Flutterwave, Paystack, PaySwap' },
]
