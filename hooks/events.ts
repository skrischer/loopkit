import { atom, read, update } from 'claude-code'
import type { EngineInterface, On } from 'claude-code'

import type { FeedEvent, Snapshot, Task } from '../types'
import { when } from './meters'
import { publishStatus } from './status'

// The engine's scan follows only references written in this file, so the
// state refs are spelled here; their defaults live in types/index.d.ts.
const events = { plugin: 'loopkit', key: 'events' } as const
const tasks = { plugin: 'loopkit', key: 'tasks' } as const
const snapshot = atom({ plugin: 'loopkit', key: 'snapshot' } as const, null as Snapshot | null, { shape: 'snapshot-2' })

const MAX_HELD = 50
const MAX_TEXT = 200
const MERGE = /\bgh\s+pr\s+merge\s+(\d+)/
const EXIT_LINE = /^Exit code \d+$/
// Control characters: C0 and C1 (with DEL).
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/g

export type NewEvent = { kind: string; text: string }

// Event text from tools, reasons or GitHub is displayed only: strip control
// characters and cut it before it is stored.
export function cleanText(text: string): string {
  return text.replace(CONTROL, '').slice(0, MAX_TEXT)
}

const firstLine = (text: string): string => text.split(/\r?\n/, 1)[0] ?? ''

// A repeat (same kind and text) counts up and moves to the front; anything
// else is prepended. At most 50 are held.
export function pushEvent(held: readonly FeedEvent[], event: NewEvent, at: number): FeedEvent[] {
  const known = held.find(row => row.kind === event.kind && row.text === event.text)
  if (known !== undefined) {
    const bumped: FeedEvent = { ...known, count: known.count + 1, at }

    return [bumped, ...held.filter(row => row !== known)].slice(0, MAX_HELD)
  }

  return [{ kind: event.kind, text: event.text, at, count: 1 }, ...held].slice(0, MAX_HELD)
}

// One text per kind, pure. Only the subject (issue, PR) is titled.
const subject = (ref: string, title: string | undefined): string => (title === undefined || title === '' ? ref : `${ref} ${title}`)

export const issueClosedText = (n: number, title?: string): string => `${subject(`#${n}`, title)} closed`

export const mergeFailedText = (n: number, title?: string, detail?: string): string =>
  `${subject(`PR #${n}`, title)} merge failed${detail === undefined || detail === '' ? '' : `: ${detail}`}`

export const subagentEndedText = (reason: 'error' | 'aborted', description: string): string =>
  `${reason === 'error' ? 'subagent failed' : 'subagent stopped'}: ${description}`

export const taskStoppedText = (description: string): string => `stopped: ${description}`

export const deniedText = (tool: string, reason: string): string => `denied ${tool}: ${firstLine(reason)}`

export const compactedText = (trigger: string): string => `compacted (${trigger})`

export const limitText = (until: string | undefined, now: number): string =>
  until === undefined ? 'usage limit' : `usage limit — resumes ${when(until, now)}`

// The issue number of a `gh pr merge <n>` command, else undefined.
export function mergeTarget(command: string): number | undefined {
  const hit = MERGE.exec(command)

  return hit === null ? undefined : Number(hit[1])
}

// The first non-empty line of an error result that is not an `Exit code <n>` line.
export function mergeDetail(text: string | undefined): string | undefined {
  for (const raw of (text ?? '').split(/\r?\n/)) {
    const line = raw.trim()
    if (line !== '' && !EXIT_LINE.test(line)) return line
  }

  return undefined
}

// The merge-failure event for a Bash command and its error text, titled from
// the snapshot; null when the command is no `gh pr merge <n>`.
export function mergeFailedEvent(command: string, titles: Snapshot['titles'] | undefined, text: string | undefined): NewEvent | null {
  const n = mergeTarget(command)

  return n === undefined ? null : { kind: 'merge-failed', text: mergeFailedText(n, titles?.[n], mergeDetail(text)) }
}

// The description of a stopped task: the held task with that id (or spawn
// agent id), else the result's command, else `task <id>`.
export function stoppedDescription(held: readonly Task[], id: string, command: string | undefined): string {
  const task = held.find(row => row.id === id || row.agentId === id)

  return task?.description || command || `task ${id}`
}

// Issues in the previous snapshot's open list that the next one lacks, titled
// from the previous titles. The first successful read has no previous list.
export function closedEvents(prev: Snapshot | null, next: Snapshot): NewEvent[] {
  if (prev === null) return []
  const still = new Set(next.open)

  return (prev.open ?? [])
    .filter(n => !still.has(n))
    .map(n => ({ kind: 'issue-closed', text: issueClosedText(n, prev.titles?.[n]) }))
}

// Every event goes through here, whichever module saw it.
export async function recordEvent($: EngineInterface, event: NewEvent): Promise<void> {
  const at = await $.clock.now()
  const text = cleanText(event.text)
  await update($, events, held => pushEvent(held ?? [], { kind: event.kind, text }, at))
  await publishStatus($)
}

export async function subagentEnded($: EngineInterface, reason: 'error' | 'aborted', description: string): Promise<void> {
  await recordEvent($, { kind: 'subagent-ended', text: subagentEndedText(reason, description) })
}

// The mod's own bookkeeping never changes a turn: a write that fails is dropped.
async function safely(work: () => Promise<unknown>): Promise<void> {
  try {
    await work()
  } catch {
    // a mod fault stays out of the session
  }
}

export function registerEvents(on: On, isActive: () => boolean): void {
  // A background task the main loop stopped.
  on('tool.call', { tool: 'TaskStop' }, async ($, e, next) => {
    const ran = await next(e)
    if (!isActive() || e.agentId !== undefined || ran.isError === true || ran.deny !== undefined) return ran
    await safely(async () => {
      const result = (ran.result ?? {}) as { task_id?: string; command?: string }
      const id = result.task_id ?? e.task_id ?? e.shell_id
      if (id === undefined) return
      const description = stoppedDescription((await read($, tasks)) ?? [], id, result.command)
      await recordEvent($, { kind: 'task-stopped', text: taskStoppedText(description) })
    })

    return ran
  }).catch(($, e, next) => next(e))

  // A failed `gh pr merge`, in any loop.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (!isActive() || ran.isError !== true) return ran
    await safely(async () => {
      if (mergeTarget(e.command) === undefined) return
      const snap = await read($, snapshot)
      const event = mergeFailedEvent(e.command, snap?.titles, ran.text)
      if (event !== null) await recordEvent($, event)
    })

    return ran
  }).catch(($, e, next) => next(e))

  // Auto-mode classifier denials only.
  on('classic.PermissionDenied', async ($, e, next) => {
    const done = await next(e)
    if (!isActive()) return done
    await safely(() => recordEvent($, { kind: 'denied', text: deniedText(e.tool_name, e.reason) }))

    return done
  }).catch(($, e, next) => next(e))
}
