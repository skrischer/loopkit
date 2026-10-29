import { describe, expect, mock, test } from 'claude-code/testing'

import { beatLine, clearsLimit, headerLine, limitActive, limitUntil, when, withCompaction, withReading, withStop } from './meters'


const MIN = 60_000
// Local-time dates, so the cases hold in any timezone.
const NOW = new Date(2026, 9, 29, 12, 0).getTime()
const today = new Date(2026, 9, 29, 19, 0).toISOString()
const friday = new Date(2026, 9, 30, 19, 0).toISOString()

describe('when', () => {
  test('HH:MM today, <Ddd> HH:MM another day', () => {
    expect(when(today, NOW)).toBe('19:00')
    expect(when(friday, NOW)).toBe('Fri 19:00')
  })
})

describe('headerLine', () => {
  const idle = { working: false, since: NOW - 3 * MIN }
  const empty = { compactions: 0, limits: [] }

  test('null when no part has a value', () => {
    expect(headerLine(empty, null, null, NOW)).toBeNull()
  })

  test('the heartbeat, last text and compacted join with a middle dot; compacted is left out at 0', () => {
    expect(headerLine(empty, idle, NOW - MIN, NOW)?.text).toBe('idle 3m · last text 1m ago')
    expect(headerLine({ ...empty, compactions: 1 }, idle, NOW - MIN, NOW)?.text).toBe('idle 3m · last text 1m ago · 1 compacted')
    expect(headerLine({ ...empty, compactions: 3 }, null, null, NOW)?.text).toBe('3 compacted')
  })

  test('no last text before the first answer', () => {
    expect(headerLine(empty, { working: true, since: NOW - 2 * MIN }, null, NOW)?.text).toBe('working 2m')
  })

  test('the limited forms, with and without until; only the limit part is flagged', () => {
    const withUntil = headerLine({ ...empty, compactions: 2, limit: { until: today } }, idle, NOW - MIN, NOW)
    expect(withUntil?.text).toBe('limited until 19:00 · idle 3m · last text 1m ago · 2 compacted')
    expect(withUntil?.parts.map(part => part.warn)).toEqual([true, false, false])
    expect(headerLine({ ...empty, limit: {} }, idle, null, NOW)?.text).toBe('limited · idle 3m')
    expect(headerLine({ ...empty, limit: { until: friday } }, null, null, NOW)?.text).toBe('limited until Fri 19:00')
  })

  test('a lone limit part with no beat', () => {
    const line = headerLine({ ...empty, limit: {} }, null, null, NOW)
    expect(line?.text).toBe('limited')
    expect(line?.parts).toEqual([{ text: 'limited', warn: true }])
  })

  test('a stop whose until is past reads as cleared', () => {
    expect(headerLine({ ...empty, limit: { until: today } }, null, null, NOW + 8 * 60 * MIN)).toBeNull()
  })

  test('no ctx, 5h or 7d figure is drawn from the readings', () => {
    const m = { compactions: 0, limits: [{ kind: 'five_hour', percentUsed: 41 }, { kind: 'seven_day', percentUsed: 12 }] }
    expect(headerLine(m, null, null, NOW)).toBeNull()
  })
})

describe('beatLine', () => {
  test('working, idle and last text', () => {
    expect(beatLine(null, null, NOW)).toBeNull()
    expect(beatLine({ working: true, since: NOW - 30_000 }, null, NOW)).toBe('working <1m')
    expect(beatLine({ working: false, since: NOW - 4 * MIN }, null, NOW)).toBe('idle 4m')
    expect(beatLine({ working: false, since: NOW - 4 * MIN }, NOW - 4 * MIN, NOW)).toBe('idle 4m · last text 4m ago')
  })
})

describe('limit clearing', () => {
  test('a reading under 100 % clears; an empty reading does not', () => {
    expect(clearsLimit([{ kind: 'five_hour', percentUsed: 99.9 }, { kind: 'seven_day', percentUsed: 3 }])).toBe(true)
    expect(clearsLimit([{ kind: 'five_hour', percentUsed: 100 }, { kind: 'seven_day', percentUsed: 3 }])).toBe(false)
    expect(clearsLimit([])).toBe(false)
  })

  test('until in the past reads as cleared; a stop without until stays', () => {
    expect(limitActive({ until: today }, NOW)).toEqual({ until: today })
    expect(limitActive({ until: today }, Date.parse(today))).toBeUndefined()
    expect(limitActive({}, NOW)).toEqual({})
    expect(limitActive(undefined, NOW)).toBeUndefined()
  })

  test('until is the latest reset among windows at 100 %', () => {
    const soon = new Date(2026, 9, 29, 15, 0).toISOString()
    expect(
      limitUntil([
        { kind: 'five_hour', percentUsed: 100, resetsAt: soon },
        { kind: 'seven_day', percentUsed: 100, resetsAt: friday },
        { kind: 'x', percentUsed: 50, resetsAt: new Date(2026, 10, 5).toISOString() },
      ]),
    ).toBe(friday)
    expect(limitUntil([{ kind: 'five_hour', percentUsed: 99, resetsAt: soon }])).toBeUndefined()
    expect(limitUntil([{ kind: 'five_hour', percentUsed: 100 }])).toBeUndefined()
  })
})

describe('the writes', () => {
  const read = (rateLimits: { kind: string; percentUsed: number; resetsAt?: string }[]) => ({ rateLimits })

  test('a reading sets the windows', () => {
    const first = withReading(undefined, read([{ kind: 'five_hour', percentUsed: 41, resetsAt: today }]))
    expect(first).toEqual({ compactions: 0, limits: [{ kind: 'five_hour', percentUsed: 41, resetsAt: today }] })
    expect(withReading(first, read([]))).toEqual({ compactions: 0, limits: [] })
  })

  test('a stop clears on a reading under 100 %, not on an empty one', () => {
    const stopped = { compactions: 0, limits: [], limit: { until: today } }
    expect(withReading(stopped, read([], 10)).limit).toEqual({ until: today })
    expect(withReading(stopped, read([{ kind: 'five_hour', percentUsed: 100 }])).limit).toEqual({ until: today })
    expect(withReading(stopped, read([{ kind: 'five_hour', percentUsed: 30 }])).limit).toBeUndefined()
  })

  test('compactions count up; a stop takes until from the windows at 100 %', () => {
    expect(withCompaction(withCompaction(undefined)).compactions).toBe(2)
    const m = { compactions: 0, limits: [{ kind: 'five_hour', percentUsed: 100, resetsAt: today }, { kind: 'seven_day', percentUsed: 100, resetsAt: friday }] }
    expect(withStop(m).limit).toEqual({ until: friday })
    expect(withStop(undefined).limit).toEqual({})
  })
})

function boot(on: Parameters<Parameters<typeof test>[1]>[1], workflow = '# Workflow contract\n') {
  const status: (string | undefined)[] = []
  on('ui.status', (_$, e) => {
    status.push(e.text)

    return { value: undefined }
  })
  const clock = mock.clock(on, { now: NOW })
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'loopkit-status' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('fs.read', (_$, e) => {
    if (e.path.endsWith('docs/workflow.md')) return { value: workflow }
    throw new Error('ENOENT')
  })
  // No gh in these cases: every read fails and the snapshot keeps its error.
  on('process.run', () => ({ value: { exitCode: 1, stderr: 'no gh\n', stdout: '' } }))
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  on('classic.StopFailure', () => ({}))
  on('classic.PostCompact', () => ({}))
  on('turn.start', () => ({ turnId: 't' }) as never)
  on('turn.complete', () => ({ text: '' }))

  return { status, clock }
}

const start = { cwd: '/work', surface: 'terminal', isInteractive: true } as const
const measure = (rateLimits: object[] = [], percent = 40) =>
  ({ context: { window: 200_000, percent }, rateLimits, changed: ['context'] }) as never

describe('the hooks', () => {
  test('measure and the limit stop: the status line carries the stop until a reading clears it', async ($, on) => {
    const { clock, status } = boot(on)
    await $.session.start(start)
    await clock.settle()
    const done = await $.session.measure(measure([{ kind: 'five_hour', percentUsed: 100, resetsAt: today }, { kind: 'seven_day', percentUsed: 100, resetsAt: friday }]))
    expect(done).toEqual({ changed: ['context'] })
    expect(status.at(-1)?.startsWith('limited')).toBe(false)
    await $.classic.StopFailure({ error: 'overloaded' } as never)
    expect(status.at(-1)?.startsWith('limited')).toBe(false)
    await $.classic.StopFailure({ error: 'rate_limit' } as never)
    expect(status.at(-1)?.startsWith('limited until Fri 19:00 · ')).toBe(true)
    await $.session.measure(measure([]))
    expect(status.at(-1)?.startsWith('limited until Fri 19:00 · ')).toBe(true)
    await $.session.measure(measure([{ kind: 'five_hour', percentUsed: 20 }]))
    expect(status.at(-1)?.startsWith('limited')).toBe(false)
  })

  test('a stop without a time reads as limited, and a past until clears it', async ($, on) => {
    const { clock, status } = boot(on)
    await $.session.start(start)
    await clock.settle()
    await $.classic.StopFailure({ error: 'rate_limit' } as never)
    expect(status.at(-1)?.startsWith('limited · ')).toBe(true)
    await $.session.measure(measure([{ kind: 'five_hour', percentUsed: 100, resetsAt: new Date(NOW + 10 * MIN).toISOString() }]))
    await $.classic.StopFailure({ error: 'rate_limit' } as never)
    expect(status.at(-1)?.startsWith('limited until ')).toBe(true)
    await clock.advance(11 * MIN)
    await $.session.measure(measure([{ kind: 'five_hour', percentUsed: 100, resetsAt: new Date(NOW + 10 * MIN).toISOString() }]))
    expect(status.at(-1)?.startsWith('limited')).toBe(false)
  })

  test('every hook observes: it passes the result on, a subagent turn and compaction included', async ($, on) => {
    const { clock } = boot(on)
    await $.session.start(start)
    await clock.settle()
    expect(await $.turn.start({ text: 'go', turnId: 't1' } as never)).toEqual({ turnId: 't' })
    expect(await $.turn.start({ text: 'sub', turnId: 't2', agentId: 'a1' } as never)).toEqual({ turnId: 't' })
    expect(await $.turn.complete({ turnId: 't1', answer: 'done', reason: 'complete' } as never)).toEqual({ text: '' })
    expect(await $.turn.complete({ turnId: 't2', agentId: 'a1', answer: 'x', reason: 'complete' } as never)).toEqual({ text: '' })
    expect(await $.classic.PostCompact({ trigger: 'auto', compact_summary: 's' } as never)).toEqual({})
    expect(await $.classic.PostCompact({ trigger: 'auto', compact_summary: 's', agent_id: 'a1' } as never)).toEqual({})
  })

  test('outside a loopkit project every hook passes through and writes nothing', async ($, on) => {
    const { clock, status } = boot(on, '# Other\n')
    await $.session.start(start)
    await clock.settle()
    await $.classic.StopFailure({ error: 'rate_limit' } as never)
    expect(await $.session.measure(measure())).toEqual({ changed: ['context'] })
    expect(status).toEqual([])
  })
})
