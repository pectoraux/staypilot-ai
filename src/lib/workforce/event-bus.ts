// StayPilot V5 — Event Bus
// Every action generates events. Employees subscribe instead of polling.
import type { WorkforceEvent, WorkforceEventType } from './types'

type Handler = (event: WorkforceEvent) => void

class EventBus {
  private handlers: Map<WorkforceEventType | '*', Set<Handler>> = new Map()
  private history: WorkforceEvent[] = []
  private maxHistory = 200

  subscribe(type: WorkforceEventType | '*', handler: Handler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    this.handlers.get(type)!.add(handler)
    return () => this.handlers.get(type)?.delete(handler)
  }

  publish(event: WorkforceEvent): void {
    this.history.unshift(event)
    if (this.history.length > this.maxHistory) this.history.pop()
    this.handlers.get(event.type)?.forEach((h) => { try { h(event) } catch (e) { /* swallow */ } })
    this.handlers.get('*')?.forEach((h) => { try { h(event) } catch (e) { /* swallow */ } })
  }

  getHistory(limit = 50): WorkforceEvent[] {
    return this.history.slice(0, limit)
  }

  getHistoryByType(type: WorkforceEventType, limit = 20): WorkforceEvent[] {
    return this.history.filter((e) => e.type === type).slice(0, limit)
  }

  clear(): void {
    this.history = []
  }
}

export const eventBus = new EventBus()

export function emit(type: WorkforceEventType, payload: Record<string, unknown> = {}, ids: { employeeId?: string; taskId?: string; missionId?: string; goalId?: string; toolName?: string } = {}): WorkforceEvent {
  const event: WorkforceEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    timestamp: Date.now(),
    ...ids,
    payload,
  }
  eventBus.publish(event)
  return event
}
