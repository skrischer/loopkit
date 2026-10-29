import type { EngineInterface, Register } from 'claude-code'

import { publishStatus } from './status'

const PANE_COMMAND = 'loopkit-status'

// A loopkit project is a working directory whose docs/workflow.md starts with
// the contract heading. A module variable, not an atom: /clear resets atoms
// but must not silence the mod. session.start decides it again on every load.
let active = false

async function isLoopkitProject($: EngineInterface): Promise<boolean> {
  try {
    const text = String(await $.fs.read('docs/workflow.md'))
    const heading = text.split('\n').find(line => /^#{1,6}\s/.test(line))

    return heading?.trim() === '# Workflow contract'
  } catch {
    return false
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    active = await isLoopkitProject($)
    const started = await next(e)
    if (!active) return started
    await $.command.register({
      name: PANE_COMMAND,
      description: 'Open the loopkit status pane and refresh it from GitHub',
      immediate: true,
    })
    await publishStatus($)

    return started
  }).catch(($, e, next) => next(e))

  on('command.run', { command: PANE_COMMAND }, async ($, e, next) => {
    if (!active) return next(e)

    return { text: 'loopkit status pane opened and refreshed.' }
  }).catch(($, e, next) => next(e))
}
