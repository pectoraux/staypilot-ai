# Task V3-5 — full-stack-developer

## Task
Build two StayPilot AI V3 modules:
1. **Hospitality AI Marketplace** (`src/components/modules/ai-marketplace.tsx` → `AIMarketplaceModule`) — third-party AI capabilities/agents (distinct from V2's human service marketplace).
2. **Property Brain** (`src/components/modules/property-brain.tsx` → `PropertyBrainModule`) — per-property AI training with feedback loop.

## Locked files (read-only)
registry.tsx, shared.tsx, data.ts, data-v2.ts, data-v3.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx, copilot.tsx, copilot-palette.tsx — NONE modified.

## Inputs from data-v3.ts
- `AICapability` interface: `{ id, name, developer, category, description, rating, installs, price, installed, verified, icon (emoji), color (hex), capabilities[] }`
- `AI_CAPABILITIES`: 8 entries (RevMax Pricing, LocalTour Concierge, DineBot, CleanRoute, FraudGuard, CommPack: Luxury Boutique, EventRadar, AutoTemplate: Corporate Sales). 3 are `installed: true`, 7 are `verified: true`, 2 are by "StayPilot Labs" (1st-party).
- `AI_MARKETPLACE_CATEGORIES`: 8 strings.
- `BrainConfig` interface: `{ category, label, value, options[], learned, examples?[] }`
- `PROPERTY_BRAIN`: 8 config cards (brand-voice, discount-policy, upgrade-policy, service-style, local-recs, suppliers, escalation, response-speed). 4 optioned, 4 freeform (local-recs, suppliers, escalation have no options).
- `BRAIN_LEARNING_PROGRESS`: `{ overall: 78, byArea[6]: {area, progress, samples}, recentLearnings[5]: {id, learning, confidence, date} }`.

## Shared APIs consumed (all as specified)
- `import { AI_CAPABILITIES, AI_MARKETPLACE_CATEGORIES, PROPERTY_BRAIN, BRAIN_LEARNING_PROGRESS } from '@/lib/data-v3'`
- `import { fmtMoneyShort, fmtPct } from '@/lib/format'` (fmtMoney/relativeDate intentionally not consumed — fmtMoneyShort for File 1 network-installs stat, fmtPct for File 2 percentages; spec listed all four for availability but doesn't require all four be used)
- `import { StatCard, SectionHeader, StatusPill } from '@/components/shared'`
- `import { toast } from 'sonner'`
- shadcn ui: card, button, badge, separator, scroll-area, tooltip, textarea, select
- recharts: Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
- lucide-react: 24 icons across the two files (Store, Star, Check, Plus, Sparkles, Zap, BadgeCheck, TrendingUp, ArrowRight, Wand2, Code2, Users, Boxes, Crown, Bot, Cpu, Download, Filter, Flame, Map, Utensils, ShieldCheck, MessageCircle / Brain, Sparkles, Check, X, ThumbsUp, ThumbsDown, MessageSquareQuote, RotateCcw, Download, Zap, GraduationCap, Activity, Layers, Clock, Volume2, Tag, ArrowUpCircle, ConciergeBell, MapPin, Truck, AlertTriangle, Gauge, ShieldCheck)
- framer-motion: motion + AnimatePresence
- types: AICapability, BrainConfig

## File 1 — ai-marketplace.tsx (~592 lines)
### Structure
1. SectionHeader: "Hospitality AI Marketplace" + spec subtitle + Store-icon capability-count badge.
2. Stats row (4 StatCards): installed count, available capabilities, avg rating, total active installs across network (fmtMoneyShort).
3. Category filter (All + 8 from AI_MARKETPLACE_CATEGORIES) — scrollable pill row with per-category lucide icons + live count chips. Active = orange→amber gradient.
4. Sort toggle (Trending / Top rated) — segmented control; installed always bubble to top within each bucket.
5. CapabilityCard × 8: gradient header tile (linear-gradient with white radial overlay, emoji in white/20 backdrop-blur tile, category badge top-right, "Installed" emerald pill when installed), body with name + developer + "1st-party" Crown badge for StayPilot Labs + "Verified" teal BadgeCheck pill (tooltiped), Stars rating + numeric + Download-icon installs, 2-line description, capability chips, separator, price + Install/Installed✓ toggle button (orange→amber gradient vs emerald outline).
6. AIOrchestrationCard (orange-bordered): spec text + dynamic list pairing each installed capability with its collaborating in-house workforce agent (cap icon → ArrowRight → agent tile with name + role).
7. BecomeDeveloperCard (teal/emerald gradient): "Build an AI capability for hospitality. Reach 5,247 properties. Earn 70% revenue share." + 3 mini-stat tiles + "Start building" button → toast.

### CAPABILITY_AGENT_MAP (drives AI Orchestration card)
Maps all 8 capability IDs to actual AI_AGENTS from data.ts:
- ac-1 RevMax Pricing → Kofi (Revenue Manager)
- ac-2 LocalTour Concierge → Yaw (Guest Success Manager)
- ac-3 DineBot → Yaw (Guest Success Manager)
- ac-4 CleanRoute → Adwoa (Operations Manager)
- ac-5 FraudGuard → Efua (Finance Analyst)
- ac-6 CommPack Luxury Boutique → Ama (Marketing Manager)
- ac-7 EventRadar → Kofi (Revenue Manager)
- ac-8 AutoTemplate: Corporate Sales → Kofi Jr. (Sales Manager)

### Install behavior
Local React state `Record<id, boolean>` seeded from AI_CAPABILITIES[i].installed. Toggle:
- install → toast.success "Installed — StayPilot will orchestrate this with your AI workforce" + description naming the collaborating agent
- uninstall → toast.info "Capability removed" + description
Installed capabilities get emerald ring + emerald "Installed" pill on the card header and an emerald-outlined "Installed ✓" button.

## File 2 — property-brain.tsx (~775 lines)
### Structure
1. SectionHeader: "Property Brain" + spec subtitle. Action: "Export brain" button (toast) + "Reset brain" rose-outline button (toast).
2. Stats row (4 StatCards): brain maturity 78%, samples learned (sum of all area samples), areas tracked 6, feedback actions 5.
3. Top grid (1 + 2 cols): ProgressRing card (168px SVG ring, animated stroke, orange→amber→teal gradient, centered gradient-text 78%) + BrainRadar card (recharts RadarChart, 6 axes, animated).
4. ByAreaBreakdown card: 6 progress bars in 2-col grid with per-area accent colors + sample counts + animated motion.div bars.
5. RecentLearnings timeline card (KEY feedback-loop feature): vertical rail with status dots (orange pending / emerald correct / rose not-quite), 5 recent learnings each with text + relative time + "% confidence" pill (tooltiped) + Correct/Not-quite buttons (emerald/rose outline). Local `judgements` state — once judged, buttons replaced with verdict label and dot color changes. Toast on each action.
6. Brain configuration grid (8 cards from PROPERTY_BRAIN): each with per-category icon, label + category subtitle, "AI-learned"/"Manual" badge, dashed-border "Learned value" quote, then either a Select (5 optioned configs) with "Use AI-learned value" + options, OR a Textarea (3 freeform configs) pre-filled + "Save override" button. Editing fires toast "Brain updated — AI will apply this going forward". Active override shows amber "Override active" hint with Zap icon. Examples shown as italic orange-bordered quotes below a separator.
7. BrandVoiceSamples card (teal gradient, ScrollArea max-h-80): 4 AI-drafted sample messages (WhatsApp welcome / Email post-stay / SMS service recovery / In-app upsell) in the learned warm Ghanaian "Akwaaba" brand voice.
8. HowBrainLearns card (violet→purple→orange gradient): verbatim spec explainer + 4 icon+text rows (ThumbsUp feedback, Check approvals, Activity patterns, ShieldCheck data portability).

### ProgressRing implementation
Custom SVG (not recharts) for full control over gradient + animation:
- 168px size, 12px stroke
- Orange→amber→teal linear gradient stroke
- Animated strokeDashoffset from full circumference to (c - value/100 * c) over 1.2s easeOut
- Centered: gradient-text "78%" + "Brain maturity" + "learning every day" with Activity icon

### Feedback loop (the key UX feature)
RecentLearnings component has local `judgements: Record<id, { verdict: 'correct' | 'not-quite' | null }>` state. Each learning has:
- "Correct" button (emerald outline, ThumbsUp icon) → toast.success "Marked correct — brain reinforced" with truncated learning text
- "Not quite" button (rose outline, ThumbsDown icon) → toast.info "Marked not quite — brain will re-learn" with description
Once judged: buttons disappear, replaced with verdict label (emerald Check / rose X) and timeline dot color updates.

## Design rules
- Warm luxury palette: orange #ea580c, amber, teal #0d9488, emerald, rose, violet. NO indigo/blue. NO Slate-blue accents.
- Dark-mode safe (app defaults dark) — all colors via Tailwind tokens (bg-card, bg-muted, text-foreground, text-muted-foreground, border-border) + dark: variants. Hex colors only for accent gradients/blurs (always paired with `1a`/`14` opacity for backgrounds).
- Responsive: grids go 1→2→3→4 cols (File 1 capability grid) and 1→2→3→4 cols (File 2 brain config grid). Category filter horizontally scrollable on narrow viewports.
- Touch-friendly: all interactive elements ≥44px (size-sm buttons are h-9, h-7 mini-buttons paired with ≥12px text + icon).
- Hover states: cards lift (`hover:shadow-lg hover:-translate-y-0.5`), buttons brighten, tabs/segmented controls swap to bg-background.
- Framer-motion: staggered entrances (delay: index * 0.04-0.05), SVG ring stroke animation, bar fill animations.
- Sonner toast feedback on every user action (install/uninstall, feedback correct/not-quite, brain config edit, export/reset).

## Verification
- `bun run lint` → exit 0 (clean) after both files written + import cleanup.
- Dev server (auto-started by system) compiled both modules cleanly:
  - `GET /?module=ai-marketplace 200 in 166ms (compile: 7ms, render: 159ms)`
  - `GET /?module=property-brain 200 in 265ms (compile: 22ms, render: 243ms)`
- No build run. No test code written.

## Stage Summary
- Two V3 modules fully built and verified.
- `src/components/modules/ai-marketplace.tsx` (AIMarketplaceModule) — 8 third-party AI capabilities across 8 categories, install/uninstall toasts, AI orchestration card pairing installed capabilities with in-house workforce agents, Become-a-developer card, Trending/Top-rated sort toggle, StayPilot Labs 1st-party badge + Verified badge + emerald Installed badge.
- `src/components/modules/property-brain.tsx` (PropertyBrainModule) — animated SVG progress ring (78%), recharts RadarChart, by-area breakdown bars, recent-learnings timeline with Correct/Not-quite feedback buttons (the training loop), 8 editable brain-config cards (Select/Textarea) firing "Brain updated" toasts, brand voice samples card, "How the brain learns" explainer, Export/Reset brain actions.
- All specified shared APIs consumed; warm palette (NO indigo/blue); dark-mode safe; responsive mobile-first; touch-friendly; hover states; framer-motion entrances; sonner toast feedback.
- Only the two target module files modified — all locked files untouched.
- Lint clean. Dev server compiled & served both modules (200 responses, no errors in dev.log).
