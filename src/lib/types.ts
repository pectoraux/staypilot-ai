// StayPilot AI — Core domain types
// Shared across all modules.

export type UserRole =
  | 'Owner'
  | 'Manager'
  | 'Receptionist'
  | 'Marketing Manager'
  | 'Housekeeping'
  | 'Admin'

export type BookingSource =
  | 'Airbnb'
  | 'Booking.com'
  | 'Expedia'
  | 'Agoda'
  | 'Vrbo'
  | 'Direct Website'
  | 'Walk-in'
  | 'Phone'
  | 'WhatsApp'
  | 'Facebook'
  | 'Instagram'
  | 'Email'
  | 'Corporate'
  | 'Referral'

export type ReservationStatus =
  | 'Confirmed'
  | 'Checked-in'
  | 'Checked-out'
  | 'Pending'
  | 'Cancelled'
  | 'No-show'

export type RoomStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance' | 'Blocked'

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Family' | 'Executive' | 'Penthouse'

export interface Room {
  id: string
  number: string
  name: string
  type: RoomType
  floor: number
  capacity: number
  baseRate: number
  status: RoomStatus
  amenities: string[]
}

export interface Reservation {
  id: string
  guestId: string
  guestName: string
  roomIds: string[]
  checkIn: string // ISO date
  checkOut: string // ISO date
  status: ReservationStatus
  source: BookingSource
  adults: number
  children: number
  grossRevenue: number
  commission: number
  netRevenue: number
  acquisitionCost: number
  campaign?: string
  coupon?: string
  notes?: string
  createdAt: string
}

export type GuestSegment =
  | 'Corporate Traveler'
  | 'Leisure'
  | 'Family'
  | 'International Tourist'
  | 'Weekend Traveler'
  | 'Long-stay Guest'
  | 'High Spender'
  | 'Birthday'
  | 'Anniversary'

export interface Guest {
  id: string
  name: string
  phone: string
  email: string
  country: string
  countryCode: string
  language: string
  bookingSource: BookingSource
  lifetimeSpend: number
  totalStays: number
  favoriteRoom?: string
  specialRequests?: string
  birthday?: string
  anniversary?: string
  travelReason: 'Business' | 'Leisure' | 'Family' | 'Medical' | 'Relocation'
  familyMembers?: number
  dietaryPreferences?: string
  avgRatingGiven?: number
  repeatVisits: number
  referralSource?: string
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'VIP'
  loyaltyPoints: number
  segments: GuestSegment[]
  tags: string[]
  lastStay?: string
  firstSeen: string
  avatarColor: string
}

export type TimelineEntryType =
  | 'Reservation'
  | 'WhatsApp'
  | 'Email'
  | 'Phone Call'
  | 'Payment'
  | 'Review'
  | 'Complaint'
  | 'Special Request'
  | 'Campaign'
  | 'Recommendation'
  | 'Check-in'
  | 'Check-out'

export interface TimelineEntry {
  id: string
  guestId: string
  type: TimelineEntryType
  title: string
  description: string
  date: string
  channel?: BookingSource | 'WhatsApp' | 'Email' | 'Phone'
  sentiment?: 'positive' | 'neutral' | 'negative'
  value?: number
}

export interface Campaign {
  id: string
  name: string
  status: 'Draft' | 'Scheduled' | 'Active' | 'Completed'
  channel: BookingSource | 'WhatsApp' | 'SMS' | 'Email' | 'Facebook' | 'Instagram' | 'Push'
  audience: string
  audienceSize: number
  message: string
  discount?: number
  sentAt?: string
  scheduledFor?: string
  opens: number
  clicks: number
  conversions: number
  revenue: number
  expectedOccupancyLift?: number
  aiGenerated: boolean
}

export interface Review {
  id: string
  platform: 'Google' | 'Booking.com' | 'Airbnb' | 'Facebook' | 'TripAdvisor'
  guestName: string
  rating: number
  text: string
  date: string
  sentiment: 'positive' | 'neutral' | 'negative'
  responded: boolean
  response?: string
}

export interface Competitor {
  id: string
  name: string
  distance: number
  avgRate: number
  occupancy: number
  rating: number
  reviewCount: number
  amenities: string[]
  rank: number
}

export interface MaintenanceIssue {
  id: string
  roomNumber: string
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Resolved'
  assignedTo?: string
  estimatedCost: number
  createdAt: string
  resolvedAt?: string
}

export interface HousekeepingTask {
  id: string
  roomNumber: string
  type: 'Cleaning' | 'Inspection' | 'Lost & Found' | 'Restock'
  status: 'Pending' | 'In Progress' | 'Done'
  assignedTo: string
  priority: 'Low' | 'Medium' | 'High'
  notes?: string
  dueTime: string
}

export interface CorporateAccount {
  id: string
  name: string
  type: 'Company' | 'Travel Agency' | 'Government' | 'NGO' | 'School' | 'Event Organizer'
  contact: string
  phone: string
  negotiatedRate: number
  contractEnd: string
  totalBookings: number
  totalRevenue: number
  status: 'Active' | 'Negotiating' | 'Expired'
}

export interface Experience {
  id: string
  name: string
  category: 'Airport Pickup' | 'Tour' | 'Laundry' | 'Meal' | 'Spa' | 'Car Rental' | 'Event' | 'Conference'
  price: number
  bookingsThisMonth: number
  revenueThisMonth: number
  rating: number
  imageColor: string
}

export interface AIAgent {
  id: string
  name: string
  role: string
  status: 'Active' | 'Idle' | 'Working'
  avatar: string
  lastAction: string
  tasksCompleted: number
  color: string
  description: string
}

export interface AIRecommendation {
  id: string
  type: 'occupancy' | 'pricing' | 'marketing' | 'retention' | 'conversion' | 'reputation'
  priority: 'High' | 'Medium' | 'Low'
  title: string
  detail: string
  action: string
  impact: string
  agentId: string
}

export interface PricingSuggestion {
  roomId: string
  roomName: string
  date: string
  currentRate: number
  suggestedRate: number
  changePct: number
  reason: string
  confidence: number
  factors: string[]
}

export interface FinancialMetric {
  month: string
  revenue: number
  expenses: number
  otaCommission: number
  profit: number
}

export interface Insight {
  id: string
  date: string
  category: 'Forecast' | 'Trend' | 'Threat' | 'Opportunity' | 'Pricing'
  title: string
  detail: string
  severity: 'info' | 'warning' | 'critical' | 'success'
  action?: string
}
