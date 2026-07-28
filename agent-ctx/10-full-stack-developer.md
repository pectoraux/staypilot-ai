# Task 10 — full-stack-developer

## Task
Build three StayPilot AI modules (revenue, competitors, channels) for the AI Revenue Operating System. Luxury hospitality, warm palette (orange/teal/amber/rose/violet), dark-mode safe, responsive, recharts visualisations, AI integration.

## Files modified (only these — all other protected files untouched)
- `src/components/modules/revenue.tsx` → `RevenueModule`
- `src/components/modules/competitors.tsx` → `CompetitorsModule`
- `src/components/modules/channels.tsx` → `ChannelsModule`

## Work Log

### revenue.tsx — AI Revenue Manager
- Hero header with the requested description text + "AI Revenue Manager · Active" pills
- 4 StatCards: avg suggested change %, rooms needing increase, rooms needing decrease, projected monthly revenue lift (derived from PRICING_SUGGESTIONS × ROOMS × 30 × 0.62 occupancy)
- Pricing suggestions table (shadcn Table): room name + #id, date + relativeDate, current rate, suggested rate with up/down arrow + changePct chip (green for ↑ increase, red for ↓ decrease, slate for flat), reason (line-clamp-2), confidence progress bar (emerald/teal/amber/rose by threshold), factor chips, Ask AI (Wand2 icon, tooltip) + Apply (Check icon) buttons
- AskAIDialog: opens on row click, POSTs to `/api/ai` with `{mode:'pricing', roomName, currentRate, occupancy: occupancyForDate(date)}`. Shows shimmer skeleton bars (Tailwind `animate-[shimmer_...]` reusing the global `shimmer` keyframe) while loading, then renders `{suggestedRate, changePct, reason, confidence}` with a colored change badge, rationale card and confidence meter. Falls back to raw text when `pricing` is null. Includes "Apply rate" button → toast.
- "Apply all" button → toast.success
- ComposedChart (occupancy area + current/suggested bars, dual Y-axes) showing occupancy-vs-rate relationship across the 8 suggested rooms
- Factors explainer panel: 7 cards (Occupancy, Seasonality, Local Events, Competitor Pricing, Booking Pace, Weather, Historical Demand) each with icon, description, mock signal value badge (up/down/flat tone), and a weighted signal bar
- framer-motion entrance animations on factor cards + AI result

### competitors.tsx — Competitor Intelligence
- Hero header with live rate scan badge + narrative summary (rate gap vs market, occupancy gap)
- 4 StatCards: rate vs market %, your occupancy %, rating gap to leader, competitors tracked
- Comparison table: rank icon, name + distance, distance (km), avg rate (with +% above / -% below you coloring), occupancy (with mini progress bar), star rating, review count, amenities chips (max 4 + "+N"). "You" row highlighted with orange background + Trophy icon + "You" badge
- Rate comparison bar chart (your bar in orange #ea580c, competitors in teal #0d9488)
- Occupancy comparison bar chart (same color scheme)
- Rating-vs-price ScatterChart (ZAxis = review count → bubble size, colored by you/competitor)
- Competitor map: aspect-square styled card with concentric dashed radius rings, crosshair lines, center "you" marker (orange MapPin with ping animation), 5 competitor markers positioned by bearing+distance using absolute % coords. Hover tooltip + click → toast with details
- AI recommendations card: 4 derived insights (raise Deluxe rates 18% below Golden Tulip, Kempinski outscores you on reviews → invest in service recovery, Vrbo not connected → competitors list there, Labadi Beach 71% premium → Suite/Penthouse underpriced). Each card: icon, title, detail, impact, action button → toast. Tone-colored borders (emerald/amber/teal)
- Position radar: 5-axis (Rate, Occupancy, Rating, Reviews, Amenities) RadarChart comparing You vs Market avg

### channels.tsx — Multi-Channel Manager & OTA Tracking
- Hero header with the exact requested text: "Connect every channel. No double bookings. AI syncs calendars 24/7."
- 4 StatCards: channels connected (X/N), commission paid MTD, direct revenue %, OTA revenue %
- SyncHealthBanner: emerald-accented card with "18 rooms synced across 11 channels · 0 conflicts · last sync 2 min ago" + "Calendars aligned" + "API healthy" status chips + "Sync now" button (toast). Below: strip of all connected channel pills with their brand colors + hover tooltips
- ChannelGrid: responsive grid (1/2/3/4 cols) of channel cards. Each card: left color accent stripe (channel.color), avatar tile (first 2 letters on brand color), name, type badge (OTA/Direct/Social with type color), commission %, Switch toggle (state-managed, toast on change), StatusPill (Live/Syncing/Disconnected), 2 metric tiles (bookings MTD, revenue MTD with commission deduction), "Connect {name}" CTA button (brand-colored) for unconnected channels (Vrbo)
- OTA analytics table: per-OTA row with bookings, gross revenue, commission paid (red), net revenue, avg booking value, cancel rate (red if ≥12% else green), repeat guest rate (UserCheck icon). Totals row at bottom. Mock cancel/repeat rates per OTA in `OTA_EXTRA`
- RevenueByTypeChart: donut (OTA orange / Direct teal / Social rose) with legend + share %
- CommissionByOtaChart: horizontal bar chart of commission paid per OTA, bars colored by each channel's brand color
- Bottom insight strip: "OTA dependency is X% — push more direct" with calculated savings + "Run direct-conversion" button

### AI integration
- RevenueModule Ask AI dialog uses the existing `/api/ai` route (mode: 'pricing') with the exact payload `{mode:'pricing', roomName, currentRate, occupancy}`. Occupancy derived live via `occupancyForDate(date)` from the shared data layer. Response shape `{raw, pricing}` handled: structured pricing card when `pricing` is non-null, raw-text fallback otherwise. Loading state shows animated shimmer + spinner.

### Design rules followed
- Warm palette only: orange #ea580c, teal #0d9488, amber, rose, violet — NO indigo/blue
- Green for increases, red for decreases throughout (intuitive)
- Channel cards use each channel's `color` field as accent stripe + avatar tile + connect CTA
- Dark-mode safe (uses Tailwind tokens + `dark:` variants + CSS vars from globals.css)
- Glass accents (`glass` utility) on hero overlays and map legend
- Responsive: mobile-first grids, `sm:`/`md:`/`lg:`/`xl:` breakpoints, 44px+ touch targets (Switch, buttons)
- framer-motion entrance animations on cards/recommendations
- Custom scrollbar class `scroll-area-fancy` available where lists could overflow
- Toast feedback on every mutation (apply rate, sync now, connect channel, queue action)

## Verification
- `bunx eslint src/components/modules/{revenue,competitors,channels}.tsx` → exit 0, no warnings/errors
- `bunx tsc --noEmit --skipLibCheck` → no errors in any of the three files (remaining tsc errors are in OTHER agents' files: corporate, experiences, housekeeping, maintenance, data.ts)
- `dev.log` shows repeated `✓ Compiled` and `GET / 200` — dev server healthy
- Only the three task files were touched; all protected files (registry, shared, data, format, store, nav, app-shell, page, layout, globals.css, api/ai/route.ts, dashboard.tsx) untouched

## Stage Summary
Three production-grade modules delivered. Revenue module gives the owner a nightly AI-curated rate sheet with one-click apply + "explain yourself" AI dialog. Competitors module surfaces market position across 5 nearby properties with 4 chart types + an interactive map placeholder + 4 derived AI recommendations. Channels module is a full channel manager with sync health, per-channel toggles, OTA P&L table, and revenue-mix visualisations. All three share the warm luxury palette, are dark-mode safe, fully responsive, and wire into the existing shared APIs (no protected files modified).
