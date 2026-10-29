import { read, update } from 'claude-code'
import type { EngineInterface, On } from 'claude-code'

import type { Meters } from '../types'
import { compactedText, limitText, recordEvent } from './events'
import { ageText } from './pane'
import { publishStatus } from './status'

// The engine's scan follows only references written in this file, so the
// state refs are spelled here; their defaults live in types/index.d.ts.
const meters = { plugin: 'loopkit', key: 'meters' } as const
const beat = { plugin: 'loopkit', key: 'beat' } as const
const lastText = { plugin: 'loopkit', key: 'lastText' } as const

const WARN_CONTEXT = 85
const LABELS: Record<string, string> = { five_hour: '5h', seven_day: '7d' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const initial = (): Meters => ({ compactions: 0, limits: [] })

const two = (n: number): string => String(n).padStart(2, '0')

// HH:MM for a reset today (local time), else <Ddd> HH:MM.
export function when(iso: string, now: number): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const time = `${two(d.getHours())}:${two(d.getMinutes())}`

  return d.toDateString() === new Date(now).toDateString() ? time : `${DAYS[d.getDay()]} ${time}`
}

// A held stop counts until its reset time has passed; a stop without a time
// counts until a reading clears it. Read-only: nothing is written here.
export function limitActive(limit: Meters['limit'] | null | undefined, now: number): Meters['limit'] | undefined {
  if (limit === undefined || limit === null) return undefined
  if (limit.until !== undefined) {
    const at = Date.parse(limit.until)
    if (!Number.isNaN(at) && at <= now) return undefined
  }

  return limit
}

// A reading with windows, every one under 100 %, clears a held stop. An empty
// reading clears nothing.
export function clearsLimit(limits: Meters['limits']): boolean {
  return limits.length > 0 && limits.every(window => window.percentUsed < 100)
}

// The latest reset among the windows at 100 % or more; unset when none is.
export function limitUntil(limits: Meters['limits']): string | undefined {
  let best: { iso: string; at: number } | undefined
  for (const window of limits) {
    if (window.percentUsed < 100 || window.resetsAt === undefined) continue
    const at = Date.parse(window.resetsAt)
    if (Number.isNaN(at)) continue
    if (best === undefined || at > best.at) best = { iso: window.resetsAt, at }
  }

  return best?.iso
}

export type Reading = { context?: { percent?: number }; rateLimits: Meters['limits'] }

// The pure writes behind the hooks.
export function withReading(held: Meters | undefined, e: Reading): Meters {
  const limits = e.rateLimits.map(window => {
    const row: Meters['limits'][number] = { kind: window.kind, percentUsed: window.percentUsed }
    if (window.resetsAt !== undefined) row.resetsAt = window.resetsAt

    return row
  })
  const out: Meters = { ...(held ?? initial()), limits }
  if (e.context?.percent !== undefined) out.context = e.context.percent
  if (out.limit !== undefined && clearsLimit(limits)) delete out.limit

  return out
}

export function withCompaction(held: Meters | undefined): Meters {
  const m = held ?? initial()

  return { ...m, compactions: m.compactions + 1 }
}

export function withStop(held: Meters | undefined): Meters {
  const m = held ?? initial()
  const until = limitUntil(m.limits)

  return { ...m, limit: until === undefined ? {} : { until } }
}

export type MeterPart = { text: string; warn: boolean }
export type MeterLine = { limited: boolean; parts: MeterPart[]; text: string }

// null when there is nothing to show. A limit stop shows `limited [until <when>]`
// and the context part only; the pane draws the whole line in the warning colour.
export function meterLine(m: Meters, now: number): MeterLine | null {
  const ctx: MeterPart | undefined =
    m.context === undefined ? undefined : { text: `ctx ${Math.round(m.context)}%`, warn: m.context >= WARN_CONTEXT }
  const limit = limitActive(m.limit, now)
  if (limit !== undefined) {
    const head = limit.until === undefined ? 'limited' : `limited until ${when(limit.until, now)}`
    const parts: MeterPart[] = [{ text: head, warn: true }]
    if (ctx !== undefined) parts.push(ctx)

    return { limited: true, parts, text: parts.map(part => part.text).join(' · ') }
  }
  const parts: MeterPart[] = []
  if (ctx !== undefined) parts.push(ctx)
  if (m.compactions > 0) parts.push({ text: `${m.compactions} compacted`, warn: false })
  for (const window of m.limits) {
    parts.push({ text: `${LABELS[window.kind] ?? window.kind} ${Math.round(window.percentUsed)}%`, warn: false })
  }
  if (parts.length === 0) return null

  return { limited: false, parts, text: parts.map(part => part.text).join(' · ') }
}

export function beatLine(b: { working: boolean; since: number } | null, text: number | null, now: number): string | null {
  if (b === null) return null
  const head = `${b.working ? 'working' : 'idle'} ${ageText(now - b.since)}`

  return text === null ? head : `${head} · last text ${ageText(now - text)} ago`
}

// The mod's own bookkeeping never changes a turn: a write that fails is dropped.
async function safely(work: () => Promise<unknown>): Promise<void> {
  try {
    await work()
  } catch {
    // a mod fault stays out of the session
  }
}

// The main loop's turn end, called from the one turn.complete hook in
// hooks/session.ts (the engine refuses a second unmatched one). That hook
// publishes the status afterwards.
export async function beatAfterTurn($: EngineInterface, e: { answer: string }): Promise<void> {
  const at = await $.clock.now()
  await update($, beat, () => ({ working: false, since: at }))
  if (e.answer.trim() !== '') await update($, lastText, () => at)
}

export function registerMeters(on: On, isActive: () => boolean): void {
  on('session.measure', async ($, e, next) => {
    const done = await next(e)
    if (!isActive()) return done
    await safely(async () => {
      await update($, meters, held => withReading(held, e))
      await publishStatus($)
    })

    return done
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    const done = await next(e)
    if (!isActive() || e.agentId !== undefined) return done
    await safely(async () => {
      const at = await $.clock.now()
      await update($, beat, () => ({ working: true, since: at }))
      await publishStatus($)
    })

    return done
  }).catch(($, e, next) => next(e))

  // Main loop only: a subagent's compaction carries an agent_id.
  on('classic.PostCompact', async ($, e, next) => {
    const done = await next(e)
    if (!isActive() || e.agent_id !== undefined) return done
    await safely(async () => {
      await update($, meters, withCompaction)
      await recordEvent($, { kind: 'compacted', text: compactedText(e.trigger) })
    })

    return done
  }).catch(($, e, next) => next(e))

  on('classic.StopFailure', async ($, e, next) => {
    const done = await next(e)
    if (!isActive() || e.error !== 'rate_limit') return done
    await safely(async () => {
      await update($, meters, withStop)
      const held = await read($, meters)
      const at = await $.clock.now()
      await recordEvent($, { kind: 'limit', text: limitText(held?.limit?.until, at) })
    })

    return done
  }).catch(($, e, next) => next(e))
}
