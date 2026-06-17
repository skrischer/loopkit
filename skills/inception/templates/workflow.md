# Workflow contract

> Operational contract for the loopkit skills (`/loopkit:plan`,
> `/loopkit:implement`) — the single source for the branch model, commands,
> gates, and loop behavior of this project. Filled during inception; the skills
> read it instead of hardcoding specifics.

## Repository

- GitHub repo: `<owner/repo>`
- Base / integration branch: `<main | develop>`
- GitHub Project board: `<url-or-number>` — mandatory; the loops' queue and
  claim mechanism. Status values: `Todo`, `In Progress`, `Done`.

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

- Branches: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`.
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
  one-spec-per-closed-phase). Human-initiated. The spec is **not** archived and
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

Across all tracks:

- An issue is **unblocked** when every `Depends on` issue is closed and it
  carries no `blocked:human` label.
- **Park, don't stop:** a blocker only a human can clear gets the
  `blocked:human` label plus a comment naming exactly what is needed and where
  to deliver it; the loop moves on to the next unblocked issue.
  `gh issue list --label blocked:human` is the human's delivery queue.

## Status

- Specs carry no lifecycle state. "Accepted" = merged on the default branch
  with a milestone and issues. A completed full-spec moves to
  `docs/specs/archive/` and its closed milestone is the "done" signal; a
  living-spec milestone is the exception — it stays open (see Gates).
- Live work state is the board: `Todo` (ready), `In Progress` (claimed by a
  loop), `Done` (merged). Claiming = set `In Progress` + assignee.
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

Two attended interactive sessions, synchronized only through GitHub state — no
headless mode, no API keys, no detached schedulers. Start each in its own
terminal from the main checkout:

- Plan loop:

  ```
  /loop /loopkit:plan — plan the roadmap's next unplanned phase to a merged spec
  with milestone, issues, and board entries; stop at the spec-acceptance gate;
  when no unplanned phase remains, report and end. Ceiling: <N> iterations;
  stop when the same blocker repeats twice.
  ```

- Implement loop:

  ```
  /loop /loopkit:implement — pick the next unblocked Todo issue and drive it to
  a merged PR; when a milestone completes, stop at the QA gate; when nothing is
  workable, report "waiting for plan" and end the tick. Ceiling: <N>
  iterations; stop when the same failure repeats twice.
  ```

- No-progress rule: the identical failure twice in a row -> stop and report,
  never grind.
- Iteration ceiling default: `<e.g. 10>` per loop run.
