# Spec: status-pane

> Created: 2026-10-29

Ship a read-only Claude Code mod inside the loopkit plugin that draws a pane
beside the chat and a status-line entry. They show what needs the human, how
far each open milestone is, what runs in the session now, and what is up next.
The mod reads GitHub through `gh` and the session through its hooks, and it
never acts. This spec carries no lifecycle state. Acceptance is the spec
merged on the default branch with a milestone and issues, and all progress
lives in the GitHub issues and milestone. A completed spec is moved to
`docs/specs/archive/`.

The design is `docs/design/status-pane.svg` (the pane and the status line,
drawn with sample data). It is reviewed with this spec at the
spec-acceptance gate.

## Outcome

- [ ] The plugin ships the mod:
      - `hooks/hooks.json` is `{ "modules": ["./register.tsx"] }`;
      - `.claude-plugin/plugin.json` names `"types": "./types/index.d.ts"`;
      - the module files are `hooks/register.tsx`, `hooks/github.ts`,
        `hooks/session.ts` and `hooks/pane.tsx`, with tests
        `hooks/github.test.ts`, `hooks/session.test.ts` and
        `hooks/pane.test.tsx`;
      - `types/index.d.ts` holds the state contract below.
- [ ] In a loopkit project, meaning a session whose working directory has a
      readable `docs/workflow.md`, the session shows:
      - from start, a status-line entry;
      - the pane, opened unasked at session start (the engine seats it on a
        terminal of at least 144 columns and keeps it waiting below that);
      - `/loopkit-status`, which opens the pane and refreshes it.
- [ ] Outside a loopkit project the mod shows nothing:
      - no status line, no pane, no command;
      - no `gh` call.
- [ ] The pane draws four sections in this order, each as in the design, with
      an empty-state line when it has no row:
      - **Needs you**: an open `AskUserQuestion` with its waiting time, then
        the session's held `Needs you:` asks (newest first), then the GitHub
        gates (milestone ready for QA, spec PR at acceptance,
        `needs:planning`, `blocked:human`);
      - **Milestones**: per open milestone with issues, closed of all issues
        as a bar, a count and a percentage, with its in-flight and blocked
        counts;
      - **Running**: one row per in-flight task (subagents, background
        shells, monitors, workflows), with its kind, its elapsed time and,
        for a subagent, the time since its last tool call;
      - **Up next**: the unblocked frontier issues and the unplanned roadmap
        phases.
- [ ] The status line reads `loopkit · <n> need you · #<m> <closed>/<total>
      · <k> running`. The milestone part names the first milestone row with
      work in flight, else the first row, and is left out when there is none.
      On a read error it reads `loopkit: <error>`.
- [ ] A `Needs you:` line in the main session's final answer of a turn
      appears in the pane at that turn's end. It stays until the human's next
      message, typed in the terminal or sent through Remote Control. A task
      notification does not clear it.
- [ ] The view re-reads GitHub:
      - at session start;
      - after each main-loop turn, at most once per 15 s;
      - right after a main-loop `gh pr merge` command returns;
      - every 2 minutes;
      - on `/loopkit-status` and on the pane's Refresh button.

      Ages in the pane update at least once a minute.
- [ ] The mod is read-only, and Verify proves it (see Verify additions):
      - it reads GitHub only through `gh` read commands passed as argv;
      - it writes nothing to GitHub or disk;
      - it starts no turn, tool call, subagent or skill;
      - it keeps its state in session atoms only;
      - it offers no action but open and refresh.
- [ ] Verify validates the mod and runs its tests (`claude plugin test`), and
      `docs/workflow.md`'s Commands say so.
- [ ] `README.md` has a "Status pane" section:
      - what each section shows;
      - `/loopkit-status`;
      - the 144-column placement;
      - that it is read-only;
      - the Claude Code version it was verified on (2.1.312; mods are on by
        default from 2.1.287).
- [ ] The foundation docs and `docs/design.md` carry the edits ratified with
      this spec (see Foundation edits).

## Scope

### In scope

- The mod as specified under Design below, with its tests and its state
  contract.
- Verify: the mod's validation, its tests and the read-only guard, plus the
  matching `docs/workflow.md` Commands text.
- The README section.
- The foundation and design-contract edits, authored in this spec PR.

### Out of scope

- Session health: context fill, compactions, usage limits, the orchestrator
  heartbeat and the event feed. That is the next phase, `session-meters`.
- Any action in the pane: no approve, merge, answer or dismiss (prior art:
  claudectl's approve-from-dashboard, AVOID).
- A user option. `userConfig` needs Claude Code ≥ 2.1.271 and an older build
  "can't load the plugin", so the mod declares none. The pane closes like any
  pane, and the status line has no switch.
- Surfaces other than the terminal. Remote Control draws "in the terminal on
  your machine", so the phone shows nothing of the mod. Desktop and VS Code
  draw whatever their surface places, unverified.
- The classic hooks of `permission-template-hardening`. They will share
  `hooks/hooks.json` under its `"hooks"` key, which the docs allow beside
  `"modules"`.
- Reading transcripts, or the `turn.step` stream (see Prior decisions).

## Design

### Files and wiring

- `hooks/register.tsx` exports `register: Register`. It wires everything:
  - **`session.start`:** it decides `active` (a readable `docs/workflow.md`)
    and returns unchanged when inactive. When active, it registers
    `/loopkit-status` with `$.command.register`, starts the one timer, calls
    `refresh`, and calls `$.ui.open({ id: 'loopkit-status', title: 'loopkit' })`.
    A reload runs it again, so it cancels the previous timer first.
  - **The timer:** `$.clock.every(60_000, …)`. Each tick writes `now`, and
    every second tick calls `refresh`. It never does anything else.
  - **`command.run` for `/loopkit-status`:** it opens the pane and calls
    `refresh` with force. Its text reply is "loopkit status pane opened and
    refreshed.".
  - **`turn.complete` on the main loop:** after `next(e)`, it calls `refresh`
    unless the last refresh is under 15 s old. The throttle is a module
    variable; a reload resets it.
  - **`tool.call` for `Bash` on the main loop:** after `next(e)`, when the
    command matches `/\bgh\s+pr\s+merge\b/`, it calls `refresh` with force.
  - **`ui.render` for `{ component: 'Pane', requestId: 'loopkit-status' }`:**
    it returns `renderPane($, e)`.
  - It calls `registerSession(on)` from `hooks/session.ts`.
  - Every hook on an inactive session returns `next(e)` unchanged.
- `hooks/github.ts`:
  - `gh($, args)` is the module's only `$.process.run` call site:
    `$.process.run(['gh', ...args])`. A non-zero exit throws the first
    stderr line; stdout is parsed as JSON.
  - `refresh($)` returns at once while `isRefreshing` is true. Otherwise it
    sets `isRefreshing` and runs four `gh` reads in parallel:
    - `['repo', 'view', '--json', 'nameWithOwner']`
    - `['issue', 'list', '--state', 'open', '--limit', '200', '--json', 'number,title,body,labels,milestone,projectItems']`
    - `['pr', 'list', '--state', 'open', '--limit', '50', '--json', 'number,title,headRefName,isDraft']`
    - `['api', 'repos/{owner}/{repo}/milestones?state=open&per_page=100']`

    It also reads `docs/roadmap.md` with `$.fs.read`, which may be missing.
    It writes `snapshot = { repo, fetchedAt, error: null, ...derive(input) }`.
    On any error it keeps the previous snapshot's data and sets `error` to
    the message. Then it clears `isRefreshing`.
  - `derive(input)` is pure and exported for tests (rules below).
- `hooks/session.ts` exports `registerSession(on)` (hooks below) and the pure
  helpers `parseAsks(answer)` and `mergeAsks(asks, lines, now, calls)` for
  tests.
- `hooks/pane.tsx` exports `renderPane($, e)` and the pure
  `statusLine(snapshot, asking, asks, tasks)`.
- `$.ui.status(statusLine(…))` is called after each write to `snapshot`,
  `asks`, `asking` or `tasks`.
- No hook ever answers for the engine (every hook calls `next(e)` and returns
  its result), and every hook catches its own errors (`.catch(($, e, next) =>
  next(e))`), so a mod fault never changes a turn.
- Code, comments and names avoid the words Verify's config-surface guard
  forbids in `hooks/` ("cron", "scheduler", "claude -p", …): say "timer".

### State contract — `types/index.d.ts`

All values are atoms under the plugin key `loopkit`, session-scoped (`$.state`
survives a compaction and a reload and resets on `/clear` and `/resume`):

```ts
export type Item = { kind: ItemKind; ref: string; title: string; note?: string }
export type ItemKind = 'qa' | 'spec' | 'escalated' | 'parked' | 'frontier' | 'phase'
export type MilestoneRow = {
  number: number; title: string; closed: number; total: number;
  percent: number; inFlight: number; blocked: number; living: boolean
}
export type Snapshot = {
  repo: string; fetchedAt: number; error: string | null;
  gates: Item[]; milestones: MilestoneRow[]; upNext: Item[]
}
export type Ask = { text: string; firstSeen: number; lastSeen: number; count: number; callsAt: number }
export type Asking = { headers: string; since: number }
export type Task = {
  id: string; kind: string; description: string; detail?: string;
  firstSeen: number; lastActivity?: number
}

declare module 'claude-code' {
  interface PluginState {
    loopkit: {
      active: boolean
      snapshot: Shaped<Snapshot | null>   // shape 'snapshot-1'
      isRefreshing: boolean
      asks: Ask[]
      calls: number
      asking: Asking | null
      tasks: Task[]
      now: number
    }
  }
}
```

### GitHub derivation — `derive({ issues, prs, milestones, roadmap })`

- **Issue dependencies:** an issue's dependencies are every `#<n>` on its
  body's lines that match `/^\s*Depends on:/i`. A `Depends on milestone:`
  line does not match. A dependency is open when `<n>` is in the fetched
  open-issue set.
- **Each open issue lands in exactly one class**, checked in this order:
  1. `blocked:human`: gate `parked`, note `blocked:human · <where>`;
  2. `needs:planning`: gate `escalated`, note `needs:planning · re-run /loopkit:plan`;
  3. board status `In Progress`: counted in its milestone's `inFlight`;
  4. board status `Done`: ignored;
  5. an open dependency: counted in its milestone's `blocked`;
  6. otherwise: `upNext` `frontier`, note `<where>`.

  `<where>` is the milestone title, or `track:adhoc`, or `no milestone`. The
  board status is `projectItems[0].status.name`. Parked and escalated issues
  also count in their milestone's `blocked`.
- **Milestone QA:** an open milestone without a `Track: living-spec` line in
  its description, with `open_issues == 0` and `closed_issues > 0`, is gate
  `qa`. Its ref is `milestone #<n>` and its note `milestone QA`.
- **Spec acceptance:** an open PR whose head branch starts with `docs/`,
  whose title starts with `docs(spec)` and does not contain `archive`, is gate
  `spec`. Its ref is `PR #<n>` and its note `spec acceptance · <branch>`.
  Every other open PR is ignored.
- **Milestone rows:** one row per open milestone with
  `open_issues + closed_issues > 0`, sorted by number:
  - `percent = round(100 * closed / total)`;
  - `living` comes from the `Track: living-spec` line.
- **Gate order:** `qa`, `spec`, `escalated`, `parked`, each by number.
- **Unplanned phases:** a `docs/roadmap.md` table row that starts with
  `| **<name>**` and ends with `| — | — |` is `upNext` `phase` `<name>`, note
  `roadmap · /loopkit:plan`. Phases come after the frontier issues, in
  roadmap order.
- **Trust boundary:** titles, bodies and branch names are only displayed or
  matched; nothing from GitHub becomes an argument or a command.

### Session signals — `registerSession(on)`

All hooks observe: they call `next(e)` and pass its result on.

- **Asks:**
  - On `turn.complete` with no `agentId`, `parseAsks(e.answer)` takes every
    line that matches `/^Needs you: .+$/`, outside fenced code blocks (a line
    starting with three backticks toggles a fence). The whole line is the
    ask's text and identity.
  - `mergeAsks` updates a held ask with the same text (`count` + 1,
    `lastSeen`), or appends a new one with `firstSeen = lastSeen = now` and
    `callsAt = calls`.
  - On `prompt.submit`, when `e.origin.kind` is `composer` or `bridge` and
    `e.isMeta` is not set, `asks` becomes empty. Every other origin
    (`task-notification`, `plugin`, `peer`, …) leaves it.
- **Calls:** on `tool.call` with no `agentId`, `calls` + 1. On `tool.call`
  with an `agentId`, that task's `lastActivity = now`.
- **AskUserQuestion:**
  - on `tool.call` for `AskUserQuestion` with no `agentId`, `asking` becomes
    `{ headers, since: now }` before `next(e)`, where `headers` is the
    questions' `header` values joined by `, `;
  - after `next(e)` settles, or when it throws, `asking` becomes `null`.
- **Tasks:**
  - On `agent.spawn`, after `next(e)` resolves with an `agentId`, a task
    `{ id: agentId, kind: 'subagent', description, detail: model, firstSeen: now }`
    is added.
  - On `classic.Stop`, `tasks` is replaced by `e.background_tasks`. Each
    entry becomes `{ id, kind: type, description: first line, detail }`,
    where `detail` is `agent_type`, `command`, `tool` or `name`, whichever is
    present. `firstSeen`, `lastActivity` and `detail` are kept for an id
    already held, or else for a held subagent with the same description;
    otherwise `firstSeen = now`. A missing `background_tasks` leaves `tasks`
    unchanged.
  - On `turn.complete` with an `agentId`, that task is removed.
  - Keyed by id, a re-notified task stays one row.

### Pane — `renderPane($, e)`

- Layout, labels, symbols and theme colours follow
  `docs/design/status-pane.svg`:
  - **Header:** a line with repo, `updated HH:MM`, `refreshing…` while
    refreshing, and the error in `error` colour when set.
  - **Sections:** Needs you (`warning`), Milestones, Running (`suggestion`),
    Up next (`success`), each titled with its row count.
  - **Footer:** a Refresh button that calls `refresh` with force.
- **Rows:** each row is the title line plus a dim note line. The width is
  `max(30, e.props.bodyColumns)`, and text is cut with `…` to fit. The
  shapes, as drawn in the design:

  | Row | Title line | Note line |
  |---|---|---|
  | open question | `? <headers>` | `question open · waiting <age>` |
  | held ask | `› <text without "Needs you: ">` | `<age> ago · <n> calls since`, plus ` · said <count>×` when `count > 1` |
  | gate | `<ref>` bold, then the title | the gate's note |
  | milestone | `#<n>` bold, the title, a 10-cell bar, `<closed>/<total>`, `<percent>%` | `<inFlight> in flight · <blocked> blocked`, or `living-spec · <closed> closed` |
  | task | `● <description>` | `<kind>`, then ` · <detail>` when set, ` · <elapsed>`, and ` · active <age>` for a subagent with a `lastActivity` |
  | up next | `<ref>` bold, then the title (a phase shows its name only) | the item's note |
- **Row caps:**
  - Needs you shows every row;
  - Running caps at 8 and Up next at 6 frontier issues and 3 phases, each
    with a dim `+<n> more` line.
- **Ages:** `<1m`, `<n>m` or `<h>h <m>m`, computed from `now`.
- **Before the first snapshot:** `Reading GitHub…` while refreshing, else
  `No status yet: run /loopkit-status.`.

### Verify additions — `scripts/verify.sh`

- **Validation:** the mod is validated by a `claude plugin validate` run that
  covers the hooks module. If the existing two runs do not reach it, add a run
  on the plugin root.
- **Tests:** `claude plugin test .` runs when `hooks/` exists, and a non-zero
  exit fails Verify.
- **Read-only guard,** over the non-test files in `hooks/` (excluding
  `*.test.ts` and `*.test.tsx`):
  - Every `$.<noun>.<method>` call is in this allowlist:
    - `$.process.run`, `$.fs.read`;
    - `$.ui.open`, `$.ui.status`, `$.ui.resolve`;
    - `$.clock.now`, `$.clock.every`;
    - `$.command.register`, `$.agent.list`.
  - `$.process.run(` occurs exactly once, and its argument begins
    `['gh',`.
  - None of these quoted argv tokens occurs: `'create'`, `'merge'`,
    `'edit'`, `'close'`, `'comment'`, `'delete'`, `'-X'`, `'--method'`,
    `'-f'`, `'-F'`, `'--field'`, `'--raw-field'`, `'--input'`.
- The existing config-surface guard already scans `hooks/`.
- `docs/workflow.md` Commands:
  - Verify names the plugin test and the read-only guard;
  - Test reads `claude plugin test .` (the status mod's tests).

### Tests — `claude plugin test`

They follow the test kit's rules (stub `session.start` and
`command.register` before `$.session.start`). They cover:

- **`derive`:** every issue class and its order, the `Depends on milestone:`
  exclusion, the living-spec milestone that is never a QA gate, the
  spec-PR rule including `archive`, percent rounding, and unplanned phases.
- **`parseAsks` and `mergeAsks`:** line start only, fenced lines skipped, a
  repeat counted, and clearing on `composer` and `bridge` but not on
  `task-notification`.
- **Tasks:** a `classic.Stop` snapshot replaces the list while keeping
  `firstSeen`, and a subagent end removes its row.
- **`statusLine`:** the milestone choice, the empty case and the error case.
- **Inactive:** with no `docs/workflow.md`, no command is registered and
  `gh` is never run.

## Constraints

- Constitution:
  - GitHub-only durable state: the mod's atoms are ephemeral, like
    within-milestone coordination.
  - Subscription auth only, and the scheduler definition: the timer starts no
    run.
  - The trust boundary.
  - Reuse native primitives: mods are Claude Code's own extension point.
  - Proportional ceremony.
- `docs/architecture.md` boundary: a reader takes `Needs you:` lines from
  main-session text only, never from subagent output or GitHub text. Here
  that means `turn.complete` without an `agentId`.
- Verify's config-surface guard scans `hooks/` for forbidden tokens.
- No build step, no package manager, no dependency: Claude Code compiles the
  TSX itself.
- Verified on Claude Code 2.1.312. Mods are on by default from 2.1.287, and an
  older build shows nothing the mod adds.

## Prior art

- [In-session status pane — loopkit state and session signals in one view (feature: status-pane)](../prior-art.md#in-session-status-pane--loopkit-state-and-session-signals-in-one-view-feature-status-pane)
  — the concern:
  - Claude Code mods (reuse; the ADOPT and AVOID list above);
  - claude-hud (compact line with opt-in detail);
  - claudectl (a small state taxonomy; AVOID approve-from-dashboard);
  - agents-statusline (one row per task);
  - CCPM epic-status (percent from issue state);
  - the second-screen dashboard (AVOID a daemon).
- [Non-blocking asks to the human — one deterministic marker (feature: ask-marker)](../prior-art.md#non-blocking-asks-to-the-human--one-deterministic-marker-feature-ask-marker)
  — the marker the pane holds, and agent view's `Needs input` gap.
- The archived `spec-ask-marker.md` (`docs/specs/archive/`) defines the line
  and the end-of-run carry the capture relies on.
- The proof of concept at
  `/home/developer/.claude/dev-mods/716eda5f-c624-45e1-9471-d98b69acf9f4/loopkit-status/`
  validated and ran on 2026-10-28. It is GitHub-only, its `derive.ts` and
  `register.tsx` are a reusable starting point, and this spec supersedes it
  where they differ. If the folder is gone, the spec alone is enough.

## Human prerequisites

none

## Foundation edits

Authored in this spec PR and ratified at the spec-acceptance gate:

- **`docs/vision.md`** Scope In gains one bullet: a read-only in-session
  status view shipped with the plugin, showing what needs the human,
  milestone progress, and running and upcoming work. It reads GitHub and the
  session and never acts.
- **`docs/constitution.md`:**
  - Tech stack gains a row: Status mod — a Claude Code mod whose
    `hooks/hooks.json` names a TypeScript module Claude Code compiles and
    runs itself — no build step, no package manager, no dependency.
  - The Runtime row's rationale reads: the only execution substrate; no
    separate language runtime or package manager (the status mod runs in
    Claude Code's mod engine).
  - Architecture principles gain **Read-only status mod.** The mod reads
    GitHub only through `gh` read commands passed as argv, and the session
    only through its hooks. It writes nothing to GitHub or disk. It starts no
    turn, tool call, subagent or skill, and offers no action but open and
    refresh. Its state is session atoms, never `$.store` or a file. Its timer
    only re-reads, so it is no scheduler. GitHub text is displayed as inert
    data. Outside a loopkit project it stays silent. (grep-verifiable.)
  - Conventions: the first bullet gains "the status mod in `hooks/` (its
    `hooks.json`, modules and tests) with its state contract in `types/`".
- **`docs/architecture.md`:**
  - Component map: a `hooks/` + `types/` row for the status mod: reads GitHub
    (`gh`) and session events, draws a read-only pane and status line, state
    in session atoms.
  - The `.claude-plugin/` row notes that `plugin.json` names the mod's
    types.
  - Boundaries gains a bullet: the status mod reads and never acts, and no
    skill depends on it; a session without it loses only the view.
  - Key flows gains flow 8, the status view: a loopkit session starts → read
    GitHub and session events → derive needs-you, milestones, running and up
    next → pane and status line, re-read after a turn, a merge and every
    2 minutes.
  - Where new code goes: "What the in-session status view shows ->
    `hooks/` (+ its state contract in `types/`)."
- **`docs/design.md`** (the design contract, edited here because
  `/loopkit:design` reads it in planning): its Overview admits one UI
  surface, the status mod's terminal pane. Its design artifact is an SVG mock
  in the same committed-SVG medium. No UI tokens are added.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Inside the loopkit plugin, not a separate plugin. | Sparring decision 2026-10-28, by the human. The early-access API risk rides the plugin, so Verify validates and tests the mod. | 2026-10-28 |
| Active only where `docs/workflow.md` is readable. | The plugin loads in every session of its users, and a status view of a non-loopkit project is noise and needless `gh` calls. | 2026-10-29 |
| The pane opens unasked at session start; there is no user option. | The human asked to see the state "without looking it up". The engine seats an unasked pane only from 144 columns. A `userConfig` option would stop older builds loading the plugin, skills included. | 2026-10-29 |
| The command is `/loopkit-status`. | A mod command gets no plugin prefix, and `/status` is a built-in the engine refuses. | 2026-10-29 |
| Asks come from `turn.complete` answers of the main loop, not from the `turn.step` stream. | Hooking the response stream risks every model reply for a view; an observing `turn.complete` hook cannot change a turn. The ask-marker carry puts every still-open ask into the run's final message, so a mid-turn ask appears by the run's end at the latest. | 2026-10-29 |
| Asks clear on the human's next message: origin `composer` or `bridge`, not meta. | It matches the roadmap row ("held until the human's next message"). A task notification is a `prompt.submit` with origin `task-notification` and must not clear them. The skill's carry re-states what is still open. | 2026-10-29 |
| Running tasks come from `classic.Stop`'s `background_tasks`, plus `agent.spawn` for subagents between stops. | No mod API lists background shells or monitors. `classic.Stop` fires at every main-loop turn end with the in-flight list (shells, subagents, monitors, workflows). `agent.spawn` adds a subagent at once, and its `turn.complete` removes it. | 2026-10-29 |
| Elapsed time counts from first sight. | `background_tasks` carries no start time. A subagent's `agent.spawn` is seen at once. A shell started before the mod loaded shows a shorter age. | 2026-10-29 |
| One 60-second timer: ages every tick, GitHub every second tick. | It gives ages to the minute and keeps `gh` load at four calls per two minutes. It writes atoms and calls `refresh` only, so it starts no run. | 2026-10-29 |
| No dismiss and no other button besides Refresh. | No action in the pane (prior art AVOID). Asks clear by the human's own next message. | 2026-10-29 |
| The read-only guard is an allowlist of `$` calls plus argv-token checks. | An allowlist cannot be bypassed by a new API name, unlike a denylist. The tokens catch a `gh` write passed as argv. | 2026-10-29 |
| Terminal only. | The docs say Remote Control draws in the terminal on the human's machine, so the phone shows nothing. Desktop and VS Code are unverified. | 2026-10-29 |
| No `userConfig`, and the README states the verified version. | The manifest has no minimum-version key. Whether an older build skips `modules` or rejects the plugin is undocumented (see Risks). | 2026-10-29 |

## Tracking

- Milestone: [status-pane](<milestone-url>), `Depends on milestone: #26`
  (ask-marker, closed).
- Issues, one per step, created after the merge:
  - **A — Scaffold, state contract, Verify:**
    - files: `hooks/hooks.json`, `types/index.d.ts`, the `plugin.json`
      `types` field, a `hooks/register.tsx` that only decides `active` and
      registers `/loopkit-status`;
    - Verify's validation, test step and read-only guard;
    - `docs/workflow.md` Commands.
    - Depends on: none.
  - **B — GitHub view:** `hooks/github.ts` (`gh`, `refresh`, `derive`) and
    `hooks/github.test.ts`. Depends on: A.
  - **C — Session signals:** `hooks/session.ts` (`registerSession`,
    `parseAsks`, `mergeAsks`) and `hooks/session.test.ts`. Depends on: A.
  - **D — Pane, status line and wiring:** `hooks/pane.tsx`,
    `hooks/pane.test.tsx`, and `hooks/register.tsx`'s full wiring (the timer,
    the refresh triggers, `ui.open`, `ui.render`, `registerSession`), built to
    `docs/design/status-pane.svg`. Depends on: B, C.
  - **E — README "Status pane" section.** Depends on: D.

## Verification

- [ ] Verify passes (`bash scripts/verify.sh`), with the mod's validation,
      `claude plugin test .` and the read-only guard included.
- [ ] Check by hand that the read-only guard bites: on a scratch branch, add
      `$.prompt.submit(` or a `'merge'` argv token to a `hooks/` module, and
      Verify fails. Do not commit it.
- [ ] Smoke (human, at the QA gate). In a terminal at least 144 columns wide,
      run `cd /home/developer/projects/loopkit && claude --plugin-dir /home/developer/projects/loopkit`.
      Then check:
      1. The pane opens beside the chat, and the status line reads
         `loopkit · …`.
      2. The Milestones section matches
         `gh api 'repos/{owner}/{repo}/milestones?state=open'` (closed / all),
         and Up next lists the unplanned roadmap phases (`session-meters`
         among them).
      3. Ask the session to end its reply with the line
         `Needs you: test ask — nothing waits on it`. After the turn the
         pane shows it under Needs you with its age. Send a new message: it
         is gone.
      4. Ask the session to start a background shell (`sleep 120`) and a
         background subagent. Each shows one row under Running and leaves
         when it ends.
      5. Ask the session to ask you something with `AskUserQuestion`. While
         the question is open, Needs you shows it with a waiting time.
      6. `/loopkit-status` reopens a closed pane and updates the `updated`
         time.
      7. In a non-loopkit directory (`cd /tmp && claude --plugin-dir
         /home/developer/projects/loopkit`), there is no pane, no status-line
         entry and no `/loopkit-status`.
- [ ] Read-through (human): the pane matches `docs/design/status-pane.svg`
      in section order, labels and row shapes, and the README section
      describes what the smoke showed.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| An older Claude Code rejects the whole plugin because of `modules`, so the skills are lost. | It is undocumented either way. The README states the verified version, the mod declares no `userConfig` (the documented load breaker), and a user report becomes a fast-lane fix (for example moving the mod behind a separate plugin). |
| The early-access mod API changes. | Verify validates and tests the mod on the developer's build. A failed hook is skipped alone, with a dim line, and turns and skills are untouched. |
| A wrong `Needs you:` capture (a quoted example, a code block). | Fenced lines are skipped, a line must start with the marker, and only main-loop answers are read. The pane is display-only. |
| GitHub rate limits. | Four calls every 2 minutes, plus throttled turn-end refreshes, and only in loopkit projects. |
| `gh` is unauthenticated or offline. | The error shows in the header and the status line, and the last snapshot stays. |
| The pane takes room on a narrow terminal. | The engine seats an unasked pane only from 144 columns, and it closes like any pane. |

## Decision log

- 2026-10-29: Drafted. Mod facts verified against the Claude Code 2.1.312
  types and the first-party mods docs:
  - `hooks.json` can hold `modules` beside classic `hooks`;
  - mods are on by default from 2.1.287;
  - command names get no prefix;
  - `prompt.submit` `origin.kind` tells a typed message from a task
    notification;
  - `classic.Stop` carries `background_tasks`;
  - `$.state` survives a compaction, while `$.store` writes a file;
  - `claude plugin test` exits non-zero on failure.
