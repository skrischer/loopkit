# Spec: session-meters

> Created: 2026-10-29

This spec extends the status pane (`spec-status-pane.md`) with session health:
- context fill and compactions;
- usage-limit windows and a limit stop with its resume time;
- an orchestrator heartbeat;
- an event feed that names every issue it mentions.

All of it comes from structured session events; nothing parses transcript or
notification text. This spec carries no lifecycle state. Acceptance is the
spec merged on the default branch with a milestone and issues, and all
progress lives in the GitHub issues and milestone. A completed spec is moved
to `docs/specs/archive/`.

The design is `docs/design/session-meters.svg`: the pane header's two meter
lines and the Events section, drawn with sample data. It is reviewed with this
spec at the spec-acceptance gate.

## Outcome

- [ ] The pane header gains two dim lines under the repo line:
      - **meters:** `ctx <p>% · <c> compacted · 5h <p>% · 7d <p>%`. A part
        with no reading is left out, and the line is left out when no part
        has one.
      - **heartbeat:** `working <age>` while a main-loop turn runs, else
        `idle <age>`. ` · last text <age> ago` follows once the main loop has
        given a non-empty answer.
- [ ] A **limit stop** turns the meters line into
      `limited until HH:MM · ctx <p>%` in the `warning` colour, and the status
      line starts `loopkit · limited until HH:MM · …`. It clears when a later
      reading puts every window under 100 % or the reset time passes.
- [ ] Context at 85 % or more draws the `ctx` part in the `warning` colour.
- [ ] A new **Events** section sits between Running and Up next. It shows the
      newest 8 events, newest first, as `HH:MM <text>`, plus ` ×<n>` when
      repeats collapsed. Its empty state is `No events yet.`. The event kinds
      are:
      - an issue closed since the previous snapshot:
        `#<n> <title> closed`;
      - a `gh pr merge` that failed, in any loop:
        `PR #<n> <title> merge failed: <first error line>`;
      - a subagent that ended on an error or an interrupt:
        `subagent failed: <description>` / `subagent stopped: <description>`;
      - a background task the main loop stopped with `TaskStop`:
        `stopped: <task description>`;
      - a permission denial: `denied <tool>: <reason>`;
      - a compaction: `compacted (auto)` / `compacted (manual)`;
      - a limit stop: `usage limit — resumes HH:MM`.
- [ ] Every `#<n>` an event names carries its title, taken from the snapshot
      the mod already holds.
- [ ] The read-only guard admits `$.session.usage` (a read) and nothing else
      new. The status-pane principle and its Verify guard hold unchanged.
- [ ] The README's "Status pane" section describes the meter lines, the
      limit stop and the Events section.
- [ ] `docs/architecture.md` lists the meter inputs (see Foundation edits).

## Scope

### In scope

- The meter and heartbeat lines, the limit stop and the Events section, as
  specified under Design, with their tests.
- The state-contract extension, the snapshot's title map, and the allowlist
  addition.
- The README update and the architecture edit.

### Out of scope

- **Failed background shells.** Their exit status reaches the session only
  inside the task-notification text, an internal unversioned format (prior
  art AVOID: transcripts and unversioned fields). A shell the main loop stops
  with `TaskStop` is covered.
- **Context or usage in the status line.** Claude Code's own status line can
  already show them (prior art: AVOID duplicating a native meter). Only the
  limit stop, which changes what the human must do, enters the line.
- **A feed of every event.** The feed shows the kinds above only (prior art
  AVOID: a feed that mirrors every event).
- **Any action in the pane**, and any write (the status-pane principle).

## Design

### Inputs

All new hooks observe: they call `next(e)` and pass its result on. They
catch their own errors, and they pass through when the session is not
active. Each atom write is followed by `publishStatus($)`. Every `now` is
`$.clock.now()` at the moment of the write.

| Input | Hook | Writes |
|---|---|---|
| context fill, usage windows | `session.measure` (pushed after each main-loop turn and when a window moves a point); `$.session.usage()` once at `session.start` and after `classic.SessionStart` `clear` / `resume` / `fork` | `meters.context` = `context.percent`; `meters.limits` = `rateLimits` (`kind`, `percentUsed`, `resetsAt`) |
| compactions | `classic.PostCompact` | `meters.compactions` + 1; event `compacted (<trigger>)` |
| limit stop | `classic.StopFailure` with `error` `rate_limit` | `meters.limitedUntil` = the latest `resetsAt` of a window at `percentUsed >= 100`, else of any window, else unset; event `usage limit — resumes HH:MM` |
| heartbeat | `turn.start` and `turn.complete`, main loop (no `agentId`) | `beat = { working: true, since: now }` at start. At complete, `beat = { working: false, since: now }`, and `lastText = now` when `answer` is not empty |
| subagent end | `turn.complete` with an `agentId` and `reason` `error` or `aborted` | event `subagent failed: …` or `subagent stopped: …`, with the description from the held task |
| stopped task | `tool.call` for `TaskStop`, main loop | event `stopped: <description>` of the held task with that `task_id`, else `stopped: task <id>` |
| denial | `classic.PermissionDenied` | event `denied <tool_name>: <first line of reason>` |
| merge failure | `tool.call` for `Bash`, any loop: the command matches `/\bgh\s+pr\s+merge\s+(\d+)/` and the result has `isError` | event `PR #<n> <title> merge failed: <first non-empty stderr line>` |
| closed issue | `refresh` in `hooks/github.ts`, on a successful read | an issue number in the previous snapshot's `open` and not in the new one becomes event `#<n> <title> closed`, with the title from the previous `titles` |

- **When the limit clears.** A `session.measure` in which every window is
  under 100 % unsets `limitedUntil`. Once its time has passed, the pane and
  `statusLine` treat it as cleared; they only read it and never write. The
  status line is re-published by the next atom write, at the latest by the
  two-minute refresh.
- **Text cleaning.** Event text taken from tools, reasons or GitHub is
  stripped of control characters and cut to 200 characters before it is
  stored. It is displayed only.

### Titles for `#<n>`

- The snapshot gains `titles: Record<number, string>` (open issues and open
  PRs, from the reads it already makes) and `open: number[]` (open issue
  numbers).
- Every event that names `#<n>` writes `#<n> <title>` when `titles` has the
  number, else `#<n>` alone.
- The closed-issue diff uses the previous snapshot's maps. The first
  successful read sets no closed events.

### Events — `hooks/events.ts`

- `pushEvent(events, { kind, text }, now)` is pure.
  - **A repeat:** when an event with the same `kind` and `text` is held, it
    gets `count` + 1 and `at = now`, and moves to the front.
  - **Otherwise:** the new event is prepended with `count = 1`.
  - **Cap:** the list keeps at most 50 events. The pane shows 8.
- `closedEvents(prev, next)` is pure. It returns the closed-issue events for
  two snapshots.
- `registerEvents(on, isActive)` registers the event hooks in the table above
  (all but the closed-issue diff, which `refresh` calls).

### Meters — `hooks/meters.ts`

- `registerMeters(on, isActive)` registers the meter and heartbeat hooks in
  the table above.
- `loadUsage($)` makes the one-time `$.session.usage()` read.
- `meterLine(meters, now)` and `beatLine(beat, lastText, now)` are pure.

### State contract — `types/index.d.ts` additions

```ts
export type Meters = {
  context?: number; compactions: number;
  limits: { kind: string; percentUsed: number; resetsAt?: string }[];
  limitedUntil?: string
}
export type Beat = { working: boolean; since: number }
export type FeedEvent = { kind: string; text: string; at: number; count: number }
// Snapshot gains: titles: Record<number, string>; open: number[]   (shape 'snapshot-2')

declare module 'claude-code' {
  interface PluginState {
    loopkit: {
      // … status-pane atoms …
      meters: Meters        // default { compactions: 0, limits: [] }
      beat: Beat | null     // default null
      lastText: number | null  // default null
      events: FeedEvent[]   // default []
    }
  }
}
```

The snapshot's shape moves to `snapshot-2`. A held `snapshot-1` value from
before a reload reads as `null`, so the next refresh re-derives it.

### Pane and status line

- **Header lines:**
  - **meters:** `5h` and `7d` stand for the `five_hour` and `seven_day`
    windows, and any other window shows its `kind`. The part is
    `<label> <percentUsed rounded>%`.
  - **heartbeat:** as in Outcome, with ages in the status-pane format.
- **The Events section:** between Running and Up next, titled `Events (<n>)`
  with the held count, the newest 8 rows shown, and a dim `+<n> more` line
  when cut. Each row is a single line: `HH:MM` dim, then the text cut with
  `…` to the pane width, then ` ×<n>` in the `warning` colour when
  `count > 1`. `HH:MM` is local time.
- **Status line:** `statusLine` gains `meters` and puts
  `limited until HH:MM · ` after `loopkit · ` while `limitedUntil` is set and
  in the future.
- **Layout and colours** follow `docs/design/session-meters.svg`. The rest of
  the pane stays as `docs/design/status-pane.svg` draws it.

### Verify

- **Allowlist:** the read-only allowlist gains `$.session.usage`, and nothing
  else.
- **Guard words:** the new modules avoid the words the config-surface guard
  forbids. They never read or name the Stop input's field for the session's
  timed wake-ups.

### Tests — `claude plugin test`

- **`events.test.ts`:**
  - `pushEvent`: collapse, move to front, the 50 cap;
  - `closedEvents`: titles from the previous snapshot, and no events on the
    first read;
  - the merge-failure match, with and without `isError`;
  - the subagent `error` / `aborted` text;
  - the `TaskStop` lookup with its fallback.
- **`meters.test.ts`:**
  - `meterLine`: parts left out without a reading, the window labels, the
    limited form, the 85 % warning flag;
  - `beatLine`: working, idle and last text;
  - `limitedUntil`: set and cleared.
- **`pane.test.tsx` additions:**
  - the Events rows, cap and empty state;
  - the two header lines;
  - `statusLine` with a limit stop.

## Constraints

- These constitution rules bind:
  - the Read-only status mod principle (from `status-pane`);
  - GitHub-only durable state (the atoms are session state);
  - the trust boundary (event text is inert data);
  - the scheduler definition: no new timer, and the status-pane timer only
    re-reads.
- `docs/architecture.md`: a reader takes `Needs you:` lines from main-session
  text only. This spec adds no new `Needs you:` source.
- Builds on the merged status-pane modules: `hooks/register.tsx`,
  `hooks/status.ts`, `hooks/github.ts`, `hooks/session.ts`,
  `hooks/pane.tsx`, `types/index.d.ts`.
- Verified on Claude Code 2.1.312. The facts this spec relies on:
  - `session.measure` and `$.session.usage()` carry `context.percent` and
    `rateLimits` with `resetsAt`;
  - `classic.PostCompact`, `classic.StopFailure` (`error: 'rate_limit'`) and
    `classic.PermissionDenied` (`tool_name`, `reason`) exist;
  - `turn.start` and `turn.complete` carry `agentId`, and `turn.complete`
    carries `reason`;
  - a tool result carries `isError`.

## Prior art

- [Session health meters — context, usage limits, heartbeat, event feed (feature: session-meters)](../prior-art.md#session-health-meters--context-usage-limits-heartbeat-event-feed-feature-session-meters)
  — the evidence:
  - 31 compactions, 9 usage-limit stops, 474 silence reminders;
  - 49 failed or killed tasks, 46 merge failures, 209 re-notified tasks;
  - 40 % of texts with three or more bare `#N`.

  The verdicts: ADOPT one row per task with repeats collapsed, and a title
  next to every `#N`. AVOID a feed of every event, and duplicating a native
  meter. claude-hud's context-and-limit line: ADOPT two numbers in one line.
- [In-session status pane — loopkit state and session signals in one view (feature: status-pane)](../prior-art.md#in-session-status-pane--loopkit-state-and-session-signals-in-one-view-feature-status-pane)
  — the mods entry: AVOID transcript parsing and state in a file.
- The status-pane spec (`docs/specs/spec-status-pane.md`, or
  `docs/specs/archive/` once archived): the modules, atoms, guards and design
  this phase extends.

## Human prerequisites

none

## Foundation edits

Authored in this spec PR and ratified at the spec-acceptance gate:

- `docs/architecture.md`, Component map: the status mod's row names its
  session inputs. They are the turn, tool and agent events, plus the meter
  events: `session.measure`, compaction, stop failure and permission denial.
- Vision: none. Constitution: none. The Read-only status mod principle already
  covers these hooks. `$.session.usage` is a read, and the allowlist lives in
  the spec and in Verify.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Usage comes from `session.measure` and `$.session.usage()`. | The seed found no hook source. The 2.1.312 API has one: `rateLimits` with `percentUsed` and `resetsAt`, pushed after each main-loop turn. | 2026-10-29 |
| Context and usage stay out of the status line, and only a limit stop enters it. | Claude Code's status line can already show context and usage (prior art AVOID duplicating a native meter). A limit stop changes what the human must do, and the evidence shows 9 stops lasting 10 min to 15 h. | 2026-10-29 |
| No failed-shell events. | A shell's exit status reaches the session only inside the task-notification text, which is internal and unversioned. | 2026-10-29 |
| A subagent failure comes from `turn.complete`'s `reason` (`error` / `aborted`) on its loop. | It is a structured field, and the subagent's description is already held as a task. | 2026-10-29 |
| A closed issue is a snapshot diff, not a PR event. | A merge closes its issue (`Closes #<n>`). The diff needs no new `gh` call and gives the title. A PR closed without a merge has no issue event, which is acceptable. | 2026-10-29 |
| Events collapse by kind and text, keep 50 and show 8. | It covers the "repeats collapsed" adopt and bounds the session state. The 209 re-notified tasks are already one row each under Running. | 2026-10-29 |
| The snapshot moves to `snapshot-2`. | New fields on a shaped atom need a new shape, so a reload never reads a value of the old shape as the new one. | 2026-10-29 |
| Heartbeat counts from the main loop's last turn start or end, plus the last non-empty answer. | It is what the 474 silence reminders measured: time since the orchestrator last said something. | 2026-10-29 |
| A separate design file, `session-meters.svg`. | `status-pane.svg` is the committed design status-pane's issues build to. The new parts get their own mock, one concept, while the pane keeps its layout. | 2026-10-29 |

## Tracking

- Milestone: [session-meters](<milestone-url>), with
  `Depends on milestone: #27` (status-pane).
- Issues, one per step, created after the merge:
  - **A — Contract and meters:**
    - the `types/index.d.ts` additions and `snapshot-2`;
    - `hooks/meters.ts` and `hooks/meters.test.ts`;
    - the `statusLine` limit prefix in `hooks/status.ts`;
    - the allowlist entry in `scripts/verify.sh`.

    Depends on: the last status-pane issue (cross-milestone).
  - **B — Events:**
    - `hooks/events.ts` and `hooks/events.test.ts`;
    - the snapshot's `titles` and `open` fields and the closed-issue diff in
      `hooks/github.ts`.

    Depends on: A.
  - **C — Pane, wiring and docs:**
    - the header lines and the Events section in `hooks/pane.tsx`, with its
      tests;
    - `registerMeters`, `registerEvents` and `loadUsage` wired in
      `hooks/register.tsx`;
    - the README update.

    Depends on: A, B.

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`), including
      `claude plugin test .` and the read-only guard with `$.session.usage`.
- [ ] Smoke (human, at the QA gate), in the same setup as status-pane's smoke
      (`claude --plugin-dir /home/developer/projects/loopkit` in the main
      checkout):
      1. After the first answer, the header shows `ctx <p>%`, plus the usage
         windows when on a subscription, and `idle <age> · last text <age> ago`.
         While a turn runs it shows `working <age>`.
      2. Run `/compact`. The meters line shows `1 compacted`, and Events shows
         `compacted (manual)`.
      3. Ask the session to close a scratch issue
         (`gh issue close <n>`), or merge any PR. After the next refresh,
         Events shows `#<n> <title> closed`.
      4. Ask the session to run `gh pr merge 999999` (no such PR). Events
         shows `PR #999999 merge failed: …`.
      5. Ask for a background subagent, then interrupt it. Events shows
         `subagent stopped: <description>`.
      6. Deny a permission prompt the session raises. Events shows
         `denied <tool>: …`.
      7. Repeat step 4. The row shows ` ×2` and moves to the top.
- [ ] Read-through (human):
      - the header lines and the Events section match
        `docs/design/session-meters.svg`;
      - the README section describes them;
      - the limit-stop form is drawn in the design and covered by tests. A
        real limit stop cannot be forced at QA.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `rateLimits` is empty (not a subscription, or before the first response). | The usage parts are left out; nothing shows a false 0 %. |
| `resetsAt` is missing on a limit stop. | The meters line reads `limited` without a time, and the status line reads `limited`. |
| A denial or error text carries untrusted content. | It is stripped of control characters, cut to 200 characters, and displayed only. |
| Event volume in a long run. | The list is capped at 50 held and 8 shown, and repeats collapse. |

## Decision log

- 2026-10-29: Drafted. The 2.1.312 API was verified for `session.measure`,
  `$.session.usage()`, `classic.PostCompact`, `classic.StopFailure`,
  `classic.PermissionDenied`, `turn.complete.reason` and the tool result's
  `isError`. The task-notification origin carries no structured status, so
  failed shells stay out.
