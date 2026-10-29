import { describe, expect, mock, test } from 'claude-code/testing'

import {
  cleanText,
  closedEvents,
  compactedText,
  deniedText,
  issueClosedText,
  limitText,
  mergeDetail,
  mergeFailedEvent,
  mergeFailedText,
  mergeTarget,
  pushEvent,
  stoppedDescription,
  subagentEndedText,
  taskStoppedText,
} from './events'
import { titlesOf } from './github'

const NOW = new Date(2026, 9, 29, 12, 0).getTime()
const today = new Date(2026, 9, 29, 19, 0).toISOString()
const friday = new Date(2026, 9, 30, 19, 0).toISOString()

const snap = (open: number[], titles: Record<number, string> = {}) => ({
  repo: 'o/r',
  fetchedAt: 0,
  error: null,
  gates: [],
  milestones: [],
  upNext: [],
  titles,
  open,
})

describe('pushEvent', () => {
  test('a new event is prepended with count 1', () => {
    const a = pushEvent([], { kind: 'denied', text: 'a' }, 1)
    expect(pushEvent(a, { kind: 'denied', text: 'b' }, 2)).toEqual([
      { kind: 'denied', text: 'b', at: 2, count: 1 },
      { kind: 'denied', text: 'a', at: 1, count: 1 },
    ])
  })

  test('a repeat counts up, takes the new time and moves to the front', () => {
    let held = pushEvent([], { kind: 'denied', text: 'a' }, 1)
    held = pushEvent(held, { kind: 'denied', text: 'b' }, 2)
    held = pushEvent(held, { kind: 'denied', text: 'a' }, 3)
    expect(held).toEqual([
      { kind: 'denied', text: 'a', at: 3, count: 2 },
      { kind: 'denied', text: 'b', at: 2, count: 1 },
    ])
  })

  test('the same text under another kind is not a repeat', () => {
    const held = pushEvent(pushEvent([], { kind: 'denied', text: 'a' }, 1), { kind: 'limit', text: 'a' }, 2)
    expect(held.map(row => row.count)).toEqual([1, 1])
  })

  test('at most 50 are held, the oldest dropped', () => {
    let held: ReturnType<typeof pushEvent> = []
    for (let i = 0; i < 60; i++) held = pushEvent(held, { kind: 'denied', text: `t${i}` }, i)
    expect(held.length).toBe(50)
    expect(held[0]?.text).toBe('t59')
    expect(held.at(-1)?.text).toBe('t10')
  })
})

describe('closedEvents', () => {
  test('missing issues become events, titled from the previous snapshot', () => {
    const prev = snap([3, 4, 5], { 3: 'Three', 4: 'Four' })
    expect(closedEvents(prev, snap([5]))).toEqual([
      { kind: 'issue-closed', text: '#3 Three closed' },
      { kind: 'issue-closed', text: '#4 Four closed' },
    ])
  })

  test('an issue without a title shows the bare number', () => {
    expect(closedEvents(snap([9]), snap([]))).toEqual([{ kind: 'issue-closed', text: '#9 closed' }])
  })

  test('no previous snapshot (the first read), or no change, gives no events', () => {
    expect(closedEvents(null, snap([1, 2]))).toEqual([])
    expect(closedEvents(snap([1, 2]), snap([1, 2, 3]))).toEqual([])
  })
})

describe('titlesOf', () => {
  test('open issues and PRs are titled, cleaned; open lists the issue numbers', () => {
    const issue = (number: number, title: string) => ({ number, title, labels: [] })
    const pr = (number: number, title: string) => ({ number, title, headRefName: 'b' })
    expect(titlesOf([issue(1, 'one\u0007'), issue(2, 'two')], [pr(3, 'three')])).toEqual({
      titles: { 1: 'one', 2: 'two', 3: 'three' },
      open: [1, 2],
    })
  })
})

describe('the texts', () => {
  test('issue-closed', () => {
    expect(issueClosedText(7, 'Fix it')).toBe('#7 Fix it closed')
    expect(issueClosedText(7)).toBe('#7 closed')
  })

  test('merge-failed, with and without a title and a detail', () => {
    expect(mergeFailedText(12, 'Add x', 'not mergeable')).toBe('PR #12 Add x merge failed: not mergeable')
    expect(mergeFailedText(12, 'Add x')).toBe('PR #12 Add x merge failed')
    expect(mergeFailedText(12)).toBe('PR #12 merge failed')
  })

  test('subagent-ended', () => {
    expect(subagentEndedText('error', 'review it')).toBe('subagent failed: review it')
    expect(subagentEndedText('aborted', 'review it')).toBe('subagent stopped: review it')
  })

  test('task-stopped, denied, compacted', () => {
    expect(taskStoppedText('sleep 300')).toBe('stopped: sleep 300')
    expect(deniedText('Bash', 'too risky\nsecond line')).toBe('denied Bash: too risky')
    expect(compactedText('auto')).toBe('compacted (auto)')
    expect(compactedText('manual')).toBe('compacted (manual)')
  })

  test('limit, with and without until', () => {
    expect(limitText(today, NOW)).toBe('usage limit — resumes 19:00')
    expect(limitText(friday, NOW)).toBe('usage limit — resumes Fri 19:00')
    expect(limitText(undefined, NOW)).toBe('usage limit')
  })
})

describe('the merge failure', () => {
  test('the match takes a gh pr merge <n> anywhere in the command', () => {
    expect(mergeTarget('gh pr merge 42 --squash')).toBe(42)
    expect(mergeTarget('git push && gh  pr merge 7')).toBe(7)
    expect(mergeTarget('gh pr merge --squash')).toBeUndefined()
    expect(mergeTarget('gh pr view 3')).toBeUndefined()
  })

  test('the detail skips Exit code lines and blanks; none when nothing is left', () => {
    expect(mergeDetail('Exit code 1\n\nX Pull request is not mergeable\nmore')).toBe('X Pull request is not mergeable')
    expect(mergeDetail('Exit code 1')).toBeUndefined()
    expect(mergeDetail('')).toBeUndefined()
    expect(mergeDetail(undefined)).toBeUndefined()
  })

  test('the event is titled from the snapshot, else bare', () => {
    expect(mergeFailedEvent('gh pr merge 5', { 5: 'Add x' }, 'Exit code 1\nboom')).toEqual({
      kind: 'merge-failed',
      text: 'PR #5 Add x merge failed: boom',
    })
    expect(mergeFailedEvent('gh pr merge 5', undefined, 'Exit code 1')?.text).toBe('PR #5 merge failed')
    expect(mergeFailedEvent('ls', {}, 'x')).toBeNull()
  })
})

describe('the stopped task', () => {
  const held = [
    { id: 't1', kind: 'shell', description: 'sleep 300', firstSeen: 0 },
    { id: 't2', kind: 'subagent', description: 'review', firstSeen: 0, agentId: 'a2' },
  ]

  test('the held task wins, then the result command, then the id', () => {
    expect(stoppedDescription(held, 't1', 'other')).toBe('sleep 300')
    expect(stoppedDescription(held, 'a2', undefined)).toBe('review')
    expect(stoppedDescription(held, 't9', 'sleep 5')).toBe('sleep 5')
    expect(stoppedDescription(held, 't9', undefined)).toBe('task t9')
  })
})

describe('cleanText', () => {
  test('control characters are stripped and the text is cut to 200', () => {
    expect(cleanText('a\u0000b\u001bc\u007fd\u0085e\nf')).toBe('abcdef')
    expect(cleanText('x'.repeat(250)).length).toBe(200)
  })
})

type Host = Parameters<Parameters<typeof test>[1]>[1]
const start = { cwd: '/work', surface: 'terminal', isInteractive: true } as const

// Boots the mod in a loopkit project. $.state is not reachable from a test, so
// the hooks are observed through the status line: every recorded event
// publishes it once more.
function boot(on: Host, workflow = '# Workflow contract\n', issues: unknown[] = [], prs: unknown[] = []) {
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
  on('process.run', (_$, e) => {
    const out: Record<string, unknown> = { repo: { nameWithOwner: 'o/r' }, issue: issues, pr: prs, api: [] }
    const hit = out[e.argv[1] === 'api' ? 'api' : (e.argv[1] ?? '')]
    if (hit === undefined) return { value: { exitCode: 1, stderr: 'no stub\n', stdout: '' } }

    return { value: { exitCode: 0, stdout: JSON.stringify(hit), stderr: '' } }
  })
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  on('classic.StopFailure', () => ({}))
  on('classic.PostCompact', () => ({}))
  on('classic.PermissionDenied', () => ({}))
  on('turn.start', () => ({ turnId: 't' }) as never)
  on('turn.complete', () => ({ text: '' }))

  return { status, clock }
}

// How many status publishes `act` caused, once the session has settled.
async function publishes(status: unknown[], clock: { settle(): Promise<void> }, act: () => Promise<unknown>): Promise<number> {
  await clock.settle()
  const before = status.length
  await act()
  await clock.settle()

  return status.length - before
}

describe('the merge-failure hook', () => {
  test('a failed gh pr merge records in any loop; a success or another command does not', async ($, on) => {
    const { clock, status } = boot(on)
    let failing = true
    on('tool.call', () => (failing ? { isError: true, result: undefined, text: 'Exit code 1\nnot mergeable' } : { result: {}, text: '' }) as never)
    await $.session.start(start)
    await clock.settle()
    const merge = { tool: 'Bash', command: 'gh pr merge 5 --squash' } as const
    const base = await publishes(status, clock, () => $.tool.call({ tool: 'Bash', command: 'ls' }))
    const main = await publishes(status, clock, () => $.tool.call(merge))
    const sub = await publishes(status, clock, () => $.tool.call({ ...merge, agentId: 'a1' } as never))
    failing = false
    const ok = await publishes(status, clock, () => $.tool.call(merge))
    // the same refresh runs for a merge command either way; the event is the extra publish
    expect(main).toBe(ok + 1)
    expect(sub).toBe(ok + 1)
    expect(base).toBeLessThan(ok)
  })

  test('it passes the tool result on unchanged', async ($, on) => {
    const { clock } = boot(on)
    on('tool.call', () => ({ isError: true, result: undefined, text: 'Exit code 1\nboom' }) as never)
    await $.session.start(start)
    await clock.settle()
    expect(await $.tool.call({ tool: 'Bash', command: 'gh pr merge 5' })).toEqual({ isError: true, result: undefined, text: 'Exit code 1\nboom' })
  })
})

describe('the TaskStop hook', () => {
  test('the main loop records the stop; an error result and a subagent do not', async ($, on) => {
    const { clock, status } = boot(on)
    let failing = false
    on('tool.call', () => (failing ? { isError: true, result: undefined, text: 'no such task' } : { result: { task_id: 't1', task_type: 'shell', message: 'ok', command: 'sleep 300' } }) as never)
    await $.session.start(start)
    await clock.settle()
    const stop = { tool: 'TaskStop', task_id: 't1' } as const
    const main = await publishes(status, clock, () => $.tool.call(stop))
    const sub = await publishes(status, clock, () => $.tool.call({ ...stop, agentId: 'a1' } as never))
    failing = true
    const err = await publishes(status, clock, () => $.tool.call(stop))
    expect(main).toBe(err + 1)
    expect(sub).toBe(err)
  })
})

describe('the denial hook', () => {
  test('a denial records and is passed on; outside a loopkit project it is silent', async ($, on) => {
    const { clock, status } = boot(on)
    await $.session.start(start)
    await clock.settle()
    const n = await publishes(status, clock, async () =>
      expect(await $.classic.PermissionDenied({ tool_name: 'Bash', tool_input: {}, tool_use_id: 'u', reason: 'no' } as never)).toEqual({}),
    )
    expect(n).toBe(1)
  })

  test('outside a loopkit project nothing is recorded', async ($, on) => {
    const { clock, status } = boot(on, '# Other\n')
    await $.session.start(start)
    await clock.settle()
    const n = await publishes(status, clock, () => $.classic.PermissionDenied({ tool_name: 'Bash', reason: 'no' } as never))
    expect(n).toBe(0)
  })
})

describe('the meters hooks record events', () => {
  test('a main-loop compaction and a limit stop record; a subagent one and other errors do not', async ($, on) => {
    const { clock, status } = boot(on)
    await $.session.start(start)
    await clock.settle()
    expect(await publishes(status, clock, () => $.classic.PostCompact({ trigger: 'auto', compact_summary: 's' } as never))).toBe(1)
    expect(await publishes(status, clock, () => $.classic.PostCompact({ trigger: 'manual', compact_summary: 's', agent_id: 'a1' } as never))).toBe(0)
    expect(await publishes(status, clock, () => $.classic.StopFailure({ error: 'rate_limit' } as never))).toBe(1)
    expect(await publishes(status, clock, () => $.classic.StopFailure({ error: 'overloaded' } as never))).toBe(0)
  })
})

describe('the subagent end', () => {
  test('error and aborted record an event; a complete turn does not', async ($, on) => {
    const { clock, status } = boot(on)
    await $.session.start(start)
    await clock.settle()
    const end = (reason: string, agentId = 'a1') =>
      $.turn.complete({ turnId: 't2', agentId, answer: 'x', reason } as never)
    // the turn.complete hook itself publishes once
    const done = await publishes(status, clock, () => end('complete'))
    expect(done).toBe(1)
    expect(await publishes(status, clock, () => end('error'))).toBe(done + 1)
    expect(await publishes(status, clock, () => end('aborted', 'a9'))).toBe(done + 1)
  })

  test('it passes the result on and a failing record does not drop the task drop', async ($, on) => {
    const { clock } = boot(on)
    await $.session.start(start)
    await clock.settle()
    expect(await $.turn.complete({ turnId: 't2', agentId: 'a1', answer: 'x', reason: 'error' } as never)).toEqual({ text: '' })
  })
})

describe('the closed-issue diff', () => {
  const issue = (number: number, title: string) => ({ number, title, body: '', labels: [], milestone: null, projectItems: [] })

  test('the first read records nothing; a later read records each closed issue', async ($, on) => {
    const rows = [issue(1, 'One'), issue(2, 'Two')]
    const { clock, status } = boot(on, '# Workflow contract\n', rows)
    await $.session.start(start)
    await clock.settle()
    // the second read, with the same issues: the publish of the read itself
    const same = await publishes(status, clock, () => $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } }))
    rows.pop()
    const closed = await publishes(status, clock, () => $.command.run({ command: 'loopkit-status', args: '', origin: { kind: 'composer' } }))
    expect(closed).toBe(same + 1)
  })
})
