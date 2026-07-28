# Task V4-4 — full-stack-developer

**Task:** Build two V4 StayPilot AI modules:
1. **Digital Employee Marketplace** (`src/components/modules/digital-employees.tsx` → `DigitalEmployeesModule`)
2. **Supplier Network** (`src/components/modules/supplier-network.tsx` → `SupplierNetworkModule`)

## Context read
- Read full `worklog.md` history (V1 foundation, V2 marketplace/experiences, V3 staff-os/reputation/events, V4 outcome-goals/autonomous-engine).
- Verified locked-file list — none modified. Only `digital-employees.tsx` + `supplier-network.tsx` (which were 9-line stubs) were rewritten.
- Confirmed registry already wires both modules (`digital-employees` → `DigitalEmployeesModule`, `supplier-network` → `SupplierNetworkModule`) via `React.lazy`.

## Data layer used (from `src/lib/data-v4.ts`)
- `DigitalEmployee` interface (id/name/role/specialization/propertyType/developer/rating/installs/price/installed/verified/avatar/color/bio/skills[]/performance{occupancy,revenue,rating}) + `DIGITAL_EMPLOYEES` (8 employees) + `EMPLOYEE_SPECIALTIES` (8).
- `Supplier` interface (id/name/category/rating/reviews/priceLevel/reliability/deliveryTime/networkUsedBy/yourStatus/description/emoji/color) + `SUPPLIERS` (8) + `SUPPLIER_CATEGORIES` (8).

## File 1 — DigitalEmployeesModule (~620 lines)
**Header:** "Digital Employee Marketplace" + the exact subtitle from the brief.

**Stats row (4 StatCards):** Hired / Available employees / Avg rating / Network installs — populated live from `DIGITAL_EMPLOYEES`.

**Explainer card** ("AI employee vs AI capability"): warm teal/orange gradient, side-by-side comparison — Capability (a tool) vs Digital Employee (full hire with persona, bio, skills, track record, e.g. Amani — Luxury Revenue Manager).

**Specialty filter:** horizontal scrollable pill row (`no-scrollbar`), 9 buttons (All + 8 specialties) each with icon + live count, orange→amber gradient for active state. Icons mapped per specialty (Crown for Luxury Boutique, Sparkles for Boutique Marketing, GraduationCap for Eco-Lodge Ops, Briefcase for MICE Sales, Handshake for Weddings, Building2 for Long-Stay, Users for Hostel, Rocket for Safari/Adventure).

**Sort:** shadcn `Select` — Top rated / Most installed / Newest. Hired employees float to top within each sort bucket.

**Employee cards (8):** Each card has a gradient header tile (color from `emp.color`) showing avatar emoji in a frosted tile + name + role + specialization, plus Hired + Verified badges. Body shows developer (with 1st-party Crown badge if StayPilot Labs), stars + rating + installs, bio (2-line clamp), skill chips (+N overflow), a 3-cell performance row (Occ. %, Rev/mo short, Rating ★), separator, salary price, and Hire/Hired ✓ button. Hired state = emerald ring + emerald button. Toast on hire: `Hired {name} as your {role} — onboarding in progress`.

**Onboarding mock card:** When ≥1 hired, shows latest hire with orange-amber gradient: "{name} is reviewing your property data, meeting your team, and will start as {role} tomorrow." + 66% Progress bar (step 2 of 3). When 0 hired, shows dashed-border placeholder.

**Publish your own employee card:** teal-emerald gradient, "Are you an expert operator? Encode your expertise into a digital employee. Reach 5,247 properties. Earn 70% revenue share." + 3 stat tiles (5,247 properties / 184K installs / 70% revenue share) + Start publishing button (toast: Studio portal opening).

**Trending by property type section:** amber-orange gradient header + 3-column grid (Guest Houses / Boutique Hotels / Lodges), each showing top 3 trending specialties with colored dot + name + trend %.

**Footer callout:** dashed-border card with Award icon: "Every employee is vetted by StayPilot and brings a measurable track record…" + "View my workforce" outline button (toast with current hired count).

## File 2 — SupplierNetworkModule (~660 lines)
**Header:** "Supplier Network" + exact subtitle from brief.

**Stats row (4 StatCards):** Preferred / Connected / Available on network / Avg reliability (computed live from connected suppliers).

**Category filter:** 9 horizontal scrollable pills (All + 8 categories) with category-specific icons (Shirt, Utensils, SprayCan, Wrench, Sofa, ShieldCheck, Wifi, SunMedium) + live counts.

**Sort:** shadcn `Select` — By reliability / By rating / Most used on network. Preferred → connected → available ordering preserved on top.

**Supplier cards (8):** Gradient header tile (color from `sup.color`) with emoji + category badge + status badge (preferred=emerald, connected=teal, available=slate). Body: name + delivery time (Clock icon), price-level chip (₵/₵₵/₵₵₵) with Tooltip, stars + rating + reviews, description (2-line clamp), **reliability progress bar** with color-coded indicator (emerald ≥95, teal ≥90, amber else) and color-matched % label, **network effect chip** (violet, "Used by N properties on the network"), separator, Connect/Connected ✓ button (full-width) + ThumbsUp "Set as preferred" outline button (Tooltip; disabled if not connected). Toast on connect: "Connected to {name} — {category} · {reliability}% · {deliveryTime}". Toast on prefer: "{name} set as preferred {category} supplier — auto-reorders route here first".

**AI recommendation card:** orange-amber gradient. Body: "switch laundry to FreshLine (96% reliability vs your 89%) — saves ~₵1,200/mo and 3 complaints/qtr." + 3-column compare grid (Current 89% / Recommended FreshLine 96% highlighted / Savings ₵1,200) + "Switch to FreshLine" button (toast: Switch initiated).

**Auto-reorder card:** teal-emerald gradient. 3 reorder rows (Linen reorder in 4 days / Cleaning supplies in 8 days / Breakfast food daily-today) each with emoji tile + Progress bar + color-coded urgency label (rose if today, amber ≤5 days, muted otherwise) + "Manage auto-reorder rules" outline button (toast).

**Network-negotiated rates card:** violet-fuchsia gradient. "StayPilot negotiates bulk rates across 5,247 properties. Your network savings: ₵4,800/mo vs going direct." + 2-column compare (Going direct ₵18,400 line-through muted / Network rate ₵13,600 emerald) + "26% network discount applied automatically" line.

**Become a supplier card:** amber-orange gradient. "Reach 5,247 properties in one integration…" + 3 stat tiles (5,247 properties / Weekly payouts / 0% listing fee) + "Apply to list" button (toast: Supplier onboarding opening).

**Footer callout:** dashed-border card with AlertTriangle: "Every supplier is StayPilot-vetted with background-checked personnel, verified reliability metrics, and network-negotiated rates…" + "View my supplier roster" outline button (toast with current connected/preferred counts).

## Shared API usage
- `DIGITAL_EMPLOYEES, EMPLOYEE_SPECIALTIES, SUPPLIERS, SUPPLIER_CATEGORIES` from `@/lib/data-v4` ✓
- `fmtMoneyShort, fmtPct` from `@/lib/format` (removed unused `fmtMoney`, `relativeDate` to keep lint clean) ✓
- `StatCard, SectionHeader` from `@/components/shared` ✓
- `toast` from `sonner` ✓
- shadcn ui: `card, button, badge, progress, separator, select` (+ `tooltip` in supplier-network) ✓
- lucide-react icons ✓ (warm, hospitality-appropriate: Bot, Store, Star, Check, Zap, TrendingUp, Truck, Package, Handshake, Network, etc.)
- framer-motion (`motion`, `AnimatePresence` with `mode="popLayout"` for filter transitions) ✓
- `StatusPill`, `TierBadge` not needed (supplier status uses its own color map aligned to the warm palette)

## Design rules followed
- Warm luxury palette only (orange #ea580c, teal #0d9488, amber, rose, violet, emerald accents). **Zero indigo/blue**.
- Dark-mode safe — all colors use Tailwind tokens or paired `dark:` variants; gradient tiles use solid hex from data layer (work in both modes).
- Responsive: 1 / 2 / 3 / 4 col grid breakpoints; filter rows use `overflow-x-auto no-scrollbar`; touch targets ≥36px (h-9 buttons).
- Hover states: `hover:shadow-lg hover:-translate-y-0.5` on cards; gradient buttons lift.
- Personas emphasized in Digital Employees (avatar, name, role, bio, skills, performance row).
- Network effect emphasized in Supplier Network ("Used by N properties" chip + bulk rates card).

## Quality gates
- `bun run lint` — clean (no errors, no warnings).
- Dev server (`dev.log`) — no new compile errors introduced.
- No locked files modified.
- No test code written.
- No `bun run build` executed.

## Stage Summary
- `src/components/modules/digital-employees.tsx` complete (~620 lines), `DigitalEmployeesModule` exported, lint-clean, compiles.
- `src/components/modules/supplier-network.tsx` complete (~660 lines), `SupplierNetworkModule` exported, lint-clean, compiles.
- Both modules replace 9-line stubs; registry already wired — no registry/nav changes needed.
- Warm luxury palette throughout, dark-mode safe, responsive + touch-friendly.
- V4 "outcomes over tools" theme reinforced: Digital Employees are *hires* (personas + track records), Suppliers are *vetted partners* with AI auto-reordering + network-negotiated bulk rates.
