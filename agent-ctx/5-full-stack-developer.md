# Task 5 — full-stack-developer — Calendar & Reservations Modules

## Task
Build two production-ready modules for StayPilot AI (Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + recharts):
1. **CalendarModule** (`src/components/modules/calendar.tsx`) — Unified Reservation Calendar with Daily/Weekly/Monthly views, color-coded booking bars, booking detail popover, AI conflict detection, occupancy heatmap, summary strip, legend.
2. **ReservationsModule** (`src/components/modules/reservations.tsx`) — Reservations table with filters/search/sorting, summary stat cards, OTA tracking card with AI insights, New Reservation dialog with sonner toast.

## Files Read First
- `/home/z/my-project/worklog.md` — foundation summary (Task 1-4)
- `src/lib/data.ts` — RESERVATIONS, ROOMS, GUESTS, SOURCE_COLORS, occupancyForDate, reservationsOnDate
- `src/lib/format.ts` — fmtMoney, fmtMoneyShort, fmtPct, fmtDate, fmtDateLong, relativeDate, initials
- `src/lib/store.ts` — useApp() store
- `src/lib/types.ts` — Reservation, Room, BookingSource, ReservationStatus
- `src/components/shared.tsx` — StatCard, SectionHeader, SourceBadge, StatusPill
- `src/components/modules/dashboard.tsx` — style/pattern reference
- `src/app/globals.css` — confirmed `scroll-area-fancy`, `glass`, `text-gradient-brand` classes

## Work Log (concrete steps)
1. **CalendarModule** (`calendar.tsx`, ~600 lines):
   - Added `'use client'` directive and full imports (React, shadcn ui: card/button/toggle-group/popover/separator, shared, data, format, utils, types, lucide-react, date-fns)
   - Defined helpers: `iso()`, `activeReservations()`, `nightsBetween()`, `bookingBar()` (computes offset%/width% for a reservation inside a [rangeStart, rangeEndExclusive) window using date-fns `differenceInCalendarDays`/`parseISO`)
   - Built `detectConflicts()` — O(n²) scan of active reservations for shared-room + date-overlap pairs (ISO string compare works for YYYY-MM-DD)
   - Built `BookingDetails` popover content — guest name, room, status pill, source badge, campaign/coupon badges, check-in/out (fmtDateLong), guests, booked (relativeDate), 3-tile gross/commission/net revenue, guest loyalty chip
   - Built `ConflictBanner` — green "No double bookings detected ✓" card when empty, amber warning card with scrollable conflict list when found (uses `scroll-area-fancy`)
   - Built `RoomGrid` (used for Daily + Weekly views) — sticky header row with day cells (weekday + date + occupancy %, today highlighted in orange, weekends muted), then one row per ROOM (number badge + name + type + base rate) with a relative track containing: day-separator grid + absolutely-positioned booking bars (color = SOURCE_COLORS[source], white text, hover scale + z-10, label shows guest name + source + nights when wide enough, falls back to initials for narrow bars). Each bar wrapped in shadcn Popover for click-to-view details. Empty rooms show "—"
   - Built `MonthlyView` — traditional 6×7 calendar grid (Sun-Sat) using `startOfMonth`/`endOfMonth`/`startOfWeek`/`eachDayOfInterval`. Each cell shows date circle (today = orange filled), occupancy % (color-graded), source-color dots from `reservationsOnDate()`, booking count. Heat legend at bottom (teal → amber → orange → rose). Month-level stats chips above grid (reservations count, net revenue, avg occupancy)
   - Built `Legend` — flex-wrap of `SourceBadge` for every source actually used in active reservations
   - Main `CalendarModule` component: SectionHeader with ToggleGroup (Daily/Weekly/Monthly, orange active state), 5-card summary strip (Today's Occupancy / Available Tonight / Arrivals Today / Departures Today / Active Bookings — all using `occupancyForDate`/`reservationsOnDate` against today's ISO date), ConflictBanner, navigation Card (prev/today/next buttons + period label + Legend), main Card wrapping either MonthlyView or RoomGrid, footer hint. `cursor` state defaults to `new Date()`; prev/next add 1 day/week/month depending on view; `view` defaults to `'weekly'`
   - Responsive: weekly/daily grids wrapped in `overflow-x-auto scroll-area-fancy` with `min-w-[860px]` inner wrapper so mobile scrolls horizontally; monthly grid `min-w-[640px]`

2. **ReservationsModule** (`reservations.tsx`, ~430 lines):
   - Imports React, shadcn ui (card/button/input/label/badge/table/select/dialog/separator), sonner toast, shared components, data, format, utils, types, lucide-react, date-fns
   - Defined `SOURCES` (all 14 BookingSource values) and `STATUSES` (all 6 ReservationStatus values) const arrays
   - `nights()` helper using `differenceInCalendarDays`/`parseISO`
   - Built `SummaryRow` — 5 StatCards: Total Reservations, Gross Revenue, Commission Paid, Net Revenue, Avg Commission % (computed live from passed rows)
   - Built `computeSourceStats()` — iterates RESERVATIONS to compute per-source bookings/gross/net/commission/cancellations, then iterates GUESTS to compute per-source guests/repeatGuests (using `bookingSource` field). Returns derived `avgNetPerBooking`, `cancelRate`, `repeatRate`
   - Built `OtaTracking` card with AI-themed header (Sparkles icon, orange-amber gradient). Top 3 insight cards: Highest-quality guests (Trophy, gold — top by avg net/booking), Most cancellations (AlertOctagon, rose — top by cancellation count), Highest repeat rate (RefreshCw, teal — top by repeatRate). Each shows source name, key metric, AI hint. Below: full source table (sorted by net revenue desc) with columns Source/Bookings/Gross/Net/Avg Net/Cancellations/Repeat %. Highlights best-quality source in amber, highest-repeat in teal, cancellations in rose. Wrapped in `overflow-x-auto scroll-area-fancy`
   - Built `NewReservationDialog` — Dialog with form (guest name input, room Select populated from ROOMS, source Select from SOURCES, check-in/check-out date inputs). Submit validates required fields, calls `toast.success()` with guest name + booking summary description, closes dialog and resets form. Empty fields trigger `toast.error()`
   - Main `ReservationsModule`: SectionHeader with New Reservation button as action, SummaryRow, OtaTracking card, filter Card with search Input (with Search icon) + source Select + status Select + Clear button (appears when any filter active) + "Showing X of Y" counter. Table Card with `max-h-[28rem] overflow-y-auto scroll-area-fancy` wrapper. Table columns: Guest (avatar + name + country/tier), Room (number badge + name), Check-in (fmtDate + relativeDate), Check-out (fmtDate), Nights, Source (SourceBadge), Status (StatusPill), Gross, Commission, Net (color-coded), Campaign/Coupon (amber/teal outline badges). Sticky header with sortable Check-in/Gross/Commission/Net columns (ArrowUpDown icon, click toggles sort direction). Empty state row when no matches
   - Filtering via `React.useMemo` — guest name substring (case-insensitive), source/status equality. Sorting via `sortKey`/`sortDir` state with `toggleSort()` helper

3. **Lint verification**: ran `npx eslint src/components/modules/calendar.tsx src/components/modules/reservations.tsx` — both files lint clean (exit 0). The only lint error in the project is in `agents.tsx` (a different module, not my responsibility).

4. **Runtime verification**: dev.log shows successful compiles and `GET / 200` responses after edits. No runtime/compile errors related to my files.

## Design Adherence
- Warm palette only: orange (#ea580c), teal (#0d9488), amber (#b45309), rose, violet, emerald — no indigo/blue in MY UI. OTA brand colors (Booking.com #003580, Agoda #5392F9, Facebook #1877F2, Vrbo #3D67FF) come from the locked `SOURCE_COLORS` data and are required by the spec for source identification.
- Tailwind tokens throughout (bg-card, text-muted-foreground, border-border, bg-accent) — dark-mode safe (app defaults to dark).
- `glass`/gradient accents used sparingly (Sparkles badge in OTA card header, orange-amber gradient on AI icon).
- Rounded-xl/2xl cards, p-4/p-5 padding throughout.
- Mobile-first responsive: grids use `grid-cols-2 md:grid-cols-5` etc; tables/grids wrapped in horizontal-scroll containers with `min-w-*` inner wrappers; touch-friendly button sizes.
- Every interactive element has hover states: `hover:bg-accent/30`, `hover:scale-[1.015]`, `hover:shadow-md`, `hover:text-foreground` for sortable headers, `hover:z-10` for booking bars.
- `scroll-area-fancy` used for: conflict list, monthly grid, OTA source table, reservations table, weekly/daily grids.

## Stage Summary
- Both modules fully functional and lint-clean.
- CalendarModule supports Daily/Weekly/Monthly views with live date-relative data, AI conflict detection, occupancy heatmap, booking popovers, today/period navigation, summary strip, source legend.
- ReservationsModule has filterable/searchable/sortable table, 5 summary stat cards, OTA tracking card with 3 AI insights + full source comparison table, New Reservation dialog with sonner toast.
- Used only the required shared APIs (ROOMS, RESERVATIONS, GUESTS, SOURCE_COLORS, PROPERTY, occupancyForDate, reservationsOnDate, fmtMoney, fmtMoneyShort, fmtPct, fmtDate, fmtDateLong, relativeDate, initials, StatCard, SectionHeader, SourceBadge, StatusPill) — no modifications to locked files.
- Ready for the next agent to build remaining stub modules.
