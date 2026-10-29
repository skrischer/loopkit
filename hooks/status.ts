import { atom, read } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import type { Ask, Asking, Beat, FeedEvent, Meters, Snapshot, Task } from '../types'
import { limitActive, when } from './meters'

// Every value here is ephemeral session state, re-derived from GitHub and the
// session's events. The pane is a view, never a second source of truth.
export const snapshot = atom({ plugin: 'loopkit', key: 'snapshot' } as const, null as Snapshot | null, { shape: 'snapshot-1' })
export const isRefreshing = atom({ plugin: 'loopkit', key: 'isRefreshing' } as const, false)
export const asks = atom({ plugin: 'loopkit', key: 'asks' } as const, [] as Ask[])
export const calls = atom({ plugin: 'loopkit', key: 'calls' } as const, 0)
export const asking = atom({ plugin: 'loopkit', key: 'asking' } as const, null as Asking | null)
export const tasks = atom({ plugin: 'loopkit', key: 'tasks' } as const, [] as Task[])
export const now = atom({ plugin: 'loopkit', key: 'now' } as const, 0)
export const meters = atom({ plugin: 'loopkit', key: 'meters' } as const, { compactions: 0, limits: [] } as Meters)
export const beat = atom({ plugin: 'loopkit', key: 'beat' } as const, null as Beat | null)
export const lastText = atom({ plugin: 'loopkit', key: 'lastText' } as const, null as number | null)
export const events = atom({ plugin: 'loopkit', key: 'events' } as const, [] as FeedEvent[])

export function statusLine(
  s: Snapshot | null,
  question: Asking | null,
  held: readonly Ask[],
  running: readonly Task[],
  limit?: Meters['limit'],
  at: number = Date.now(),
): string {
  const active = limitActive(limit, at)
  // Claude Code draws the plugin's status line as `loopkit: <text>`, so the
  // limit part opens the text in every form.
  const lead = active === undefined ? '' : active.until === undefined ? 'limited · ' : `limited until ${when(active.until, at)} · `
  if (s === null) return `${lead}reading GitHub…`
  if (s.error !== null) return `${lead}${s.error}`
  const needs = (question ? 1 : 0) + held.length + s.gates.length
  const m = s.milestones.find(row => row.inFlight > 0) ?? s.milestones[0]
  const parts = [`${needs} need you`]
  if (m) parts.push(`#${m.number} ${m.closed}/${m.total}`)
  parts.push(`${running.length} running`)

  return lead + parts.join(' · ')
}

export async function publishStatus($: EngineInterface): Promise<void> {
  const [s, q, h, t, m, at] = await Promise.all([
    read($, snapshot),
    read($, asking),
    read($, asks),
    read($, tasks),
    read($, meters),
    $.clock.now(),
  ])
  $.ui.status(statusLine(s, q, h, t, m?.limit, at))
}
