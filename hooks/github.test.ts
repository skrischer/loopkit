import { expect, test } from 'claude-code/testing'

import { derive } from './github'
import type { DeriveInput, RawIssue } from './github'

const issue = (n: number, over: Partial<RawIssue> = {}): RawIssue => ({
  number: n,
  title: `issue ${n}`,
  body: '',
  labels: [],
  milestone: { number: 7, title: 'alpha' },
  projectItems: [{ status: { name: 'Todo' } }],
  ...over,
})

const input = (over: Partial<DeriveInput> = {}): DeriveInput => ({
  issues: [],
  prs: [],
  milestones: [],
  roadmap: null,
  ...over,
})

test('every issue class lands in exactly one place, in order', async () => {
  const d = derive(
    input({
      issues: [
        issue(1, { labels: [{ name: 'blocked:human' }, { name: 'needs:planning' }] }),
        issue(2, { labels: [{ name: 'needs:planning' }], projectItems: [{ status: { name: 'In Progress' } }] }),
        issue(3, { projectItems: [{ status: { name: 'In Progress' } }], body: 'Depends on: #9' }),
        issue(4, { projectItems: [{ status: { name: 'Done' } }] }),
        issue(5, { body: 'Depends on: #99' }),
        issue(6, { milestone: null, labels: [{ name: 'track:adhoc' }] }),
        issue(7, { milestone: null }),
        issue(9),
      ],
      milestones: [{ number: 7, title: 'alpha', open_issues: 8, closed_issues: 0, description: '' }],
    }),
  )

  expect(d.gates.map(g => [g.kind, g.ref, g.note])).toEqual([
    ['escalated', '#2', 'needs:planning · re-run /loopkit:plan'],
    ['parked', '#1', 'blocked:human · alpha'],
  ])
  expect(d.upNext.map(i => [i.ref, i.note])).toEqual([
    ['#5', 'alpha'],
    ['#6', 'track:adhoc'],
    ['#7', 'no milestone'],
    ['#9', 'alpha'],
  ])
  expect(d.milestones).toEqual([
    { number: 7, title: 'alpha', closed: 0, total: 8, percent: 0, inFlight: 1, blocked: 2, living: false },
  ])
})

test('a dependency on an open issue blocks, and counts in its milestone', async () => {
  const d = derive(
    input({
      issues: [issue(1), issue(2, { body: 'Goal: x\nDepends on: #1, #99' })],
      milestones: [{ number: 7, title: 'alpha', open_issues: 2, closed_issues: 0, description: '' }],
    }),
  )

  expect(d.upNext.map(i => i.ref)).toEqual(['#1'])
  expect(d.milestones[0].blocked).toBe(1)
})

test('a Depends on milestone line is not an issue dependency', async () => {
  const d = derive(
    input({ issues: [issue(1), issue(2, { body: 'Depends on milestone: #1' })] }),
  )

  expect(d.upNext.map(i => i.ref)).toEqual(['#1', '#2'])
})

test('milestone QA gate, never for a living-spec milestone', async () => {
  const d = derive(
    input({
      milestones: [
        { number: 8, title: 'delta', open_issues: 0, closed_issues: 3, description: 'Design: x' },
        { number: 9, title: 'theme', open_issues: 0, closed_issues: 2, description: 'Intro\nTrack: living-spec' },
        { number: 10, title: 'empty', open_issues: 0, closed_issues: 0, description: '' },
        { number: 11, title: 'busy', open_issues: 1, closed_issues: 3, description: '' },
      ],
    }),
  )

  expect(d.gates).toEqual([{ kind: 'qa', ref: 'milestone #8', title: 'delta', note: 'milestone QA' }])
  expect(d.milestones.map(m => [m.number, m.living])).toEqual([
    [8, false],
    [9, true],
    [11, false],
  ])
})

test('spec acceptance PRs: docs/ branch, docs(spec) title, no archive', async () => {
  const pr = (number: number, title: string, headRefName: string) => ({ number, title, headRefName, isDraft: false })
  const d = derive(
    input({
      prs: [
        pr(10, 'docs(spec): beta', 'docs/beta'),
        pr(11, 'feat: thing', 'feat/thing'),
        pr(12, 'docs(spec): archive gamma after milestone QA', 'docs/archive-gamma'),
        pr(13, 'docs(spec): off branch', 'feat/off'),
        pr(9, 'docs(spec): alpha', 'docs/alpha'),
      ],
    }),
  )

  expect(d.gates.map(g => [g.kind, g.ref, g.note])).toEqual([
    ['spec', 'PR #9', 'spec acceptance · docs/alpha'],
    ['spec', 'PR #10', 'spec acceptance · docs/beta'],
  ])
})

test('gate order: qa, spec, escalated, parked, each by number', async () => {
  const d = derive(
    input({
      issues: [
        issue(20, { labels: [{ name: 'blocked:human' }] }),
        issue(3, { labels: [{ name: 'blocked:human' }] }),
        issue(30, { labels: [{ name: 'needs:planning' }] }),
        issue(4, { labels: [{ name: 'needs:planning' }] }),
      ],
      prs: [{ number: 5, title: 'docs(spec): x', headRefName: 'docs/x', isDraft: false }],
      milestones: [{ number: 2, title: 'm', open_issues: 0, closed_issues: 1, description: '' }],
    }),
  )

  expect(d.gates.map(g => g.ref)).toEqual(['milestone #2', 'PR #5', '#4', '#30', '#3', '#20'])
})

test('percent rounds to the nearest whole number', async () => {
  const d = derive(
    input({
      milestones: [
        { number: 2, title: 'b', open_issues: 2, closed_issues: 1, description: '' },
        { number: 1, title: 'a', open_issues: 1, closed_issues: 2, description: '' },
        { number: 3, title: 'c', open_issues: 7, closed_issues: 1, description: '' },
      ],
    }),
  )

  expect(d.milestones.map(m => [m.number, m.percent])).toEqual([
    [1, 67],
    [2, 33],
    [3, 13],
  ])
})

test('unplanned phases follow the frontier, in roadmap order', async () => {
  const d = derive(
    input({
      issues: [issue(1)],
      roadmap: [
        '| **gamma** — a phase | — | — |',
        '| **beta** — planned | [spec](x) | [#8](y) |',
        '| **alpha** — another | — | — |',
        '| not a phase | — | — |',
      ].join('\n'),
    }),
  )

  expect(d.upNext.map(i => [i.kind, i.ref, i.title, i.note])).toEqual([
    ['frontier', '#1', 'issue 1', 'alpha'],
    ['phase', 'gamma', 'gamma', 'roadmap · /loopkit:plan'],
    ['phase', 'alpha', 'alpha', 'roadmap · /loopkit:plan'],
  ])
})

test('control characters are stripped from titles, bodies and branches', async () => {
  const d = derive(
    input({
      issues: [
        issue(1, { title: 'a\u001b[31mb\u0085c\u0007', milestone: { number: 7, title: 'm\u009bs' } }),
        issue(2, { body: 'Depends on:\u0000 #1\u001b' }),
      ],
      prs: [{ number: 5, title: 'docs(spec): x\u001b[0m', headRefName: 'docs/x\u0007y', isDraft: false }],
    }),
  )

  expect(d.upNext[0]).toEqual({ kind: 'frontier', ref: '#1', title: 'a[31mbc', note: 'ms' })
  expect(d.upNext.map(i => i.ref)).toEqual(['#1'])
  expect(d.gates[0].title).toBe('docs(spec): x[0m')
  expect(d.gates[0].note).toBe('spec acceptance · docs/xy')
})

// refresh() is not tested here: the host refuses $.state calls a module graph
// does not reach, and register.tsx wires hooks/github.ts only in issue D.
