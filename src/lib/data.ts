// StayPilot AI — Rich mock dataset for a boutique guest house in Accra, Ghana.
// Reservations are generated relative to "today" so the calendar is always live.
import type {
  Room, Reservation, Guest, TimelineEntry, Campaign, Review, Competitor,
  MaintenanceIssue, HousekeepingTask, CorporateAccount, Experience, AIAgent,
  AIRecommendation, PricingSuggestion, FinancialMetric, Insight, BookingSource,
} from './types'

// Deterministic pseudo-random for stable rendering
let _seed = 42
function rand() {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff
  return _seed / 0x7fffffff
}
function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)] }
function randInt(min: number, max: number) { return Math.floor(rand() * (max - min + 1)) + min }
function daysFromNow(n: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function daysAgo(n: number): string { return daysFromNow(-n) }

// ---------- PROPERTY ----------
export const PROPERTY = {
  name: 'Akwaaba Boutique Lodge',
  location: 'East Legon, Accra, Ghana',
  roomsTotal: 18,
  currency: 'GHS',
  currencySymbol: '₵',
  established: 2019,
  tagline: 'Where every guest feels at home',
}

// ---------- ROOMS ----------
const ROOM_DEFS: Array<Omit<Room, 'id' | 'status'>> = [
  { number: '101', name: 'Baobab Standard', type: 'Standard', floor: 1, capacity: 2, baseRate: 450, amenities: ['WiFi', 'AC', 'TV', 'Breakfast'] },
  { number: '102', name: 'Savannah Standard', type: 'Standard', floor: 1, capacity: 2, baseRate: 450, amenities: ['WiFi', 'AC', 'TV', 'Breakfast'] },
  { number: '103', name: 'Lagoon Deluxe', type: 'Deluxe', floor: 1, capacity: 2, baseRate: 620, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar'] },
  { number: '104', name: 'Mango Deluxe', type: 'Deluxe', floor: 1, capacity: 3, baseRate: 620, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar'] },
  { number: '201', name: 'Sunset Suite', type: 'Suite', floor: 2, capacity: 2, baseRate: 950, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar', 'Balcony'] },
  { number: '202', name: 'Sunrise Suite', type: 'Suite', floor: 2, capacity: 2, baseRate: 950, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar', 'Balcony'] },
  { number: '203', name: 'Harmattan Family', type: 'Family', floor: 2, capacity: 4, baseRate: 1100, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar', 'Kitchenette'] },
  { number: '204', name: 'Rainforest Family', type: 'Family', floor: 2, capacity: 4, baseRate: 1100, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar', 'Kitchenette'] },
  { number: '301', name: 'Executive Gold', type: 'Executive', floor: 3, capacity: 2, baseRate: 1350, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar', 'Lounge', 'Workspace'] },
  { number: '302', name: 'Executive Platinum', type: 'Executive', floor: 3, capacity: 2, baseRate: 1350, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar', 'Lounge', 'Workspace'] },
  { number: '303', name: 'Penthouse Sky', type: 'Penthouse', floor: 3, capacity: 4, baseRate: 2200, amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Mini-bar', 'Lounge', 'Workspace', 'Jacuzzi', 'Terrace'] },
]

export const ROOMS: Room[] = ROOM_DEFS.map((r, i) => ({
  ...r,
  id: `room-${r.number}`,
  status: i % 7 === 0 ? 'Maintenance' : i % 5 === 0 ? 'Cleaning' : i % 3 === 0 ? 'Occupied' : 'Available',
}))

// ---------- GUESTS ----------
const FIRST_NAMES = ['Kwame', 'Ama', 'Kofi', 'Akosua', 'Yaw', 'Adwoa', 'Kwabena', 'Abena', 'Chen', 'Mei', 'Liang', 'Sarah', 'James', 'Emily', 'David', 'Fatima', 'Omar', 'Aisha', 'Lerato', 'Thabo', 'Ngozi', 'Emeka', 'Priya', 'Raj', 'Anika', 'Daniel', 'Sophie', 'Marcus', 'Linda', 'Tomás', 'Isabella', 'Yuki', 'Hiroshi', 'Zara', 'Ibrahim']
const LAST_NAMES = ['Mensah', 'Boateng', 'Asante', 'Owusu', 'Annor', 'Dartey', 'Liu', 'Wang', 'Zhang', 'Smith', 'Brown', 'Johnson', 'Hassan', 'Diop', 'Mbeki', 'Nkosi', 'Patel', 'Kumar', 'Sharma', 'Müller', 'Schmidt', 'Rossi', 'Tanaka', 'Yamamoto', 'Costa', 'Silva']
const COUNTRIES = [
  { name: 'Ghana', code: 'GH', lang: 'English' },
  { name: 'Nigeria', code: 'NG', lang: 'English' },
  { name: 'South Africa', code: 'ZA', lang: 'English' },
  { name: 'Kenya', code: 'KE', lang: 'English' },
  { name: 'United Kingdom', code: 'GB', lang: 'English' },
  { name: 'United States', code: 'US', lang: 'English' },
  { name: 'Germany', code: 'DE', lang: 'German' },
  { name: 'China', code: 'CN', lang: 'Mandarin' },
  { name: 'India', code: 'IN', lang: 'Hindi' },
  { name: 'France', code: 'FR', lang: 'French' },
  { name: 'Canada', code: 'CA', lang: 'English' },
  { name: 'Côte d\u2019Ivoire', code: 'CI', lang: 'French' },
]
const AVATAR_COLORS = ['#c2410c', '#0d9488', '#b45309', '#9333ea', '#be123c', '#15803d', '#a16207', '#0e7490']
const SOURCES: BookingSource[] = ['Airbnb', 'Booking.com', 'Direct Website', 'WhatsApp', 'Walk-in', 'Phone', 'Expedia', 'Corporate', 'Referral', 'Instagram', 'Facebook', 'Agoda']
const TIERS: Array<Guest['loyaltyTier']> = ['Bronze', 'Silver', 'Gold', 'VIP']
const SEGMENTS: Guest['segments'] = ['Corporate Traveler', 'Leisure', 'Family', 'International Tourist', 'Weekend Traveler', 'Long-stay Guest', 'High Spender', 'Birthday', 'Anniversary']

function genGuest(i: number): Guest {
  const first = FIRST_NAMES[i % FIRST_NAMES.length]
  const last = LAST_NAMES[(i * 3) % LAST_NAMES.length]
  const country = COUNTRIES[i % COUNTRIES.length]
  const stays = randInt(1, 12)
  const lifetime = stays * randInt(450, 2400)
  const tier = stays > 8 ? 'VIP' : stays > 5 ? 'Gold' : stays > 2 ? 'Silver' : 'Bronze'
  const segments: Guest['segments'][] = []
  if (country.code !== 'GH') segments.push('International Tourist')
  if (stays > 4) segments.push('High Spender')
  segments.push(pick(['Corporate Traveler', 'Leisure', 'Family', 'Weekend Traveler', 'Long-stay Guest']))
  if (i % 7 === 0) segments.push('Birthday')
  if (i % 11 === 0) segments.push('Anniversary')
  const source = SOURCES[i % SOURCES.length]
  return {
    id: `guest-${i + 1}`,
    name: `${first} ${last}`,
    phone: `+${randInt(1, 99)} ${randInt(1000000000, 9999999999)}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    country: country.name,
    countryCode: country.code,
    language: country.lang,
    bookingSource: source,
    lifetimeSpend: lifetime,
    totalStays: stays,
    favoriteRoom: pick(ROOMS).name,
    specialRequests: pick(['Extra pillows', 'Late checkout', 'Ground floor', 'Quiet room', 'Vegetarian meals', 'Airport pickup', 'High floor', 'Crib needed', '']),
    birthday: `${String(randInt(1, 28)).padStart(2, '0')}-${String(randInt(1, 12)).padStart(2, '0')}`,
    anniversary: i % 4 === 0 ? `${String(randInt(1, 28)).padStart(2, '0')}-${String(randInt(1, 12)).padStart(2, '0')}` : undefined,
    travelReason: pick(['Business', 'Leisure', 'Family', 'Medical', 'Relocation']),
    familyMembers: i % 3 === 0 ? randInt(1, 3) : 0,
    dietaryPreferences: pick(['None', 'Vegetarian', 'Halal', 'Vegan', 'Gluten-free', '']),
    avgRatingGiven: Number((3.5 + rand() * 1.5).toFixed(1)),
    repeatVisits: Math.max(0, stays - 1),
    referralSource: i % 5 === 0 ? pick(['Friend', 'Google', 'Instagram', 'Returning guest', 'Corporate']) : undefined,
    loyaltyTier: tier,
    loyaltyPoints: stays * randInt(100, 400),
    segments: Array.from(new Set(segments)),
    tags: pick([['repeat', 'high-value'], ['new', 'direct'], ['ota', 'one-time'], ['vip', 'referral'], ['family'], ['business'], ['international'], []]),
    lastStay: daysAgo(randInt(5, 400)),
    firstSeen: daysAgo(randInt(60, 900)),
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }
}
export const GUESTS: Guest[] = Array.from({ length: 64 }, (_, i) => genGuest(i))

// ---------- RESERVATIONS ----------
const STATUS_WEIGHTS: Array<[Reservation['status'], number]> = [
  ['Checked-out', 45], ['Confirmed', 30], ['Checked-in', 12], ['Cancelled', 8], ['Pending', 3], ['No-show', 2],
]
function weightedStatus(): Reservation['status'] {
  const total = STATUS_WEIGHTS.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [st, w] of STATUS_WEIGHTS) { if ((r -= w) <= 0) return st }
  return 'Confirmed'
}
function nightsRate(room: Room, nights: number) { return room.baseRate * nights }

function genReservation(i: number): Reservation {
  const room = ROOMS[i % ROOMS.length]
  const guest = GUESTS[i % GUESTS.length]
  // spread reservations across -60..+45 days
  const startOffset = randInt(-60, 45)
  const nights = randInt(1, 6)
  const checkIn = daysFromNow(startOffset)
  const checkOut = daysFromNow(startOffset + nights)
  const source = guest.bookingSource
  const status = weightedStatus()
  const commissionRate = source === 'Airbnb' ? 0.15 : source === 'Booking.com' ? 0.15 : source === 'Expedia' ? 0.18 : source === 'Agoda' ? 0.17 : source === 'Vrbo' ? 0.1 : 0
  const gross = Math.round(nightsRate(room, nights) * (0.9 + rand() * 0.3))
  const commission = Math.round(gross * commissionRate)
  const acqCost = commissionRate > 0 ? Math.round(gross * (0.02 + rand() * 0.04)) : 0
  return {
    id: `res-${i + 1}`,
    guestId: guest.id,
    guestName: guest.name,
    roomIds: [room.id],
    checkIn, checkOut,
    status,
    source,
    adults: randInt(1, 2),
    children: rand() > 0.7 ? randInt(1, 2) : 0,
    grossRevenue: gross,
    commission,
    netRevenue: gross - commission,
    acquisitionCost: acqCost,
    campaign: rand() > 0.7 ? pick(['Ramadan Promo', 'Weekend Flash Sale', 'Corporate Q4', 'Loyalty Reboot', 'Christmas Repeat']) : undefined,
    coupon: rand() > 0.85 ? pick(['STAY10', 'DIRECT15', 'WELCOME', 'VIPBACK']) : undefined,
    notes: rand() > 0.7 ? pick(['Needs airport pickup', 'Celebrating anniversary', 'Business meeting nearby', 'First time in Accra', '']) : '',
    createdAt: daysAgo(randInt(1, 60)),
  }
}
export const RESERVATIONS: Reservation[] = Array.from({ length: 120 }, (_, i) => genReservation(i))

// ---------- TIMELINE (for a sample guest) ----------
export function timelineForGuest(guestId: string): TimelineEntry[] {
  const guest = GUESTS.find(g => g.id === guestId)
  if (!guest) return []
  const res = RESERVATIONS.filter(r => r.guestId === guestId).sort((a, b) => a.checkIn.localeCompare(b.checkIn))
  const entries: TimelineEntry[] = []
  res.forEach((r, idx) => {
    entries.push({ id: `${guestId}-res-${idx}`, guestId, type: 'Reservation', title: `Booked ${ROOMS.find(rm => rm.id === r.roomIds[0])?.name ?? 'a room'}`, description: `${r.nights ?? ''} ${r.source} · ₵${r.grossRevenue.toLocaleString()}`, date: r.createdAt, channel: r.source, value: r.grossRevenue })
    if (r.status === 'Checked-out' || r.status === 'Checked-in') {
      entries.push({ id: `${guestId}-ci-${idx}`, guestId, type: 'Check-in', title: 'Checked in', description: `Room ${ROOMS.find(rm => rm.id === r.roomIds[0])?.number}`, date: r.checkIn })
    }
    if (r.status === 'Checked-out') {
      entries.push({ id: `${guestId}-co-${idx}`, guestId, type: 'Check-out', title: 'Checked out', description: 'Stay completed', date: r.checkOut })
    }
    if (r.commission > 0) {
      entries.push({ id: `${guestId}-pay-${idx}`, guestId, type: 'Payment', title: 'Payment received', description: `₵${r.grossRevenue.toLocaleString()} via ${r.source}`, date: r.createdAt, value: r.grossRevenue })
    }
  })
  entries.push({ id: `${guestId}-wa`, guestId, type: 'WhatsApp', title: 'WhatsApp inquiry', description: 'Asked about airport pickup and early check-in', date: daysAgo(randInt(1, 30)), channel: 'WhatsApp', sentiment: 'neutral' })
  entries.push({ id: `${guestId}-email`, guestId, type: 'Email', title: 'Welcome email sent', description: 'Sent booking confirmation and local guide', date: daysAgo(randInt(1, 20)), channel: 'Email', sentiment: 'positive' })
  if (guest.avgRatingGiven && guest.avgRatingGiven >= 4) {
    entries.push({ id: `${guestId}-rev`, guestId, type: 'Review', title: `Left a ${guest.avgRatingGiven}★ review`, description: pick(['"Lovely staff, great location!"', '"Felt like home, will return."', '"Clean and comfortable, highly recommend."']), date: daysAgo(randInt(1, 60)), sentiment: 'positive' })
  }
  entries.push({ id: `${guestId}-camp`, guestId, type: 'Campaign', title: 'Added to "Loyalty Reboot" campaign', description: 'Targeted as lapsed high-value guest', date: daysAgo(randInt(1, 15)) })
  entries.sort((a, b) => b.date.localeCompare(a.date))
  return entries
}

// ---------- CAMPAIGNS ----------
export const CAMPAIGNS: Campaign[] = [
  { id: 'camp-1', name: 'Weekend Flash Sale', status: 'Active', channel: 'WhatsApp', audience: 'Lapsed guests (6-12 months)', audienceSize: 48, message: 'Hi {name}! We miss you at Akwaaba Lodge. Enjoy 20% off this weekend — your favorite room is waiting. 🌴', discount: 20, sentAt: daysAgo(1), opens: 39, clicks: 22, conversions: 7, revenue: 14200, expectedOccupancyLift: 12, aiGenerated: true },
  { id: 'camp-2', name: 'Christmas Repeat Offer', status: 'Scheduled', channel: 'Email', audience: 'Guests who stayed last Christmas', audienceSize: 23, message: 'Celebrate the holidays with us again! Book your Christmas stay by Nov 30 for a free festive dinner.', discount: 15, scheduledFor: daysFromNow(3), opens: 0, clicks: 0, conversions: 0, revenue: 0, expectedOccupancyLift: 8, aiGenerated: true },
  { id: 'camp-3', name: 'Corporate Q4 Outreach', status: 'Active', channel: 'Email', audience: 'Corporate travelers', audienceSize: 34, message: 'Planning year-end travel? Lock in our corporate rate of ₵1,150/night with complimentary breakfast.', discount: 10, sentAt: daysAgo(4), opens: 28, clicks: 15, conversions: 5, revenue: 28750, expectedOccupancyLift: 9, aiGenerated: true },
  { id: 'camp-4', name: 'Birthday Reward', status: 'Active', channel: 'SMS', audience: 'Upcoming birthdays', audienceSize: 12, message: 'Happy birthday month, {name}! Enjoy a free night upgrade on your next stay. 🎂', discount: 0, sentAt: daysAgo(2), opens: 11, clicks: 9, conversions: 3, revenue: 6800, aiGenerated: true },
  { id: 'camp-5', name: 'Instagram Story Promo', status: 'Completed', channel: 'Instagram', audience: 'Followers near Accra', audienceSize: 1850, message: 'Tag someone you\u2019d bring to Akwaaba Lodge and win a free weekend!', discount: 0, sentAt: daysAgo(20), opens: 1240, clicks: 180, conversions: 11, revenue: 22100, expectedOccupancyLift: 6, aiGenerated: false },
  { id: 'camp-6', name: 'Loyalty Reboot', status: 'Scheduled', channel: 'WhatsApp', audience: 'VIP & Gold lapsed 90+ days', audienceSize: 18, message: 'As a {tier} member, enjoy 25% off + late checkout. Your points miss you!', discount: 25, scheduledFor: daysFromNow(1), opens: 0, clicks: 0, conversions: 0, revenue: 0, expectedOccupancyLift: 14, aiGenerated: true },
]

// ---------- REVIEWS ----------
export const REVIEWS: Review[] = [
  { id: 'rev-1', platform: 'Google', guestName: 'Sarah Johnson', rating: 5, text: 'Absolutely loved my stay! The staff went above and beyond, and the breakfast was incredible. Will definitely return.', date: daysAgo(2), sentiment: 'positive', responded: true, response: 'Thank you Sarah! We can\u2019t wait to welcome you back. 🌟' },
  { id: 'rev-2', platform: 'Booking.com', guestName: 'Chen Wei', rating: 4, text: 'Clean rooms and great location. WiFi could be a bit faster but overall a very pleasant stay.', date: daysAgo(4), sentiment: 'positive', responded: false },
  { id: 'rev-3', platform: 'Airbnb', guestName: 'Marcus Brown', rating: 5, text: 'Felt like home. The concierge helped me book a tour to Cape Coast — unforgettable!', date: daysAgo(5), sentiment: 'positive', responded: true, response: 'So glad you enjoyed the tour, Marcus! 🙌' },
  { id: 'rev-4', platform: 'TripAdvisor', guestName: 'Fatima Diop', rating: 3, text: 'Nice place but the AC in room 102 was noisy. Staff were friendly though.', date: daysAgo(7), sentiment: 'neutral', responded: false },
  { id: 'rev-5', platform: 'Google', guestName: 'David Schmidt', rating: 5, text: 'Best boutique lodge in East Legon. The penthouse terrace is stunning at sunset.', date: daysAgo(9), sentiment: 'positive', responded: true, response: 'Thank you David! The sunset view is our favorite too. 🌅' },
  { id: 'rev-6', platform: 'Facebook', guestName: 'Linda Costa', rating: 2, text: 'Booked through an OTA and had to wait 40 minutes to check in. Disappointing start.', date: daysAgo(11), sentiment: 'negative', responded: false },
  { id: 'rev-7', platform: 'Booking.com', guestName: 'Priya Sharma', rating: 5, text: 'Excellent value. The family room was spacious and the kids loved the breakfast spread.', date: daysAgo(14), sentiment: 'positive', responded: true, response: 'So happy the kids enjoyed it! 🥞' },
]

// ---------- COMPETITORS ----------
export const COMPETITORS: Competitor[] = [
  { id: 'comp-1', name: 'Golden Tulip Accra', distance: 1.2, avgRate: 980, occupancy: 82, rating: 4.3, reviewCount: 1240, amenities: ['Pool', 'Gym', 'Restaurant', 'Bar'], rank: 1 },
  { id: 'comp-2', name: 'Labadi Beach Hotel', distance: 2.8, avgRate: 1450, occupancy: 76, rating: 4.5, reviewCount: 2100, amenities: ['Pool', 'Beach', 'Spa', 'Restaurant', 'Bar'], rank: 2 },
  { id: 'comp-3', name: 'Ibis Styles Accra', distance: 3.4, avgRate: 720, occupancy: 88, rating: 4.1, reviewCount: 890, amenities: ['Pool', 'Restaurant', 'Gym'], rank: 3 },
  { id: 'comp-4', name: 'Accra City Hotel', distance: 4.1, avgRate: 850, occupancy: 71, rating: 3.9, reviewCount: 560, amenities: ['Pool', 'Restaurant', 'Bar'], rank: 4 },
  { id: 'comp-5', name: 'Kempinski Gold Coast', distance: 5.0, avgRate: 2100, occupancy: 69, rating: 4.7, reviewCount: 1850, amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Casino'], rank: 5 },
]

// ---------- MAINTENANCE ----------
export const MAINTENANCE: MaintenanceIssue[] = [
  { id: 'mnt-1', roomNumber: '102', title: 'Noisy AC unit', description: 'Guest reported rattling noise from AC in room 102. Likely needs fan motor replacement.', priority: 'Medium', status: 'Open', assignedTo: 'Tech Kojo', estimatedCost: 350, createdAt: daysAgo(1) },
  { id: 'mnt-2', roomNumber: '303', title: 'Jacuzzi leak', description: 'Slow leak detected under penthouse jacuzzi. Needs sealing.', priority: 'High', status: 'In Progress', assignedTo: 'Tech Yaw', estimatedCost: 800, createdAt: daysAgo(3) },
  { id: 'mnt-3', roomNumber: '201', title: 'Balcony door lock', description: 'Balcony door lock stiff, hard to open.', priority: 'Low', status: 'Open', estimatedCost: 120, createdAt: daysAgo(2) },
  { id: 'mnt-4', roomNumber: '104', title: 'Shower drain slow', description: 'Water draining slowly in shower.', priority: 'Medium', status: 'Resolved', assignedTo: 'Tech Kojo', estimatedCost: 90, createdAt: daysAgo(10), resolvedAt: daysAgo(7) },
  { id: 'mnt-5', roomNumber: '301', title: 'Flickering light', description: 'Bathroom light flickers intermittently.', priority: 'Low', status: 'Open', estimatedCost: 60, createdAt: daysAgo(0) },
]

// ---------- HOUSEKEEPING ----------
export const HOUSEKEEPING: HousekeepingTask[] = [
  { id: 'hk-1', roomNumber: '101', type: 'Cleaning', status: 'Done', assignedTo: 'Grace', priority: 'Medium', dueTime: '09:00', notes: 'Check-out clean' },
  { id: 'hk-2', roomNumber: '203', type: 'Cleaning', status: 'In Progress', assignedTo: 'Akua', priority: 'High', dueTime: '11:00', notes: 'Family checkout, extra time' },
  { id: 'hk-3', roomNumber: '302', type: 'Inspection', status: 'Pending', assignedTo: 'Supervisor Adwoa', priority: 'Medium', dueTime: '13:00' },
  { id: 'hk-4', roomNumber: '104', type: 'Cleaning', status: 'Pending', assignedTo: 'Grace', priority: 'Medium', dueTime: '14:00' },
  { id: 'hk-5', roomNumber: '202', type: 'Lost & Found', status: 'Pending', assignedTo: 'Reception', priority: 'Low', notes: 'Phone charger left behind', dueTime: '15:00' },
  { id: 'hk-6', roomNumber: '303', type: 'Cleaning', status: 'Pending', assignedTo: 'Akua', priority: 'High', dueTime: '16:00', notes: 'Penthouse turnover' },
  { id: 'hk-7', roomNumber: '102', type: 'Restock', status: 'Done', assignedTo: 'Grace', priority: 'Low', dueTime: '10:00' },
]

// ---------- CORPORATE ----------
export const CORPORATE: CorporateAccount[] = [
  { id: 'corp-1', name: 'MTN Ghana', type: 'Company', contact: 'Akosua Frimpong', phone: '+233 24 000 1111', negotiatedRate: 1150, contractEnd: daysFromNow(120), totalBookings: 42, totalRevenue: 48300, status: 'Active' },
  { id: 'corp-2', name: 'Zenith Travels', type: 'Travel Agency', contact: 'Tunde Adebayo', phone: '+234 80 222 3333', negotiatedRate: 980, contractEnd: daysFromNow(60), totalBookings: 28, totalRevenue: 27440, status: 'Active' },
  { id: 'corp-3', name: 'UNICEF West Africa', type: 'NGO', contact: 'Maria Gonzalez', phone: '+233 30 555 6666', negotiatedRate: 1050, contractEnd: daysFromNow(200), totalBookings: 19, totalRevenue: 19950, status: 'Active' },
  { id: 'corp-4', name: 'University of Ghana', type: 'School', contact: 'Prof. Owusu', phone: '+233 30 777 8888', negotiatedRate: 720, contractEnd: daysFromNow(30), totalBookings: 15, totalRevenue: 10800, status: 'Negotiating' },
  { id: 'corp-5', name: 'Ministry of Tourism', type: 'Government', contact: 'Hon. Adjei', phone: '+233 30 999 0000', negotiatedRate: 1250, contractEnd: daysAgo(10), totalBookings: 22, totalRevenue: 27500, status: 'Expired' },
]

// ---------- EXPERIENCES ----------
export const EXPERIENCES: Experience[] = [
  { id: 'exp-1', name: 'Airport Pickup (Kotoka)', category: 'Airport Pickup', price: 180, bookingsThisMonth: 34, revenueThisMonth: 6120, rating: 4.8, imageColor: '#0d9488' },
  { id: 'exp-2', name: 'Cape Coast Castle Day Tour', category: 'Tour', price: 450, bookingsThisMonth: 18, revenueThisMonth: 8100, rating: 4.9, imageColor: '#b45309' },
  { id: 'exp-3', name: 'Laundry Service (Daily)', category: 'Laundry', price: 80, bookingsThisMonth: 52, revenueThisMonth: 4160, rating: 4.6, imageColor: '#9333ea' },
  { id: 'exp-4', name: 'Private Chef Dinner', category: 'Meal', price: 650, bookingsThisMonth: 9, revenueThisMonth: 5850, rating: 5.0, imageColor: '#be123c' },
  { id: 'exp-5', name: 'Couples Spa Package', category: 'Spa', price: 520, bookingsThisMonth: 12, revenueThisMonth: 6240, rating: 4.7, imageColor: '#15803d' },
  { id: 'exp-6', name: 'Chauffeured Car (Full Day)', category: 'Car Rental', price: 700, bookingsThisMonth: 7, revenueThisMonth: 4900, rating: 4.8, imageColor: '#a16207' },
  { id: 'exp-7', name: 'Rooftop Event Space', category: 'Event', price: 2500, bookingsThisMonth: 3, revenueThisMonth: 7500, rating: 4.9, imageColor: '#0e7490' },
  { id: 'exp-8', name: 'Conference Room (Half Day)', category: 'Conference', price: 1200, bookingsThisMonth: 5, revenueThisMonth: 6000, rating: 4.5, imageColor: '#c2410c' },
]

// ---------- AI AGENTS ----------
export const AI_AGENTS: AIAgent[] = [
  { id: 'agent-1', name: 'Kofi', role: 'Revenue Manager', status: 'Working', avatar: '💰', lastAction: 'Raised Booking.com rates 8% for next weekend', tasksCompleted: 142, color: '#b45309', description: 'Optimizes nightly pricing, monitors pace, and recommends rate changes across channels.' },
  { id: 'agent-2', name: 'Ama', role: 'Marketing Manager', status: 'Active', avatar: '📣', lastAction: 'Drafted "Weekend Flash Sale" WhatsApp campaign', tasksCompleted: 98, color: '#be123c', description: 'Builds audiences, generates campaigns, and schedules multi-channel sends.' },
  { id: 'agent-3', name: 'Yaw', role: 'Guest Success Manager', status: 'Active', avatar: '🤝', lastAction: 'Sent loyalty reboot to 18 VIP guests', tasksCompleted: 210, color: '#15803d', description: 'Converts OTA guests to direct, manages loyalty, and nurtures repeat bookings.' },
  { id: 'agent-4', name: 'Abena', role: 'Pricing Analyst', status: 'Idle', avatar: '📊', lastAction: 'Competitor scan complete — 3 underpriced nights found', tasksCompleted: 76, color: '#9333ea', description: 'Analyzes competitor rates, seasonality, and demand to tune pricing.' },
  { id: 'agent-5', name: 'Kwabena', role: 'OTA Manager', status: 'Active', avatar: '🔌', lastAction: 'Synced 18 rooms across 5 OTAs — 0 conflicts', tasksCompleted: 540, color: '#0d9488', description: 'Synchronizes calendars and inventory across all booking platforms.' },
  { id: 'agent-6', name: 'Akosua', role: 'Reputation Manager', status: 'Working', avatar: '⭐', lastAction: 'Drafted replies to 2 pending reviews', tasksCompleted: 134, color: '#a16207', description: 'Monitors reviews, analyzes sentiment, and drafts responses.' },
  { id: 'agent-7', name: 'Kofi Jr.', role: 'Sales Manager', status: 'Idle', avatar: '💼', lastAction: 'Renegotiated MTN Ghana contract', tasksCompleted: 61, color: '#0e7490', description: 'Manages corporate accounts and negotiates group rates.' },
  { id: 'agent-8', name: 'Adwoa', role: 'Operations Manager', status: 'Active', avatar: '⚙️', lastAction: 'Reassigned housekeeping for early check-ins', tasksCompleted: 188, color: '#c2410c', description: 'Coordinates housekeeping, maintenance, and front desk operations.' },
  { id: 'agent-9', name: 'Efua', role: 'Finance Analyst', status: 'Active', avatar: '🏦', lastAction: 'Flagged ₵4,200 in outstanding OTA commissions', tasksCompleted: 92, color: '#9333ea', description: 'Tracks revenue, expenses, commissions, and cash flow.' },
  { id: 'agent-10', name: 'Nana', role: 'General Manager', status: 'Working', avatar: '👑', lastAction: 'Compiled morning insights brief for owner', tasksCompleted: 320, color: '#be123c', description: 'Synthesizes all agents\u2019 work into a daily brief and strategic recommendations.' },
]

// ---------- AI RECOMMENDATIONS ----------
export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  { id: 'rec-1', type: 'occupancy', priority: 'High', title: 'Friday occupancy is only 42%', detail: '11 of 18 rooms sit empty this Friday. Demand is soft but your competitor Ibis Styles is at 88%.', action: 'Launch flash sale', impact: '+8 rooms · ₵6,400', agentId: 'agent-1' },
  { id: 'rec-2', type: 'retention', priority: 'High', title: 'Send promotion to 48 lapsed guests', detail: '48 high-value guests haven\u2019t booked in 6-12 months. They averaged ₵1,800/stay previously.', action: 'Run "Loyalty Reboot"', impact: '+5 direct bookings · ₵9,000', agentId: 'agent-3' },
  { id: 'rec-3', type: 'pricing', priority: 'Medium', title: 'Increase Booking.com pricing by 8%', detail: 'Your Booking.com rate is 14% below Ibis Styles while occupancy is healthy at 78%. Margin left on the table.', action: 'Adjust rates', impact: '+₵2,300/night', agentId: 'agent-1' },
  { id: 'rec-4', type: 'conversion', priority: 'High', title: '12 OTA guests eligible for direct conversion', detail: '12 guests booked via Airbnb/Booking.com this month and match your direct-conversion profile.', action: 'Send loyalty invites', impact: 'Save ₵3,800 future commission', agentId: 'agent-3' },
  { id: 'rec-5', type: 'marketing', priority: 'Medium', title: 'Offer free breakfast for next weekend', detail: 'Free breakfast historically lifts weekend conversions by 18% with near-zero cost.', action: 'Add weekend perk', impact: '+4 bookings', agentId: 'agent-2' },
  { id: 'rec-6', type: 'reputation', priority: 'Medium', title: '2 negative/neutral reviews need responses', detail: 'Fatima (AC noise) and Linda (long check-in) are unanswered. Replying within 24h improves recovery rate.', action: 'Respond now', impact: '+0.2 rating', agentId: 'agent-6' },
]

// ---------- PRICING SUGGESTIONS ----------
export const PRICING_SUGGESTIONS: PricingSuggestion[] = ROOMS.slice(0, 8).map((r, i) => {
  const change = [8, 5, -3, 12, 6, 0, 10, 4][i]
  const suggested = Math.round(r.baseRate * (1 + change / 100))
  return {
    roomId: r.id,
    roomName: r.name,
    date: daysFromNow(randInt(1, 14)),
    currentRate: r.baseRate,
    suggestedRate: suggested,
    changePct: change,
    reason: pick([
      'Weekend demand spike + competitor pricing above market',
      'Low occupancy forecast + last-minute gap',
      'Local event (concert) driving demand',
      'Healthy pace — optimize margin',
      'Below competitor average by 11%',
      'Off-season soft demand',
      'Corporate conference nearby',
      'Holiday weekend approaching',
    ]),
    confidence: randInt(72, 96),
    factors: pick([['Occupancy', 'Competitors', 'Pace'], ['Seasonality', 'Events', 'History'], ['Weather', 'Competitors', 'Pace']]),
  }
})

// ---------- FINANCIALS ----------
export const FINANCIALS: FinancialMetric[] = (() => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  return months.map((m, i) => {
    const revenue = 180000 + i * 12000 + randInt(-8000, 12000)
    const otaCommission = Math.round(revenue * (0.34 - i * 0.01))
    const expenses = Math.round(revenue * (0.42 + rand() * 0.05))
    return { month: m, revenue, expenses, otaCommission, profit: revenue - otaCommission - expenses }
  })
})()

// ---------- INSIGHTS ----------
export const INSIGHTS: Insight[] = [
  { id: 'ins-1', date: daysAgo(0), category: 'Forecast', title: 'Tomorrow\u2019s occupancy: 67%', detail: '12 of 18 rooms sold. 6 rooms available — Friday is the weak spot at 42%.', severity: 'warning', action: 'Launch vacancy campaign' },
  { id: 'ins-2', date: daysAgo(0), category: 'Opportunity', title: 'Direct booking % up 7pts this month', detail: 'Your direct conversion engine is working — 41% of bookings now direct vs 34% last month.', severity: 'success' },
  { id: 'ins-3', date: daysAgo(0), category: 'Threat', title: 'Booking.com cancellation rate rising', detail: 'Booking.com cancellations hit 14% this month (avg 8%). Consider stricter policies.', severity: 'critical', action: 'Tighten cancellation policy' },
  { id: 'ins-4', date: daysAgo(0), category: 'Pricing', title: 'Penthouse underpriced vs Kempinski', detail: 'Your penthouse (₵2,200) is 48% below Kempinski\u2019s entry suite with comparable ratings.', severity: 'info', action: 'Test ₵2,600 next weekend' },
  { id: 'ins-5', date: daysAgo(0), category: 'Trend', title: 'Repeat guest rate climbing to 38%', detail: 'Loyalty program is paying off. VIP tier grew from 4 to 9 members this quarter.', severity: 'success' },
  { id: 'ins-6', date: daysAgo(0), category: 'Forecast', title: 'Revenue forecast next 30 days: ₵312,000', detail: 'On pace for a record month if Friday gaps are filled.', severity: 'info' },
]

// ---------- CHANNELS ----------
export const CHANNELS = [
  { id: 'ch-airbnb', name: 'Airbnb', type: 'OTA', connected: true, syncStatus: 'Live', commission: 15, bookingsThisMonth: 28, revenueThisMonth: 72400, color: '#FF5A5F' },
  { id: 'ch-booking', name: 'Booking.com', type: 'OTA', connected: true, syncStatus: 'Live', commission: 15, bookingsThisMonth: 41, revenueThisMonth: 106200, color: '#003580' },
  { id: 'ch-expedia', name: 'Expedia', type: 'OTA', connected: true, syncStatus: 'Live', commission: 18, bookingsThisMonth: 9, revenueThisMonth: 19800, color: '#FFC72C' },
  { id: 'ch-agoda', name: 'Agoda', type: 'OTA', connected: true, syncStatus: 'Syncing', commission: 17, bookingsThisMonth: 6, revenueThisMonth: 12100, color: '#5392F9' },
  { id: 'ch-vrbo', name: 'Vrbo', type: 'OTA', connected: false, syncStatus: 'Not connected', commission: 10, bookingsThisMonth: 0, revenueThisMonth: 0, color: '#3D67FF' },
  { id: 'ch-direct', name: 'Direct Website', type: 'Direct', connected: true, syncStatus: 'Live', commission: 0, bookingsThisMonth: 32, revenueThisMonth: 94600, color: '#0d9488' },
  { id: 'ch-whatsapp', name: 'WhatsApp', type: 'Direct', connected: true, syncStatus: 'Live', commission: 0, bookingsThisMonth: 14, revenueThisMonth: 31200, color: '#25D366' },
  { id: 'ch-walkin', name: 'Walk-in', type: 'Direct', connected: true, syncStatus: 'Live', commission: 0, bookingsThisMonth: 5, revenueThisMonth: 9800, color: '#b45309' },
  { id: 'ch-phone', name: 'Phone', type: 'Direct', connected: true, syncStatus: 'Live', commission: 0, bookingsThisMonth: 7, revenueThisMonth: 15400, color: '#9333ea' },
  { id: 'ch-facebook', name: 'Facebook', type: 'Social', connected: true, syncStatus: 'Live', commission: 0, bookingsThisMonth: 3, revenueThisMonth: 6900, color: '#1877F2' },
  { id: 'ch-instagram', name: 'Instagram', type: 'Social', connected: true, syncStatus: 'Live', commission: 0, bookingsThisMonth: 4, revenueThisMonth: 9200, color: '#E4405F' },
  { id: 'ch-email', name: 'Email', type: 'Direct', connected: true, syncStatus: 'Live', commission: 0, bookingsThisMonth: 2, revenueThisMonth: 4100, color: '#6b7280' },
]

// Source color mapping for calendar
export const SOURCE_COLORS: Record<BookingSource, string> = {
  'Airbnb': '#FF5A5F',
  'Booking.com': '#003580',
  'Expedia': '#e8a200',
  'Agoda': '#5392F9',
  'Vrbo': '#3D67FF',
  'Direct Website': '#0d9488',
  'Walk-in': '#b45309',
  'Phone': '#9333ea',
  'WhatsApp': '#25D366',
  'Facebook': '#1877F2',
  'Instagram': '#E4405F',
  'Email': '#6b7280',
  'Corporate': '#15803d',
  'Referral': '#be123c',
}

// ---------- DERIVED METRICS ----------
export function occupancyForDate(date: string): number {
  const active = RESERVATIONS.filter(r =>
    r.status !== 'Cancelled' && r.status !== 'No-show' &&
    r.checkIn <= date && r.checkOut > date
  )
  const roomsBooked = new Set(active.flatMap(r => r.roomIds)).size
  return Math.round((roomsBooked / PROPERTY.roomsTotal) * 100)
}

export function reservationsOnDate(date: string): Reservation[] {
  return RESERVATIONS.filter(r =>
    r.status !== 'Cancelled' && r.status !== 'No-show' &&
    r.checkIn <= date && r.checkOut > date
  )
}
