'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip, TooltipTrigger, TooltipContent,
} from '@/components/ui/tooltip'
import { SectionHeader, StatusPill } from '@/components/shared'
import { GRAPH_NODES, GRAPH_EDGES } from '@/lib/data-v2'
import type { GraphNode, GraphEdge } from '@/lib/data-v2'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Share2, Network, Eye, Filter, ZoomIn, ZoomOut, Maximize2, MousePointerClick,
  Users, Building2, Heart, CalendarCheck, Megaphone, BedDouble, Star, MapPin,
  Forward, UserCog, Home, X, ArrowRight, Sparkles, Database,
} from 'lucide-react'

// ----------------- type → color & icon mapping -----------------
type NodeType = GraphNode['type']

interface TypeMeta {
  label: string
  color: string
  icon: React.ReactNode
}

const TYPE_META: Record<NodeType, TypeMeta> = {
  property:   { label: 'Property',   color: '#ea580c', icon: <Home className="h-3 w-3" /> },
  guest:      { label: 'Guest',      color: '#0d9488', icon: <Users className="h-3 w-3" /> },
  company:    { label: 'Company',    color: '#be123c', icon: <Building2 className="h-3 w-3" /> },
  family:     { label: 'Family',     color: '#9333ea', icon: <Heart className="h-3 w-3" /> },
  booking:    { label: 'Booking',    color: '#b45309', icon: <CalendarCheck className="h-3 w-3" /> },
  campaign:   { label: 'Campaign',   color: '#15803d', icon: <Megaphone className="h-3 w-3" /> },
  room:       { label: 'Room',       color: '#a16207', icon: <BedDouble className="h-3 w-3" /> },
  review:     { label: 'Review',     color: '#0e7490', icon: <Star className="h-3 w-3" /> },
  experience: { label: 'Experience', color: '#c2410c', icon: <MapPin className="h-3 w-3" /> },
  referral:   { label: 'Referral',   color: '#6b7280', icon: <Forward className="h-3 w-3" /> },
  staff:      { label: 'Staff',      color: '#1f2937', icon: <UserCog className="h-3 w-3" /> },
}

// ----------------- helpers -----------------
const nodeById = (id: string) => GRAPH_NODES.find(n => n.id === id)
const edgesForNode = (id: string) => GRAPH_EDGES.filter(e => e.from === id || e.to === id)
const neighborsOf = (id: string): Set<string> => {
  const s = new Set<string>()
  for (const e of GRAPH_EDGES) {
    if (e.from === id) s.add(e.to)
    if (e.to === id) s.add(e.from)
  }
  return s
}

function readableSentence(edge: GraphEdge): string {
  const from = nodeById(edge.from)
  const to = nodeById(edge.to)
  return `${from?.label ?? edge.from} → ${edge.label} → ${to?.label ?? edge.to}`
}

// ----------------- SVG graph -----------------
interface GraphProps {
  enabledTypes: Set<NodeType>
  hovered: string | null
  selected: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
  zoom: number
}

function GraphSVG({ enabledTypes, hovered, selected, onHover, onSelect, zoom }: GraphProps) {
  // Determine visible nodes (type enabled)
  const visibleNodes = React.useMemo(
    () => GRAPH_NODES.filter(n => enabledTypes.has(n.type)),
    [enabledTypes],
  )
  const visibleIds = React.useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes])
  const visibleEdges = React.useMemo(
    () => GRAPH_EDGES.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [visibleIds],
  )

  // Highlight set: hovered or selected node + its neighbors
  const focusId = hovered ?? selected
  const focusNeighbors = React.useMemo(
    () => focusId ? neighborsOf(focusId) : null,
    [focusId],
  )

  const isNodeDimmed = (id: string) => {
    if (!focusId) return false
    if (id === focusId) return false
    return !focusNeighbors?.has(id)
  }
  const isEdgeHighlighted = (e: GraphEdge) => Boolean(focusId && (e.from === focusId || e.to === focusId))
  const isEdgeDimmed = (e: GraphEdge) => Boolean(focusId) && !isEdgeHighlighted(e)

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border"
      style={{ background: 'radial-gradient(circle at 50% 45%, rgba(234,88,12,0.07), transparent 65%)' }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full select-none"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 240ms ease', aspectRatio: '1 / 1' }}
      >
        <defs>
          {/* glow filter for highlighted nodes */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* subtle background grid */}
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.15" className="text-border" />
          </pattern>
        </defs>

        <rect width="100" height="100" fill="url(#grid)" opacity={0.5} />

        {/* edges */}
        <g>
          {visibleEdges.map((e, i) => {
            const a = nodeById(e.from)!
            const b = nodeById(e.to)!
            // gentle curve via midpoint offset
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            const dx = b.x - a.x
            const dy = b.y - a.y
            const len = Math.sqrt(dx * dx + dy * dy) || 1
            const nx = -dy / len
            const ny = dx / len
            const bend = Math.min(4, len * 0.18)
            const cx = mx + nx * bend
            const cy = my + ny * bend
            const hl = isEdgeHighlighted(e)
            const dim = isEdgeDimmed(e)
            return (
              <path
                key={i}
                d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                fill="none"
                stroke={hl ? '#ea580c' : '#a16207'}
                strokeWidth={hl ? 0.7 : 0.35 + e.weight * 0.06}
                strokeOpacity={dim ? 0.08 : hl ? 0.95 : 0.4}
                filter={hl ? 'url(#edgeGlow)' : undefined}
                style={{ transition: 'stroke-opacity 180ms ease, stroke 180ms ease' }}
              />
            )
          })}
        </g>

        {/* edge labels (only for highlighted edges) */}
        <g>
          {visibleEdges.map((e, i) => {
            if (!focusId || !isEdgeHighlighted(e)) return null
            const a = nodeById(e.from)!
            const b = nodeById(e.to)!
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            return (
              <text
                key={`l-${i}`}
                x={mx}
                y={my - 0.8}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 2.1, fontWeight: 600 }}
                opacity={0.85}
              >
                <tspan>{e.label}</tspan>
              </text>
            )
          })}
        </g>

        {/* nodes */}
        <g>
          {visibleNodes.map((n) => {
            const dim = isNodeDimmed(n.id)
            const isFocus = focusId === n.id
            const isSelected = selected === n.id
            const r = Math.max(2.4, n.size / 3.6)
            const meta = TYPE_META[n.type]
            return (
              <g
                key={n.id}
                style={{ cursor: 'pointer', transition: 'opacity 180ms ease' }}
                opacity={dim ? 0.25 : 1}
                onMouseEnter={() => onHover(n.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(isSelected ? null : n.id)}
              >
                {/* halo ring for focus/selected */}
                {(isFocus || isSelected) && (
                  <circle cx={n.x} cy={n.y} r={r + 2.5} fill="none" stroke={meta.color} strokeWidth={0.4} strokeOpacity={0.5} />
                )}
                {(isFocus || isSelected) && (
                  <circle cx={n.x} cy={n.y} r={r + 1.4} fill="none" stroke={meta.color} strokeWidth={0.3} strokeOpacity={0.8} />
                )}
                {/* node body */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r}
                  fill={meta.color}
                  fillOpacity={0.9}
                  stroke="white"
                  strokeWidth={0.5}
                  strokeOpacity={0.85}
                  filter={isFocus ? 'url(#nodeGlow)' : undefined}
                  style={{ transition: 'r 180ms ease' }}
                />
                {/* inner dot for property (center) */}
                {n.type === 'property' && (
                  <circle cx={n.x} cy={n.y} r={r * 0.45} fill="white" fillOpacity={0.9} />
                )}
                {/* label */}
                <text
                  x={n.x}
                  y={n.y + r + 2.6}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ fontSize: 2.3, fontWeight: isFocus || isSelected ? 700 : 500 }}
                  opacity={dim ? 0.4 : 0.95}
                >
                  {n.label.length > 22 ? n.label.slice(0, 21) + '…' : n.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

// ----------------- Filter row -----------------
function TypeFilterRow({
  enabled, onToggle,
}: {
  enabled: Set<NodeType>
  onToggle: (t: NodeType) => void
}) {
  const types = Object.keys(TYPE_META) as NodeType[]
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-2.5">
        <Filter className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-xs font-semibold">Node types</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{enabled.size}/{types.length} shown</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {types.map((t) => {
          const meta = TYPE_META[t]
          const isOn = enabled.has(t)
          const count = GRAPH_NODES.filter(n => n.type === t).length
          return (
            <button
              key={t}
              onClick={() => onToggle(t)}
              className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                isOn ? 'border-transparent text-white shadow-sm' : 'border-border text-muted-foreground hover:bg-accent/40'
              }`}
              style={isOn ? { backgroundColor: meta.color } : { color: meta.color, borderColor: meta.color + '40' }}
            >
              {meta.icon}
              <span>{meta.label}</span>
              <span className={`text-[9px] tabular-nums ${isOn ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

// ----------------- Legend -----------------
function LegendCard() {
  const types = Object.keys(TYPE_META) as NodeType[]
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-3.5 w-3.5 text-teal-500" />
        <span className="text-xs font-semibold">Legend</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {types.map((t) => {
          const meta = TYPE_META[t]
          return (
            <div key={t} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
              <span className="text-[11px]">{meta.label}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ----------------- Node detail side panel -----------------
function NodeDetailPanel({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const meta = TYPE_META[node.type]
  const edges = edgesForNode(node.id)
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-40" style={{ backgroundColor: meta.color + '33' }} />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ backgroundColor: meta.color }}>
              {meta.icon}
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-tight truncate">{node.label}</p>
              <p className="text-[11px] text-muted-foreground">Type: {meta.label}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-base font-bold tabular-nums">{edges.length}</p>
            <p className="text-[10px] text-muted-foreground">Connections</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-base font-bold tabular-nums">{edges.reduce((s, e) => s + e.weight, 0)}</p>
            <p className="text-[10px] text-muted-foreground">Total weight</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-base font-bold tabular-nums">{new Set(edges.map(e => e.label)).size}</p>
            <p className="text-[10px] text-muted-foreground">Rel. types</p>
          </div>
        </div>

        <Separator className="my-3" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Connected to</p>
        <ScrollArea className="max-h-72 pr-2">
          <div className="space-y-1.5">
            {edges.map((e, i) => {
              const otherId = e.from === node.id ? e.to : e.from
              const other = nodeById(otherId)
              if (!other) return null
              const otherMeta = TYPE_META[other.type]
              const direction = e.from === node.id ? '→' : '←'
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => toast.info(`Inspecting ${other.label}`, { description: readableSentence(e) })}
                  className="w-full text-left rounded-lg border border-border bg-card/50 p-2 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: otherMeta.color }} />
                    <span className="text-xs font-medium truncate flex-1">{other.label}</span>
                    <StatusPill status={otherMeta.label} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 ml-4">
                    {direction} <span className="text-foreground/70 font-medium">{e.label}</span> · weight {e.weight}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}

// ----------------- All relationships list -----------------
function AllRelationshipsPanel() {
  const [q, setQ] = React.useState('')
  const filtered = React.useMemo(() => {
    if (!q.trim()) return GRAPH_EDGES
    const lc = q.toLowerCase()
    return GRAPH_EDGES.filter(e => {
      const a = nodeById(e.from)
      const b = nodeById(e.to)
      const sentence = `${a?.label} ${e.label} ${b?.label}`.toLowerCase()
      return sentence.includes(lc)
    })
  }, [q])
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-violet-500" />
          <h3 className="font-semibold text-sm">Relationships</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">{GRAPH_EDGES.length} edges</Badge>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search relationships…"
        className="w-full h-8 mb-2 rounded-md border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30"
      />
      <ScrollArea className="max-h-96 pr-2">
        <div className="space-y-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No matches.</p>
          )}
          {filtered.map((e, i) => {
            const a = nodeById(e.from)!
            const b = nodeById(e.to)!
            const aMeta = TYPE_META[a.type]
            const bMeta = TYPE_META[b.type]
            return (
              <div key={i} className="rounded-lg border border-border bg-card/40 p-2 hover:bg-accent/40 transition-colors">
                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                  <span className="font-medium" style={{ color: aMeta.color }}>{a.label}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[9.5px]">
                    <ArrowRight className="h-2.5 w-2.5" /> {e.label}
                  </span>
                  <span className="font-medium" style={{ color: bMeta.color }}>{b.label}</span>
                  <span className="ml-auto text-[9.5px] text-muted-foreground tabular-nums">w{e.weight}</span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
}

// ----------------- Stats strip -----------------
function StatsStrip({ enabledCount }: { enabledCount: number }) {
  const relTypes = new Set(GRAPH_EDGES.map(e => e.label)).size
  const stats = [
    { label: 'Total Nodes', value: GRAPH_NODES.length, icon: <Network className="h-4 w-4" />, color: '#ea580c' },
    { label: 'Total Edges', value: GRAPH_EDGES.length, icon: <Share2 className="h-4 w-4" />, color: '#0d9488' },
    { label: 'Relationship Types', value: relTypes, icon: <Sparkles className="h-4 w-4" />, color: '#9333ea' },
    { label: 'Visible Now', value: enabledCount, icon: <Eye className="h-4 w-4" />, color: '#15803d' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-4 relative overflow-hidden gap-0">
          <div className="absolute -right-4 -top-4 h-14 w-14 rounded-full blur-2xl opacity-40" style={{ backgroundColor: s.color + '22' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: s.color + '1a', color: s.color }}>
              {s.icon}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ----------------- Module -----------------
export function KnowledgeGraphModule() {
  const allTypes = Object.keys(TYPE_META) as NodeType[]
  const [enabled, setEnabled] = React.useState<Set<NodeType>>(new Set(allTypes))
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<string | null>(null)
  const [zoom, setZoom] = React.useState(1)

  const toggleType = (t: NodeType) => {
    setEnabled(prev => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t); else next.add(t)
      return next
    })
  }

  const selectedNode = selected ? nodeById(selected) : null
  const visibleCount = GRAPH_NODES.filter(n => enabled.has(n.type)).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Hospitality Knowledge Graph"
        description="Guests, companies, families, bookings, campaigns, rooms, reviews, experiences, referrals, staff, properties — all connected. The AI uses these relationships to make better recommendations."
        action={
          <Badge variant="outline" className="text-[10px] bg-background/60">
            <Database className="h-3 w-3 text-orange-500" /> {GRAPH_NODES.length} nodes · {GRAPH_EDGES.length} edges
          </Badge>
        }
      />

      {/* Stats */}
      <StatsStrip enabledCount={visibleCount} />

      {/* Filter row */}
      <TypeFilterRow enabled={enabled} onToggle={toggleType} />

      {/* Graph + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold text-sm">Relationship Graph</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.7, +(z - 0.1).toFixed(2)))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(1.6, +(z + 0.1).toFixed(2)))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2 ml-1" onClick={() => { setZoom(1); setHovered(null); setSelected(null); setEnabled(new Set(allTypes)); toast.success('Graph reset') }}>
                <Maximize2 className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </div>

          <GraphSVG
            enabledTypes={enabled}
            hovered={hovered}
            selected={selected}
            onHover={setHovered}
            onSelect={setSelected}
            zoom={zoom}
          />

          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MousePointerClick className="h-3 w-3" /> Hover to highlight · click to inspect
            </span>
            <span>{visibleCount} nodes · {GRAPH_EDGES.filter(e => enabled.has(nodeById(e.from)!.type) && enabled.has(nodeById(e.to)!.type)).length} edges visible</span>
          </div>
        </Card>

        <div>
          {selectedNode ? (
            <NodeDetailPanel node={selectedNode} onClose={() => setSelected(null)} />
          ) : (
            <LegendCard />
          )}
        </div>
      </div>

      {/* All relationships */}
      <AllRelationshipsPanel />
    </div>
  )
}
