import { atom, read } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import type { Ask, Asking, Snapshot, Task } from '../types'

// Every value here is ephemeral session state, re-derived from GitHub and the
// session's events. The pane is a view, never a second source of truth.
export const snapshot = atom({ plugin: 'loopkit', key: 'snapshot' } as const, null as Snapshot | null, { shape: 'snapshot-1' })
export const isRefreshing = atom({ plugin: 'loopkit', key: 'isRefreshing' } as const, false)
export const asks = atom({ plugin: 'loopkit', key: 'asks' } as const, [] as Ask[])
export const calls = atom({ plugin: 'loopkit', key: 'calls' } as const, 0)
export const asking = atom({ plugin: 'loopkit', key: 'asking' } as const, null as Asking | null)
export const tasks = atom({ plugin: 'loopkit', key: 'tasks' } as const, [] as Task[])
export const now = atom({ plugin: 'loopkit', key: 'now' } as const, 0)

export function statusLine(
  s: Snapshot | null,
  question: Asking | null,
  held: readonly Ask[],
  running: readonly Task[],
): string {
  if (s === null) return 'loopkit · reading GitHub…'
  if (s.error !== null) return `loopkit: ${s.error}`
  const needs = (question ? 1 : 0) + held.length + s.gates.length
  const m = s.milestones.find(row => row.inFlight > 0) ?? s.milestones[0]
  const parts = ['loopkit', `${needs} need you`]
  if (m) parts.push(`#${m.number} ${m.closed}/${m.total}`)
  parts.push(`${running.length} running`)

  return parts.join(' · ')
}

export async function publishStatus($: EngineInterface): Promise<void> {
  const [s, q, h, t] = await Promise.all([read($, snapshot), read($, asking), read($, asks), read($, tasks)])
  $.ui.status(statusLine(s, q, h, t))
}
