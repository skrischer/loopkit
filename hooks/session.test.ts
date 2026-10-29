import { describe, expect, test } from 'claude-code/testing'

import { addSubagent, clearsAsks, dropTask, mergeAsks, mergeTasks, parseAsks, touchTask } from './session'

const T = 1_000_000

describe('parseAsks', () => {
  test('only lines that start with the marker count', () => {
    const answer = 'Done.\nNeeds you: merge #4\n  Needs you: indented\nI said Needs you: nope\nNeeds you:\n'
    expect(parseAsks(answer)).toEqual(['Needs you: merge #4'])
  })

  test('fenced lines are skipped', () => {
    const answer = 'a\n```\nNeeds you: inside\n```\nNeeds you: outside\n~~~\nb'
    expect(parseAsks(answer)).toEqual(['Needs you: outside'])
  })
})

describe('mergeAsks', () => {
  test('a new ask is appended and a repeat is counted', () => {
    const first = mergeAsks([], ['Needs you: a'], T, 3)
    expect(first).toEqual([{ text: 'Needs you: a', firstSeen: T, lastSeen: T, count: 1, callsAt: 3 }])
    const again = mergeAsks(first, ['Needs you: a', 'Needs you: b'], T + 60_000, 9)
    expect(again).toEqual([
      { text: 'Needs you: a', firstSeen: T, lastSeen: T + 60_000, count: 2, callsAt: 3 },
      { text: 'Needs you: b', firstSeen: T + 60_000, lastSeen: T + 60_000, count: 1, callsAt: 9 },
    ])
    expect(first[0]?.count).toBe(1)
  })

  test('a line said twice in one answer is one sighting', () => {
    expect(mergeAsks([], ['Needs you: a', 'Needs you: a'], T, 0)[0]?.count).toBe(1)
  })
})

describe('mergeTasks', () => {
  test('keeps firstSeen and lastActivity for an id already held', () => {
    const held = [{ id: 'a1', kind: 'shell', description: 'sleep', firstSeen: 5, lastActivity: 7 }]
    const out = mergeTasks(held, [{ id: 'a1', type: 'shell', description: 'sleep\nmore', command: 'sleep 120' }], T)
    expect(out).toEqual([{ id: 'a1', kind: 'shell', description: 'sleep', detail: 'sleep 120', firstSeen: 5, lastActivity: 7 }])
  })

  test('a held subagent with the same description keeps its sighting and detail', () => {
    const held = [{ id: 'agent-1', kind: 'subagent', description: 'build', detail: 'sonnet', firstSeen: 5 }]
    const out = mergeTasks(held, [{ id: 'task-9', type: 'subagent', description: 'build', agent_type: 'general-purpose' }], T)
    expect(out).toEqual([{ id: 'task-9', kind: 'subagent', description: 'build', detail: 'sonnet', firstSeen: 5 }])
  })

  test('a new task starts now; an empty list empties', () => {
    expect(mergeTasks([], [{ id: 'm', type: 'monitor', description: 'watch', tool: 'poll' }], T)).toEqual([
      { id: 'm', kind: 'monitor', description: 'watch', detail: 'poll', firstSeen: T },
    ])
    expect(mergeTasks([{ id: 'x', kind: 'shell', description: 'd', firstSeen: 1 }], [], T)).toEqual([])
  })
})


describe('clearsAsks', () => {
  const origin = (kind: string, extra: object = {}) => ({ origin: { kind }, ...extra })

  test('the human typing or sending through Remote Control clears', () => {
    expect(clearsAsks(origin('composer'))).toBe(true)
    expect(clearsAsks(origin('bridge'))).toBe(true)
  })

  test('a task notification, a trigger, a plugin or a peer leaves the asks', () => {
    for (const kind of ['task-notification', 'scheduled-trigger', 'plugin', 'peer', 'sdk']) {
      expect(clearsAsks(origin(kind))).toBe(false)
    }
  })

  test('a meta prompt and the pane command leave the asks', () => {
    expect(clearsAsks(origin('composer', { isMeta: true }))).toBe(false)
    expect(clearsAsks(origin('composer', { command: { name: 'loopkit-status' } }))).toBe(false)
    expect(clearsAsks(origin('composer', { command: { name: 'clear' } }))).toBe(true)
  })
})

describe('subagent rows', () => {
  test('a spawn adds one row, keyed by id; its end removes it', () => {
    const one = addSubagent([], 'a1', 'build', 'sonnet', T)
    expect(one).toEqual([{ id: 'a1', kind: 'subagent', description: 'build', detail: 'sonnet', firstSeen: T }])
    expect(addSubagent(one, 'a1', 'build', 'sonnet', T + 1)).toEqual(one)
    expect(dropTask(one, 'a1')).toEqual([])
    expect(dropTask(one, 'other')).toEqual(one)
  })

  test('a tool call stamps its subagent', () => {
    const one = addSubagent([], 'a1', 'build', 'sonnet', T)
    expect(touchTask(one, 'a1', T + 9)[0]?.lastActivity).toBe(T + 9)
    expect(touchTask(one, 'zz', T + 9)).toEqual(one)
  })
})
