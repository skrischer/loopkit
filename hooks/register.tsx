import { update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import { refresh } from './github'
import { renderPane } from './pane'
import { registerSession } from './session'
import { publishStatus } from './status'

const PANE_COMMAND = 'loopkit-status'
const PANE_ID = 'loopkit-status'
const TICK_MS = 60_000
const MERGE = /\bgh\s+pr\s+merge\b/

// The engine's scan follows only references written in this file, so the
// state refs are spelled here; their defaults live in types/index.d.ts.
const isRefreshing = { plugin: 'loopkit', key: 'isRefreshing' } as const
const now = { plugin: 'loopkit', key: 'now' } as const

// A loopkit project is a working directory whose docs/workflow.md starts with
// the contract heading. A module variable, not an atom: /clear resets atoms
// but must not silence the mod. session.start decides it again on every load.
let active = false
let timer: Timer | undefined
let ticks = 0

async function isLoopkitProject($: EngineInterface): Promise<boolean> {
  try {
    const text = await $.fs.read('docs/workflow.md')
    const heading = text.split('\n').find(line => /^#{1,6}\s/.test(line))

    return heading?.trim() === '# Workflow contract'
  } catch {
    return false
  }
}

// Fire and forget: no hook waits on gh, and a fault never reaches the turn.
function refreshInBackground($: EngineInterface): void {
  void refresh($).catch(() => undefined)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    active = await isLoopkitProject($)
    const started = await next(e)
    if (!active) return started
    await update($, isRefreshing, () => false)
    await $.command.register({
      name: PANE_COMMAND,
      description: 'Open the loopkit status pane and refresh it from GitHub',
      immediate: true,
    })
    timer?.cancel()
    ticks = 0
    timer = $.clock.every(TICK_MS, () => {
      void (async () => {
        ticks += 1
        const at = await $.clock.now()
        await update($, now, () => at).catch(() => undefined)
        if (ticks % 2 === 0) refreshInBackground($)
      })()
    })
    refreshInBackground($)
    void $.ui.open({ id: PANE_ID, title: 'loopkit' }).catch(() => undefined)
    await publishStatus($)

    return started
  }).catch(($, e, next) => next(e))

  // /clear, resume and fork reset $.state to its defaults.
  on('classic.SessionStart', async ($, e, next) => {
    const done = await next(e)
    if (!active || !['clear', 'resume', 'fork'].includes(e.source)) return done
    refreshInBackground($)
    await publishStatus($)

    return done
  }).catch(($, e, next) => next(e))

  on('command.run', { command: PANE_COMMAND }, async ($, e, next) => {
    if (!active) return next(e)
    await $.ui.open({ id: PANE_ID, title: 'loopkit' })
    await refresh($)

    return { text: 'loopkit status pane opened and refreshed.' }
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (active && MERGE.test(e.command)) refreshInBackground($)

    return ran
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e, next) => {
    if (!active) return next(e)

    return renderPane($, e)
  }).catch(($, e, next) => { return next(e) })

  registerSession(on, () => active)
}
