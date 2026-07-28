// StayPilot V5 — Memory Store
// Every employee has long-term memory. Shared org memory too.
// Persists to localStorage so it survives reloads.
import type { MemoryEvent, MemoryQuery, Memory, MemoryStore } from './types'
import { emit } from './event-bus'

const STORAGE_KEY = 'staypilot-memory-v5'

class MemoryStoreImpl implements MemoryStore {
  private memories: Memory[] = []
  private loaded = false

  private load() {
    if (this.loaded) return
    this.loaded = true
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) this.memories = JSON.parse(raw)
      else this.seed()
    } catch { this.seed() }
  }

  private seed() {
    const now = Date.now()
    this.memories = [
      { id: 'mem-seed-1', employeeId: 'emp-crm', scope: 'guest', type: 'preference', content: 'David Kumar always requests Room 101 (ground floor)', confidence: 94, createdAt: now - 86400000 * 30, timesRecalled: 5 },
      { id: 'mem-seed-2', employeeId: 'emp-crm', scope: 'guest', type: 'sensitivity', content: 'Aisha Mensah allergic to feathers — needs synthetic pillows', confidence: 91, createdAt: now - 86400000 * 20, timesRecalled: 3 },
      { id: 'mem-seed-3', employeeId: 'emp-revenue', scope: 'pricing', type: 'pattern', content: 'Weekend price elasticity is low — 10% increase drops demand only 4%', confidence: 84, createdAt: now - 86400000 * 14, timesRecalled: 8 },
      { id: 'mem-seed-4', employeeId: 'emp-marketing', scope: 'campaign', type: 'performance', content: 'WhatsApp campaigns at 1 PM convert 5.8% — best send time', confidence: 91, createdAt: now - 86400000 * 10, timesRecalled: 4 },
      { id: 'mem-seed-5', employeeId: 'emp-ops', scope: 'maintenance', type: 'history', content: 'Room 303 jacuzzi needs seal replacement every ~18 months', confidence: 88, createdAt: now - 86400000 * 60, timesRecalled: 2 },
      { id: 'mem-seed-6', employeeId: 'emp-gm', scope: 'strategy', type: 'lesson', content: 'Free breakfast outperforms 10% discounts by 34% (network A/B)', confidence: 91, createdAt: now - 86400000 * 5, timesRecalled: 6 },
    ]
    this.persist()
  }

  private persist() {
    if (typeof window === 'undefined') return
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memories)) } catch { /* quota */ }
  }

  async remember(event: MemoryEvent): Promise<void> {
    this.load()
    const memory: Memory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      employeeId: event.employeeId,
      scope: event.scope,
      type: event.type,
      content: event.content,
      metadata: event.metadata,
      confidence: event.confidence ?? 70,
      createdAt: Date.now(),
      timesRecalled: 0,
    }
    this.memories.unshift(memory)
    if (this.memories.length > 500) this.memories = this.memories.slice(0, 500)
    this.persist()
    emit('MemoryWritten', { content: memory.content, scope: memory.scope }, { employeeId: event.employeeId })
  }

  async recall(query: MemoryQuery): Promise<Memory[]> {
    this.load()
    let results = this.memories
    if (query.employeeId) results = results.filter((m) => m.employeeId === query.employeeId)
    if (query.scope) results = results.filter((m) => m.scope === query.scope)
    if (query.type) results = results.filter((m) => m.type === query.type)
    if (query.search) {
      const q = query.search.toLowerCase()
      results = results.filter((m) => m.content.toLowerCase().includes(q))
    }
    const limited = results.slice(0, query.limit ?? 20)
    // increment recall count
    limited.forEach((m) => { m.timesRecalled++ })
    if (limited.length) {
      emit('MemoryRecalled', { count: limited.length, query }, { employeeId: query.employeeId })
    }
    this.persist()
    return limited
  }

  getAll(): Memory[] {
    this.load()
    return this.memories
  }

  clearEmployee(employeeId: string): void {
    this.load()
    this.memories = this.memories.filter((m) => m.employeeId !== employeeId)
    this.persist()
  }
}

export const memoryStore: MemoryStore & { getAll(): Memory[]; clearEmployee(id: string): void } = new MemoryStoreImpl()
