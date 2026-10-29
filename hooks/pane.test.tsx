import { describe, expect, mock, test } from 'claude-code/testing'

import type { Snapshot } from '../types'
import { ageText, bar, cut } from './pane'
import { statusLine } from './status'

const PANE = {
  plugin: 'loopkit',
  component: 'Pane',
  requestId: 'loopkit-status',
  surface: 'terminal',
  props: {
    title: 'loopkit',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

const snap = (over: Partial<Snapshot> = {}): Snapshot => ({
  repo: 'o/r',
  fetchedAt: 0,
  error: null,
  gates: [],
  milestones: [],
  upNext: [],
  ...over,
})

const row = (n: number, over: Partial<Snapshot['milestones'][number]> = {}) => ({
  number: n,
  title: `m${n}`,
  closed: 1,
  total: 2,
  percent: 50,
  inFlight: 0,
  blocked: 0,
  living: false,
  ...over,
})

describe('helpers', () => {
  test('age format', () => {
    expect(ageText(0)).toBe('<1m')
    expect(ageText(59_999)).toBe('<1m')
    expect(ageText(60_000)).toBe('1m')
    expect(ageText(59 * 60_000)).toBe('59m')
    expect(ageText(61 * 60_000)).toBe('1h 1m')
    expect(ageText(-5_000)).toBe('<1m')
  })

  test('cut and bar', () => {
    expect(cut('abcdef', 4)).toBe('abc…')
    expect(cut('abc', 4)).toBe('abc')
    expect(bar(1, 2)).toEqual({ filled: '█████', empty: '░░░░░' })
    expect(bar(0, 0)).toEqual({ filled: '', empty: '░░░░░░░░░░' })
    expect(bar(3, 3).empty).toBe('')
  })
})

describe('statusLine', () => {
  test('before the first snapshot', () => {
    expect(statusLine(null, null, [], [])).toBe('loopkit · reading GitHub…')
  })

  test('the error case', () => {
    expect(statusLine(snap({ error: 'gh failed' }), null, [], [])).toBe('loopkit: gh failed')
  })

  test('the empty case', () => {
    expect(statusLine(snap(), null, [], [])).toBe('loopkit · 0 need you · 0 running')
  })

  test('the milestone with work in flight wins, else the first', () => {
    const flight = snap({ milestones: [row(3), row(4, { inFlight: 2, closed: 4, total: 8 })] })
    expect(statusLine(flight, null, [], [])).toBe('loopkit · 0 need you · #4 4/8 · 0 running')
    const calm = snap({ milestones: [row(3), row(4)] })
    expect(statusLine(calm, null, [], [])).toBe('loopkit · 0 need you · #3 1/2 · 0 running')
  })

  test('counts question, asks, gates and tasks', () => {
    const s = snap({ gates: [{ kind: 'qa', ref: '#1', title: 't' }] })
    const ask = { text: 'Needs you: x', firstSeen: 0, lastSeen: 0, count: 1, callsAt: 0 }
    const task = { id: 'a', kind: 'shell', description: 'd', firstSeen: 0 }
    expect(statusLine(s, { headers: 'h', since: 0 }, [ask], [task])).toBe('loopkit · 3 need you · 1 running')
  })
})

type Host = Parameters<Parameters<typeof test>[1]>[1]

// Boots the mod in a loopkit project with stubbed gh answers; returns the
// recorded argv and the mock clock.
function boot(on: Host, gh: Record<string, unknown>, workflow = '# Workflow contract\n') {
  const ran: string[][] = []
  const status: (string | undefined)[] = []
  on('ui.status', (_$, e) => {
    status.push(e.text)

    return { value: undefined }
  })
  const clock = mock.clock(on, { now: Date.UTC(2026, 9, 29, 12, 0) })
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'loopkit-status' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('fs.read', (_$, e) => {
    if (e.path.endsWith('docs/workflow.md')) return { value: workflow }
    throw new Error('ENOENT')
  })
  on('process.run', (_$, e) => {
    ran.push([...e.argv])
    const key = e.argv[1] === 'api' ? 'api' : `${e.argv[1]} ${e.argv[2]}`.trim()
    const out = gh[e.argv[1] === 'api' ? 'api' : (e.argv[1] ?? '')]
    if (out === undefined) return { value: { exitCode: 1, stderr: `no stub for ${key}\n`, stdout: '' } }

    return { value: { exitCode: 0, stdout: JSON.stringify(out), stderr: '' } }
  })

  return { ran, clock, status }
}

const ghOk = {
  repo: { nameWithOwner: 'o/r' },
  issue: [
    { number: 5, title: 'Needs a decision', body: '', labels: [{ name: 'blocked:human' }], milestone: { number: 7, title: 'alpha' }, projectItems: [] },
    { number: 6, title: 'Build it', body: '', labels: [], milestone: { number: 7, title: 'alpha' }, projectItems: [{ status: { name: 'Todo' } }] },
  ],
  pr: [],
  api: [{ number: 7, title: 'alpha', open_issues: 2, closed_issues: 2 }],
}

const start = { cwd: '/work', surface: 'terminal', isInteractive: true } as const
const texts = async (ui: Awaited<ReturnType<Host['ui']['mount']>>) => {
  const out: string[] = []
  for (const hit of (await ui.findAll({ type: 'Text' })) ?? []) out.push(hit.text ?? '')

  return out
}

describe('the pane', () => {
  test('before the first snapshot, nothing refreshing', async ($, on) => {
    boot(on, {}, '# Workflow contract\n')
    await $.session.start(start)
    const ui = await $.ui.mount(PANE)
    const all = await texts(ui)
    expect(all.some(t => t.includes('loopkit'))).toBe(true)
    await ui.unmount()
  })

  test('sections, rows, empty states and the Refresh button after a refresh', async ($, on) => {
    const { clock } = boot(on, ghOk)
    await $.session.start(start)
    await clock.settle()
    await $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } })
    const ui = await $.ui.mount(PANE)
    const all = (await texts(ui)).join('\n')
    expect(all).toContain('Needs you (1)')
    expect(all).toContain('#5')
    expect(all).toContain('Milestones (1)')
    expect(all).toContain('50%')
    expect(all).toContain('Running (0)')
    expect(all).toContain('Nothing running.')
    expect(all).toContain('Up next (1)')
    expect(all).toContain('o/r')
    expect(await ui.find({ type: 'Button', text: /Refresh/ })).toBeTruthy()
    await ui.unmount()
  })

  test('a read error shows in the header and keeps the status line', async ($, on) => {
    const { status, clock } = boot(on, { ...ghOk, repo: undefined })
    await $.session.start(start)
    await clock.settle()
    await $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } })
    expect(status.at(-1)).toMatch(/^loopkit: /)
  })
})

describe('the wiring', () => {
  const run = { command: 'loopkit-status', args: '', origin: { kind: 'composer' } } as const

  test('refresh reads gh as argv, read-only, and the command replies', async ($, on) => {
    const { ran, clock } = boot(on, ghOk)
    await $.session.start(start)
    await clock.settle()
    expect(ran.length).toBe(4)
    expect(ran.every(argv => argv[0] === 'gh')).toBe(true)
    const res = await $.command.run(run)
    expect(JSON.stringify(res)).toContain('opened and refreshed')
    expect(ran.length).toBe(8)
  })

  test('a gh pr merge in Bash refreshes; other commands do not', async ($, on) => {
    const { ran, clock } = boot(on, ghOk)
    on('tool.call', () => ({ result: {} }))
    await $.session.start(start)
    await clock.settle()
    const base = ran.length
    await $.tool.call({ tool: 'Bash', command: 'ls' })
    await clock.settle()
    expect(ran.length).toBe(base)
    await $.tool.call({ tool: 'Bash', command: 'gh pr merge 5 --squash' })
    await clock.settle()
    expect(ran.length).toBe(base + 4)
  })

  test('a main-loop turn end refreshes at most every 15 s; a subagent turn never', async ($, on) => {
    const { ran, clock } = boot(on, ghOk)
    on('turn.complete', () => ({ text: '' }))
    const done = { answer: '', durationMs: 1, isAborted: false, reason: 'answer', turnId: 't' } as const
    await $.session.start(start)
    await clock.settle()
    const base = ran.length
    await $.turn.complete(done)
    await clock.settle()
    expect(ran.length).toBe(base)
    await clock.advance(16_000)
    await $.turn.complete({ ...done, agentId: 'a1' })
    await clock.settle()
    expect(ran.length).toBe(base)
    await $.turn.complete(done)
    await clock.settle()
    expect(ran.length).toBe(base + 4)
  })

  test('the timer re-reads on every second tick', async ($, on) => {
    const { ran, clock } = boot(on, ghOk)
    await $.session.start(start)
    await clock.settle()
    const base = ran.length
    await clock.advance(60_000)
    expect(ran.length).toBe(base)
    await clock.advance(60_000)
    expect(ran.length).toBe(base + 4)
  })

  test('/clear re-reads', async ($, on) => {
    const { ran, clock } = boot(on, ghOk)
    on('classic.SessionStart', () => ({}))
    await $.session.start(start)
    await clock.settle()
    const base = ran.length
    await $.classic.SessionStart({ source: 'clear' })
    await clock.settle()
    expect(ran.length).toBe(base + 4)
  })

  test('caps: Running 8 rows, Up next 6 frontier issues and 3 phases, each with +n more', async ($, on) => {
    const many = Array.from({ length: 9 }, (_, i) => ({
      number: 100 + i,
      title: `todo ${i}`,
      body: '',
      labels: [],
      milestone: { number: 7, title: 'alpha' },
      projectItems: [{ status: { name: 'Todo' } }],
    }))
    const { clock } = boot(on, { ...ghOk, issue: many })
    on('classic.Stop', () => ({}))
    await $.session.start(start)
    await clock.settle()
    await $.classic.Stop({
      stop_hook_active: false,
      background_tasks: Array.from({ length: 10 }, (_, i) => ({ id: `t${i}`, type: 'shell', description: `job ${i}`, command: 'sleep 1' })),
    } as never)
    const ui = await $.ui.mount(PANE)
    const all = (await texts(ui)).join('\n')
    expect(all).toContain('Running (10)')
    expect(all).toContain('job 7')
    expect(all).not.toContain('job 8')
    expect(all).toContain('+2 more')
    expect(all).toContain('Up next (9)')
    expect(all).toContain('+3 more')
    await ui.unmount()
  })
})
