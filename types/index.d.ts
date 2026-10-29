export type Item = { kind: ItemKind; ref: string; title: string; note?: string }
export type ItemKind = 'qa' | 'spec' | 'escalated' | 'parked' | 'frontier' | 'phase'
export type MilestoneRow = {
  number: number
  title: string
  closed: number
  total: number
  percent: number
  inFlight: number
  blocked: number
  living: boolean
}
export type Snapshot = {
  repo: string
  fetchedAt: number
  error: string | null
  gates: Item[]
  milestones: MilestoneRow[]
  upNext: Item[]
  titles: Record<number, string> // open issues and open PRs
  open: number[] // open issue numbers
}
export type Ask = { text: string; firstSeen: number; lastSeen: number; count: number; callsAt: number }
export type Asking = { headers: string; since: number }
export type Task = {
  id: string
  kind: string
  description: string
  detail?: string
  firstSeen: number
  lastActivity?: number
  agentId?: string // the spawn's agent id once a Stop re-keys the row to its task id
}

export type Meters = {
  context?: number
  compactions: number
  limits: { kind: string; percentUsed: number; resetsAt?: string }[]
  limit?: { until?: string }
}
export type Beat = { working: boolean; since: number }
export type FeedEvent = { kind: string; text: string; at: number; count: number }

declare module 'claude-code' {
  interface PluginState {
    loopkit: {
      snapshot: Shaped<Snapshot | null> // shape 'snapshot-2', default null
      isRefreshing: boolean // default false
      asks: Ask[] // default []
      calls: number // default 0
      asking: Asking | null // default null
      tasks: Task[] // default []
      now: number // default 0
      meters: Meters // default { compactions: 0, limits: [] }
      beat: Beat | null // default null
      lastText: number | null // default null
      events: FeedEvent[] // default []
    }
  }
}
