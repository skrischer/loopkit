# Workflow contract

> Operational contract for the loopkit skills (`/loopkit:plan`,
> `/loopkit:implement`) — the single source for the branch model, commands,
> gates, and loop behavior of this project. Filled during inception; the skills
> read it instead of hardcoding specifics.

## Environment prerequisites

- `git` and `gh` must be installed and on PATH.
- `gh` must be authenticated (`gh auth status`) with the `repo`
  (issues/milestones/PRs) and `project` (the ProjectV2 board) scopes.
- Landmine: `gh auth login` does NOT grant `project` by default. Remedy: missing
  `project` scope -> `gh auth refresh -s project` (OAuth login; for a PAT or
  `GH_TOKEN`, `gh auth refresh` does not apply — re-create the token with the
  `project` scope instead).

## Repository

- GitHub repo: `<owner/repo>`
- Base / integration branch: `<main | develop>`
- GitHub Project board: `<url-or-number>` — mandatory; the loops' queue and
  status display. Status values: `Todo`, `In Progress`, `Done` — a status
  display, **not** a claim or lock (see Orchestration).
- Board field-ID recipe (so the loops set status without re-discovering it):
  ProjectV2 Status field `<status-field-id>`; option IDs — Todo
  `<todo-option-id>`, In Progress `<in-progress-option-id>`, Done
  `<done-option-id>`. Re-derive with `gh project field-list <number> --owner
  <owner> --format json --jq '.fields[]|select(.name=="Status")'` (returns the
  field id + option ids).

`/loopkit:plan` requires a GitHub repo; specs are the local single source of
truth, milestones and issues are created on GitHub from them.

## Worktrees

- All implementation and docs work happens in a worktree — never in the main
  checkout. The loops run from the main checkout and never modify it except
  fast-forward pulls.
- Path convention: `../<repo>-worktrees/<branch-with-slashes-as-dashes>`.
- Operate via `git -C <worktree>`, never `cd` into it (a `git -C ... push`
  does not start with `git push`, so it bypasses any push-guard on the main
  checkout).
- After creating a worktree, run the Bootstrap command in it before anything
  else — verification cannot run in an un-bootstrapped worktree.

## Commands

- Bootstrap: `<makes a fresh worktree runnable — install deps from the
  lockfile, copy env files; e.g. npm ci && cp ../<repo>/.env.local .>`
- Verify: `<ONE non-interactive command; e.g. npm run verify>`
  (measured duration: `<e.g. ~20s>`)
- Test: `<e.g. npm test | none yet>`
- Build: `<full check for app-affecting changes; e.g. npm run build>`

Verify is the per-iteration gate: run it after every change set and fix until
green. Run Build additionally before opening an app-affecting PR. While Test is
`none yet`, every acceptance item no machine check covers is verified at the
human milestone-QA gate instead.

## Branch and spec naming

- Branches: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`, `refactor/<scope>`.
- Specs: `docs/specs/spec-<scope>.md` — the single source of truth for design.
- Completed specs: moved to `docs/specs/archive/` with the same name.

## Proportional tracks

Planning weight scales with change size. Every change runs on exactly **one**
of three tracks:

- **full-spec** — a feature. A spec under `docs/specs/`, a milestone, and
  dependency-ordered issues. The full chain (spec -> milestone -> issues -> PR)
  applies. The spec is archived and the milestone closes when the work is done.
- **living-spec milestone** — an ongoing theme that never finishes. A spec plus
  a milestone that **stays open** and accretes issues over time (not
  one-spec-per-closed-phase). Human-initiated. The milestone is marked with a
  `Track: living-spec` line in its description (the discriminator the QA gate
  reads to tell it from a full-spec milestone). The spec is **not** archived and
  the milestone is **not** closed at the QA gate — a merged spec with an open
  milestone signals the theme is active.
- **`track:adhoc` fast-lane** — a bug or QoL change. A single GitHub issue,
  labeled `track:adhoc`, with **no spec and no milestone** — it holds its whole
  state on the board and skips ceremony entirely (no dependency graph either).
  Created by the **human**, not by `/loopkit:plan`.

The `feat`/`fix`-must-trace-to-a-spec rule is relaxed for `track:adhoc` only;
full-spec and living-spec changes always reference a spec.

## Issue conventions

Per track:

- **full-spec** — Body format: a `Goal:` line, an `Acceptance:` checklist, an
  optional `Depends on: #N[, #M]` line, and a `Spec:` path pointing at the
  feature spec. The issue belongs to the feature's milestone.
- **living-spec** — same body format; the `Spec:` path points at the living
  spec, and the issue belongs to the always-open living-spec milestone. Closing
  the issue does not archive the spec or close the milestone.
- **`track:adhoc`** — created by the human as a single issue carrying the
  `track:adhoc` label, with **no `Spec:` path and no milestone**. A `Goal:` line
  and `Acceptance:` checklist still describe it; `Depends on:` is allowed but
  rarely needed. Its full state lives on the board.

Milestone-level depends-on:

- A milestone that depends on another carries a `Depends on milestone: #<n>`
  line in its **description** — a fixed, parseable token `/loopkit:plan` writes
  and humans/`/loopkit:implement` read. Two milestones with no `Depends on
  milestone` edge between them are **independent** and may run as parallel
  orchestrators (see Orchestration); a milestone is workable once its
  depended-on milestones are closed.

Across all tracks:

- An issue is **unblocked** when every `Depends on` issue is closed and it
  carries neither a `blocked:human` nor a `needs:planning` label. The two
  exclusions differ: `blocked:human` = a human prerequisite (secret, external
  provisioning); `needs:planning` = a design fork the implementer escalated to
  the planner, resolved by re-running `/loopkit:plan` on the spec.
- **Park, don't stop:** a blocker only a human can clear gets the
  `blocked:human` label plus a comment naming exactly what is needed and where
  to deliver it; the loop moves on to the next unblocked issue.
  `gh issue list --label blocked:human` is the human's delivery queue.

## Status

- Specs carry no lifecycle state. "Accepted" = merged on the default branch
  with a milestone and issues. A completed full-spec moves to
  `docs/specs/archive/` and its closed milestone is the "done" signal; a
  living-spec milestone is the exception — it stays open (see Gates).
- Live work state is the board: `Todo` (ready), `In Progress` (an orchestrator's
  subagent is on it), `Done` (merged). These are a **status display only — not a
  claim or lock**: race-prevention is unnecessary because each milestone has a
  single owning orchestrator (see Orchestration), so no two loops contend for the
  same issue.
- Everything else — blocked, deferred — lives on the GitHub issues and
  milestones, the single source of truth for progress.

## The chain: spec -> milestone -> issues -> PR

| Layer | Owns |
| ----- | ---- |
| `docs/specs/spec-*.md` | The design: why, what, done-criteria |
| GitHub milestone | The phase / grouping |
| GitHub issues | The steps — one issue per implementable step |
| Project board | The live work state: Todo / In Progress / Done |

A PR closes an issue (`Closes #N`); the issue references its spec path. The
spec never lists steps; the issues never restate the design. The spec's
`Outcome` list is done-criteria, not a progress mirror. This chain applies to
the full-spec and living-spec tracks; a `track:adhoc` issue bypasses it
(no spec, no milestone) and goes issue -> PR directly.

## Orchestration

`/loopkit:implement` is a **milestone orchestrator**, not a flat issue-consumer.
Pointed at **one** milestone, it owns that milestone end-to-end:

- **Build the graph.** Read the milestone's open issues and build the dependency
  DAG from their `Depends on: #N` lines. The **unblocked frontier** is every open
  issue whose `Depends on` issues are all closed and that carries neither a
  `blocked:human` nor a `needs:planning` label.
- **Fan out in waves.** Dispatch the current frontier as a **parallel batch of
  in-session subagents** (the Agent tool — subscription-auth, never `claude -p`
  or a detached process). **One subagent implements exactly one issue
  end-to-end:** worktree -> implement -> Verify -> review -> merge. Await the
  whole batch, re-read GitHub issue state, recompute the next frontier, and
  repeat until no open issues remain. (Wave-based dispatch is the baseline;
  rolling dispatch is a later optimization.)
- **Escalate or park, don't stall.** If a subagent escalates a design fork
  (`needs:planning` — back to the planner) or parks its issue (`blocked:human` —
  a human prerequisite), the orchestrator excludes that issue **and its
  dependents**, finishes the rest of the frontier, and reports the escalated /
  parked issues **instead of running milestone-QA** — a milestone with such
  issues is not complete.

No claiming. **Ownership replaces claiming:** the orchestrator is the **sole
dispatcher** of its milestone's issues, so there is no race to prevent and no
`In Progress` + assignee claim. The board's `In Progress` is a status display,
not a lock (see Status).

Milestone-level parallelism = a **second orchestrator on an independent
milestone**. Which milestones are independent is read from the `Depends on
milestone: #<n>` line in each milestone description (see Issue conventions):
milestones with no edge between them run as separate orchestrators, one human
attended per orchestrator. Single-orchestrator-per-milestone is an attended
**convention**, not a GitHub lock — the constitution forbids claim arbitration
of any kind.

A `track:adhoc` issue has no milestone and so no orchestrator: the human (or the
implement loop) drives it issue -> PR directly through the same per-PR machine
gate.

## Gates

- **Per PR — machine gates, no human stop:** Verify green + in-session agent
  review (`VERDICT: APPROVE`, via the Agent tool — never a billed CLI) ->
  autonomous squash-merge.
- **Per milestone — human gates:**
  - Planning: the spec-acceptance gate — genuinely-open decisions
    (AskUserQuestion, never guess) + human-prerequisites handover, then merge
    on the default branch (acceptance = merged spec with a milestone and
    issues).
  - Implementation: the milestone QA gate — when the milestone's last issue
    closes, QA scenarios are derived from the spec's Verification section; the
    human accepts or files regressions. For a **living-spec** milestone the gate
    runs per closed-issue batch but does **not** archive the spec or close the
    milestone — the theme stays open.
- A `track:adhoc` issue has no milestone, so it skips both human gates; its only
  gate is the per-PR machine gate above.
- QA-gate default check: `<review | UI check | smoke test>`.

## Autonomy

Within the loopkit skills the following are explicitly granted and override any
stricter global user rules: autonomous commits, pushes, PR creation and merges,
dependency installs, and `.env` edits. Hard limits live in
`.claude/settings.json` (deny rules: `rm -rf`, force-push, hard reset,
destructive database commands).

## Loops

Three attended interactive sessions, synchronized only through GitHub state — no
headless mode, no API keys, no detached schedulers. Start each in its own
terminal from the main checkout. `/loop` wraps only the two recurring
queue-draining loops (plan, implement); `/loopkit:roadmap` is invoked directly,
per idea:

- Roadmap loop (idea sparring):

  ```
  /loopkit:roadmap <idea...> — spar each raw idea against prior art (research
  mode asked per idea) and seed 1..n roadmap phases with their backing prior-art
  entries; no loop-readiness sweep. A foundation-doc impact is recorded onto the
  seeded phase, authored later in that phase's /loopkit:plan spec PR — never
  edited here. Ceiling: <N> iterations.
  ```

- Plan loop:

  ```
  /loop /loopkit:plan [phase...] — plan the roadmap's next unplanned phase, or a
  human-named set of one-or-many phases in that order, to a merged spec with
  milestone, issues, and board entries; stop at the spec-acceptance gate; when no
  unplanned phase remains, report and end. A multi-phase run writes each new
  milestone's `Depends on milestone:` edge as it goes and never auto-picks the
  set. Ceiling: <N> iterations; stop when the same blocker repeats twice.
  ```

- Implement loop:

  ```
  /loop /loopkit:implement <milestone> — orchestrate one milestone: build the
  issue DAG and fan out in-session subagents along the unblocked frontier in
  waves until it is done; when the milestone completes, stop at the QA gate;
  when nothing is workable, report "waiting for plan" and end the tick.
  Ceiling: <N> iterations; stop when the same failure repeats twice.
  ```

- No-progress rule: the identical failure twice in a row -> stop and report,
  never grind.
- Iteration ceiling default: `<e.g. 10>` per loop run.
