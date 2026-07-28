// StayPilot AI V4 — Outcome-Based Hospitality AI data layer.
// Shift from tools to outcomes: owners hire AI teams with measurable goals.
// Reuses V1 (data.ts) + V2 (data-v2.ts) + V3 (data-v3.ts).

// ===================== OUTCOME GOALS =====================
export type GoalCategory = 'occupancy' | 'direct' | 'revenue' | 'satisfaction' | 'repeat' | 'spend' | 'commission' | 'rating'
export type GoalStatus = 'On Track' | 'At Risk' | 'Behind' | 'Achieved' | 'Paused'

export interface GoalMilestone {
  id: string
  label: string
  target: number
  current: number
  unit: string
  deadline: string
  done: boolean
}

export interface Goal {
  id: string
  title: string
  category: GoalCategory
  status: GoalStatus
  target: number
  current: number
  unit: string
  baseline: number
  deadline: string
  progress: number // % to target
  aiConfidence: number
  assignedAgents: string[]
  missionsLinked: number
  milestones: GoalMilestone[]
  northStar: string
  lastUpdated: string
  trend: number[]
  autoExecuting: boolean
  projectedAchievement: string
}

export const GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Maintain 90% occupancy',
    category: 'occupancy',
    status: 'On Track',
    target: 90,
    current: 72,
    unit: '%',
    baseline: 64,
    deadline: '90 days',
    progress: 51,
    aiConfidence: 78,
    assignedAgents: ['agent-1', 'agent-2', 'agent-3', 'agent-4'],
    missionsLinked: 3,
    milestones: [
      { id: 'm1', label: 'Reach 75% this month', target: 75, current: 72, unit: '%', deadline: '14 days', done: false },
      { id: 'm2', label: 'Reach 82% next month', target: 82, current: 0, unit: '%', deadline: '45 days', done: false },
      { id: 'm3', label: 'Sustain 90%', target: 90, current: 0, unit: '%', deadline: '90 days', done: false },
    ],
    northStar: 'Occupancy',
    lastUpdated: '2h ago',
    trend: [64, 66, 65, 68, 70, 69, 72, 72],
    autoExecuting: true,
    projectedAchievement: '86 days (ahead of deadline)',
  },
  {
    id: 'goal-2',
    title: 'Reduce OTA commissions below 15%',
    category: 'commission',
    status: 'On Track',
    target: 15,
    current: 15,
    unit: '%',
    baseline: 22,
    deadline: '60 days',
    progress: 100,
    aiConfidence: 92,
    assignedAgents: ['agent-3', 'agent-5', 'agent-9'],
    missionsLinked: 2,
    milestones: [
      { id: 'm1', label: 'Reach 18%', target: 18, current: 15, unit: '%', deadline: '30 days', done: true },
      { id: 'm2', label: 'Reach 15%', target: 15, current: 15, unit: '%', deadline: '60 days', done: true },
    ],
    northStar: 'OTA Commission %',
    lastUpdated: '1h ago',
    trend: [22, 21, 20, 19, 18, 17, 16, 15],
    autoExecuting: true,
    projectedAchievement: 'Achieved ✓ — pushing to 12%',
  },
  {
    id: 'goal-3',
    title: 'Increase direct bookings to 60%',
    category: 'direct',
    status: 'At Risk',
    target: 60,
    current: 41,
    unit: '%',
    baseline: 34,
    deadline: '120 days',
    progress: 41,
    aiConfidence: 64,
    assignedAgents: ['agent-3', 'agent-2', 'agent-7'],
    missionsLinked: 4,
    milestones: [
      { id: 'm1', label: 'Reach 45%', target: 45, current: 41, unit: '%', deadline: '20 days', done: false },
      { id: 'm2', label: 'Reach 52%', target: 52, current: 0, unit: '%', deadline: '60 days', done: false },
      { id: 'm3', label: 'Reach 60%', target: 60, current: 0, unit: '%', deadline: '120 days', done: false },
    ],
    northStar: 'Direct Booking %',
    lastUpdated: '3h ago',
    trend: [34, 36, 37, 38, 39, 40, 40, 41],
    autoExecuting: true,
    projectedAchievement: '118 days — needs acceleration',
  },
  {
    id: 'goal-4',
    title: 'Increase average guest spend to ₵1,200',
    category: 'spend',
    status: 'On Track',
    target: 1200,
    current: 1180,
    unit: '₵',
    baseline: 820,
    deadline: '45 days',
    progress: 90,
    aiConfidence: 88,
    assignedAgents: ['agent-8', 'agent-3', 'agent-2'],
    missionsLinked: 2,
    milestones: [
      { id: 'm1', label: 'Reach ₵1,000', target: 1000, current: 1180, unit: '₵', deadline: 'Done', done: true },
      { id: 'm2', label: 'Reach ₵1,100', target: 1100, current: 1180, unit: '₵', deadline: 'Done', done: true },
      { id: 'm3', label: 'Reach ₵1,200', target: 1200, current: 1180, unit: '₵', deadline: '45 days', done: false },
    ],
    northStar: 'Avg Spend per Guest',
    lastUpdated: '5h ago',
    trend: [820, 880, 920, 980, 1040, 1100, 1140, 1180],
    autoExecuting: true,
    projectedAchievement: '38 days',
  },
  {
    id: 'goal-5',
    title: 'Become the highest-rated guest house in Accra',
    category: 'rating',
    status: 'Behind',
    target: 4.8,
    current: 4.4,
    unit: '★',
    baseline: 4.1,
    deadline: '180 days',
    progress: 60,
    aiConfidence: 52,
    assignedAgents: ['agent-6', 'agent-8', 'agent-3'],
    missionsLinked: 1,
    milestones: [
      { id: 'm1', label: 'Reach 4.5★', target: 4.5, current: 4.4, unit: '★', deadline: '30 days', done: false },
      { id: 'm2', label: 'Reach 4.7★', target: 4.7, current: 0, unit: '★', deadline: '90 days', done: false },
      { id: 'm3', label: 'Reach 4.8★ (top in Accra)', target: 4.8, current: 0, unit: '★', deadline: '180 days', done: false },
    ],
    northStar: 'Customer Satisfaction',
    lastUpdated: '1d ago',
    trend: [4.1, 4.15, 4.2, 4.25, 4.3, 4.35, 4.38, 4.4],
    autoExecuting: false,
    projectedAchievement: '225 days — needs intervention',
  },
  {
    id: 'goal-6',
    title: 'Increase repeat guests to 50%',
    category: 'repeat',
    status: 'On Track',
    target: 50,
    current: 38,
    unit: '%',
    baseline: 28,
    deadline: '90 days',
    progress: 50,
    aiConfidence: 81,
    assignedAgents: ['agent-3', 'agent-2', 'agent-6'],
    missionsLinked: 3,
    milestones: [
      { id: 'm1', label: 'Reach 40%', target: 40, current: 38, unit: '%', deadline: '10 days', done: false },
      { id: 'm2', label: 'Reach 45%', target: 45, current: 0, unit: '%', deadline: '45 days', done: false },
      { id: 'm3', label: 'Reach 50%', target: 50, current: 0, unit: '%', deadline: '90 days', done: false },
    ],
    northStar: 'Repeat Guest %',
    lastUpdated: '4h ago',
    trend: [28, 30, 31, 33, 34, 36, 37, 38],
    autoExecuting: true,
    projectedAchievement: '84 days',
  },
]

export const GOAL_TEMPLATES = [
  { id: 'gt-1', title: 'Maintain 90% occupancy', category: 'occupancy', icon: '🛏️', unit: '%', popular: true },
  { id: 'gt-2', title: 'Reduce OTA commissions below 15%', category: 'commission', icon: '📉', unit: '%', popular: true },
  { id: 'gt-3', title: 'Increase direct bookings to 60%', category: 'direct', icon: '🎯', unit: '%', popular: true },
  { id: 'gt-4', title: 'Increase average guest spend to ₵1,200', category: 'spend', icon: '💰', unit: '₵', popular: true },
  { id: 'gt-5', title: 'Become the highest-rated guest house in my city', category: 'rating', icon: '🏆', unit: '★', popular: true },
  { id: 'gt-6', title: 'Increase repeat guests to 50%', category: 'repeat', icon: '🔁', unit: '%', popular: false },
  { id: 'gt-7', title: 'Reach ₵500K quarterly revenue', category: 'revenue', icon: '📈', unit: '₵', popular: false },
  { id: 'gt-8', title: 'Achieve 4.8★ average rating', category: 'satisfaction', icon: '⭐', unit: '★', popular: false },
]

// ===================== AUTONOMOUS REVENUE ENGINE =====================
export interface EngineScenario {
  id: string
  title: string
  detectedDate: string
  targetDate: string
  weeksAhead: number
  severity: 'critical' | 'warning' | 'opportunity'
  currentProjection: number
  projectedAfter: number
  unit: string
  revenueAtRisk: number
  revenueRecovered: number
  status: 'Auto-executing' | 'Proposed' | 'Completed'
  steps: EngineStep[]
  approvalsNeeded: number
}

export interface EngineStep {
  id: string
  agent: string
  role: string
  action: string
  status: 'done' | 'active' | 'pending' | 'auto'
  auto: boolean
  impact: string
  timestamp: string
}

export const ENGINE_SCENARIOS: EngineScenario[] = [
  {
    id: 'es-1',
    title: 'Occupancy gap detected in 3 weeks',
    detectedDate: '2h ago',
    targetDate: '21 days',
    weeksAhead: 3,
    severity: 'warning',
    currentProjection: 54,
    projectedAfter: 83,
    unit: '%',
    revenueAtRisk: 28400,
    revenueRecovered: 18600,
    status: 'Auto-executing',
    approvalsNeeded: 1,
    steps: [
      { id: 's1', agent: 'Revenue Director', role: 'Kofi', action: 'Predicted 54% occupancy in 3 weeks (16 empty rooms) using booking pace + seasonality model', status: 'auto', auto: true, impact: '₵28,400 at risk', timestamp: '2h ago' },
      { id: 's2', agent: 'Pricing Analyst', role: 'Abena', action: 'Analyzed historical demand for similar weeks → recommended targeted 6% rate cut on slow rooms', status: 'auto', auto: true, impact: '+4 bookings projected', timestamp: '1h 50m ago' },
      { id: 's3', agent: 'CRM Manager', role: 'Yaw', action: 'Found 28 similar guests from last year\'s same week → queued personalized offers', status: 'auto', auto: true, impact: '+6 bookings projected', timestamp: '1h 40m ago' },
      { id: 's4', agent: 'Marketing Director', role: 'Ama', action: 'Generated "3-Week Out" campaign: WhatsApp + email to 28 guests + Instagram boost', status: 'active', auto: true, impact: '+5 bookings projected', timestamp: '1h ago' },
      { id: 's5', agent: 'Sales Manager', role: 'Kofi Jr.', action: 'Contacting 3 corporate accounts (MTN, UNICEF, Zenith) about that week\'s availability', status: 'active', auto: false, impact: '+3 bookings projected', timestamp: '40m ago' },
      { id: 's6', agent: 'OTA Manager', role: 'Kwabena', action: 'Optimizing Airbnb/Booking.com listing visibility + photos for that week', status: 'pending', auto: true, impact: '+2 bookings projected', timestamp: '—' },
      { id: 's7', agent: 'Guest Relations', role: 'Akosua', action: 'Promoting local experiences (Cape Coast tour) as a package to drive conversion', status: 'pending', auto: false, impact: '+1 booking projected', timestamp: '—' },
      { id: 's8', agent: 'Revenue Director', role: 'Kofi', action: 'Will report projected impact: 54% → 83% (+₵18,600 recovered)', status: 'pending', auto: false, impact: '+₵18,600', timestamp: '—' },
    ],
  },
  {
    id: 'es-2',
    title: 'AICC conference spike in 6 days — maximize revenue',
    detectedDate: '1d ago',
    targetDate: '6 days',
    weeksAhead: 1,
    severity: 'opportunity',
    currentProjection: 72,
    projectedAfter: 96,
    unit: '%',
    revenueAtRisk: 0,
    revenueRecovered: 14400,
    status: 'Auto-executing',
    approvalsNeeded: 1,
    steps: [
      { id: 's1', agent: 'Revenue Director', role: 'Kofi', action: 'Detected AICC 2,000-attendee conference — 8 nearby competitors already sold out', status: 'auto', auto: true, impact: 'Demand spike +23%', timestamp: '1d ago' },
      { id: 's2', agent: 'Pricing Analyst', role: 'Abena', action: 'Recommended +31% ADR premium for conference week (network data supports it)', status: 'pending', auto: false, impact: '+₵9,600', timestamp: '—' },
      { id: 's3', agent: 'OTA Manager', role: 'Kwabena', action: 'Boosting OTA visibility + minimum 2-night stay rule', status: 'active', auto: true, impact: '+3 bookings', timestamp: '20h ago' },
      { id: 's4', agent: 'Sales Manager', role: 'Kofi Jr.', action: 'Outreach to conference attendees via AICC partner list', status: 'pending', auto: false, impact: '+5 bookings', timestamp: '—' },
    ],
  },
  {
    id: 'es-3',
    title: 'Cancellation cluster risk next weekend',
    detectedDate: '3h ago',
    targetDate: '9 days',
    weeksAhead: 1,
    severity: 'critical',
    currentProjection: 78,
    projectedAfter: 78,
    unit: '%',
    revenueAtRisk: 9800,
    revenueRecovered: 7400,
    status: 'Proposed',
    approvalsNeeded: 2,
    steps: [
      { id: 's1', agent: 'Revenue Director', role: 'Kofi', action: 'Booking pace shows 4 Bookings.com reservations with >30% cancellation probability', status: 'auto', auto: true, impact: '₵9,800 at risk', timestamp: '3h ago' },
      { id: 's2', agent: 'CRM Manager', role: 'Yaw', action: 'Proposed: offer non-refundable rebooking with 12% discount to lock them in', status: 'pending', auto: false, impact: 'Save 3 of 4', timestamp: '—' },
      { id: 's3', agent: 'Marketing Director', role: 'Ama', action: 'Standby: launch waitlist campaign if cancellations hit', status: 'pending', auto: true, impact: '+₵7,400 recovery', timestamp: '—' },
    ],
  },
  {
    id: 'es-4',
    title: 'Off-season demand softening in 5 weeks',
    detectedDate: '6h ago',
    targetDate: '38 days',
    weeksAhead: 5,
    severity: 'warning',
    currentProjection: 48,
    projectedAfter: 67,
    unit: '%',
    revenueAtRisk: 22400,
    revenueRecovered: 14200,
    status: 'Proposed',
    approvalsNeeded: 1,
    steps: [
      { id: 's1', agent: 'Revenue Director', role: 'Kofi', action: '5-week forecast shows off-season dip to 48% (network pattern confirmed)', status: 'auto', auto: true, impact: '₵22,400 at risk', timestamp: '6h ago' },
      { id: 's2', agent: 'Pricing Analyst', role: 'Abena', action: 'Drafted graduated discount plan: 8% wks 5-6, 12% wks 7-8', status: 'pending', auto: false, impact: '+5 bookings', timestamp: '—' },
      { id: 's3', agent: 'Marketing Director', role: 'Ama', action: 'Drafted "Quiet Season Escape" campaign for digital nomads + remote workers', status: 'pending', auto: false, impact: '+4 bookings', timestamp: '—' },
      { id: 's4', agent: 'Guest Relations', role: 'Akosua', action: 'Proposed long-stay package (14+ nights) at 25% off for nomads', status: 'pending', auto: false, impact: '+3 bookings', timestamp: '—' },
    ],
  },
]

// ===================== DIGITAL EMPLOYEE MARKETPLACE =====================
// Distinct from V3's AI capability marketplace — these are full "AI employees" with personas
export interface DigitalEmployee {
  id: string
  name: string
  role: string
  specialization: string
  propertyType: string
  developer: string
  rating: number
  installs: number
  price: string
  installed: boolean
  verified: boolean
  avatar: string
  color: string
  bio: string
  skills: string[]
  performance: { occupancy: number; revenue: number; rating: number }
}

export const DIGITAL_EMPLOYEES: DigitalEmployee[] = [
  { id: 'de-1', name: 'Amani', role: 'Luxury Hotel Revenue Manager', specialization: 'Luxury Boutique', propertyType: 'Boutique Hotel', developer: 'RevPro AI', rating: 4.9, installs: 420, price: '₵680/mo', installed: true, verified: true, avatar: '💼', color: '#a16207', bio: '15 years of luxury hospitality revenue experience. Specializes in ADR optimization, suite upselling, and high-net-worth guest retention.', skills: ['Luxury pricing', 'Suite upselling', 'VIP retention', 'Competitor analysis', 'Rate integrity'], performance: { occupancy: 84, revenue: 38600, rating: 4.7 } },
  { id: 'de-2', name: 'Zuri', role: 'Boutique Hotel Marketing Director', specialization: 'Boutique Marketing', propertyType: 'Boutique Hotel', developer: 'StayPilot Labs', rating: 4.8, installs: 680, price: '₵420/mo', installed: true, verified: true, avatar: '📣', color: '#be123c', bio: 'Storytelling-first marketer for boutique properties. Builds Instagram-first brands, runs high-converting WhatsApp campaigns.', skills: ['Brand storytelling', 'Instagram growth', 'WhatsApp campaigns', 'Influencer outreach', 'Content calendar'], performance: { occupancy: 76, revenue: 24800, rating: 4.6 } },
  { id: 'de-3', name: 'Kofi', role: 'Eco-Lodge Operations Manager', specialization: 'Eco-Lodge Ops', propertyType: 'Lodge', developer: 'GreenStay AI', rating: 4.7, installs: 180, price: '₵520/mo', installed: false, verified: true, avatar: '🌿', color: '#15803d', bio: 'Sustainability-focused operations manager. Optimizes solar usage, water conservation, and eco-certified supplier sourcing.', skills: ['Energy optimization', 'Waste reduction', 'Eco sourcing', 'Staff scheduling', 'Sustainability reporting'], performance: { occupancy: 72, revenue: 22400, rating: 4.8 } },
  { id: 'de-4', name: 'Nadia', role: 'Conference Sales Specialist', specialization: 'MICE Sales', propertyType: 'Conference Hotel', developer: 'MICEPro', rating: 4.8, installs: 240, price: '₵580/mo', installed: false, verified: true, avatar: '🎤', color: '#0e7490', bio: 'Meetings-Incentives-Conferences-Events sales expert. Books corporate blocks, manages event budgets, coordinates AV.', skills: ['Corporate prospecting', 'Contract negotiation', 'Event coordination', 'AV planning', 'Catering liaison'], performance: { occupancy: 81, revenue: 41200, rating: 4.5 } },
  { id: 'de-5', name: 'Amara', role: 'Wedding Venue Coordinator', specialization: 'Weddings', propertyType: 'Resort', developer: 'VowAI', rating: 4.9, installs: 320, price: '₵720/mo', installed: false, verified: true, avatar: '💍', color: '#9333ea', bio: 'End-to-end wedding venue sales + coordination. Books 40+ weddings/year on average across the network.', skills: ['Wedding sales', 'Vendor coordination', 'Banquet pricing', 'Bride-groom liaison', 'Timeline management'], performance: { occupancy: 78, revenue: 52400, rating: 4.8 } },
  { id: 'de-6', name: 'Tariq', role: 'Serviced Apartments Manager', specialization: 'Long-Stay', propertyType: 'Serviced Apartments', developer: 'StayLong AI', rating: 4.6, installs: 140, price: '₵480/mo', installed: false, verified: true, avatar: '🏢', color: '#0d9488', bio: 'Long-stay and corporate-housing specialist. Optimizes 30+ day stays, manages corporate leases, handles tenant relations.', skills: ['Long-stay pricing', 'Corporate leasing', 'Tenant relations', 'Maintenance scheduling', 'Deposit management'], performance: { occupancy: 88, revenue: 34800, rating: 4.4 } },
  { id: 'de-7', name: 'Lerato', role: 'Hostel Community Manager', specialization: 'Hostel', propertyType: 'Hostel', developer: 'BackpackrAI', rating: 4.5, installs: 95, price: '₵280/mo', installed: false, verified: false, avatar: '🛏️', color: '#ea580c', bio: 'Hostel-focused community builder. Drives dorm occupancy, organizes social events, manages reviews from younger travelers.', skills: ['Dorm pricing', 'Social events', 'Review management', 'Backpacker marketing', 'Community building'], performance: { occupancy: 86, revenue: 18600, rating: 4.3 } },
  { id: 'de-8', name: 'Sefu', role: 'Safari Lodge Concierge', specialization: 'Safari/Adventure', propertyType: 'Lodge', developer: 'WildAI', rating: 4.9, installs: 75, price: '₵640/mo', installed: false, verified: true, avatar: '🦁', color: '#b45309', bio: 'Adventure-tourism concierge. Books safari packages, manages guide schedules, handles international guest comms.', skills: ['Safari packaging', 'Guide scheduling', 'International comms', 'Safety protocols', 'Photo safari upsell'], performance: { occupancy: 79, revenue: 48200, rating: 4.9 } },
]

export const EMPLOYEE_SPECIALTIES = ['Luxury Boutique', 'Boutique Marketing', 'Eco-Lodge Ops', 'MICE Sales', 'Weddings', 'Long-Stay', 'Hostel', 'Safari/Adventure']

// ===================== PREDICTIVE OPERATIONS =====================
export interface OpsForecast {
  id: string
  resource: string
  icon: string
  horizon: string
  forecast: number
  unit: string
  current: number
  trend: number
  confidence: number
  action: string
  autoScheduled: boolean
  color: string
}

export const OPS_FORECASTS: OpsForecast[] = [
  { id: 'of-1', resource: 'Housekeeping demand', icon: '🧹', horizon: '7 days', forecast: 38, unit: 'turnovers', current: 32, trend: 19, confidence: 91, action: 'Schedule 1 extra housekeeper Fri-Sun', autoScheduled: true, color: '#0d9488' },
  { id: 'of-2', resource: 'Linen usage', icon: '🛏️', horizon: '7 days', forecast: 152, unit: 'sets', current: 128, trend: 19, confidence: 88, action: 'Order 24 sets — current stock 140, falls short', autoScheduled: true, color: '#9333ea' },
  { id: 'of-3', resource: 'Food inventory (breakfast)', icon: '🍳', horizon: '5 days', forecast: 184, unit: 'covers', current: 160, trend: 15, confidence: 84, action: 'Increase eggs + bread order by 15%', autoScheduled: true, color: '#b45309' },
  { id: 'of-4', resource: 'Utility consumption (electricity)', icon: '⚡', horizon: '14 days', forecast: 2840, unit: 'kWh', current: 2620, trend: 8, confidence: 79, action: 'AC pre-cool schedule optimized to cut peak load', autoScheduled: false, color: '#be123c' },
  { id: 'of-5', resource: 'Staffing level (front desk)', icon: '🛎️', horizon: '3 days', forecast: 5, unit: 'staff peak', current: 4, trend: 25, confidence: 93, action: 'Add 1 receptionist for 2-5 PM peak (Thu-Fri)', autoScheduled: true, color: '#15803d' },
  { id: 'of-6', resource: 'Maintenance window (room 303 jacuzzi)', icon: '🔧', horizon: '12 days', forecast: 1, unit: 'failure predicted', current: 0, trend: 0, confidence: 72, action: 'Schedule preventive seal replacement', autoScheduled: false, color: '#a16207' },
  { id: 'of-7', resource: 'Peak check-in period', icon: '📈', horizon: 'Today', forecast: 14, unit: 'arrivals 2-5 PM', current: 0, trend: 0, confidence: 96, action: 'Mobile check-in links sent, 1 extra staff added', autoScheduled: true, color: '#ea580c' },
  { id: 'of-8', resource: 'Water usage', icon: '💧', horizon: '7 days', forecast: 18400, unit: 'liters', current: 16800, trend: 10, confidence: 82, action: 'Monitor — within capacity', autoScheduled: false, color: '#0e7490' },
]

export const OPS_TIMESERIES = [
  { day: 'Mon', turnovers: 5, linen: 20, food: 22, staff: 3 },
  { day: 'Tue', turnovers: 4, linen: 16, food: 18, staff: 3 },
  { day: 'Wed', turnovers: 6, linen: 24, food: 26, staff: 4 },
  { day: 'Thu', turnovers: 7, linen: 28, food: 30, staff: 4 },
  { day: 'Fri', turnovers: 9, linen: 36, food: 38, staff: 5 },
  { day: 'Sat', turnovers: 8, linen: 32, food: 34, staff: 5 },
  { day: 'Sun', turnovers: 5, linen: 20, food: 22, staff: 4 },
]

// ===================== SUPPLIER NETWORK =====================
export interface Supplier {
  id: string
  name: string
  category: string
  rating: number
  reviews: number
  priceLevel: 1 | 2 | 3
  reliability: number
  deliveryTime: string
  networkUsedBy: number
  yourStatus: 'preferred' | 'connected' | 'available'
  description: string
  emoji: string
  color: string
}

export const SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'FreshLine Laundry', category: 'Laundry', rating: 4.7, reviews: 320, priceLevel: 2, reliability: 96, deliveryTime: 'Same day', networkUsedBy: 1240, yourStatus: 'preferred', description: 'Hotel linen + guest laundry. Same-day pickup/delivery. Bulk pricing for StayPilot network.', emoji: '👕', color: '#9333ea' },
  { id: 'sup-2', name: 'Akwaaba Foods Wholesale', category: 'Food Wholesaler', rating: 4.6, reviews: 180, priceLevel: 1, reliability: 92, deliveryTime: '24 hrs', networkUsedBy: 680, yourStatus: 'preferred', description: 'Bulk breakfast + kitchen supplies. Network-negotiated rates 18% below market.', emoji: '🥘', color: '#b45309' },
  { id: 'sup-3', name: 'SparkleClean Supplies', category: 'Cleaning Supplies', rating: 4.8, reviews: 410, priceLevel: 2, reliability: 98, deliveryTime: '48 hrs', networkUsedBy: 1820, yourStatus: 'connected', description: 'Eco-certified cleaning chemicals + equipment. Auto-reorder based on your usage.', emoji: '🧴', color: '#0d9488' },
  { id: 'sup-4', name: 'FixIt Maintenance Co.', category: 'Maintenance Contractor', rating: 4.5, reviews: 260, priceLevel: 2, reliability: 89, deliveryTime: 'On call', networkUsedBy: 540, yourStatus: 'connected', description: 'Licensed HVAC, plumbing, electrical. Network-discounted hourly rates.', emoji: '🔧', color: '#a16207' },
  { id: 'sup-5', name: 'ComfortCraft Furniture', category: 'Furniture', rating: 4.7, reviews: 95, priceLevel: 3, reliability: 91, deliveryTime: '2-3 weeks', networkUsedBy: 220, yourStatus: 'available', description: 'Hotel-grade beds, sofas, case goods. Bulk refurbishment packages.', emoji: '🛋️', color: '#be123c' },
  { id: 'sup-6', name: 'SecureGuard GH', category: 'Security', rating: 4.6, reviews: 140, priceLevel: 2, reliability: 94, deliveryTime: 'On call', networkUsedBy: 380, yourStatus: 'available', description: '24/7 security guards + CCTV monitoring. Background-checked personnel.', emoji: '🛡️', color: '#1f2937' },
  { id: 'sup-7', name: 'SurfNet Internet', category: 'Internet Provider', rating: 4.4, reviews: 520, priceLevel: 2, reliability: 87, deliveryTime: '3 days install', networkUsedBy: 940, yourStatus: 'connected', description: 'Dedicated fiber + backup. StayPilot properties get priority routing.', emoji: '📶', color: '#0e7490' },
  { id: 'sup-8', name: 'GreenPower Solar', category: 'Utilities', rating: 4.8, reviews: 210, priceLevel: 3, reliability: 95, deliveryTime: '4 weeks install', networkUsedBy: 160, yourStatus: 'available', description: 'Solar + battery systems. Cuts utility costs 40-60%. Financing via PaySwap.', emoji: '☀️', color: '#ea580c' },
]

export const SUPPLIER_CATEGORIES = ['Laundry', 'Food Wholesaler', 'Cleaning Supplies', 'Maintenance Contractor', 'Furniture', 'Security', 'Internet Provider', 'Utilities']

// ===================== HOSPITALITY DATA CLOUD =====================
export interface RegionalMetric {
  region: string
  occupancy: number
  adr: number
  revpar: number
  directShare: number
  growth: number
  properties: number
}

export const REGIONAL_METRICS: RegionalMetric[] = [
  { region: 'Accra', occupancy: 71, adr: 820, revpar: 582, directShare: 38, growth: 14, properties: 142 },
  { region: 'Lagos', occupancy: 74, adr: 910, revpar: 673, directShare: 31, growth: 18, properties: 218 },
  { region: 'Nairobi', occupancy: 69, adr: 780, revpar: 538, directShare: 42, growth: 16, properties: 96 },
  { region: 'Cape Town', occupancy: 76, adr: 1240, revpar: 942, directShare: 51, growth: 9, properties: 184 },
  { region: 'Zanzibar', occupancy: 82, adr: 1180, revpar: 968, directShare: 44, growth: 24, properties: 72 },
  { region: 'Kampala', occupancy: 64, adr: 620, revpar: 397, directShare: 28, growth: 12, properties: 58 },
  { region: 'Abidjan', occupancy: 67, adr: 690, revpar: 462, directShare: 33, growth: 15, properties: 64 },
  { region: 'Dakar', occupancy: 66, adr: 710, revpar: 469, directShare: 35, growth: 11, properties: 48 },
]

export const SEASONAL_TRENDS = [
  { month: 'Jan', demand: 72, occupancy: 68, adr: 780 },
  { month: 'Feb', demand: 68, occupancy: 64, adr: 740 },
  { month: 'Mar', demand: 75, occupancy: 71, adr: 810 },
  { month: 'Apr', demand: 82, occupancy: 76, adr: 890 },
  { month: 'May', demand: 78, occupancy: 73, adr: 850 },
  { month: 'Jun', demand: 71, occupancy: 67, adr: 790 },
  { month: 'Jul', demand: 84, occupancy: 79, adr: 920 },
  { month: 'Aug', demand: 88, occupancy: 83, adr: 980 },
  { month: 'Sep', demand: 76, occupancy: 72, adr: 830 },
  { month: 'Oct', demand: 74, occupancy: 70, adr: 810 },
  { month: 'Nov', demand: 81, occupancy: 76, adr: 880 },
  { month: 'Dec', demand: 92, occupancy: 87, adr: 1080 },
]

export const DATA_CLOUD_INSIGHTS = [
  { id: 'dci-1', title: 'Booking lead times shortening', detail: 'Network-wide booking lead times dropped from 14 to 9 days over 12 months. Guests book later. Adjust pricing pace models.', impact: 'Affects 5,247 properties', trend: -36 },
  { id: 'dci-2', title: 'Cancellation rates rising on Booking.com', detail: 'Booking.com cancellations across the network rose to 13% (from 9%). Tighten policies network-wide.', impact: '+4pp vs last year', trend: 44 },
  { id: 'dci-3', title: 'Direct booking share climbing in West Africa', detail: 'West African properties\' direct share rose 7pp YoY — fastest-improving region globally.', impact: '+7pp YoY', trend: 7 },
  { id: 'dci-4', title: 'Guest spend on experiences up 28%', detail: 'Ancillary spend on experiences grew 28% network-wide. Properties offering 3+ experiences see 41% higher guest LTV.', impact: '+28% YoY', trend: 28 },
  { id: 'dci-5', title: 'August peak demand confirmed', detail: 'August is the network\'s highest-demand month (88 demand index). Properties should lock rates 90 days out.', impact: 'Peak season', trend: 0 },
  { id: 'dci-6', title: 'Repeat-guest rate correlates with response speed', detail: 'Properties responding under 15 min have 42% higher repeat rates. AI concierge is the lever.', impact: '+42% repeat', trend: 0 },
]

export const DATA_CLOUD_STATS = {
  properties: 5247,
  bookingsAnalyzed: 4180000,
  regions: 23,
  insights: 14820,
  dataPoints: 184_000_000,
  premium: true,
}

// ===================== HOSPITALITY API PLATFORM =====================
export interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WEBHOOK'
  path: string
  description: string
  category: string
  auth: boolean
  calls: number
}

export const API_ENDPOINTS: APIEndpoint[] = [
  { id: 'api-1', method: 'GET', path: '/v1/reservations', description: 'List all reservations with filters (date, source, status)', category: 'Reservations', auth: true, calls: 184000 },
  { id: 'api-2', method: 'POST', path: '/v1/reservations', description: 'Create a new reservation', category: 'Reservations', auth: true, calls: 92000 },
  { id: 'api-3', method: 'GET', path: '/v1/guests/:id', description: 'Get a guest profile with CRM data + timeline', category: 'Guest Profiles', auth: true, calls: 142000 },
  { id: 'api-4', method: 'PUT', path: '/v1/guests/:id', description: 'Update guest profile / loyalty tier', category: 'Guest Profiles', auth: true, calls: 38000 },
  { id: 'api-5', method: 'GET', path: '/v1/pricing/rooms/:id', description: 'Get current + suggested pricing for a room', category: 'Pricing', auth: true, calls: 68000 },
  { id: 'api-6', method: 'PUT', path: '/v1/pricing/rooms/:id', description: 'Update room rate (triggers OTA sync)', category: 'Pricing', auth: true, calls: 41000 },
  { id: 'api-7', method: 'GET', path: '/v1/availability', description: 'Check availability across date range', category: 'Availability', auth: true, calls: 286000 },
  { id: 'api-8', method: 'GET', path: '/v1/loyalty/guests/:id', description: 'Get loyalty points + tier + redemption history', category: 'Loyalty', auth: true, calls: 54000 },
  { id: 'api-9', method: 'POST', path: '/v1/payments/charge', description: 'Charge a guest via PaySwap', category: 'Payments', auth: true, calls: 124000 },
  { id: 'api-10', method: 'POST', path: '/v1/payments/payout', description: 'Send a payout (supplier, staff, refund)', category: 'Payments', auth: true, calls: 48000 },
  { id: 'api-11', method: 'WEBHOOK', path: '/v1/events/guest.booked', description: 'Fired when a guest books', category: 'Events', auth: true, calls: 184000 },
  { id: 'api-12', method: 'WEBHOOK', path: '/v1/events/guest.checked_out', description: 'Fired when a guest checks out', category: 'Events', auth: true, calls: 142000 },
  { id: 'api-13', method: 'WEBHOOK', path: '/v1/events/review.received', description: 'Fired when a review is posted', category: 'Events', auth: true, calls: 42000 },
  { id: 'api-14', method: 'WEBHOOK', path: '/v1/events/opportunity.detected', description: 'Fired when AI detects a revenue opportunity', category: 'Events', auth: true, calls: 38000 },
  { id: 'api-15', method: 'POST', path: '/v1/missions', description: 'Create or trigger an AI mission', category: 'AI Missions', auth: true, calls: 12000 },
  { id: 'api-16', method: 'GET', path: '/v1/missions/:id', description: 'Get mission status + progress', category: 'AI Missions', auth: true, calls: 28000 },
]

export const API_CATEGORIES = ['Reservations', 'Guest Profiles', 'Pricing', 'Availability', 'Loyalty', 'Payments', 'Events', 'AI Missions']

export const API_APPS = [
  { id: 'app-1', name: 'StayPilot Mobile (Owner)', developer: 'StayPilot', description: 'iOS/Android owner app — approve missions, monitor goals, chat with agents.', icon: '📱', installs: 4200 },
  { id: 'app-2', name: 'Guest WhatsApp Bot', developer: 'StayPilot', description: 'Guest-facing WhatsApp concierge built on the events API.', icon: '💬', installs: 2800 },
  { id: 'app-3', name: 'QuickBooks Sync', developer: 'Intuit', description: 'Auto-sync revenue, expenses, and payouts to QuickBooks.', icon: '📊', installs: 1800 },
  { id: 'app-4', name: 'Mailchimp Bridge', developer: 'Mailchimp', description: 'Sync guest segments to Mailchimp audiences for email campaigns.', icon: '✉️', installs: 940 },
  { id: 'app-5', name: 'Custom Analytics Dashboard', developer: 'DataStudio', description: 'Build custom dashboards on StayPilot data via the APIs.', icon: '📈', installs: 620 },
]

// ===================== TREASURY / DEEPENED FINANCIAL LAYER =====================
export interface TreasuryAccount {
  id: string
  name: string
  type: 'operating' | 'escrow' | 'savings' | 'financing'
  balance: number
  currency: string
  property: string
  apy?: number
}

export const TREASURY_ACCOUNTS: TreasuryAccount[] = [
  { id: 'ta-1', name: 'Akwaaba Operating', type: 'operating', balance: 184200, currency: 'GHS', property: 'Akwaaba Boutique Lodge' },
  { id: 'ta-2', name: 'Coconut Bay Operating', type: 'operating', balance: 142800, currency: 'GHS', property: 'Coconut Bay Boutique' },
  { id: 'ta-3', name: 'Volta Lakeside Operating', type: 'operating', balance: 88400, currency: 'GHS', property: 'Volta Lakeside Lodge' },
  { id: 'ta-4', name: 'Network Escrow Holdings', type: 'escrow', balance: 28400, currency: 'GHS', property: 'All properties' },
  { id: 'ta-5', name: 'Reserve Savings', type: 'savings', balance: 320000, currency: 'GHS', property: 'Portfolio', apy: 8.5 },
  { id: 'ta-6', name: 'PaySwap Credit Line', type: 'financing', balance: -120000, currency: 'GHS', property: 'Portfolio', apy: 9.5 },
]

export const PAYOUT_ORCHESTRATION = [
  { id: 'po-1', recipient: 'SparkleClean Pro', type: 'Supplier', amount: 2400, scheduled: 'Tomorrow', status: 'Scheduled', method: 'PaySwap' },
  { id: 'po-2', recipient: 'Akua (Housekeeping)', type: 'Staff payroll', amount: 3200, scheduled: 'Friday', status: 'Scheduled', method: 'PaySwap' },
  { id: 'po-3', recipient: 'AkwaabaTransfers', type: 'Supplier', amount: 1820, scheduled: 'Today', status: 'Processing', method: 'PaySwap' },
  { id: 'po-4', recipient: 'MTN Ghana (corp rebate)', type: 'Corporate rebate', amount: 4200, scheduled: 'Mon', status: 'Pending approval', method: 'Bank' },
  { id: 'po-5', recipient: 'Booking.com (commission)', type: 'OTA commission', amount: 15900, scheduled: 'Auto-deducted', status: 'Reconciled', method: 'OTA' },
]

export const FINANCING_OFFERS = [
  { id: 'fo-1', name: 'Working capital', amount: 120000, apr: 9.5, term: '24 months', payment: 5500, useCase: 'Any business purpose', basedOn: '6-month cash flow', chance: 94 },
  { id: 'fo-2', name: 'Property improvement', amount: 280000, apr: 8.2, term: '36 months', payment: 8800, useCase: 'Renovations, pool, solar', basedOn: 'Property + cash flow', chance: 88 },
  { id: 'fo-3', name: 'Revenue-based advance', amount: 80000, apr: 12.0, term: '12 months', payment: '9% of monthly revenue', useCase: 'Fast capital, no fixed payment', basedOn: 'Booking pipeline', chance: 96 },
  { id: 'fo-4', name: 'Supplier financing', amount: 45000, apr: 7.5, term: '6 months', payment: 7800, useCase: 'Bulk inventory purchases', basedOn: 'Supplier history', chance: 92 },
  { id: 'fo-5', name: 'New acquisition', amount: 850000, apr: 11.5, term: '60 months', payment: 18600, useCase: 'Acquire a new property', basedOn: 'Portfolio performance', chance: 71 },
]

export const TREASURY_FLOWS = [
  { id: 'tf-1', flow: 'Booking revenue → Operating', volume: 486000, share: 62, icon: '🛎️' },
  { id: 'tf-2', flow: 'Ancillary revenue → Operating', volume: 64200, share: 8, icon: '🗺️' },
  { id: 'tf-3', flow: 'Operating → Reserve (auto-sweep)', volume: 48000, share: 6, icon: '🏦' },
  { id: 'tf-4', flow: 'Operating → Escrow (long stays)', volume: 28400, share: 4, icon: '🔐' },
  { id: 'tf-5', flow: 'Operating → Payouts (suppliers/staff)', volume: 38600, share: 5, icon: '💸' },
  { id: 'tf-6', flow: 'Credit line → Operating', volume: 120000, share: 15, icon: '💳' },
]

// ===================== HOSPITALITY GRAPH (network-wide) =====================
export interface GraphEntity {
  id: string
  name: string
  type: 'property' | 'guest' | 'company' | 'family' | 'event' | 'airline' | 'attraction' | 'restaurant' | 'transport' | 'influencer' | 'business'
  network: number // how many connections
  category: string
}

export const NETWORK_GRAPH_ENTITIES = [
  { id: 'ge-1', name: 'Akwaaba Boutique Lodge', type: 'property', network: 42, category: 'Your property' },
  { id: 'ge-2', name: 'Coconut Bay Boutique', type: 'property', network: 38, category: 'Network property' },
  { id: 'ge-3', name: 'MTN Ghana', type: 'company', network: 18, category: 'Corporate client' },
  { id: 'ge-4', name: 'AICC Tech Conference', type: 'event', network: 96, category: 'Demand driver' },
  { id: 'ge-5', name: 'Africa World Airlines', type: 'airline', network: 124, category: 'Arrival channel' },
  { id: 'ge-6', name: 'Cape Coast Castle', type: 'attraction', network: 218, category: 'Experience' },
  { id: 'ge-7', name: 'Buka Restaurant', type: 'restaurant', network: 142, category: 'Dining partner' },
  { id: 'ge-8', name: 'RideGH Transfers', type: 'transport', network: 184, category: 'Transport partner' },
  { id: 'ge-9', name: '@AccraEats (48K)', type: 'influencer', network: 64, category: 'Marketing partner' },
  { id: 'ge-10', name: 'East Legon Business Assoc.', type: 'business', network: 88, category: 'Local business' },
]

// ===================== POSITIONING (the product family) =====================
export const PRODUCT_FAMILY = [
  { id: 'pf-1', name: 'StayPilot Revenue AI', icon: '📈', description: 'The autonomous revenue engine + outcome-based goals + AI workforce.', status: 'Live' },
  { id: 'pf-2', name: 'StayPilot Network', icon: '🌐', description: '5,247 properties sharing anonymous intelligence + cross-property referrals.', status: 'Live' },
  { id: 'pf-3', name: 'StayPilot Payments', icon: '💳', description: 'PaySwap-powered financial layer: checkout, escrow, payouts, wallets, financing.', status: 'Live' },
  { id: 'pf-4', name: 'StayPilot Marketplace', icon: '🛍️', description: 'AI capabilities, digital employees, and service providers — one-click install.', status: 'Live' },
  { id: 'pf-5', name: 'StayPilot Intelligence Cloud', icon: '☁️', description: 'Anonymized analytics platform — regional benchmarks, seasonal trends, lead times.', status: 'Live' },
  { id: 'pf-6', name: 'StayPilot APIs', icon: '🔌', description: 'Reservations, guests, pricing, payments, events, missions — build on StayPilot.', status: 'Live' },
  { id: 'pf-7', name: 'StayPilot AI Workforce', icon: '🤖', description: '12 specialist agents + hireable digital employees for every hospitality vertical.', status: 'Live' },
]
