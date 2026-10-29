# Spec: session-meters

> Created: 2026-10-29

Extend the status pane (`spec-status-pane.md`) with session health:

- context fill and compactions;
- usage-limit windows, and a limit stop with its resume time;
- an orchestrator heartbeat;
- an event feed that names the issue or PR each event is about.

All of it comes from structured session hooks. Nothing parses transcript or
notification text, and the mod still reads the session only through its
hooks. This spec carries no lifecycle state. Acceptance is the spec merged on
the default branch with a milestone and issues, and all progress lives in the
GitHub issues and milestone. A completed spec is moved to
`docs/specs/archive/`.

The design is `docs/design/session-meters.svg`: the pane header's two meter
lines and the Events section, drawn with sample data. It is reviewed with
this spec at the spec-acceptance gate.

## Outcome

- [ ] The pane header gains two dim lines under the repo line:
      - **meters:** `ctx <p>% · <c> compacted · 5h <p>% · 7d <p>%`.
        - A part is left out when it has no reading.
        - `<c> compacted` is left out at 0.
        - The whole line is left out when no part has a value.
        - The first reading comes after the session's first answer, or the
          first answer after `/clear`.
      - **heartbeat:** `working <age>` while a main-loop turn runs, else
        `idle <age>`. Once the main loop has given a non-empty answer,
        ` · last text <age> ago` follows.
- [ ] A **limit stop** turns the meters line into
      `limited until <when> · ctx <p>%` in the `warning` colour, or
      `limited · ctx <p>%` when no reset time is known.
      - The status line gains the same `limited until <when> · ` or
        `limited · `, right after `loopkit · `.
      - `<when>` is `HH:MM` when the reset is today, else `<Ddd> HH:MM` (for
        example `Fri 19:00`).
      - The stop clears when a later reading puts every window under 100 %,
        or when its reset time has passed.
- [ ] Context at 85 % or more draws the `ctx` part in the `warning` colour.
- [ ] A new **Events** section sits between Running and Up next.
      - It shows the newest 8 events, newest first, as `HH:MM <text>`.
      - Collapsed repeats show ` ×<n>`.
      - Its empty state is `No events yet.`.

      The kinds and their texts:

      | Kind | When | Text |
      |---|---|---|
      | `issue-closed` | an issue closed since the previous snapshot | `#<n> <title> closed` |
      | `merge-failed` | a `gh pr merge` failed, in any loop | `PR #<n> <title> merge failed`, plus `: <detail>` when there is one |
      | `subagent-ended` | a subagent ended on an error or an interrupt | `subagent failed: <description>` / `subagent stopped: <description>` |
      | `task-stopped` | the main loop stopped a background task with `TaskStop` | `stopped: <description>` |
      | `denied` | an auto-mode classifier denial | `denied <tool>: <reason>` |
      | `compacted` | a main-loop compaction | `compacted (auto)` / `compacted (manual)` |
      | `limit` | a limit stop | `usage limit — resumes <when>`, or `usage limit` |

- [ ] The issue or PR an event is about carries its title (`#<n> <title>`,
      `PR #<n> <title>`), taken from the snapshot the mod already holds.
      Free text inside an event, such as a description, a reason or an error
      line, is shown as it is.
- [ ] The read-only guard's allowlist does not change. The status-pane
      principle and its Verify guard hold as they are.
- [ ] The README's "Status pane" section describes the meter lines, the
      limit stop and the Events section.
- [ ] `docs/architecture.md` lists the meter inputs (see Foundation edits).

## Scope

### In scope

- The meter and heartbeat lines, the limit stop and the Events section, as
  specified under Design, with their tests.
- The state-contract extension and the snapshot's title map.
- The README update and the architecture edit.

### Out of scope

- **Failed background shells.** Their exit status reaches the session only
  inside the task-notification text, which is an internal, unversioned format
  (prior art AVOID: transcripts and unversioned fields). A shell the main loop
  stops with `TaskStop` is covered.
- **Denials in the other modes.** `classic.PermissionDenied` fires only for
  auto-mode classifier denials. A manual denial, a `deny` rule and a
  `PreToolUse` block reach no hook.
- **Context or usage in the status line.** Claude Code's own status line can
  already show them (prior art: AVOID duplicating a native meter). Only the
  limit stop enters the line, because it changes what the human must do.
- **A feed of every event.** Only the kinds above are shown (prior art
  AVOID: a feed that mirrors every event).
- **`$.session.usage()` or any other `$` op.** The mod reads the session only
  through its hooks (the Read-only status mod principle), so the meters wait
  for the first `session.measure`.
- **Any action in the pane, and any write** (the status-pane principle).

## Design

### Inputs

All new hooks observe: they call `next(e)` and pass its result on. They catch
their own errors, and they pass through when the session is not active. Each
atom write is followed by `publishStatus($)`. Every `now` is `$.clock.now()`
at the moment of the write.

| Input | Hook | Writes |
|---|---|---|
| context fill, usage windows | `session.measure`, which fires after each main-thread turn and when a window moves a point | `meters.context = context.percent` when present; `meters.limits = rateLimits` (`kind`, `percentUsed`, `resetsAt`); and, when `meters.limit` is held, `rateLimits` is not empty and every window is under 100 %, `meters.limit` is cleared |
| compactions | `classic.PostCompact` with no `agent_id` (main loop only) | `meters.compactions` + 1; event `compacted` (`compacted (<trigger>)`) |
| limit stop | `classic.StopFailure` with `error` `rate_limit` | `meters.limit = { until }`, where `until` is the latest `resetsAt` among windows with `percentUsed >= 100` and is unset when there is none; event `limit` |
| heartbeat | `turn.start` and `turn.complete` on the main loop (no `agentId`) | at start, `beat = { working: true, since: now }`; at complete, `beat = { working: false, since: now }`, plus `lastText = now` when `answer` is not empty |
| subagent end | `turn.complete` with an `agentId` and `reason` `error` or `aborted` | event `subagent-ended`. The hook reads the held task's description **before** calling `next(e)`, because `session.ts` removes the task on the same event. With no held task, it writes the `agentId` instead |
| stopped task | `tool.call` for `TaskStop` on the main loop | after `next(e)`, when the result is not `isError`: event `task-stopped`, keyed on the result's `task_id`. The description comes from the held task with that id, else the result's `command`, else `task <id>` |
| denial | `classic.PermissionDenied` (auto-mode classifier denials only) | event `denied` (`denied <tool_name>: <first line of reason>`) |
| merge failure | `tool.call` for `Bash`, in any loop, when the command matches `/\bgh\s+pr\s+merge\s+(\d+)/` and the result has `isError` | event `merge-failed`. The detail is the first non-empty line of the result's `text` that is not an `Exit code <n>` line; without one there is no detail |
| closed issue | `refresh` in `hooks/github.ts`, on a successful read | every issue number in the previous snapshot's `open` that is missing from the new one becomes event `issue-closed`, titled from the previous `titles` |

- **When a limit stop clears.**
  - A `session.measure` reading that has windows, all under 100 %, clears
    it. An empty `rateLimits` clears nothing.
  - Once `until` is in the past, the pane and `statusLine` treat the stop as
    cleared. They only read it and never write.
  - A stop with no `until` clears only on such a reading.
  - The status line is re-published by the next atom write, or at the latest
    by the two-minute refresh.
- **Why `classic.PostCompact`, not `session.compact`.** `session.compact` is
  a transforming hook and also fires for the `precompute` trigger.
  `classic.PostCompact` observes a finished compaction and carries `trigger`
  (`manual` / `auto`).
- **Text cleaning.** Event text taken from tools, reasons or GitHub is
  stripped of C0 and C1 control characters and cut to 200 characters before
  it is stored. It is displayed only.
- **Both events for one stop.** A `TaskStop` on a background subagent can
  produce both `task-stopped` and `subagent-ended`. Both are shown, as two
  facts: the stop and its effect.

### Titles

- The snapshot gains two fields, built from the reads it already makes:
  - `titles: Record<number, string>`, for open issues and open PRs;
  - `open: number[]`, the open issue numbers.
- An event's subject gets its title from `titles`. The subject is the closed
  issue, or the PR a merge failed on. Without a title it shows the bare
  `#<n>` or `PR #<n>`. Free text is shown as it is.
- The closed-issue diff uses the previous snapshot's maps. The first
  successful read writes no `issue-closed` events.

### Events — `hooks/events.ts`

- `pushEvent(events, { kind, text }, now)` is pure:
  - when an event with the same `kind` and `text` is held, its `count` goes
    up by 1, its `at` becomes `now`, and it moves to the front;
  - otherwise the new event is prepended with `count = 1`;
  - the list keeps at most 50 events, and the pane shows 8.
- `closedEvents(prev, next)` is pure. It returns the `issue-closed` events
  for two snapshots.
- `registerEvents(on, isActive)` registers the event hooks in the table
  above, all except the closed-issue diff, which `refresh` calls.
- The kind strings are exactly `issue-closed`, `merge-failed`,
  `subagent-ended`, `task-stopped`, `denied`, `compacted` and `limit`. None of
  them is a quoted write-argv token the read-only guard bans.

### Meters — `hooks/meters.ts`

- `registerMeters(on, isActive)` registers the meter and heartbeat hooks in
  the table above.
- `meterLine(meters, now)` and `beatLine(beat, lastText, now)` are pure.
- `when(iso, now)` gives `HH:MM` for a reset today, else `<Ddd> HH:MM`.

### State contract — `types/index.d.ts` additions

Issue A adds:

```ts
export type Meters = {
  context?: number; compactions: number;
  limits: { kind: string; percentUsed: number; resetsAt?: string }[];
  limit?: { until?: string }
}
export type Beat = { working: boolean; since: number }
export type FeedEvent = { kind: string; text: string; at: number; count: number }

declare module 'claude-code' {
  interface PluginState {
    loopkit: {
      // … status-pane atoms …
      meters: Meters           // default { compactions: 0, limits: [] }
      beat: Beat | null        // default null
      lastText: number | null  // default null
      events: FeedEvent[]      // default []
    }
  }
}
```

Issue B adds `titles: Record<number, string>` and `open: number[]` to
`Snapshot`, and moves the snapshot atom's shape to `snapshot-2`. After a
reload, a held `snapshot-1` value reads as `null`, and the next refresh
re-derives it.

### Pane and status line

- **The meters line:**
  - `5h` and `7d` stand for the `five_hour` and `seven_day` windows; any
    other window shows its `kind`;
  - each part is `<label> <percentUsed rounded>%`.
- **The heartbeat line:** as in Outcome, with ages in the status-pane format.
- **The Events section:**
  - it sits between Running and Up next, titled `Events (<n>)` with the held
    count;
  - the newest 8 rows are shown, with a dim `+<n> more` line when cut;
  - each row is one line: `HH:MM` dim (local time), then the text, then
    ` ×<n>` in the `warning` colour when `count > 1`;
  - a row that is too long is cut with `…`. An `issue-closed` or
    `merge-failed` row cuts its title and keeps what follows it; any other
    row is cut at the end.
- **`statusLine`:** it becomes
  `statusLine(snapshot, asking, asks, tasks, limit?, now?)`. The two new
  parameters are optional, so status-pane's four-argument calls and tests
  keep working, and `publishStatus` passes `await $.clock.now()`. While a stop holds, its part goes
  right after `loopkit · ` in every form:
  - `loopkit · limited until 19:00 · 1 need you · …`
  - `loopkit · limited · reading GitHub…`
  - `loopkit · limited until 19:00 · <error>`, which replaces
    `loopkit: <error>` while the stop holds.
- **Layout and colours** follow `docs/design/session-meters.svg`. The status
  line is plain text: `$.ui.status` takes a string, so it has no colour. The
  rest of the pane stays as `docs/design/status-pane.svg` draws it.

### Verify

- No allowlist change: every new input is a hook.
- The new modules avoid the words the config-surface guard forbids. They
  never read or name the field of the Stop input that lists the session's
  timed wake-ups.

### Tests — `claude plugin test`

- **`events.test.ts`:**
  - `pushEvent`: collapse, move to front, and the 50 cap;
  - `closedEvents`: titles from the previous snapshot, and no events on the
    first read;
  - the merge-failure match, with and without `isError`, and the detail
    rule: skip `Exit code <n>`, no detail when nothing is left;
  - `subagent-ended`: the `error` and `aborted` texts, the description read
    before `next(e)`, and the `agentId` fallback;
  - `TaskStop`: the result's `task_id`, the `command` fallback, and no event
    on `isError`;
  - the denial text;
  - the compaction text, counting only a main-loop event;
  - control-character stripping and the 200-character cut.
- **`meters.test.ts`:**
  - `meterLine`: parts left out without a reading, `compacted` left out at 0,
    the window labels, the limited forms with and without `until`, and the
    85 % warning flag;
  - `beatLine`: working, idle, and last text;
  - `when`: today and another day;
  - limit clearing: on a reading under 100 %, not on an empty `rateLimits`,
    and on `until` in the past.
- **`pane.test.tsx` additions:**
  - the Events rows, their cap, empty state and title-cut rule;
  - the two header lines;
  - `statusLine` with a limit stop, in all three forms.

## Constraints

- Constitution:
  - the Read-only status mod principle (from `status-pane`): the session is
    read through hooks only;
  - GitHub-only durable state: the atoms are session state;
  - the trust boundary: event text is inert data;
  - the scheduler definition: no new timer.
- `docs/architecture.md`: a reader takes `Needs you:` lines from main-session
  text only. This spec adds no new `Needs you:` source.
- This phase builds on the merged status-pane modules: `hooks/register.tsx`,
  `hooks/status.ts`, `hooks/github.ts`, `hooks/session.ts`,
  `hooks/pane.tsx` and `types/index.d.ts`.
- Verified on Claude Code 2.1.312:
  - `session.measure` fires after each main-thread turn and carries the
    optional `context.percent` and `rateLimits` (`kind`, `percentUsed`,
    optional `resetsAt`);
  - `classic.PostCompact` carries `trigger`, plus `agent_id` inside a
    subagent;
  - `classic.StopFailure` carries `error: 'rate_limit'`;
  - `classic.PermissionDenied` fires in auto mode only and carries
    `tool_name` and `reason`;
  - `turn.start` and `turn.complete` carry `agentId`, and `turn.complete`
    carries `reason`;
  - an error tool result carries `isError` and `text`, never the typed
    record.

## Prior art

- [Session health meters — context, usage limits, heartbeat, event feed (feature: session-meters)](../prior-art.md#session-health-meters--context-usage-limits-heartbeat-event-feed-feature-session-meters)
  - The evidence: 31 compactions, 9 usage-limit stops, 474 silence reminders,
    49 failed or killed tasks, 46 merge failures, 209 re-notified tasks, and
    40 % of texts with three or more bare `#N`.
  - The verdicts:
    - ADOPT one row per task, with repeats collapsed;
    - ADOPT a title next to `#N`;
    - AVOID a feed of every event;
    - AVOID duplicating a native meter;
    - claude-hud's context-and-limit line: ADOPT two numbers in one line.
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
  session inputs. These are the turn, tool and agent events, plus the meter
  events (`session.measure`, compaction, stop failure, permission denial).
- Vision: none.
- Constitution: none. Every new input is a hook, so the Read-only status mod
  principle covers this phase as written, and the allowlist does not change.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Usage comes from `session.measure`; there is no `$.session.usage()` call. | The seed found no hook source, but the 2.1.312 API has one: `rateLimits` with `percentUsed` and `resetsAt`. The Read-only status mod principle allows reading the session only through hooks, so the meters wait for the first reading, which comes after the first answer. | 2026-10-29 |
| Context and usage stay out of the status line; only a limit stop enters it. | Claude Code's status line can already show context and usage (prior art: AVOID duplicating a native meter). A limit stop changes what the human must do, and the evidence has 9 stops lasting 10 min to 15 h. | 2026-10-29 |
| The limit stop's `until` comes only from windows at 100 % or more; otherwise it is unknown. | A fallback to any window could show a reset days away, and a transient 429 would claim a time. `limited` without a time is honest, and it clears on a reading under 100 %. | 2026-10-29 |
| No failed-shell events. | A shell's exit status reaches the session only inside the task-notification text, which is internal and unversioned. | 2026-10-29 |
| Denials are auto-mode classifier denials only. | `classic.PermissionDenied` fires only there. A manual denial, a `deny` rule and a `PreToolUse` block reach no hook. | 2026-10-29 |
| A subagent failure comes from `turn.complete`'s `reason` (`error` / `aborted`) on its loop, read before `next(e)`. | It is a structured field. Hooks nest first-outermost, and `session.ts` removes the task on the same event, so reading first keeps the description. | 2026-10-29 |
| A closed issue is a snapshot diff, not a PR event. | A merge closes its issue (`Closes #<n>`). The diff needs no new `gh` call and gives the title. A PR closed without merging has no issue event, which is acceptable. | 2026-10-29 |
| Only an event's subject is titled. | The snapshot holds the subject's title. Free text such as descriptions and reasons is the source's own words, shown as they are. | 2026-10-29 |
| Events collapse by kind and text; 50 are kept and 8 shown. | It covers the "repeats collapsed" adopt and bounds the session state. The 209 re-notified tasks are already one row each under Running. | 2026-10-29 |
| A compaction counts from `classic.PostCompact` with no `agent_id`. | It observes a finished main-loop compaction. `session.compact` transforms the compaction and also fires for `precompute`. | 2026-10-29 |
| The snapshot moves to `snapshot-2`, in issue B. | New fields on a shaped atom need a new shape, so a reload never reads an old-shape value as the new one. The issue that adds the fields owns the shape. | 2026-10-29 |
| The heartbeat counts from the main loop's last turn start or end, plus the last non-empty answer. | That is what the 474 silence reminders measured: the time since the orchestrator last said something. | 2026-10-29 |
| The new parts get their own design file, `session-meters.svg`. | `status-pane.svg` is the committed design that status-pane's issues build to. A separate mock covers one concept, and the pane keeps its layout. | 2026-10-29 |

## Tracking

- Milestone: [session-meters](<milestone-url>), with
  `Depends on milestone: #27` (status-pane).
- Issues, one per step, created after the merge:
  - **A — Contract and meters:**
    - the `types/index.d.ts` additions (`Meters`, `Beat`, `FeedEvent`, and
      the four atoms);
    - `hooks/meters.ts` and `hooks/meters.test.ts`;
    - the `statusLine` signature and the limit part in `hooks/status.ts`.

    Depends on: #299.
  - **B — Events:**
    - `hooks/events.ts` and `hooks/events.test.ts`;
    - in `hooks/github.ts`: the snapshot's `titles` and `open` fields,
      `snapshot-2`, and the closed-issue diff.

    Depends on: A, #300.
  - **C — Pane, wiring and docs:**
    - the header lines and the Events section in `hooks/pane.tsx`, with its
      tests;
    - `registerMeters` and `registerEvents` wired in `hooks/register.tsx`;
    - the README update.

    Depends on: A, B, #302, #303.

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`), including
      `claude plugin test .` and the unchanged read-only guard.
- [ ] Smoke (human, at the QA gate). Use the same setup as status-pane's
      smoke: `claude --plugin-dir /home/developer/projects/loopkit` in the
      main checkout.
      1. After the first answer, the header shows `ctx <p>%` (plus the usage
         windows on a subscription) and `idle <age> · last text <age> ago`.
         While a turn runs, it shows `working <age>`.
      2. Run `/compact`. The meters line shows `1 compacted`, and Events
         shows `compacted (manual)`.
      3. Ask the session to close a scratch issue (`gh issue close <n>`), or
         merge a PR that closes an issue. After the next refresh, Events shows
         `#<n> <title> closed`.
      4. Ask the session to run `gh pr merge 999999` (no such PR). Events
         shows `PR #999999 merge failed: <gh's error line>`.
      5. Repeat step 4. The row shows ` ×2` and moves to the top.
      6. Ask for a foreground subagent, and press Esc while it runs. Events
         shows `subagent stopped: <description>`.
      7. Ask the session to start a background shell (`sleep 300`), then
         stop it with `TaskStop`. Events shows `stopped: <description>`.
- [ ] Read-through (human):
      - the header lines and the Events section match
        `docs/design/session-meters.svg`;
      - the README section describes them;
      - the limit stop and the auto-mode denial are drawn in the design and
        covered by tests, because neither can be forced reliably at QA.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `rateLimits` is empty (not a subscription, or before the first response). | The usage parts are left out, so nothing shows a false 0 %. |
| A limit stop arrives without `resetsAt`. | The meters line and the status line read `limited` with no time, and the stop clears on a reading under 100 %. |
| A denial or error text carries untrusted content. | It is stripped of control characters, cut to 200 characters, and displayed only. |
| Events pile up in a long run. | At most 50 are held and 8 shown, and repeats collapse. |
| The meters are blank right after start or `/clear`. | By design: the first `session.measure` fills them after the first answer. The heartbeat and the other sections show at once. |

## Decision log

- 2026-10-29: Drafted. The 2.1.312 API was verified for `session.measure`,
  `classic.PostCompact`, `classic.StopFailure`, `classic.PermissionDenied`,
  `turn.complete.reason` and the tool result's `isError`. The
  task-notification origin carries no structured status, so failed shells
  stay out.
- 2026-10-29: Review round 1 (REQUEST_CHANGES) addressed:
  - no `$.session.usage()`; the session is read through hooks only;
  - the merge detail comes from the error result's `text`;
  - denials are scoped to auto mode;
  - the subagent description is read before `next(e)`, with an `agentId`
    fallback;
  - `limit?: { until? }` covers a stop without a time, and `until` is taken
    only from windows at 100 %;
  - only main-loop compactions count;
  - the `TaskStop` result fields are used;
  - only an event's subject is titled;
  - the snapshot fields and `snapshot-2` moved to issue B;
  - the `statusLine` signature and forms are defined;
  - the kind strings are named;
  - `compacted` is left out at 0;
  - the cross-milestone dependencies use real issue numbers;
  - the design is corrected (plain status line, the cut rule, an auto-mode
    reason);
  - the smoke steps are producible, and the tests are extended.
- 2026-10-29: Review round 2 returned APPROVE. Its three non-blocking notes
  were applied before the gate:
  - an empty `rateLimits` clears no stop;
  - `limit` and `now` are optional in `statusLine`;
  - smoke step 3 merges a PR that closes an issue.
