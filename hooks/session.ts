import { read, update } from 'claude-code'
import type { EngineInterface, On } from 'claude-code'

import type { Ask, Task } from '../types'
import { getLastRefresh, refresh } from './github'
import { publishStatus } from './status'

const ASK_LINE = /^Needs you: .+$/
const PANE_COMMAND = 'loopkit-status'

// The engine's scan follows only references written in this file, so the
// state refs are spelled here; their defaults live in types/index.d.ts.
const asks = { plugin: 'loopkit', key: 'asks' } as const
const calls = { plugin: 'loopkit', key: 'calls' } as const
const asking = { plugin: 'loopkit', key: 'asking' } as const
const tasks = { plugin: 'loopkit', key: 'tasks' } as const

// Every line of an answer that starts with the marker, outside fenced code
// blocks. A line starting with three backticks toggles a fence. The whole line
// is the ask's text and its identity.
export function parseAsks(answer: string): string[] {
  const lines: string[] = []
  let fenced = false
  for (const line of answer.split(/\r?\n/)) {
    if (line.trimStart().startsWith('```')) {
      fenced = !fenced
      continue
    }
    if (!fenced && ASK_LINE.test(line)) lines.push(line)
  }

  return lines
}

// A held ask with the same text counts the repeat; any other line is a new ask.
// The carry of an open ask repeats it verbatim, so a repeat is normal. A line
// said twice in one answer is one sighting.
export function mergeAsks(held: readonly Ask[], lines: readonly string[], now: number, callCount: number): Ask[] {
  const next = held.map(ask => ({ ...ask }))
  for (const text of new Set(lines)) {
    const known = next.find(ask => ask.text === text)
    if (known) {
      known.count += 1
      known.lastSeen = now
    } else {
      next.push({ text, firstSeen: now, lastSeen: now, count: 1, callsAt: callCount })
    }
  }

  return next
}

export type BackgroundTask = {
  id: string
  type: string
  description: string
  command?: string
  agent_type?: string
  tool?: string
  name?: string
}

// classic.Stop lists every task in flight. A held entry keeps its firstSeen,
// lastActivity and detail: by id, or else a held subagent with the same
// description (agent.spawn saw it first, under its agent id, which the row
// keeps as agentId when it is re-keyed to the Stop's task id).
export function mergeTasks(held: readonly Task[], running: readonly BackgroundTask[], now: number): Task[] {
  const runningIds = new Set(running.map(item => item.id))
  const claimed = new Set<Task>()
  return running.map(item => {
    const description = (item.description ?? '').split('\n')[0] ?? ''
    // The description fallback takes only a spawn row no Stop has claimed: not
    // listed by id, not re-keyed before, not taken earlier in this merge.
    const known =
      held.find(task => task.id === item.id) ??
      held.find(
        task =>
          task.kind === 'subagent' &&
          task.description === description &&
          task.agentId === undefined &&
          !runningIds.has(task.id) &&
          !claimed.has(task),
      )
    if (known !== undefined) claimed.add(known)
    const detail = known?.detail ?? item.agent_type ?? item.command ?? item.tool ?? item.name
    const task: Task = {
      id: item.id,
      kind: item.type,
      description,
      firstSeen: known?.firstSeen ?? now,
    }
    if (detail !== undefined) task.detail = detail
    if (known?.lastActivity !== undefined) task.lastActivity = known.lastActivity
    // The spawn's agent id outlives the re-key to the Stop's task id.
    const agentId = known?.agentId ?? (known !== undefined && known.id !== item.id ? known.id : undefined)
    if (agentId !== undefined) task.agentId = agentId

    return task
  })
}

// The human's own next message clears the held asks: typed in the terminal or
// sent through Remote Control, not meta, not the pane's own command. A task
// notification, a scheduled trigger, a plugin or a peer leaves them.
export function clearsAsks(e: { origin: { kind: string }; isMeta?: true; command?: { name: string } }): boolean {
  return (e.origin.kind === 'composer' || e.origin.kind === 'bridge') && !e.isMeta && e.command?.name !== PANE_COMMAND
}

// A subagent seen at agent.spawn, before any Stop lists it. Keyed by id.
export function addSubagent(held: readonly Task[], id: string, description: string, model: string, now: number): Task[] {
  return held.some(task => task.id === id || task.agentId === id) ? [...held] : [...held, { id, kind: 'subagent', description, detail: model, firstSeen: now }]
}

export function dropTask(held: readonly Task[], id: string): Task[] {
  return held.filter(task => task.id !== id && task.agentId !== id)
}

export function touchTask(held: readonly Task[], id: string, now: number): Task[] {
  return held.map(task => (task.id === id || task.agentId === id ? { ...task, lastActivity: now } : task))
}

async function stamp($: EngineInterface): Promise<number> {
  return await $.clock.now()
}

// The main loop's turn end re-reads GitHub unless a read ran in the last 15 s.
// It lives here because the engine refuses a second unmatched turn.complete
// hook in one module graph. Fire and forget: no turn waits on gh.
const THROTTLE_MS = 15_000
async function refreshAfterTurn($: EngineInterface): Promise<void> {
  if ((await $.clock.now()) - getLastRefresh() < THROTTLE_MS) return
  void refresh($).catch(() => undefined)
}

// The mod's own bookkeeping never changes a turn: a write that fails is dropped.
async function safely(work: () => Promise<unknown>): Promise<void> {
  try {
    await work()
  } catch {
    // a mod fault stays out of the session
  }
}

export function registerSession(on: On, isActive: () => boolean): void {
  // Asks: the main loop's final answer carries them; the human's next message clears them.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (!isActive()) return done
    await safely(async () => {
      const agentId = e.agentId
      if (agentId !== undefined) {
        await update($, tasks, held => dropTask(held ?? [], agentId))
      } else {
        const lines = parseAsks(e.answer)
        if (lines.length > 0) {
          const at = await stamp($)
          const callCount = (await read($, calls)) ?? 0
          await update($, asks, held => mergeAsks(held ?? [], lines, at, callCount))
        }
      }
      await publishStatus($)
    })
    if (e.agentId === undefined) await safely(() => refreshAfterTurn($))

    return done
  }).catch(($, e, next) => next(e))

  on('prompt.submit', async ($, e, next) => {
    if (isActive() && clearsAsks(e)) {
      await safely(async () => {
        await update($, asks, () => [])
        await publishStatus($)
      })
    }

    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    if (isActive()) {
      await safely(async () => {
        const agentId = e.agentId
        if (agentId === undefined) {
          await update($, calls, n => (n ?? 0) + 1)
        } else {
          const at = await stamp($)
          await update($, tasks, held => touchTask(held ?? [], agentId, at))
        }
        await publishStatus($)
      })
    }

    return next(e)
  }).catch(($, e, next) => next(e))

  // The open question. The finally keeps the atom honest when the call throws;
  // a throw from next itself still reaches the engine untouched.
  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    if (!isActive() || e.agentId !== undefined) return next(e)
    await safely(async () => {
      const headers = e.questions.map(q => q.header).join(', ')
      const since = await stamp($)
      await update($, asking, () => ({ headers, since }))
      await publishStatus($)
    })
    try {
      return await next(e)
    } finally {
      await safely(async () => {
        await update($, asking, () => null)
        await publishStatus($)
      })
    }
  }).catch(($, e, next) => next(e))

  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (!isActive() || started.agentId === undefined) return started
    const id = started.agentId
    await safely(async () => {
      const at = await stamp($)
      await update($, tasks, held => addSubagent(held ?? [], id, e.description, started.model, at))
      await publishStatus($)
    })

    return started
  }).catch(($, e, next) => next(e))

  on('classic.Stop', async ($, e, next) => {
    const done = await next(e)
    if (!isActive() || e.background_tasks === undefined) return done
    const running = e.background_tasks
    await safely(async () => {
      const at = await stamp($)
      await update($, tasks, held => mergeTasks(held ?? [], running, at))
      await publishStatus($)
    })

    return done
  }).catch(($, e, next) => next(e))
}
