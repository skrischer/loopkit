import { read, update } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import type { Item, MilestoneRow, Snapshot } from '../types'
import { isRefreshing, publishStatus, snapshot } from './status'

// The GitHub shapes the view reads. Titles, bodies and branch names are
// untrusted text: they are displayed or matched, never executed or passed on.
export type RawIssue = {
  number: number
  title: string
  body?: string | null
  labels: { name: string }[]
  milestone?: { number: number; title: string } | null
  projectItems?: { status?: { name: string } | null }[]
}
export type RawPr = { number: number; title: string; headRefName: string; isDraft?: boolean }
export type RawMilestone = {
  number: number
  title: string
  open_issues: number
  closed_issues: number
  description?: string | null
}
export type DeriveInput = {
  issues: RawIssue[]
  prs: RawPr[]
  milestones: RawMilestone[]
  roadmap: string | null
}
export type Derived = Pick<Snapshot, 'gates' | 'milestones' | 'upNext'>

// Control characters: C0 and C1 (with DEL). Bodies keep their newlines.
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/g
const CONTROL_KEEP_NEWLINE = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g

const clean = (text: string | null | undefined): string => (text ?? '').replace(CONTROL, '')
const cleanBody = (text: string | null | undefined): string => (text ?? '').replace(CONTROL_KEEP_NEWLINE, '')

const isLiving = (description: string | null | undefined): boolean =>
  /^\s*Track:\s*living-spec\b/im.test(cleanBody(description))

// Every #<n> on a "Depends on:" line. "Depends on milestone:" does not match.
function dependencies(body: string): number[] {
  const refs: number[] = []
  for (const line of body.split('\n')) {
    if (!/^\s*Depends on:/i.test(line)) continue
    for (const hit of line.matchAll(/#(\d+)/g)) refs.push(Number(hit[1]))
  }

  return refs
}

function unplannedPhases(roadmap: string | null): string[] {
  const names: string[] = []
  for (const raw of (roadmap ?? '').split('\n')) {
    const line = clean(raw).trimEnd()
    const m = /^\|\s*\*\*([^*]+)\*\*/.exec(line)
    if (m && /\|\s*—\s*\|\s*—\s*\|$/.test(line)) names.push(m[1].trim())
  }

  return names
}

export function derive(input: DeriveInput): Derived {
  const openIssues = new Set(input.issues.map(i => i.number))
  const qa: { n: number; item: Item }[] = []
  const spec: { n: number; item: Item }[] = []
  const escalated: { n: number; item: Item }[] = []
  const parked: { n: number; item: Item }[] = []
  const frontier: Item[] = []
  const inFlight = new Map<number, number>()
  const blocked = new Map<number, number>()
  const bump = (map: Map<number, number>, key: number | undefined) => {
    if (key !== undefined) map.set(key, (map.get(key) ?? 0) + 1)
  }

  for (const ms of input.milestones) {
    if (!isLiving(ms.description) && ms.open_issues === 0 && ms.closed_issues > 0) {
      qa.push({
        n: ms.number,
        item: { kind: 'qa', ref: `milestone #${ms.number}`, title: clean(ms.title), note: 'milestone QA' },
      })
    }
  }

  for (const pr of input.prs) {
    const branch = clean(pr.headRefName)
    const title = clean(pr.title)
    if (branch.startsWith('docs/') && title.startsWith('docs(spec)') && !title.includes('archive')) {
      spec.push({
        n: pr.number,
        item: { kind: 'spec', ref: `PR #${pr.number}`, title, note: `spec acceptance · ${branch}` },
      })
    }
  }

  for (const issue of input.issues) {
    const labels = issue.labels.map(l => l.name)
    const status = issue.projectItems?.[0]?.status?.name ?? null
    const msNumber = issue.milestone?.number
    const where = issue.milestone
      ? clean(issue.milestone.title)
      : labels.includes('track:adhoc')
        ? 'track:adhoc'
        : 'no milestone'
    const title = clean(issue.title)

    if (labels.includes('blocked:human')) {
      parked.push({
        n: issue.number,
        item: { kind: 'parked', ref: `#${issue.number}`, title, note: `blocked:human · ${where}` },
      })
      bump(blocked, msNumber)
    } else if (labels.includes('needs:planning')) {
      escalated.push({
        n: issue.number,
        item: {
          kind: 'escalated',
          ref: `#${issue.number}`,
          title,
          note: 'needs:planning · re-run /loopkit:plan',
        },
      })
      bump(blocked, msNumber)
    } else if (status === 'In Progress') {
      bump(inFlight, msNumber)
    } else if (status === 'Done') {
      continue
    } else if (dependencies(cleanBody(issue.body)).some(n => openIssues.has(n))) {
      bump(blocked, msNumber)
    } else {
      frontier.push({ kind: 'frontier', ref: `#${issue.number}`, title, note: where })
    }
  }

  const byNumber = (a: { n: number }, b: { n: number }) => a.n - b.n
  const gates = [qa, spec, escalated, parked].flatMap(group => group.sort(byNumber).map(g => g.item))

  const milestones: MilestoneRow[] = input.milestones
    .filter(ms => ms.open_issues + ms.closed_issues > 0)
    .sort((a, b) => a.number - b.number)
    .map(ms => {
      const total = ms.open_issues + ms.closed_issues

      return {
        number: ms.number,
        title: clean(ms.title),
        closed: ms.closed_issues,
        total,
        percent: Math.round((100 * ms.closed_issues) / total),
        inFlight: inFlight.get(ms.number) ?? 0,
        blocked: blocked.get(ms.number) ?? 0,
        living: isLiving(ms.description),
      }
    })

  const phases: Item[] = unplannedPhases(input.roadmap).map(name => ({
    kind: 'phase',
    ref: name,
    title: name,
    note: 'roadmap · /loopkit:plan',
  }))

  return { gates, milestones, upNext: [...frontier, ...phases] }
}

// The module's only process call site. argv, no shell: nothing read from
// GitHub is ever interpolated into a command.
async function gh($: EngineInterface, args: string[]): Promise<unknown> {
  const { exitCode, stdout, stderr } = await $.process.run(['gh', ...args])
  if (exitCode !== 0) throw new Error(stderr.trim().split('\n')[0] || `gh ${args[0]} failed`)

  return JSON.parse(stdout)
}

async function readOrNull($: EngineInterface, path: string): Promise<string | null> {
  try {
    return await $.fs.read(path)
  } catch {
    return null
  }
}

let lastRefreshAt = 0
export const getLastRefresh = (): number => lastRefreshAt

export async function refresh($: EngineInterface): Promise<void> {
  if (await read($, isRefreshing)) return
  lastRefreshAt = await $.clock.now()
  await update($, isRefreshing, () => true)
  try {
    let next: Snapshot
    try {
      const [repo, issues, prs, milestones, roadmap] = await Promise.all([
        gh($, ['repo', 'view', '--json', 'nameWithOwner']) as Promise<{ nameWithOwner: string }>,
        gh($, [
          'issue', 'list', '--state', 'open', '--limit', '200',
          '--json', 'number,title,body,labels,milestone,projectItems',
        ]) as Promise<RawIssue[]>,
        gh($, [
          'pr', 'list', '--state', 'open', '--limit', '50',
          '--json', 'number,title,headRefName,isDraft',
        ]) as Promise<RawPr[]>,
        gh($, ['api', 'repos/{owner}/{repo}/milestones?state=open&per_page=100']) as Promise<RawMilestone[]>,
        readOrNull($, 'docs/roadmap.md'),
      ])
      next = {
        repo: clean(repo.nameWithOwner),
        fetchedAt: lastRefreshAt,
        error: null,
        ...derive({ issues, prs, milestones, roadmap }),
      }
    } catch (err) {
      const prev = await read($, snapshot)
      next = {
        repo: prev?.repo ?? '',
        fetchedAt: prev?.fetchedAt ?? lastRefreshAt,
        error: clean(err instanceof Error ? err.message : String(err)),
        gates: prev?.gates ?? [],
        milestones: prev?.milestones ?? [],
        upNext: prev?.upNext ?? [],
      }
    }
    await update($, snapshot, () => next)
  } finally {
    await update($, isRefreshing, () => false)
    await publishStatus($)
  }
}
