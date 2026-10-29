import { describe, expect, mock, test } from 'claude-code/testing'

import type { Snapshot } from '../types'
import { ageText, bar, cut, cutEvent, paneRows } from './pane'
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
  titles: {},
  open: [],
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
    expect(statusLine(null, null, [], [])).toBe('reading GitHub…')
  })

  test('the error case', () => {
    expect(statusLine(snap({ error: 'gh failed' }), null, [], [])).toBe('gh failed')
  })

  test('the empty case', () => {
    expect(statusLine(snap(), null, [], [])).toBe('0 need you · 0 running')
  })

  test('the milestone with work in flight wins, else the first', () => {
    const flight = snap({ milestones: [row(3), row(4, { inFlight: 2, closed: 4, total: 8 })] })
    expect(statusLine(flight, null, [], [])).toBe('0 need you · #4 4/8 · 0 running')
    const calm = snap({ milestones: [row(3), row(4)] })
    expect(statusLine(calm, null, [], [])).toBe('0 need you · #3 1/2 · 0 running')
  })

  test('counts question, asks, gates and tasks', () => {
    const s = snap({ gates: [{ kind: 'qa', ref: '#1', title: 't' }] })
    const ask = { text: 'Needs you: x', firstSeen: 0, lastSeen: 0, count: 1, callsAt: 0 }
    const task = { id: 'a', kind: 'shell', description: 'd', firstSeen: 0 }
    expect(statusLine(s, { headers: 'h', since: 0 }, [ask], [task])).toBe('3 need you · 1 running')
  })
})

describe('statusLine with a limit stop', () => {
  const at = new Date(2026, 9, 29, 12, 0).getTime()
  const today = new Date(2026, 9, 29, 19, 0).toISOString()
  const friday = new Date(2026, 9, 30, 19, 0).toISOString()

  test('the part opens the text in all three forms', () => {
    expect(statusLine(snap(), null, [], [], { until: today }, at)).toBe('limited until 19:00 · 0 need you · 0 running')
    expect(statusLine(null, null, [], [], {}, at)).toBe('limited · reading GitHub…')
    expect(statusLine(snap({ error: 'boom' }), null, [], [], { until: friday }, at)).toBe('limited until Fri 19:00 · boom')
  })

  test('no stop, or a past one, leaves the text as it was', () => {
    expect(statusLine(snap(), null, [], [])).toBe('0 need you · 0 running')
    expect(statusLine(snap(), null, [], [], { until: today }, Date.parse(today) + 1)).toBe('0 need you · 0 running')
  })
})

describe('cutEvent', () => {
  test('a short row is whole; a long closed or merge-failed row cuts its title and keeps the tail', () => {
    expect(cutEvent('issue-closed', '#5 short closed', 40)).toBe('#5 short closed')
    expect(cutEvent('issue-closed', '#302 pane, refresh triggers and the inline height closed', 30)).toBe('#302 pane, refresh tri… closed')
    expect(cutEvent('merge-failed', 'PR #307 README section for the pane merge failed: not mergeable', 40)).toBe(
      'PR #307 REA… merge failed: not mergeable',
    )
  })

  test('any other row, or no room for a title, is cut at the end', () => {
    expect(cutEvent('denied', 'denied Bash: [Data Exfiltration] posts to a host', 20)).toBe('denied Bash: [Data …')
    expect(cutEvent('issue-closed', '#5 closed and some more words that are long', 20)).toBe('#5 closed and some …')
    expect(cutEvent('merge-failed', 'PR #5 merge failed: a very long reason indeed', 20).length).toBe(20)
  })
})

describe('paneRows', () => {
  const state = { snap: snap(), held: [], question: null, running: [], events: [], header: false }

  test('the empty snapshot: header, five gaps, six sections and the button', () => {
    // loopkit, meta, 5 gaps, Needs you 2, Milestones 2, Running 2, Events 2, Up next 2, Refresh 1
    expect(paneRows(state)).toBe(2 + 5 + 2 + 2 + 2 + 2 + 2 + 1)
    expect(paneRows({ ...state, header: true })).toBe(paneRows(state) + 1)
  })

  test('rows grow with the content and the caps', () => {
    const event = { kind: 'denied', text: 't', at: 0, count: 1 }
    const base = paneRows(state)
    expect(paneRows({ ...state, events: [event] })).toBe(base) // one row replaces the empty state
    expect(paneRows({ ...state, events: Array(12).fill(event) })).toBe(base + 8) // 8 rows and +n more
    expect(paneRows({ ...state, snap: snap({ error: 'x' }) })).toBe(base + 1)
    const task = { id: 'a', kind: 'shell', description: 'd', firstSeen: 0 }
    expect(paneRows({ ...state, running: Array(10).fill(task) })).toBe(base + (1 + 16 + 1) - 2)
  })

  test('before the first snapshot', () => {
    expect(paneRows({ ...state, snap: null })).toBe(3)
  })
})

type Host = Parameters<Parameters<typeof test>[1]>[1]

// Boots the mod in a loopkit project with stubbed gh answers; returns the
// recorded argv and the mock clock.
function boot(on: Host, gh: Record<string, unknown>, workflow = '# Workflow contract\n', roadmap: string | null = null, hang = false) {
  const ran: string[][] = []
  const status: (string | undefined)[] = []
  on('ui.status', (_$, e) => {
    status.push(e.text)

    return { value: undefined }
  })
  const clock = mock.clock(on, { now: Date.UTC(2026, 9, 29, 12, 0) })
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'loopkit-status' } }))
  const opened: (number | undefined)[] = []
  on('ui.open', (_$, e) => {
    opened.push(e.rows)

    return { value: { isPlaced: true } }
  })
  on('fs.read', (_$, e) => {
    if (e.path.endsWith('docs/workflow.md')) return { value: workflow }
    if (e.path.endsWith('docs/roadmap.md') && roadmap !== null) return { value: roadmap }
    throw new Error('ENOENT')
  })
  on('process.run', async (_$, e) => {
    ran.push([...e.argv])
    if (hang) await new Promise(() => undefined)
    const key = e.argv[1] === 'api' ? 'api' : `${e.argv[1]} ${e.argv[2]}`.trim()
    const out = gh[e.argv[1] === 'api' ? 'api' : (e.argv[1] ?? '')]
    if (out === undefined) return { value: { exitCode: 1, stderr: `no stub for ${key}\n`, stdout: '' } }

    return { value: { exitCode: 0, stdout: JSON.stringify(out), stderr: '' } }
  })

  return { ran, clock, status, opened }
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
  test('before the first snapshot, while the first read is out', async ($, on) => {
    const { clock } = boot(on, {}, '# Workflow contract\n', null, true)
    await $.session.start(start)
    await clock.settle()
    const ui = await $.ui.mount(PANE)
    expect((await texts(ui)).join('\n')).toContain('Reading GitHub…')
    expect(await ui.find({ type: 'Button', text: /Refresh/ })).toBeTruthy()
    await ui.unmount()
  })

  test('a held open-question marker is cleared on session.start', async ($, on) => {
    const { clock } = boot(on, ghOk)
    on('tool.call', { tool: 'AskUserQuestion' }, async () => new Promise(() => undefined))
    await $.session.start(start)
    await clock.settle()
    void $.tool.call({ tool: 'AskUserQuestion', questions: [{ header: 'Pick one', question: 'Which?', options: [], multiSelect: false }] })
    await clock.settle()
    let ui = await $.ui.mount(PANE)
    expect((await texts(ui)).join('\n')).toContain('Pick one')
    await ui.unmount()
    await $.session.start(start)
    await clock.settle()
    ui = await $.ui.mount(PANE)
    expect((await texts(ui)).join('\n')).not.toContain('Pick one')
    await ui.unmount()
  })

  test('a render before session.start finishes redraws once the session is active', async ($, on) => {
    const { clock } = boot(on, ghOk)
    // The engine's own drawing, beneath the mod: nothing, outside an active project.
    on('ui.render', () => ({ type: 'Text', children: [''] }))
    const ui = await $.ui.mount(PANE)
    expect((await texts(ui)).join('\n')).not.toContain('Needs you')
    await $.session.start(start)
    await clock.settle()
    expect((await texts(ui)).join('\n')).toContain('Needs you (1)')
    await ui.unmount()
  })

  test('empty states', async ($, on) => {
    const { clock } = boot(on, { repo: { nameWithOwner: 'o/r' }, issue: [], pr: [], api: [] })
    await $.session.start(start)
    await clock.settle()
    const ui = await $.ui.mount(PANE)
    const all = (await texts(ui)).join('\n')
    for (const line of ['Nothing needs you.', 'No open milestone.', 'Nothing running.', 'Nothing unblocked.']) expect(all).toContain(line)
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

  test('a blank line separates the header, the sections and the Refresh button', async ($, on) => {
    const { clock } = boot(on, ghOk)
    await $.session.start(start)
    await clock.settle()
    await $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } })
    const ui = await $.ui.mount(PANE)
    const all = await texts(ui)
    const at = (needle: string) => all.findIndex(t => t.includes(needle))
    // After the header, then between the five sections.
    for (const section of ['Needs you (', 'Milestones (', 'Running (', 'Events (', 'Up next (']) expect(all[at(section) - 1]).toBe(' ')
    // Before the Refresh button: six gaps in all.
    expect(all.filter(t => t === ' ')).toHaveLength(6)
    await ui.unmount()
  })

  test('a read error shows in the header and keeps the status line', async ($, on) => {
    const { status, clock } = boot(on, { ...ghOk, repo: undefined })
    await $.session.start(start)
    await clock.settle()
    await $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } })
    expect(status.at(-1)).toBe('no stub for repo view')
    const ui = await $.ui.mount(PANE)
    expect((await texts(ui)).join('\n')).toContain('no stub for repo')
    await ui.unmount()
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
    const roadmap = ['A', 'B', 'C', 'D', 'E'].map(n => `| **Phase ${n}** | x | — | — |`).join('\n')
    const { clock } = boot(on, { ...ghOk, issue: many }, '# Workflow contract\n', roadmap)
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
    expect(all).toContain('Up next (14)')
    expect(all).toContain('Phase C')
    expect(all).not.toContain('Phase D')
    expect(all).toContain('+5 more')
    expect(all).toContain('+2 more')
    await ui.unmount()
  })
})

describe('session meters in the pane', () => {
  const merge = { tool: 'Bash', command: 'gh pr merge 6 --squash' } as const
  const long = 'A very long issue title that cannot fit the pane width at all'

  // The hook stubs beneath the mod, and the opened rows.
  function stubs(on: Host): void {
    on('turn.start', () => ({ turnId: 't' }) as never)
    on('turn.complete', () => ({ text: '' }))
    on('classic.PostCompact', () => ({}))
    on('classic.StopFailure', () => ({}))
    on('classic.PermissionDenied', () => ({}))
    on('session.measure', (_$, e) => ({ changed: e.changed }))
    on('tool.call', () => ({ isError: true, result: undefined, text: 'Exit code 1\nnot mergeable' }) as never)

  }

  test('no header line before any reading', async ($, on) => {
    const { clock } = boot(on, ghOk)
    stubs(on)
    await $.session.start(start)
    await clock.settle()
    const ui = await $.ui.mount(PANE)
    const all = (await texts(ui)).join('\n')
    expect(all).not.toMatch(/idle|working|compacted|limited/)
    expect(all).not.toMatch(/ctx|5h|7d/)
    await ui.unmount()
  })

  test('the header line: heartbeat, last text and compactions, without a limit stop', async ($, on) => {
    const { clock } = boot(on, ghOk)
    stubs(on)
    await $.session.start(start)
    await clock.settle()
    await $.turn.start({ text: 'go', turnId: 't1' } as never)
    let ui = await $.ui.mount(PANE)
    expect((await texts(ui)).join('\n')).toContain('working <1m')
    await ui.unmount()
    await clock.advance(4 * 60_000)
    await $.turn.complete({ turnId: 't1', answer: 'done', reason: 'complete' } as never)
    await $.classic.PostCompact({ trigger: 'auto', compact_summary: 's' } as never)
    ui = await $.ui.mount(PANE)
    const all = await texts(ui)
    expect(all.some(t => t === 'idle <1m · last text <1m ago · 1 compacted')).toBe(true)
    expect(all.join('\n')).not.toContain('limited')
    await ui.unmount()
  })

  test('a limit stop opens the header line', async ($, on) => {
    const { clock } = boot(on, ghOk)
    stubs(on)
    await $.session.start(start)
    await clock.settle()
    await $.turn.complete({ turnId: 't1', answer: '', reason: 'complete' } as never)
    const reset = new Date(Date.UTC(2026, 9, 29, 12, 0) + 6 * 3_600_000).toISOString()
    await $.session.measure({ rateLimits: [{ kind: 'five_hour', percentUsed: 100, resetsAt: reset }], changed: [] } as never)
    await $.classic.StopFailure({ error: 'rate_limit' } as never)
    const ui = await $.ui.mount(PANE)
    const all = await texts(ui)
    expect(all.some(t => t.startsWith('limited until ') && t.includes(' · idle <1m'))).toBe(true)
    expect(all.join('\n')).not.toMatch(/ctx|5h|7d/)
    await ui.unmount()
  })

  test('Events: the empty state, then rows with the time, a ×n count and the cap', async ($, on) => {
    const { clock } = boot(on, ghOk)
    stubs(on)
    await $.session.start(start)
    await clock.settle()
    let ui = await $.ui.mount(PANE)
    let all = await texts(ui)
    expect(all).toContain('Events (0)')
    expect(all).toContain('No events yet.')
    await ui.unmount()
    for (let i = 0; i < 10; i++) await $.classic.PermissionDenied({ tool_name: 'Bash', reason: `reason ${i}` } as never)
    await $.classic.PermissionDenied({ tool_name: 'Bash', reason: 'reason 9' } as never)
    ui = await $.ui.mount(PANE)
    all = await texts(ui)
    expect(all).toContain('Events (10)')
    expect(all).not.toContain('No events yet.')
    const rows = all.filter(t => /^\d\d:\d\d denied Bash: reason/.test(t))
    expect(rows.length).toBeGreaterThanOrEqual(8)
    expect(rows.some(t => t.includes('denied Bash: reason 9 ×2'))).toBe(true)
    expect(rows.some(t => t.includes('reason 0'))).toBe(false)
    expect(all).toContain('+2 more')
    // Between Running and Up next.
    const at = (needle: string) => all.findIndex(t => t.includes(needle))
    expect(at('Running (')).toBeLessThan(at('Events ('))
    expect(at('Events (')).toBeLessThan(at('Up next ('))
    await ui.unmount()
  })

  test('a failed merge cuts the title and keeps the tail; a closed issue shows its title', async ($, on) => {
    const gh = { ...ghOk, issue: [{ ...ghOk.issue[1]!, title: long }, { ...ghOk.issue[0]!, number: 9, title: 'Gone soon', labels: [] }] }
    const { clock } = boot(on, gh)
    stubs(on)
    await $.session.start(start)
    await clock.settle()
    await $.tool.call(merge)
    await clock.settle()
    gh.issue = [gh.issue[0]!]
    await $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } })
    const ui = await $.ui.mount(PANE)
    const all = await texts(ui)
    const failed = all.find(t => /PR #6 .*merge failed/.test(t))
    expect(failed).toMatch(/^\d\d:\d\d PR #6 A very long.*… merge failed: not mergeable$/)
    expect(failed!.length).toBeLessThanOrEqual(60)
    expect(all.some(t => /^\d\d:\d\d #9 Gone soon closed$/.test(t))).toBe(true)
    await ui.unmount()
  })

  test('both opens pass the content height as rows', async ($, on) => {
    const { clock, opened } = boot(on, ghOk)
    stubs(on)
    await $.session.start(start)
    await clock.settle()
    expect(opened).toHaveLength(1)
    expect(opened[0]).toBeGreaterThan(0)
    await $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } })
    expect(opened).toHaveLength(2)
    // The second open sees the refreshed snapshot: its rows match paneRows for it.
    const second = opened[1]!
    expect(second).toBeGreaterThanOrEqual(opened[0]!)
    await $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } })
    expect(opened[2]).toBe(second)
  })
})
