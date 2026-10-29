# Spec: status-pane

> Created: 2026-10-29

Ship a read-only Claude Code mod inside the loopkit plugin. It draws a pane
beside the chat and a status-line entry, showing:

- what needs the human;
- how far each open milestone is;
- what runs in the session now;
- what is up next.

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
      - the module files are `hooks/register.tsx`, `hooks/status.ts`,
        `hooks/github.ts`, `hooks/session.ts` and `hooks/pane.tsx`;
      - their tests are `hooks/register.test.ts`, `hooks/github.test.ts`,
        `hooks/session.test.ts` and `hooks/pane.test.tsx`;
      - `types/index.d.ts` holds the state contract below;
      - a root `tsconfig.json` reads
        `{ "extends": "./.claude-plugin/types/tsconfig.json" }`.
        That is the file Claude Code writes when it loads a mod from a
        folder the human owns. Committing it keeps the main checkout clean
        after a `--plugin-dir` session.
- [ ] A loopkit project is a session whose working directory has a readable
      `docs/workflow.md` whose first heading is `# Workflow contract`. In one,
      the session shows:
      - from start, a status-line entry;
      - the pane, opened unasked at session start. The engine seats it on a
        terminal of at least 144 columns (110 once the human has opened it)
        and keeps it waiting below that;
      - `/loopkit-status`, which opens the pane and refreshes it, even
        mid-turn.
- [ ] Outside a loopkit project the mod shows nothing:
      - no status line, no pane, no command;
      - no `gh` call.
- [ ] The pane draws four sections in this order, each as in the design:
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

      A section with no row shows its empty-state line (see Pane).
- [ ] The status line reads `loopkit · <n> need you · #<m> <closed>/<total>
      · <k> running`:
      - `<n>` counts every Needs you row (question, asks, gates);
      - the milestone part names the first milestone row with work in flight,
        else the first row, and is left out when there is none;
      - before the first snapshot it reads `loopkit · reading GitHub…`;
      - on a read error it reads `loopkit: <error>`.
- [ ] A `Needs you:` line in the main session's final answer of a turn
      appears in the pane at that turn's end. It stays until the human's next
      message, typed in the terminal or sent through Remote Control. Neither
      of these clears it:
      - a task notification;
      - the `/loopkit-status` command.
- [ ] The view re-reads GitHub:
      - at session start, and after `/clear`, `/resume` or a fork;
      - after each main-loop turn, at most once per 15 s;
      - right after any `gh pr merge` command returns, in the main loop or a
        subagent;
      - every 2 minutes;
      - on `/loopkit-status` and on the pane's Refresh button.

      Ages in the pane are current to the minute.
- [ ] The mod is read-only, and Verify proves it (see Verify additions):
      - it reads GitHub only through `gh` read commands passed as argv;
      - it writes nothing to GitHub or disk;
      - it starts no turn, tool call, subagent or skill;
      - it keeps its state in session atoms only;
      - it offers no action but open and refresh.
- [ ] Verify validates the mod and runs its tests (`claude plugin test`), and
      it stays green after a session has loaded the mod in the checkout.
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

- The mod as specified under Design below, with its tests, its state
  contract and the root `tsconfig.json`.
- Verify:
  - the tests;
  - the read-only guard;
  - the config-surface guard switched to `git ls-files` (tracked and new,
    non-ignored files), with `types/` added;
  - the matching `docs/workflow.md` Commands text.
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

- **`hooks/status.ts`** (issue A) owns the status line:
  - the pure `statusLine(snapshot, asking, asks, tasks)`;
  - `publishStatus($)`, which reads those four atoms and calls
    `$.ui.status(statusLine(…))`.

  Every module calls `publishStatus($)` after it writes one of those atoms.
- **`hooks/register.tsx`** exports `register: Register` and wires everything:
  - **`active`** is a module variable, not an atom, so `/clear` cannot reset
    it. `session.start` decides it (the loopkit-project test above) and
    returns unchanged when it is false. A reload runs `session.start` again
    and decides it again.
  - **`session.start`, when active:**
    - set `isRefreshing` to false (a reload kills an in-flight refresh);
    - register `/loopkit-status` with `$.command.register` and
      `immediate: true`;
    - cancel the previous timer, then start the one timer;
    - `void refresh($)`;
    - `void $.ui.open({ id: 'loopkit-status', title: 'loopkit' })`;
    - `publishStatus($)`.
  - **The timer** is `$.clock.every(60_000, …)`. Each tick writes `now`, and
    every second tick calls `void refresh($)`. It never does anything else.
  - **`classic.SessionStart`** with `source` `clear`, `resume` or `fork`:
    - `$.state` was reset to defaults, so it calls `void refresh($)` and
      `publishStatus($)`;
    - `asks`, `asking` and `tasks` start empty;
    - on a `claude --resume` start it may fire before `session.start` has
      decided `active`, and then it passes through. That is harmless:
      `session.start` refreshes anyway.
  - **`command.run` for `/loopkit-status`:** open the pane, then
    `await refresh($)`. The reply is "loopkit status pane opened and
    refreshed.".
  - **`turn.complete` on the main loop:** after `next(e)`, call
    `void refresh($)` unless `lastRefresh` is under 15 s old.
  - **`tool.call` for `Bash`, any loop:** after `next(e)`, when the command
    matches `/\bgh\s+pr\s+merge\b/`, call `void refresh($)`.
  - **`ui.render` for `{ component: 'Pane', requestId: 'loopkit-status' }`:**
    return `renderPane($, e)`.
  - **`registerSession(on, () => active)`** from `hooks/session.ts`.
  - **Inactive sessions:** every hook returns `next(e)` unchanged.
  - **Hooks never answer for the engine.** Every hook calls `next(e)` and
    returns its result, and every hook catches its own errors
    (`.catch(($, e, next) => next(e))`), so a mod fault never changes a turn.
  - **`void` calls** are fire-and-forget, so no hook waits on `gh`.
- **`hooks/github.ts`:**
  - **`gh($, args)`** is the module's only `$.process.run` call site:
    `$.process.run(['gh', ...args])`. A non-zero exit throws the first
    stderr line; stdout is parsed as JSON.
  - **`refresh($)`** takes no options:
    - It returns at once while `isRefreshing` is true.
    - Otherwise it sets the module variable
      `lastRefresh = await $.clock.now()`, sets `isRefreshing`, and runs four
      `gh` reads in parallel:
      - `['repo', 'view', '--json', 'nameWithOwner']`
      - `['issue', 'list', '--state', 'open', '--limit', '200', '--json', 'number,title,body,labels,milestone,projectItems']`
      - `['pr', 'list', '--state', 'open', '--limit', '50', '--json', 'number,title,headRefName,isDraft']`
      - `['api', 'repos/{owner}/{repo}/milestones?state=open&per_page=100']`
    - It also reads `docs/roadmap.md` with `$.fs.read`. The file may be
      missing.
    - It writes `snapshot = { repo, fetchedAt, error: null, ...derive(input) }`.
      On any error it keeps the previous snapshot's data and sets `error` to
      the message.
    - Then it clears `isRefreshing` and calls `publishStatus($)`.
  - **`derive(input)`** is pure and exported for tests (rules below).
  - **Exports:** `lastRefresh` through a getter.
- **`hooks/session.ts`** exports:
  - `registerSession(on, isActive)` (hooks below);
  - the pure helpers `parseAsks(answer)` and `mergeAsks(asks, lines, now, calls)`,
    for tests.
- **`hooks/pane.tsx`** exports `renderPane($, e)`.
- **Banned words:** code, comments and names avoid the words Verify's
  config-surface guard forbids ("cron", "scheduler", "claude -p", …). Say
  "timer".

### State contract — `types/index.d.ts`

All values are atoms under the plugin key `loopkit`, session-scoped. `$.state`
survives a compaction and a reload, and resets to these defaults on `/clear`,
`/resume` and a fork:

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
      snapshot: Shaped<Snapshot | null>   // shape 'snapshot-1', default null
      isRefreshing: boolean               // default false
      asks: Ask[]                         // default []
      calls: number                       // default 0
      asking: Asking | null               // default null
      tasks: Task[]                       // default []
      now: number                         // default 0
    }
  }
}
```

### GitHub derivation — `derive({ issues, prs, milestones, roadmap })`

- **Text cleaning:** every title, body and branch name is first stripped of
  C0 and C1 control characters, apart from `\n` in bodies. Nothing from
  GitHub becomes an argument or a command; it is only displayed or matched.
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
  `open_issues + closed_issues > 0`, sorted by number.
  `percent = round(100 * closed / total)`, and `living` comes from the
  `Track: living-spec` line.
- **Gate order:** `qa`, `spec`, `escalated`, `parked`, each by number.
- **Unplanned phases:** a `docs/roadmap.md` table row that starts with
  `| **<name>**` and ends with `| — | — |` is `upNext` `phase` `<name>`, note
  `roadmap · /loopkit:plan`. Phases come after the frontier issues, in
  roadmap order.

### Session signals — `registerSession(on, isActive)`

Every hook passes through when `isActive()` is false. All hooks observe: they
call `next(e)` and pass its result on. Each atom write is followed by
`publishStatus($)`.

- **Asks:**
  - On `turn.complete` with no `agentId`, `parseAsks(e.answer)` takes every
    line that matches `/^Needs you: .+$/` outside fenced code blocks. A line
    starting with three backticks toggles a fence. The whole line is the
    ask's text and identity.
  - `mergeAsks` updates a held ask with the same text (`count` + 1,
    `lastSeen`), or appends a new one with `firstSeen = lastSeen = now` and
    `callsAt = calls`. A repeat is normal: the ask-marker end-of-run carry
    copies an open ask verbatim.
  - On `prompt.submit`, `asks` becomes empty when all of these hold:
    - `e.origin.kind` is `composer` or `bridge`;
    - `e.isMeta` is not set;
    - `e.command?.name` is not `loopkit-status`.

    Every other prompt leaves `asks` as it is (`task-notification`,
    `scheduled-trigger`, `plugin`, `peer`, …).
- **Calls:**
  - on `tool.call` with no `agentId`, `calls` + 1;
  - on `tool.call` with an `agentId`, that task's `lastActivity` becomes now.
- **AskUserQuestion:**
  - On `tool.call` for `AskUserQuestion` with no `agentId`, `asking` becomes
    `{ headers, since: now }` before `next(e)`. `headers` is the questions'
    `header` values joined by `, `.
  - After `next(e)` settles, or when it throws, `asking` becomes `null`.
- **Tasks:**
  - On `agent.spawn`, after `next(e)` resolves with an `agentId`, a task
    `{ id: agentId, kind: 'subagent', description, detail: model, firstSeen: now }`
    is added.
  - On `classic.Stop`, `tasks` is replaced by `e.background_tasks`:
    - each entry becomes `{ id, kind: type, description: first line, detail }`;
    - `detail` is `agent_type`, `command`, `tool` or `name`, whichever is
      present;
    - `firstSeen`, `lastActivity` and `detail` are kept for an id already
      held, or else for a held subagent with the same description;
      otherwise `firstSeen = now`;
    - a missing `background_tasks` leaves `tasks` unchanged.
  - On `turn.complete` with an `agentId`, that task is removed.
  - Tasks are keyed by id, so a re-notified task stays one row.
- **`now`:** every `now` above is `$.clock.now()` at the moment of the write.

### Pane — `renderPane($, e)`

- **Layout,** labels, symbols and theme colours follow
  `docs/design/status-pane.svg`:
  - **Header:** repo, `updated HH:MM`, and `refreshing…` while refreshing.
    When `error` is set, the error follows in the `error` colour.
  - **Sections:** Needs you (`warning`), Milestones, Running (`suggestion`)
    and Up next (`success`), each titled with its row count.
  - **Footer:** a Refresh button that calls `void refresh($)`.
- **Rows:** each row is a title line plus a dim note line. The width is
  `max(30, e.props.bodyColumns)`, and text is cut with `…` to fit. The
  shapes:

  | Row | Title line | Note line |
  |---|---|---|
  | open question | `? <headers>` | `question open · waiting <age>` |
  | held ask | `› <text without "Needs you: ">` | `<age> ago · <n> calls since`, plus ` · seen <count>×` when `count > 1` |
  | gate | `<ref>` bold, then the title | the gate's note |
  | milestone | `#<n>` bold, the title, a 10-cell bar, `<closed>/<total>`, `<percent>%` | `<inFlight> in flight · <blocked> blocked`, or `living-spec · <closed> closed` |
  | task | `● <description>` | `<kind>`, then ` · <detail>` when set, then ` · <elapsed>`, then ` · active <age>` for a subagent with a `lastActivity` |
  | up next | `<ref>` bold, then the title (a phase shows its name only) | the item's note |

- **The bar:** `round(10 * closed / total)` filled cells, the rest empty.
- **Empty states:**

  | Section | Line |
  |---|---|
  | Needs you | `Nothing needs you.` |
  | Milestones | `No open milestone.` |
  | Running | `Nothing running.` |
  | Up next | `Nothing unblocked.` |

- **Caps:**
  - Needs you shows every row.
  - Running caps at 8 rows, and Up next at 6 frontier issues and 3 phases.
    A capped section ends with a dim `+<n> more` line.
- **Ages:** `<1m`, `<n>m` or `<h>h <m>m`. The render hook reads the `now`
  atom, which subscribes it to the minute tick. It computes ages from
  `$.clock.now()` at render time, clamped at 0.
- **Before the first snapshot:** `Reading GitHub…` while refreshing, else
  `No status yet: run /loopkit-status.`. The question and the held asks are
  drawn even then.

### Verify additions — `scripts/verify.sh`

- **Validation:** the existing second run,
  `claude plugin validate .claude-plugin/plugin.json`, already validates the
  hooks module (it prints "Validating hooks" with `hooks:` and `calls:`
  lines). No new run.
- **Tests:** `claude plugin test .` runs when `hooks/` exists. A non-zero exit
  fails Verify.
- **Read-only guard:**
  - **Allowlist from validate's own report.** From that validate run, every
    `calls:` line is checked, with its `(via …)` parts dropped. Each listed
    call must be one of:
    - `$.process.run`, `$.fs.read`;
    - `$.ui.open`, `$.ui.status`, `$.ui.resolve`;
    - `$.clock.now`, `$.clock.every`;
    - `$.command.register`;
    - `$.state.get`, `$.state.set` (the `atom` / `read` / `update` helpers
      imported from `'claude-code'`).

    This is the native gap it fills. Validate reports the calls but enforces
    no policy, so the guard is the policy. It also catches a destructured
    `$`, which a source grep would miss.
  - **One process call site.** Over the non-test files in `hooks/` (listed
    the same way as the config-surface guard below), `$.process.run(` occurs
    exactly once, and its argument begins `['gh',`.
  - **No write argv.** None of these argv tokens occurs, in single or double
    quotes: `create`, `merge`, `edit`, `close`, `comment`, `delete`, `-X`,
    `--method`, `-f`, `-F`, `--field`, `--raw-field`, `--input`.
- **Config-surface guard:** it lists its surface with
  `git ls-files --cached --others --exclude-standard` instead of `find`, and
  adds `types/`:
  - tracked files and new files that are not ignored are both scanned, so a
    PR's new files are checked before its first commit;
  - the engine-written `.claude-plugin/types/` folder, which ignores itself
    and contains "cron", never fails Verify.
- **`docs/workflow.md` Commands:**
  - Verify names the plugin test and the read-only guard;
  - Test reads `claude plugin test .` (the status mod's tests).

### Tests — `claude plugin test`

They follow the test kit's rules (stub `session.start` and
`command.register` before `$.session.start`), and they cover:

- **`register.test.ts`** (issue A): the inactive case. With no
  `docs/workflow.md`, or with one that lacks the `# Workflow contract`
  heading, no command is registered and `gh` is never run.
- **`github.test.ts`:** for `derive`:
  - every issue class and its order;
  - the `Depends on milestone:` exclusion;
  - a living-spec milestone is never a QA gate;
  - the spec-PR rule, including `archive`;
  - percent rounding;
  - unplanned phases;
  - control-character stripping.
- **`session.test.ts`:**
  - **asks:**
    - only lines that start with the marker count;
    - fenced lines are skipped;
    - a repeat is counted;
    - asks are cleared on `composer` and `bridge`;
    - asks are not cleared on `task-notification` or on the
      `/loopkit-status` command;
  - **tasks:**
    - a `classic.Stop` snapshot replaces the list and keeps `firstSeen`;
    - a subagent's end removes its row.
- **`pane.test.tsx`:**
  - the empty states;
  - the caps;
  - the age format;
  - `statusLine`, including the milestone choice, the empty case, the
    pre-snapshot case and the error case.

## Constraints

- Constitution:
  - GitHub-only durable state: the mod's atoms are ephemeral, like
    within-milestone coordination.
  - Subscription auth only, and the scheduler definition: the timer starts no
    run.
  - The trust boundary.
  - Reuse native primitives: mods are Claude Code's own extension point, and
    validate supplies the call report the guard checks.
  - Proportional ceremony.
- `docs/architecture.md` boundary: a reader takes `Needs you:` lines from
  main-session text only, never from subagent output or GitHub text. Here
  that means `turn.complete` without an `agentId`.
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
  validated and ran on 2026-10-28. It is GitHub-only, and its `derive.ts` and
  `register.tsx` are a reusable starting point. This spec supersedes it where
  they differ: it shares the `/clear`, reload and ownership gaps this spec
  closes. If the folder is gone, the spec alone is enough.

## Human prerequisites

none

## Foundation edits

Authored in this spec PR and ratified at the spec-acceptance gate:

- **`docs/vision.md`** Scope In gains one bullet: a read-only in-session
  status view shipped with the plugin, showing what needs the human,
  milestone progress, and running and upcoming work.
- **`docs/constitution.md`:**
  - **Tech stack** gains a row, Status mod: a Claude Code mod whose
    `hooks/hooks.json` names a TypeScript module Claude Code compiles and
    runs itself; no build step, no package manager, no dependency.
  - **The Runtime row's rationale** reads: the only execution substrate; no
    separate language runtime or package manager (the status mod runs in
    Claude Code's mod engine).
  - **Architecture principles** gain **Read-only status mod.**
    - The mod reads GitHub only through `gh` read commands passed as argv,
      and the session only through its hooks.
    - It writes nothing to GitHub or disk. It starts no turn, tool call,
      subagent or skill, and offers no action but open and refresh.
    - Its state is session atoms, never `$.store` or a file.
    - Its timer only re-reads, so it is no scheduler.
    - GitHub text is displayed as inert data.
    - Outside a loopkit project it stays silent.
    - (grep-verifiable.)
  - **Conventions:** the first bullet gains "the status mod in `hooks/` (its
    `hooks.json`, modules and tests) with its state contract in `types/`".
- **`docs/architecture.md`** (structural facts only; the binding rules live in
  the constitution):
  - Component map: a `hooks/` + `types/` row for the status mod. Its inputs
    are GitHub (`gh`) and session events; its outputs are a pane and a
    status-line entry.
  - The `.claude-plugin/` row notes that `plugin.json` names the mod's
    types.
  - Boundaries gains a bullet: no skill depends on the status mod, so a
    session without it loses only the view.
  - Key flows gains flow 8, the status view:
    1. a loopkit session starts;
    2. the mod reads GitHub and session events;
    3. it derives needs-you, milestones, running and up next;
    4. it draws the pane and the status line, re-read after a turn, a merge
       and every 2 minutes.
  - Where new code goes: "What the in-session status view shows ->
    `hooks/` (+ its state contract in `types/`)."
- **`docs/design.md`** (the design contract, edited here because
  `/loopkit:design` reads it in planning):
  - it admits one UI surface, the status mod's terminal pane. Its design
    artifact is an SVG mock in the same committed-SVG medium, with no UI
    tokens added;
  - "Decisions it clarifies" and "One concept per diagram" name a UI mock.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Inside the loopkit plugin, not a separate plugin. | Sparring decision 2026-10-28, by the human. The early-access API risk rides the plugin, so Verify validates and tests the mod. | 2026-10-28 |
| Active only where `docs/workflow.md` is readable and starts with `# Workflow contract`. | The plugin loads in every session of its users. A `docs/workflow.md` alone is a common filename; the contract heading is loopkit's. | 2026-10-29 |
| `active` is a module variable decided at `session.start`, and `classic.SessionStart` (`clear`, `resume`, `fork`) re-reads GitHub. | `/clear`, `/resume` and a fork reset every `$.state` value without a new `session.start`. An atom would silence the mod for the rest of the process. | 2026-10-29 |
| The pane opens unasked at session start; there is no user option. | The human asked to see the state "without looking it up". The engine seats an unasked pane only from 144 columns. A `userConfig` option would stop older builds loading the plugin, skills included. | 2026-10-29 |
| The command is `/loopkit-status`, registered `immediate`. | A mod command gets no plugin prefix, and `/status` is a built-in the engine refuses. `immediate` lets it run mid-turn. | 2026-10-29 |
| Asks come from `turn.complete` answers of the main loop, not from the `turn.step` stream. | Hooking the response stream risks every model reply for a view; an observing `turn.complete` hook cannot change a turn. The ask-marker carry puts every still-open ask into the run's final message, so a mid-turn ask appears by the run's end at the latest. | 2026-10-29 |
| Asks clear on the human's next message: origin `composer` or `bridge`, not meta, not `/loopkit-status`. | It matches the roadmap row ("held until the human's next message"). A task notification must not clear them, and neither must opening the pane that shows them. The skill's carry re-states what is still open. | 2026-10-29 |
| A repeated ask shows "seen N×", not "said N×". | The ask-marker carry copies an open ask verbatim by design, so a count alone does not mean a re-ask. | 2026-10-29 |
| Running tasks come from `classic.Stop`'s `background_tasks`, plus `agent.spawn` for subagents between stops. | No mod API lists background shells or monitors. `classic.Stop` fires at every main-loop turn end with the in-flight list (shells, subagents, monitors, workflows). `agent.spawn` adds a subagent at once, and its `turn.complete` removes it. | 2026-10-29 |
| Elapsed time counts from first sight. | `background_tasks` carries no start time. A subagent's `agent.spawn` is seen at once. A shell started before the mod loaded shows a shorter age. | 2026-10-29 |
| The merge trigger hears `gh pr merge` in any loop. | In `/loopkit:implement`, subagents run the merges. A refresh is read-only and coalesced by `isRefreshing`. | 2026-10-29 |
| One 60-second timer: `now` every tick, GitHub every second tick. | It gives ages to the minute and keeps `gh` load at four calls per two minutes. It writes an atom and calls `refresh` only, so it starts no run. | 2026-10-29 |
| `hooks/status.ts`, in issue A, owns `statusLine` and `publishStatus`. | B (GitHub) and C (session) write the atoms the line reads, and they run in parallel, so the publisher must exist before either. | 2026-10-29 |
| No dismiss and no other button besides Refresh. | No action in the pane (prior art AVOID). Asks clear by the human's own next message. | 2026-10-29 |
| The read-only guard checks validate's `calls:` report against an allowlist, plus two source greps (one `gh` call site, no write argv tokens). | Validate is the native call report, but it enforces no policy. An allowlist cannot be bypassed by a new API name, and validate also catches a destructured `$`. The argv tokens catch a `gh` write. | 2026-10-29 |
| The config-surface guard lists tracked plus new non-ignored files (`git ls-files --cached --others --exclude-standard`), and the root `tsconfig.json` is committed. | Loading the mod from a folder the human owns writes `.claude-plugin/types/`, which ignores itself and contains "cron", plus a root `tsconfig.json`. Skipping ignored files keeps Verify green, and listing new files still scans a PR before its first commit. The committed `tsconfig.json` keeps the clean-base preflight green after a `--plugin-dir` session. | 2026-10-29 |
| Terminal only. | The docs say Remote Control draws in the terminal on the human's machine, so the phone shows nothing. Desktop and VS Code are unverified. | 2026-10-29 |
| No `userConfig`, and the README states the verified version. | The manifest has no minimum-version key. Whether an older build skips `modules` or rejects the plugin is undocumented (see Risks). | 2026-10-29 |

## Tracking

- Milestone: [status-pane](https://github.com/skrischer/loopkit/milestone/27), `Depends on milestone: #26`
  (ask-marker, closed).
- Issues, one per step, created after the merge:
  - **A — Scaffold, state contract, status line, Verify:**
    - files:
      - `hooks/hooks.json`, `types/index.d.ts`, the `plugin.json` `types`
        field, the root `tsconfig.json`;
      - `hooks/status.ts`;
      - a `hooks/register.tsx` that only decides `active` and registers
        `/loopkit-status`;
      - `hooks/register.test.ts`;
    - Verify's test step, read-only guard and the config-surface guard over
      tracked and new files;
    - `docs/workflow.md` Commands.
    - Depends on: none.
  - **B — GitHub view:** `hooks/github.ts` (`gh`, `refresh`, `derive`) and
    `hooks/github.test.ts`. Depends on: A.
  - **C — Session signals:** `hooks/session.ts` (`registerSession`,
    `parseAsks`, `mergeAsks`) and `hooks/session.test.ts`. Depends on: A.
  - **D — Pane and wiring:**
    - `hooks/pane.tsx` and `hooks/pane.test.tsx`, built to
      `docs/design/status-pane.svg`;
    - the full wiring in `hooks/register.tsx`: the timer, the refresh
      triggers, `classic.SessionStart`, `ui.open`, `ui.render` and
      `registerSession`.
    - Depends on: B, C.
  - **E — README "Status pane" section.** Depends on: D.

## Verification

- [ ] **Verify passes** (`bash scripts/verify.sh`), with `claude plugin test .`,
      the read-only guard and the config-surface guard over tracked and new
      files included.
- [ ] **The read-only guard bites.** On a scratch branch, add
      `$.prompt.submit(` or a `'merge'` argv token to a `hooks/` module, and
      Verify fails. Do not commit it.
- [ ] **Smoke (human, at the QA gate).**
      - Setup:
        - use a terminal at least 144 columns wide;
        - run
          `cd /home/developer/projects/loopkit && claude --plugin-dir /home/developer/projects/loopkit`;
        - the marketplace-installed loopkit has no mod, so only this copy
          draws the pane.
      - Steps:
        1. The pane opens beside the chat, and the status line reads
           `loopkit · …`.
        2. The Milestones section matches
           `gh api 'repos/{owner}/{repo}/milestones?state=open'`
           (closed / all). Up next lists the unplanned roadmap phases,
           `session-meters` among them.
        3. Ask the session to end its reply with the line
           `Needs you: test ask — nothing waits on it`.
           - After the turn, the pane shows it under Needs you, with its
             age.
           - `/loopkit-status` leaves it in place.
           - A new typed message clears it.
        4. Ask the session to start a background shell (`sleep 120`) and a
           background subagent. Each shows one row under Running and leaves
           when it ends.
        5. Ask the session to ask you something with `AskUserQuestion`.
           While it is open, Needs you shows it with a waiting time.
        6. Close the pane; `/loopkit-status` reopens it and updates the
           `updated` time.
        7. `/clear`: the pane and the status line come back with GitHub data
           within one refresh.
        8. Quit, then start once more with
           `GH_HOST=invalid.example claude --plugin-dir /home/developer/projects/loopkit`.
           The header and the status line show the `gh` error.
        9. In a terminal under 110 columns the pane waits;
           `/loopkit-status` places it.
        10. Run
            `cd /tmp && claude --plugin-dir /home/developer/projects/loopkit`
            (a non-loopkit directory). There is no pane, no status-line entry
            and no `/loopkit-status`.
      - Check: afterwards, `git status` in the main checkout is clean, and
        `bash scripts/verify.sh` is still green.
- [ ] **Read-through (human):** the pane matches `docs/design/status-pane.svg`
      in section order, labels and row shapes, and the README section
      describes what the smoke showed.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| An older Claude Code rejects the whole plugin because of `modules`, so the skills are lost. | It is undocumented either way. The README states the verified version, the mod declares no `userConfig` (the documented load breaker), and a user report becomes a fast-lane fix (for example moving the mod behind a separate plugin). |
| The early-access mod API changes. | Verify validates and tests the mod on the developer's build. A failed hook is skipped alone, with a dim line, and turns and skills are untouched. |
| A wrong `Needs you:` capture, from a quoted example or a code block. | Fenced lines are skipped, a line must start with the marker, and only main-loop answers are read. The pane is display-only. |
| GitHub rate limits. | Four calls every 2 minutes, plus throttled turn-end refreshes, and only in loopkit projects. |
| `gh` is unauthenticated or offline. | The error shows in the header and the status line, and the last snapshot stays. |
| The pane takes room on a narrow terminal. | The engine seats an unasked pane only from 144 columns, and it closes like any pane. |
| The engine overwrites the committed root `tsconfig.json` with other content. | The QA check of `git status` after the smoke catches it. The fix is a fast-lane change to the file's content. |

## Decision log

- 2026-10-29: Drafted. The mod facts were verified against the Claude Code
  2.1.312 types and the first-party mods docs:
  - `hooks.json` can hold `modules` beside classic `hooks`;
  - mods are on by default from 2.1.287;
  - command names get no prefix;
  - `prompt.submit`'s `origin.kind` tells a typed message from a task
    notification;
  - `classic.Stop` carries `background_tasks`;
  - `$.state` survives a compaction, while `$.store` writes a file;
  - `claude plugin test` exits non-zero on failure.
- 2026-10-29: Review round 1 (REQUEST_CHANGES) addressed:
  - Verify scans tracked files only (superseded in round 2), and the root
    `tsconfig.json` is committed;
  - `active` is a module variable, and `classic.SessionStart` covers
    `/clear`, `/resume` and fork;
  - issue A ships `register.test.ts`;
  - `hooks/status.ts` (A) owns the status line;
  - the read-only guard uses validate's `calls:` report;
  - `isRefreshing` resets on `session.start`;
  - the merge trigger hears any loop;
  - the command is `immediate` and does not clear asks;
  - `refresh` takes no options, and hook calls are fire-and-forget;
  - the status-line count, the empty states, the bar rounding and the age
    clock are defined;
  - "seen N×";
  - the activation needs the contract heading;
  - control characters are stripped;
  - the SVG sample is consistent;
  - round 2: the config surface also lists new, non-ignored files
    (`--others --exclude-standard`), so a PR is scanned before its first
    commit. `await $.clock.now()`, `e.command?.name`, the render
    subscription to `now`, the `--resume` ordering and the SVG annotations
    are fixed;
  - `docs/design.md` names a UI mock;
  - the architecture edits are trimmed to structural facts;
  - more QA steps.
- 2026-10-29: Issue A (#299) built. `types/index.d.ts` is the contract
  verbatim, and the atoms live in `hooks/status.ts`, exported for the later
  modules. The engine's scan requires `atom` references with literal
  `plugin`/`key` strings written inline. The one-call-site guard allows zero
  `$.process.run(` sites until `hooks/github.ts` exists, because issue A ships
  no `gh` call. From then on exactly one is required, and it must be a
  `['gh', …]` argv.
- 2026-10-29: Issue C (#301) built. The engine's scan follows only state
  references and `$`-taking helpers written in the same module file, so
  `hooks/session.ts` spells its own `{ plugin, key }` refs (with `?? default`)
  and declares `stamp($)` at the top level. A test's own `on` hooks are refused
  `$.state` calls ("its hooks module does not call it"), and a test hook holds
  one hook per event, so `session.test.ts` covers the pure helpers (`parseAsks`,
  `mergeAsks`, `mergeTasks`, `clearsAsks` and the subagent-row helpers). The
  hooks themselves were checked end to end through a throwaway wiring in
  `register.tsx`; issue D's wiring makes a real hook test possible there.
- 2026-10-29: Issue B (#300) built. `lastRefresh` is exported as the getter
  `getLastRefresh()`. `refresh` has no unit test yet: the test host refuses a
  `$.state` call that the module graph from `hooks.json` does not reach, and
  `register.tsx` imports `hooks/github.ts` only in issue D, which adds the
  `refresh` tests with the wiring. On a read error the snapshot keeps its
  `repo`, `fetchedAt` and data and sets `error`.
- 2026-10-29: Issue D (#302) built. The engine refuses a second unmatched
  `turn.complete` hook in one module graph, so the 15 s throttled refresh
  rides the existing hook in `hooks/session.ts` (`registerSession` keeps its
  `(on, isActive)` signature) instead of a hook in `register.tsx`. The engine
  scan also refuses a `read`/`update` of an imported atom, so `github.ts` and
  `pane.tsx` spell their own refs; the `snapshot` ref there is an `atom` with
  the same `shape: 'snapshot-1'` tag as `status.ts`, because an untagged
  write reads back as the default. A ref without `atom` reads `undefined`
  when unset, so `pane.tsx` applies the defaults. In tests the file paths
  reach `fs.read` absolute, and the `refresh`, hook and pane tests all live
  in `hooks/pane.test.tsx`, which boots the mod through `$.session.start`
  with a `mock.clock`.
- 2026-10-29: Issue #314 built. Claude Code draws a plugin's status line as
  `<plugin>: <text>`, so `statusLine` drops its own `loopkit · ` lead (it read
  `loopkit: loopkit · 2 need you …` at the QA gate). The pre-snapshot form is
  `reading GitHub…` and the error form is the bare error; the README and the
  design show the line as drawn.
- 2026-10-29: Issue #316 built. The pane puts one blank line (a `<Text>{' '}</Text>`
  gap) after the header lines, between Needs you, Milestones, Running and Up
  next, and before the Refresh button, as the design draws them. The
  pre-snapshot layout is unchanged.
