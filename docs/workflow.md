# Workflow contract

> Operational contract for the loopkit skills (`/loopkit:plan`,
> `/loopkit:implement`) — the single source for the branch model, commands,
> gates, and loop behavior of this project. Filled during inception; the skills
> read it instead of hardcoding specifics. The skills now fully match this
> contract (the P1–P6 brownfield roadmap is complete).

## Environment prerequisites

- `git` and `gh` must be installed and on PATH.
- `gh` must be authenticated (`gh auth status`) with the `repo`
  (issues/milestones/PRs) and `project` (the ProjectV2 board) scopes.
- Landmine: `gh auth login` does NOT grant `project` by default. Remedy: missing
  `project` scope -> `gh auth refresh -s project` (OAuth login; for a PAT or
  `GH_TOKEN`, `gh auth refresh` does not apply — re-create the token with the
  `project` scope instead).

## Repository

- GitHub repo: `skrischer/loopkit` (public)
- Base / integration branch: `main`
- GitHub Project board: https://github.com/users/skrischer/projects/5 (#5) —
  mandatory; the loops' queue. Status values: `Todo`, `In Progress`, `Done`.

`/loopkit:plan` requires a GitHub repo; specs are the local single source of
truth, milestones and issues are created on GitHub from them.

## Worktrees

- All implementation and docs work happens in a worktree — never in the main
  checkout. The loops run from the main checkout and never modify it except
  fast-forward pulls.
- Path convention: `../loopkit-worktrees/<branch-with-slashes-as-dashes>`.
- Operate via `git -C <worktree>`, never `cd` into it (a `git -C ... push` does
  not start with `git push`, so it bypasses any push-guard on the main checkout).

## Commands

- Bootstrap: `none` — loopkit has no dependencies; a fresh worktree is runnable
  as-is (Markdown skills + JSON manifests).
- Verify: `bash scripts/verify.sh` — the per-PR machine gate. Runs the native
  `claude plugin validate` twice, non-strict: `claude plugin validate .`
  (marketplace manifest) and `claude plugin validate .claude-plugin/plugin.json`
  (plugin manifest + every skill), plus a config-surface auth/state guard (greps
  the non-prose surfaces — `.claude-plugin/`, template JSON, `scripts/`, hooks —
  for forbidden auth/scheduler usage and asserts no committed local-state second
  source). Exits non-zero on any failure. No new dependency — only `claude`,
  `git`, and shell. Behavioural acceptance a structural check cannot cover is
  still verified at the milestone-QA gate.
- Test: `none yet`.
- Build: `none`.

## Branch and spec naming

- Branches: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`, `refactor/<scope>`.
- Specs: `docs/specs/spec-<scope>.md` — the single source of truth for design.
- Completed specs: moved to `docs/specs/archive/` with the same name.
- Proportional tracks (one per change): full-spec (a feature), a living-spec
  milestone (an ongoing theme), a `track:adhoc` fast-lane (a bug/QoL change —
  no spec, no milestone).

## Issue conventions

- Body format: a `Goal:` line, an `Acceptance:` checklist, a `Depends on: #N`
  line (issue-level), and a `Spec:` path (or `none` for `track:adhoc`).
- Milestones carry milestone-level depends-on info as a `Depends on milestone:
  #<n>[, #<m>] | none` line in the milestone description (`/loopkit:plan` writes
  it, `/loopkit:implement` and humans read it). Milestones with no edge between
  them are independent and can run as parallel orchestrators.
- An issue is **unblocked** when every `Depends on` issue is closed and it
  carries neither a `blocked:human` nor a `needs:planning` label
  (`blocked:human` = a human prerequisite; `needs:planning` = a design fork
  escalated to the planner, resolved by re-running `/loopkit:plan`).
- `track:adhoc` = a bug/QoL issue with no spec and no milestone — the fast-lane.
- A living-spec milestone carries a `Track: living-spec` line in its milestone
  description — the discriminator `/loopkit:implement`'s QA gate reads to tell it
  from a full-spec milestone (which has no such line).

## State

- Specs carry NO lifecycle state. "Accepted" = merged on the default branch with
  a milestone and issues. A completed spec moves to `docs/specs/archive/`; its
  closed milestone is the "done" signal.
- The roadmap carries no current-focus or status marker — the human points
  `/plan` at a phase.
- Live work state is the board: `Todo` (ready), `In Progress` (being worked),
  `Done` (merged).
- **No claiming.** The milestone orchestrator is the sole dispatcher of its own
  subagents; ownership replaces claiming at both the milestone and issue level.

## The chain: spec -> milestone -> issues -> PR

| Layer | Owns |
| ----- | ---- |
| `docs/specs/spec-*.md` | The design: why, what, done-criteria (+ prior-art links) |
| GitHub milestone | The phase / grouping (+ milestone-level depends-on) |
| GitHub issues | The steps — one issue per implementable step |
| Project board | The live work state: Todo / In Progress / Done |

A PR closes an issue (`Closes #N`); the issue references its spec path. The spec
never lists steps; the issues never restate the design.

## Gates

- **Per PR — machine gate, no human stop:** the Verify command
  (`bash scripts/verify.sh`) runs green, then in-session agent review
  (`VERDICT: APPROVE`, via the Agent tool — never a billed CLI) -> autonomous
  squash-merge.
- **Per milestone — human gates:**
  - Planning: the spec-acceptance gate — genuinely-open decisions
    (AskUserQuestion, never guess) + human-prerequisites handover.
  - Implementation: the milestone-QA gate — when the milestone's last issue
    closes, QA scenarios are derived from the spec's Verification section.
- **Clarification belongs to planning:** the implementer never asks the human;
  a fork escalates back to the planner (reopen the spec).
- QA-gate default check: review + a smoke run of the changed skill.

## Autonomy

Within the loopkit skills the following are explicitly granted and override any
stricter global user rules: autonomous commits, pushes, PR creation and merges,
dependency installs, and `.env` edits. Hard limits live in
`.claude/settings.json` (deny rules: `rm -rf`, force-push, hard reset).

## Loops

Three attended interactive sessions, synchronized only through GitHub state — no
headless mode, no API keys, no detached schedulers. Start each in its own
terminal from the main checkout.

- Roadmap loop (idea sparring):

  ```
  /loopkit:roadmap <idea...> — spar each raw idea against prior art (research
  mode asked per idea) and seed 1..n roadmap phases with their backing prior-art
  entries; no loop-readiness sweep. A foundation-doc impact is recorded onto the
  seeded phase, never edited here — its `/loopkit:plan` cycle authors it.
  Ceiling: 10 iterations.
  ```

- Plan loop (producer):

  ```
  /loopkit:plan <phase[, phase...]> — draft each named phase's spec with
  milestone, issues (two-level depends-on), and board entries; stop at the
  spec-acceptance gate. Plans one or many phases per run in the human-named
  order, writing each new milestone's `Depends on milestone:` edge as it goes
  (never auto-picks the set). Ceiling: 10 iterations; stop when the same blocker
  repeats twice.
  ```

- Implement loop (milestone orchestrator):

  ```
  /loopkit:implement <milestone> — orchestrate one milestone: plan the issue
  DAG and fan out in-session subagents along the unblocked frontier to merged
  PRs; stop at the milestone-QA gate. Parallelize milestones with a second
  orchestrator on an independent milestone. Ceiling: 10 iterations; stop when
  the same failure repeats twice.
  ```

- No-progress rule: the identical failure twice in a row -> stop and report,
  never grind.
- Iteration ceiling default: 10 per loop run.

**Usage:** seed phases with `/loopkit:roadmap <idea>`, plan one or many with
`/loopkit:plan <phase[, phase...]>`, then orchestrate each milestone with
`/loopkit:implement <milestone>`. Run independent milestones as separate
orchestrators.
