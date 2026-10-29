import { atom, read } from 'claude-code'
import type { EngineInterface, RenderElement, RenderInput } from 'claude-code'

import type { Ask, Asking, Beat, FeedEvent, Item, Meters, MilestoneRow, Snapshot, Task } from '../types'
import { refresh } from './github'
import { headerLine } from './meters'

// The engine's scan follows only references written in this file, so the
// state refs are spelled here; their defaults live in types/index.d.ts.
// Same shape tag as hooks/status.ts: a write without it reads back as the default.
const snapshot = atom({ plugin: 'loopkit', key: 'snapshot' } as const, null as Snapshot | null, { shape: 'snapshot-2' })
const isRefreshing = { plugin: 'loopkit', key: 'isRefreshing' } as const
const asks = { plugin: 'loopkit', key: 'asks' } as const
const asking = { plugin: 'loopkit', key: 'asking' } as const
const tasks = { plugin: 'loopkit', key: 'tasks' } as const
const calls = { plugin: 'loopkit', key: 'calls' } as const
const now = { plugin: 'loopkit', key: 'now' } as const
const meters = { plugin: 'loopkit', key: 'meters' } as const
const beat = { plugin: 'loopkit', key: 'beat' } as const
const lastText = { plugin: 'loopkit', key: 'lastText' } as const
const events = { plugin: 'loopkit', key: 'events' } as const

const MIN_WIDTH = 30
const BAR_CELLS = 10
const MAX_TASKS = 8
const MAX_FRONTIER = 6
const MAX_PHASES = 3
const MAX_EVENTS = 8
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

const CLOSED = /^(#\d+ )(.*)( closed)$/
const MERGE_FAILED = /^(PR #\d+ )(.*?)( merge failed(?:: .*)?)$/

// Cuts an event's text to a width. An issue-closed or merge-failed row cuts
// its title and keeps what follows it; any other row is cut at the end.
export function cutEvent(kind: string, text: string, width: number): string {
  if (text.length <= width) return text
  const hit = kind === 'issue-closed' ? CLOSED.exec(text) : kind === 'merge-failed' ? MERGE_FAILED.exec(text) : null
  if (hit === null) return cut(text, width)
  const [, lead = '', title = '', tail = ''] = hit
  const room = width - lead.length - tail.length

  return room >= 2 ? lead + cut(title, room) + tail : cut(text, width)
}

export type PaneState = {
  snap: Snapshot | null
  held: readonly Ask[]
  question: Asking | null
  running: readonly Task[]
  events: readonly FeedEvent[]
  header: boolean // headerLine gave a line
}

const refLines = (item: Item): number => (item.note ? 2 : 1)

function needsLines(s: PaneState): number {
  const gates = s.snap?.gates ?? []
  const count = (s.question ? 1 : 0) + s.held.length + gates.length
  if (count === 0) return 2

  return 1 + (s.question ? 2 : 0) + 2 * s.held.length + gates.reduce((n, item) => n + refLines(item), 0)
}

function runningLines(s: PaneState): number {
  if (s.running.length === 0) return 2

  return 1 + 2 * Math.min(s.running.length, MAX_TASKS) + (s.running.length > MAX_TASKS ? 1 : 0)
}

// The line count renderPane draws for these atoms (a gap is one line).
export function paneRows(s: PaneState): number {
  const snap = s.snap
  if (snap === null) return 2 + (s.question || s.held.length > 0 ? needsLines(s) : 0) + (s.running.length > 0 ? runningLines(s) : 0) + 1
  const frontier = snap.upNext.filter(item => item.kind !== 'phase')
  const phases = snap.upNext.filter(item => item.kind === 'phase')
  const nextShown = [...frontier.slice(0, MAX_FRONTIER), ...phases.slice(0, MAX_PHASES)]
  const nextLines =
    1 + (nextShown.length === 0 ? 1 : nextShown.reduce((n, item) => n + refLines(item), 0)) + (snap.upNext.length > nextShown.length ? 1 : 0)
  const eventLines = 1 + (s.events.length === 0 ? 1 : Math.min(s.events.length, MAX_EVENTS) + (s.events.length > MAX_EVENTS ? 1 : 0))
  const milestoneLines = 1 + (snap.milestones.length === 0 ? 1 : 2 * snap.milestones.length)
  // loopkit, meta, [header], [error], five gaps and the Refresh button.
  const top = 2 + (s.header ? 1 : 0) + (snap.error ? 1 : 0)

  return top + needsLines(s) + milestoneLines + runningLines(s) + eventLines + nextLines + 5 + 1
}

// paneRows for the atoms as they stand now, for $.ui.open's `rows`.
export async function openRows($: EngineInterface): Promise<number> {
  const at = await $.clock.now()
  const [snap, held, question, running, feed, m, b, text] = await Promise.all([
    read($, snapshot),
    read($, asks),
    read($, asking),
    read($, tasks),
    read($, events),
    read($, meters),
    read($, beat),
    read($, lastText),
  ])

  return paneRows({
    snap: snap ?? null,
    held: held ?? [],
    question: question ?? null,
    running: running ?? [],
    events: feed ?? [],
    header: headerLine(m ?? { compactions: 0, limits: [] }, b ?? null, text ?? null, at) !== null,
  })
}

export async function renderPane($: EngineInterface, e: RenderInput): Promise<RenderElement> {
  const { Box, Text, Button } = $.ui.resolve(e)
  await read($, now)
  const at = await $.clock.now()
  // An unset atom reads undefined: the defaults live in types/index.d.ts.
  const [snapRead, refreshingRead, heldRead, questionRead, runningRead, callsRead, metersRead, beatRead, textRead, eventsRead] = await Promise.all([
    read($, snapshot),
    read($, isRefreshing),
    read($, asks),
    read($, asking),
    read($, tasks),
    read($, calls),
    read($, meters),
    read($, beat),
    read($, lastText),
    read($, events),
  ])
  const snap: Snapshot | null = snapRead ?? null
  const refreshing = refreshingRead ?? false
  const held: Ask[] = heldRead ?? []
  const question: Asking | null = questionRead ?? null
  const running: Task[] = runningRead ?? []
  const callCount: number = callsRead ?? 0
  const meterRead: Meters = metersRead ?? { compactions: 0, limits: [] }
  const feed: FeedEvent[] = eventsRead ?? []
  const header = headerLine(meterRead, (beatRead ?? null) as Beat | null, textRead ?? null, at)
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

  // Header: the repo line, then the dim header line with its limit part in the warning colour.
  const headerText = header === null ? '' : cut(header.text, width)
  const warnLength = header?.parts[0]?.warn ? Math.min(header.parts[0].text.length, headerText.length) : 0
  const headerRow =
    header === null ? null : (
      <Text>
        <Text color="warning">{headerText.slice(0, warnLength)}</Text>
        <Text dimColor>{headerText.slice(warnLength)}</Text>
      </Text>
    )
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

  function eventsSection() {
    const shown = feed.slice(0, MAX_EVENTS)

    return (
      <Box flexDirection="column">
        {heading('Events', feed.length)}
        {feed.length === 0 ? <Text dimColor>No events yet.</Text> : null}
        {shown.map(event => {
          const times = event.count > 1 ? ` ×${event.count}` : ''
          const stamp = clock(event.at)

          return (
            <Text>
              <Text dimColor>{stamp}</Text>
              {' ' + cutEvent(event.kind, event.text, Math.max(1, width - stamp.length - 1 - times.length))}
              {times ? <Text color="warning">{times}</Text> : null}
            </Text>
          )
        })}
        {more(feed.length - shown.length)}
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
      {headerRow}
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
      {eventsSection()}
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
