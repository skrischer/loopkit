import { atom, read } from 'claude-code'
import type { EngineInterface, RenderElement, RenderInput } from 'claude-code'

import type { Ask, Asking, Item, MilestoneRow, Snapshot, Task } from '../types'
import { refresh } from './github'

// The engine's scan follows only references written in this file, so the
// state refs are spelled here; their defaults live in types/index.d.ts.
// Same shape tag as hooks/status.ts: a write without it reads back as the default.
const snapshot = atom({ plugin: 'loopkit', key: 'snapshot' } as const, null as Snapshot | null, { shape: 'snapshot-1' })
const isRefreshing = { plugin: 'loopkit', key: 'isRefreshing' } as const
const asks = { plugin: 'loopkit', key: 'asks' } as const
const asking = { plugin: 'loopkit', key: 'asking' } as const
const tasks = { plugin: 'loopkit', key: 'tasks' } as const
const calls = { plugin: 'loopkit', key: 'calls' } as const
const now = { plugin: 'loopkit', key: 'now' } as const

const MIN_WIDTH = 30
const BAR_CELLS = 10
const MAX_TASKS = 8
const MAX_FRONTIER = 6
const MAX_PHASES = 3
const ASK_PREFIX = 'Needs you: '

// <1m, <n>m or <h>h <m>m. A negative span (clock skew) reads as zero.
export function ageText(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60_000)
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

// Cuts text to a width with an ellipsis.
export function cut(text: string, width: number): string {
  if (width <= 0) return ''
  if (text.length <= width) return text

  return `${text.slice(0, Math.max(0, width - 1))}…`
}

export function bar(closed: number, total: number): { filled: string; empty: string } {
  const cells = total > 0 ? Math.round((BAR_CELLS * closed) / total) : 0
  const filled = Math.min(BAR_CELLS, Math.max(0, cells))

  return { filled: '█'.repeat(filled), empty: '░'.repeat(BAR_CELLS - filled) }
}

function clock(ms: number): string {
  const d = new Date(ms)
  const two = (n: number): string => String(n).padStart(2, '0')

  return `${two(d.getHours())}:${two(d.getMinutes())}`
}

export function taskNote(task: Task, at: number): string {
  let note = task.kind
  if (task.detail) note += ` · ${task.detail}`
  note += ` · ${ageText(at - task.firstSeen)}`
  if (task.kind === 'subagent' && task.lastActivity !== undefined) note += ` · active ${ageText(at - task.lastActivity)}`

  return note
}

export function askNote(ask: Ask, at: number, callCount: number): string {
  let note = `${ageText(at - ask.firstSeen)} ago · ${Math.max(0, callCount - ask.callsAt)} calls since`
  if (ask.count > 1) note += ` · seen ${ask.count}×`

  return note
}

export function milestoneNote(m: MilestoneRow): string {
  return m.living ? `living-spec · ${m.closed} closed` : `${m.inFlight} in flight · ${m.blocked} blocked`
}

export async function renderPane($: EngineInterface, e: RenderInput): Promise<RenderElement> {
  const { Box, Text, Button } = $.ui.resolve(e)
  await read($, now)
  const at = await $.clock.now()
  // An unset atom reads undefined: the defaults live in types/index.d.ts.
  const [snapRead, refreshingRead, heldRead, questionRead, runningRead, callsRead] = await Promise.all([
    read($, snapshot),
    read($, isRefreshing),
    read($, asks),
    read($, asking),
    read($, tasks),
    read($, calls),
  ])
  const snap: Snapshot | null = snapRead ?? null
  const refreshing = refreshingRead ?? false
  const held: Ask[] = heldRead ?? []
  const question: Asking | null = questionRead ?? null
  const running: Task[] = runningRead ?? []
  const callCount: number = callsRead ?? 0
  const width = Math.max(MIN_WIDTH, e.props.bodyColumns)

  const note = (text: string) => <Text dimColor>{'  ' + cut(text, width - 2)}</Text>
  const title = (mark: string, markColor: 'warning' | 'suggestion' | undefined, text: string) => (
    <Text>
      <Text bold={mark !== '●'} color={markColor}>
        {mark}
      </Text>
      {' ' + cut(text, width - mark.length - 1)}
    </Text>
  )
  const refRow = (ref: string, text: string, noteText: string | undefined) => (
    <Box flexDirection="column">
      <Text>
        <Text bold>{cut(ref, width)}</Text>
        {text ? ' ' + cut(text, Math.max(0, width - ref.length - 1)) : ''}
      </Text>
      {noteText ? note(noteText) : null}
    </Box>
  )
  const heading = (label: string, count: number, color?: 'warning' | 'suggestion' | 'success') => (
    <Text bold color={color}>{`${label} (${count})`}</Text>
  )
  // One blank line: the design's gap after the header, between sections and before Refresh.
  const gap = <Text>{' '}</Text>
  const more = (n: number) => (n > 0 ? <Text dimColor>{`+${n} more`}</Text> : null)

  // Header
  const errorLine = snap?.error ? <Text color="error">{cut(snap.error, width)}</Text> : null
  const meta = snap
    ? `${snap.repo || 'GitHub'} · updated ${clock(snap.fetchedAt)}${refreshing ? ' · refreshing…' : ''}`
    : ''

  // Needs you: open question, held asks (newest first), then the GitHub gates.
  const gates: Item[] = snap?.gates ?? []
  const heldRows = [...held].sort((a, b) => b.lastSeen - a.lastSeen)
  const needsCount = (question ? 1 : 0) + heldRows.length + gates.length

  const needs = (
    <Box flexDirection="column">
      {heading('Needs you', needsCount, 'warning')}
      {needsCount === 0 ? <Text dimColor>Nothing needs you.</Text> : null}
      {question ? (
        <Box flexDirection="column">
          {title('?', 'warning', question.headers)}
          {note(`question open · waiting ${ageText(at - question.since)}`)}
        </Box>
      ) : null}
      {heldRows.map(ask => (
        <Box flexDirection="column">
          {title('›', 'warning', ask.text.startsWith(ASK_PREFIX) ? ask.text.slice(ASK_PREFIX.length) : ask.text)}
          {note(askNote(ask, at, callCount))}
        </Box>
      ))}
      {gates.map(item => refRow(item.ref, item.title, item.note))}
    </Box>
  )

  if (snap === null) {
    return (
      <Box flexDirection="column">
        <Text bold>loopkit</Text>
        <Text dimColor>{refreshing ? 'Reading GitHub…' : 'No status yet: run /loopkit-status.'}</Text>
        {question || heldRows.length > 0 ? needs : null}
        {running.length > 0 ? <Box flexDirection="column">{runningSection()}</Box> : null}
        <Button onPress={() => void refresh($).catch(() => undefined)}>Refresh</Button>
      </Box>
    )
  }

  function runningSection() {
    const shown = running.slice(0, MAX_TASKS)

    return (
      <Box flexDirection="column">
        {heading('Running', running.length, 'suggestion')}
        {running.length === 0 ? <Text dimColor>Nothing running.</Text> : null}
        {shown.map(task => (
          <Box flexDirection="column">
            {title('●', 'suggestion', task.description)}
            {note(taskNote(task, at))}
          </Box>
        ))}
        {more(running.length - shown.length)}
      </Box>
    )
  }

  const frontier = snap.upNext.filter(item => item.kind !== 'phase')
  const phases = snap.upNext.filter(item => item.kind === 'phase')
  const nextShown = [...frontier.slice(0, MAX_FRONTIER), ...phases.slice(0, MAX_PHASES)]
  const hidden = snap.upNext.length - nextShown.length

  return (
    <Box flexDirection="column">
      <Text bold>loopkit</Text>
      <Text dimColor>{cut(meta, width)}</Text>
      {errorLine}
      {gap}
      {needs}
      {gap}
      <Box flexDirection="column">
        {heading('Milestones', snap.milestones.length)}
        {snap.milestones.length === 0 ? <Text dimColor>No open milestone.</Text> : null}
        {snap.milestones.map(m => {
          const cells = bar(m.closed, m.total)

          return (
            <Box flexDirection="column">
              <Text>
                <Text bold>{`#${m.number}`}</Text>
                {` ${cut(m.title, Math.max(4, width - 31))} `}
                <Text color="success">{cells.filled}</Text>
                <Text dimColor>{cells.empty}</Text>
                {`  ${m.closed}/${m.total}  ${m.percent}%`}
              </Text>
              {note(milestoneNote(m))}
            </Box>
          )
        })}
      </Box>
      {gap}
      {runningSection()}
      {gap}
      <Box flexDirection="column">
        {heading('Up next', snap.upNext.length, 'success')}
        {nextShown.length === 0 ? <Text dimColor>Nothing unblocked.</Text> : null}
        {nextShown.map(item =>
          item.kind === 'phase' ? refRow(item.title, '', item.note) : refRow(item.ref, item.title, item.note),
        )}
        {more(hidden)}
      </Box>
      {gap}
      <Button onPress={() => void refresh($).catch(() => undefined)}>Refresh</Button>
    </Box>
  )
}
